import { neon } from '@neondatabase/serverless';
import { Resend } from 'resend';

declare const process: {
  env: Record<string, string | undefined>;
};

const DEFAULT_TO_EMAIL = 'kecidavid26@gmail.com';
const DEFAULT_FROM_EMAIL = 'Portfolio Tracker <tracker@davidkeci.com>';
const MESSAGE_DOMAIN = 'davidkeci.com';
const MAX_ITEMS = 160;

type SqlClient = ReturnType<typeof neon>;

export type VisitorInfo = {
  sessionId: string;
  city: string;
  country: string;
  deviceType: string;
  browserName: string;
  currentUrl: string;
  referrer: string;
  timestamp: string;
  userAgent: string;
};

export type ActivityItem = {
  type: string;
  label: string;
  url: string;
  at: string;
};

export type StoredVisitorInfo = VisitorInfo & {
  resendEmailId?: string;
  activities: ActivityItem[];
  updates: Array<{
    action: 'update' | 'final';
    sentAt: string;
    resendEmailId?: string;
    activities: ActivityItem[];
    totalTimeSeconds: number;
  }>;
  finalSentAt?: string;
};

export type SessionRow = {
  id: string;
  message_id: string;
  visitor_info: StoredVisitorInfo | string | null;
  created_at: string;
};

let sqlClient: SqlClient | null = null;

export function getSql() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('Missing DATABASE_URL');
  }

  sqlClient ??= neon(databaseUrl);
  return sqlClient;
}

