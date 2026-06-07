import { useEffect } from 'react';
import { ANALYTICS_LOCATION_CHANGE_EVENT, CV_DOWNLOAD_TRACKED_EVENT } from './analyticsEvents';

const SESSION_KEY = 'portfolio:visitor-session:v1';
const DEFAULT_SUMMARY_INTERVAL_MS = 30 * 60 * 1000;
const CHECK_INTERVAL_MS = 60 * 1000;
const MAX_PAGES = 80;
const MAX_CV_DOWNLOADS = 20;

type PageVisit = {
  path: string;
  at: number;
};

type CvDownload = {
  at: number;
  source: string;
  language: string;
};

type VisitorSession = {
  id: string;
  startedAt: number;
  referrer: string;
  pages: PageVisit[];
  cvDownloaded: boolean;
  cvDownloads: CvDownload[];
  lastActivityAt: number;
  lastSummaryAt: number;
  summaryCount: number;
};

type CvDownloadEvent = CustomEvent<{
  source?: string;
  language?: string;
}>;

const summaryIntervalMs = () => {
  const value = Number(import.meta.env.VITE_VISITOR_SUMMARY_INTERVAL_MS);
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_SUMMARY_INTERVAL_MS;
};

const now = () => Date.now();

const currentPath = () =>
  `${window.location.pathname}${window.location.search}${window.location.hash}`;

const newSessionId = () => {
  if (crypto.randomUUID) return crypto.randomUUID();
  return `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const createSession = (): VisitorSession => {
  const startedAt = now();

  return {
    id: newSessionId(),
    startedAt,
    referrer: document.referrer || '',
    pages: [],
    cvDownloaded: false,
    cvDownloads: [],
    lastActivityAt: startedAt,
    lastSummaryAt: startedAt,
    summaryCount: 0,
  };
};

const readSession = () => {
  const stored = sessionStorage.getItem(SESSION_KEY);
  if (!stored) return createSession();

  try {
    const parsed = JSON.parse(stored) as VisitorSession;
    if (!parsed.id || !parsed.startedAt) return createSession();
    return parsed;
  } catch {
    return createSession();
  }
};

const saveSession = (session: VisitorSession) => {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

const recordPageVisit = () => {
  const session = readSession();
  const path = currentPath();
  const lastPage = session.pages.at(-1);

  if (lastPage?.path !== path) {
    session.pages = [...session.pages, { path, at: now() }].slice(-MAX_PAGES);
    session.lastActivityAt = now();
    saveSession(session);
  }

  return session;
};

const payloadFromSession = (session: VisitorSession) => ({
  sessionId: session.id,
  startedAt: new Date(session.startedAt).toISOString(),
  referrer: session.referrer,
  pages: session.pages.map(page => ({
    path: page.path,
    at: new Date(page.at).toISOString(),
  })),
  cvDownloaded: session.cvDownloaded,
  cvDownloads: session.cvDownloads.map(download => ({
    at: new Date(download.at).toISOString(),
    source: download.source,
    language: download.language,
  })),
  totalTimeSeconds: Math.max(0, Math.round((now() - session.startedAt) / 1000)),
  summaryNumber: session.summaryCount + 1,
});

export default function VisitorSessionTracker() {
  useEffect(() => {
    let sending = false;

    const maybeSendSummary = async () => {
      if (sending) return;

      const session = readSession();
      const currentTime = now();
      const intervalMs = summaryIntervalMs();
      const summaryIsDue = currentTime - session.lastSummaryAt >= intervalMs;
      const hasNewActivity = session.lastActivityAt > session.lastSummaryAt;

      if (!summaryIsDue || !hasNewActivity) return;

      sending = true;

      try {
        const response = await fetch('/api/visitor-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payloadFromSession(session)),
          keepalive: true,
        });

        if (response.ok) {
          const updated = readSession();
          updated.lastSummaryAt = currentTime;
          updated.summaryCount += 1;
          saveSession(updated);
        }
      } catch {
        // The next interval will retry if the visitor is still active.
      } finally {
        sending = false;
      }
    };

    const handlePageChange = () => {
      recordPageVisit();
      void maybeSendSummary();
    };

    const handleCvDownload = (event: Event) => {
      const detail = (event as CvDownloadEvent).detail ?? {};
      const session = readSession();

      session.cvDownloaded = true;
      session.cvDownloads = [
        ...session.cvDownloads,
        {
          at: now(),
          source: detail.source ?? 'unknown',
          language: detail.language ?? 'default',
        },
      ].slice(-MAX_CV_DOWNLOADS);
      session.lastActivityAt = now();
      saveSession(session);

      void maybeSendSummary();
    };

    recordPageVisit();

    const interval = window.setInterval(() => {
      void maybeSendSummary();
    }, CHECK_INTERVAL_MS);

    window.addEventListener(ANALYTICS_LOCATION_CHANGE_EVENT, handlePageChange);
    window.addEventListener('hashchange', handlePageChange);
    window.addEventListener('popstate', handlePageChange);
    window.addEventListener(CV_DOWNLOAD_TRACKED_EVENT, handleCvDownload);
    document.addEventListener('visibilitychange', maybeSendSummary);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener(ANALYTICS_LOCATION_CHANGE_EVENT, handlePageChange);
      window.removeEventListener('hashchange', handlePageChange);
      window.removeEventListener('popstate', handlePageChange);
      window.removeEventListener(CV_DOWNLOAD_TRACKED_EVENT, handleCvDownload);
      document.removeEventListener('visibilitychange', maybeSendSummary);
    };
  }, []);

  return null;
}
