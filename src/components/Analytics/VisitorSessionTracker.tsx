import { useEffect } from 'react';
import { ANALYTICS_LOCATION_CHANGE_EVENT, CV_DOWNLOAD_TRACKED_EVENT } from './analyticsEvents';

const SESSION_KEY = 'portfolio:custom-visitor-session:v2';
const TRACK_ENDPOINT = '/api/track';
const UPDATE_INTERVAL_MS = 15 * 60 * 1000;
const MIN_FINAL_SESSION_MS = 60 * 1000;
const MAX_ACTIVITIES = 160;

type ActivityType = 'click' | 'page' | 'template' | 'cv';

type ActivityItem = {
  type: ActivityType;
  label: string;
  url: string;
  at: string;
};

type VisitorSession = {
  id: string;
  startedAt: number;
  startSent: boolean;
  finalSent: boolean;
  lastUrl: string;
  activities: ActivityItem[];
  pendingActivities: ActivityItem[];
};

type CvDownloadEvent = CustomEvent<{
  source?: string;
  language?: string;
}>;

const now = () => Date.now();

const currentUrl = () => window.location.href;

const newSessionId = () => {
  if (crypto.randomUUID) return crypto.randomUUID();
  return `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const detectDeviceType = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  if (/android|iphone|ipad|ipod|mobile|windows phone/.test(userAgent)) return 'mobile';
  return 'desktop';
};

const detectBrowserName = () => {
  const ua = navigator.userAgent;
  if (/Edg\//.test(ua)) return 'Microsoft Edge';
  if (/OPR\//.test(ua)) return 'Opera';
  if (/Firefox\//.test(ua)) return 'Firefox';
  if (/Chrome\//.test(ua) || /CriOS\//.test(ua)) return 'Chrome';
  if (/Safari\//.test(ua)) return 'Safari';
  return 'Unknown browser';
};

const createSession = (): VisitorSession => ({
  id: newSessionId(),
  startedAt: now(),
  startSent: false,
  finalSent: false,
  lastUrl: currentUrl(),
  activities: [],
  pendingActivities: [],
});

const readSession = () => {
  const stored = sessionStorage.getItem(SESSION_KEY);
  if (!stored) {
    const session = createSession();
    saveSession(session);
    return session;
  }

  try {
    const session = JSON.parse(stored) as VisitorSession;
    if (!session.id || !session.startedAt) return createSession();
    return session;
  } catch {
    return createSession();
  }
};

const saveSession = (session: VisitorSession) => {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

const sessionPayloadBase = (session: VisitorSession) => ({
  sessionId: session.id,
  timestamp: new Date().toISOString(),
  currentUrl: currentUrl(),
  referrer: document.referrer || '',
  deviceType: detectDeviceType(),
  browserName: detectBrowserName(),
  userAgent: navigator.userAgent,
  totalTimeSeconds: Math.max(0, Math.round((now() - session.startedAt) / 1000)),
});

const sendJson = async (payload: Record<string, unknown>) => {
  const response = await fetch(TRACK_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    keepalive: true,
  });

  return response.ok;
};

const sendStart = async () => {
  const session = readSession();
  if (session.startSent) return;

  try {
    const ok = await sendJson({
      action: 'start',
      ...sessionPayloadBase(session),
    });

    if (ok) {
      const updated = readSession();
      updated.startSent = true;
      saveSession(updated);
    }
  } catch (error) {
    console.error('Visitor start tracking failed', error);
  }
};

const readableText = (element: Element) => {
  const labelled = element.getAttribute('aria-label') || element.getAttribute('title');
  if (labelled) return labelled.trim();

  const text = element.textContent?.replace(/\s+/g, ' ').trim();
  if (text) return text.slice(0, 120);

  return element.tagName.toLowerCase();
};

const clickLabel = (target: EventTarget | null) => {
  const element = target instanceof Element ? target : null;
  if (!element) return 'Unknown click';

  const actionable = element.closest('a, button, [role="button"], input, textarea, select, .work-folder');
  if (!actionable) return '';

  const href = actionable instanceof HTMLAnchorElement ? ` -> ${actionable.href}` : '';
  return `${actionable.tagName.toLowerCase()}: ${readableText(actionable)}${href}`;
};

const isTemplateInteraction = (target: EventTarget | null) => {
  const element = target instanceof Element ? target : null;
  return Boolean(element?.closest('[data-template], [data-template-id], .work-folder'));
};

const recordActivity = (type: ActivityType, label: string) => {
  const session = readSession();
  const activity: ActivityItem = {
    type,
    label,
    url: currentUrl(),
    at: new Date().toISOString(),
  };

  session.activities = [...session.activities, activity].slice(-MAX_ACTIVITIES);
  session.pendingActivities = [...session.pendingActivities, activity].slice(-MAX_ACTIVITIES);
  saveSession(session);
};

const sendUpdate = async () => {
  const session = readSession();
  if (!session.startSent || session.pendingActivities.length === 0) return;

  const pending = session.pendingActivities;

  try {
    const ok = await sendJson({
      action: 'update',
      ...sessionPayloadBase(session),
      activities: pending,
      allActivities: session.activities,
    });

    if (ok) {
      const updated = readSession();
      updated.pendingActivities = updated.pendingActivities.filter(
        activity => !pending.some(sent => sent.at === activity.at && sent.label === activity.label)
      );
      saveSession(updated);
    }
  } catch (error) {
    console.error('Visitor update tracking failed', error);
  }
};

const sendFinal = () => {
  const session = readSession();
  if (!session.startSent || session.finalSent) return;
  if (session.activities.length === 0 && now() - session.startedAt < MIN_FINAL_SESSION_MS) return;

  const payload = {
    action: 'final',
    ...sessionPayloadBase(session),
    activities: session.pendingActivities,
    allActivities: session.activities,
  };
  const body = JSON.stringify(payload);
  const blob = new Blob([body], { type: 'application/json' });

  session.finalSent = true;
  saveSession(session);

  if (!navigator.sendBeacon(TRACK_ENDPOINT, blob)) {
    void fetch(TRACK_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    });
  }
};

export default function VisitorSessionTracker() {
  useEffect(() => {
    void sendStart();

    const handlePointerUp = (event: PointerEvent) => {
      if (!event.isTrusted || !event.isPrimary || event.button !== 0) return;

      const label = clickLabel(event.target);
      if (!label) return;

      recordActivity(isTemplateInteraction(event.target) ? 'template' : 'click', label);
    };

    const handlePageChange = () => {
      const session = readSession();
      const url = currentUrl();
      if (session.lastUrl === url) return;

      session.lastUrl = url;
      saveSession(session);
      recordActivity('page', `Changed page to ${url}`);
    };

    const handleCvDownload = (event: Event) => {
      const detail = (event as CvDownloadEvent).detail ?? {};
      const language = detail.language ?? 'default';
      const source = detail.source ?? 'unknown';
      recordActivity('cv', `Downloaded CV (${language}) from ${source}`);
    };

    const interval = window.setInterval(() => {
      void sendUpdate();
    }, UPDATE_INTERVAL_MS);

    document.addEventListener('pointerup', handlePointerUp, { capture: true, passive: true });
    window.addEventListener(ANALYTICS_LOCATION_CHANGE_EVENT, handlePageChange);
    window.addEventListener('hashchange', handlePageChange);
    window.addEventListener('popstate', handlePageChange);
    window.addEventListener(CV_DOWNLOAD_TRACKED_EVENT, handleCvDownload);
    window.addEventListener('pagehide', sendFinal);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener('pointerup', handlePointerUp, { capture: true });
      window.removeEventListener(ANALYTICS_LOCATION_CHANGE_EVENT, handlePageChange);
      window.removeEventListener('hashchange', handlePageChange);
      window.removeEventListener('popstate', handlePageChange);
      window.removeEventListener(CV_DOWNLOAD_TRACKED_EVENT, handleCvDownload);
      window.removeEventListener('pagehide', sendFinal);
    };
  }, []);

  return null;
}