export async function ensureSessionsTable(sql = getSql()) {
  await sql`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      message_id TEXT NOT NULL,
      visitor_info JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

export function json(body: Record<string, unknown>, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}

export function decodeHeader(value: string | null) {
  if (!value) return '';

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function countryName(value: string) {
  if (!value) return 'Unknown country';

  try {
    const displayNames = new Intl.DisplayNames(['en'], { type: 'region' });
    return displayNames.of(value.toUpperCase()) || value;
  } catch {
    return value;
  }
}

export function getLocation(request: Request) {
  const city = decodeHeader(request.headers.get('x-vercel-ip-city')) || 'Unknown city';
  const countryCode = decodeHeader(request.headers.get('x-vercel-ip-country'));

  return {
    city,
    country: countryName(countryCode),
  };
}

export function asString(value: unknown, fallback = '', maxLength = 1000) {
  if (typeof value !== 'string') return fallback;
  return value.slice(0, maxLength);
}

export function asNumber(value: unknown, fallback = 0) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.max(0, Math.round(value));
}

export function normalizeIso(value: unknown) {
  const date = new Date(asString(value));
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

export function normalizeActivities(value: unknown): ActivityItem[] {
  if (!Array.isArray(value)) return [];

  return value.slice(-MAX_ITEMS).map(item => ({
    type: asString(item?.type, 'activity', 80),
    label: asString(item?.label, 'Unknown activity', 300),
    url: asString(item?.url, '', 1000),
    at: normalizeIso(item?.at),
  }));
}

export function parseStoredInfo(value: SessionRow['visitor_info']): StoredVisitorInfo | null {
  if (!value) return null;
  if (typeof value === 'object') return value as StoredVisitorInfo;

  try {
    return JSON.parse(value) as StoredVisitorInfo;
  } catch {
    return null;
  }
}

export function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/Berlin',
  }).format(new Date(iso));
}

export function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) return `${hours}h ${minutes}m ${remainingSeconds}s`;
  if (minutes > 0) return `${minutes}m ${remainingSeconds}s`;
  return `${remainingSeconds}s`;
}

export function makeThreadMessageId(sessionId: string) {
  const safeId = sessionId.replace(/[^a-zA-Z0-9._-]/g, '').slice(0, 120);
  return `<portfolio-${safeId}-${Date.now()}@${MESSAGE_DOMAIN}>`;
}

export function referrerSource(referrer: string) {
  if (!referrer) return 'Direct / unknown';

  try {
    return new URL(referrer).hostname.replace(/^www\./, '');
  } catch {
    return referrer;
  }
}

function activityList(activities: ActivityItem[]) {
  if (activities.length === 0) return '<li>No activity recorded.</li>';

  return activities.map(activity => `
    <li>
      <strong>${escapeHtml(activity.type)}</strong>
      ${escapeHtml(activity.label)}
      <br><span>${escapeHtml(activity.url)} - ${escapeHtml(formatDate(activity.at))}</span>
    </li>
  `).join('');
}

export function buildStartEmail(info: VisitorInfo) {
  const title = `${info.city}, ${info.country}`;

  const html = `<!doctype html>
<html>
  <body style="margin:0;background:#f4f4ef;padding:28px;font-family:Arial,Helvetica,sans-serif;color:#111;">
    <main style="max-width:680px;margin:0 auto;background:#fff;border:1px solid #deded6;border-radius:12px;overflow:hidden;">
      <section style="background:#111;color:#f5f5f0;padding:28px 30px;">
        <p style="margin:0 0 10px;color:#c6f435;font-size:12px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;">New portfolio visitor</p>
        <h1 style="margin:0;font-size:28px;line-height:1.12;">${escapeHtml(title)}</h1>
      </section>
      <section style="padding:28px 30px;">
        <table style="width:100%;border-collapse:collapse;font-size:15px;line-height:1.5;">
          <tr><td style="padding:9px 0;color:#6f6f67;width:34%;">Session ID</td><td style="padding:9px 0;font-weight:700;">${escapeHtml(info.sessionId)}</td></tr>
          <tr><td style="padding:9px 0;color:#6f6f67;">Location</td><td style="padding:9px 0;font-weight:700;">${escapeHtml(info.city)}, ${escapeHtml(info.country)}</td></tr>
          <tr><td style="padding:9px 0;color:#6f6f67;">Device</td><td style="padding:9px 0;font-weight:700;">${escapeHtml(info.deviceType)}</td></tr>
          <tr><td style="padding:9px 0;color:#6f6f67;">Browser</td><td style="padding:9px 0;font-weight:700;">${escapeHtml(info.browserName)}</td></tr>
          <tr><td style="padding:9px 0;color:#6f6f67;">Current page</td><td style="padding:9px 0;font-weight:700;">${escapeHtml(info.currentUrl)}</td></tr>
          <tr><td style="padding:9px 0;color:#6f6f67;">Referrer</td><td style="padding:9px 0;font-weight:700;">${escapeHtml(referrerSource(info.referrer))}</td></tr>
          <tr><td style="padding:9px 0;color:#6f6f67;">Timestamp</td><td style="padding:9px 0;font-weight:700;">${escapeHtml(formatDate(info.timestamp))}</td></tr>
        </table>
      </section>
    </main>
  </body>
</html>`;

  const text = [
    'New portfolio visitor',
    `Session ID: ${info.sessionId}`,
    `Location: ${info.city}, ${info.country}`,
    `Device: ${info.deviceType}`,
    `Browser: ${info.browserName}`,
    `Current page: ${info.currentUrl}`,
    `Referrer: ${referrerSource(info.referrer)}`,
    `Timestamp: ${formatDate(info.timestamp)}`,
  ].join('\n');

  return { html, text };
}

export function buildReplyEmail(params: {
  action: 'update' | 'final';
  info: StoredVisitorInfo;
  activities: ActivityItem[];
  allActivities: ActivityItem[];
  totalTimeSeconds: number;
  timestamp: string;
}) {
  const isFinal = params.action === 'final';
  const heading = isFinal ? 'Final session summary' : 'Visitor activity update';
  const intro = isFinal
    ? `The visitor left after ${formatDuration(params.totalTimeSeconds)}.`
    : 'The visitor had new activity since the last update.';

  const html = `<!doctype html>
<html>
  <body style="margin:0;background:#f4f4ef;padding:28px;font-family:Arial,Helvetica,sans-serif;color:#111;">
    <main style="max-width:680px;margin:0 auto;background:#fff;border:1px solid #deded6;border-radius:12px;overflow:hidden;">
      <section style="background:#111;color:#f5f5f0;padding:24px 30px;">
        <p style="margin:0 0 10px;color:#c6f435;font-size:12px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;">${escapeHtml(heading)}</p>
        <h1 style="margin:0;font-size:24px;line-height:1.16;">${escapeHtml(params.info.city)}, ${escapeHtml(params.info.country)}</h1>
      </section>
      <section style="padding:26px 30px;">
        <p style="margin:0 0 18px;color:#30302c;font-size:15px;line-height:1.6;">${escapeHtml(intro)}</p>
        <table style="width:100%;border-collapse:collapse;font-size:15px;line-height:1.5;margin-bottom:24px;">
          <tr><td style="padding:8px 0;color:#6f6f67;width:34%;">Session ID</td><td style="padding:8px 0;font-weight:700;">${escapeHtml(params.info.sessionId)}</td></tr>
          <tr><td style="padding:8px 0;color:#6f6f67;">Total time</td><td style="padding:8px 0;font-weight:700;">${escapeHtml(formatDuration(params.totalTimeSeconds))}</td></tr>
          <tr><td style="padding:8px 0;color:#6f6f67;">Sent at</td><td style="padding:8px 0;font-weight:700;">${escapeHtml(formatDate(params.timestamp))}</td></tr>
        </table>

        <h2 style="margin:0 0 12px;font-size:14px;letter-spacing:.12em;text-transform:uppercase;">New activity</h2>
        <ul style="margin:0 0 26px;padding-left:20px;color:#20201d;line-height:1.7;">${activityList(params.activities)}</ul>

        <h2 style="margin:0 0 12px;font-size:14px;letter-spacing:.12em;text-transform:uppercase;">All activity</h2>
        <ul style="margin:0;padding-left:20px;color:#20201d;line-height:1.7;">${activityList(params.allActivities)}</ul>
      </section>
    </main>
  </body>
</html>`;

  const activityText = (items: ActivityItem[]) =>
    items.map(item => `- ${item.type}: ${item.label} (${item.url}) at ${formatDate(item.at)}`).join('\n') ||
    'No activity recorded.';

  const text = [
    heading,
    intro,
    `Session ID: ${params.info.sessionId}`,
    `Total time: ${formatDuration(params.totalTimeSeconds)}`,
    `Sent at: ${formatDate(params.timestamp)}`,
    '',
    'New activity:',
    activityText(params.activities),
    '',
    'All activity:',
    activityText(params.allActivities),
  ].join('\n');

  return { html, text };
}

type SendEmailInput = {
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  headers?: Record<string, string>;
};

export async function sendEmailWithRetry(input: SendEmailInput) {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    throw new Error('Missing RESEND_API_KEY');
  }

  const resend = new Resend(resendApiKey);
  let lastError: unknown = null;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const { data, error } = await resend.emails.send(input);
      if (error) {
        lastError = error;
        console.error('Resend send failed', error);
      } else {
        return data;
      }
    } catch (error) {
      lastError = error;
      console.error('Resend send threw', error);
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Resend failed after retry');
}

export function emailRecipients() {
  return {
    to: process.env.VISITOR_EMAIL_TO || DEFAULT_TO_EMAIL,
    from: process.env.VISITOR_EMAIL_FROM || DEFAULT_FROM_EMAIL,
  };
}
