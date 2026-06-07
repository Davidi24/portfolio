import { Resend } from 'resend';

declare const process: {
  env: Record<string, string | undefined>;
};

const DEFAULT_TO_EMAIL = 'kecidavid26@gmail.com';
const DEFAULT_FROM_EMAIL = 'Portfolio Tracker <onboarding@resend.dev>';
const MAX_BODY_LENGTH = 24_000;
const MAX_LIST_ITEMS = 80;

type PageVisit = {
  path?: unknown;
  at?: unknown;
};

type CvDownload = {
  at?: unknown;
  source?: unknown;
  language?: unknown;
};

type VisitorSessionPayload = {
  sessionId?: unknown;
  startedAt?: unknown;
  referrer?: unknown;
  pages?: unknown;
  cvDownloaded?: unknown;
  cvDownloads?: unknown;
  totalTimeSeconds?: unknown;
  summaryNumber?: unknown;
};

type NormalizedPayload = {
  sessionId: string;
  startedAt: string;
  referrer: string;
  pages: Array<{ path: string; at: string }>;
  cvDownloaded: boolean;
  cvDownloads: Array<{ at: string; source: string; language: string }>;
  totalTimeSeconds: number;
  summaryNumber: number;
};

const json = (body: Record<string, unknown>, status = 200) =>
  Response.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store',
    },
  });

const asString = (value: unknown, fallback = '') => {
  if (typeof value !== 'string') return fallback;
  return value.slice(0, 500);
};

const asNumber = (value: unknown, fallback = 0) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.max(0, Math.round(value));
};

const normalizeDate = (value: unknown) => {
  const input = asString(value);
  const date = new Date(input);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
};

const normalizePayload = (payload: VisitorSessionPayload): NormalizedPayload => {
  const rawPages = Array.isArray(payload.pages) ? payload.pages : [];
  const pages = rawPages.slice(-MAX_LIST_ITEMS).map((page: PageVisit) => ({
    path: asString(page.path, '/'),
    at: normalizeDate(page.at),
  }));

  const rawDownloads = Array.isArray(payload.cvDownloads) ? payload.cvDownloads : [];
  const cvDownloads = rawDownloads.slice(-MAX_LIST_ITEMS).map((download: CvDownload) => ({
    at: normalizeDate(download.at),
    source: asString(download.source, 'unknown'),
    language: asString(download.language, 'default'),
  }));

  return {
    sessionId: asString(payload.sessionId, 'unknown-session'),
    startedAt: normalizeDate(payload.startedAt),
    referrer: asString(payload.referrer, ''),
    pages,
    cvDownloaded: Boolean(payload.cvDownloaded),
    cvDownloads,
    totalTimeSeconds: asNumber(payload.totalTimeSeconds),
    summaryNumber: asNumber(payload.summaryNumber, 1),
  };
};

const decodeHeader = (value: string | null) => {
  if (!value) return '';

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const getLocation = (request: Request) => ({
  city: decodeHeader(request.headers.get('x-vercel-ip-city')) || 'Unknown city',
  country: decodeHeader(request.headers.get('x-vercel-ip-country')) || 'Unknown country',
});

const referrerSource = (referrer: string) => {
  if (!referrer) return 'Direct / unknown';

  try {
    return new URL(referrer).hostname.replace(/^www\./, '');
  } catch {
    return referrer;
  }
};

const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) return `${hours}h ${minutes}m ${remainingSeconds}s`;
  if (minutes > 0) return `${minutes}m ${remainingSeconds}s`;
  return `${remainingSeconds}s`;
};

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/Berlin',
  }).format(new Date(iso));

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const listItems = (items: string[]) =>
  items.length > 0
    ? items.map(item => `<li>${item}</li>`).join('')
    : '<li>None yet</li>';

const buildEmailHtml = (
  payload: NormalizedPayload,
  location: { city: string; country: string }
) => {
  const pages = payload.pages.map((page, index) =>
    `<strong>${index + 1}.</strong> ${escapeHtml(page.path)} <span>${escapeHtml(formatDate(page.at))}</span>`
  );
  const cvDownloads = payload.cvDownloads.map(download =>
    `${escapeHtml(download.language)} from ${escapeHtml(download.source)} <span>${escapeHtml(formatDate(download.at))}</span>`
  );

  return `<!doctype html>
<html>
  <body style="margin:0;background:#f4f4ef;padding:28px;font-family:Arial,Helvetica,sans-serif;color:#111111;">
    <main style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #deded6;border-radius:12px;overflow:hidden;">
      <section style="background:#111111;color:#f5f5f0;padding:28px 30px;">
        <p style="margin:0 0 10px;color:#c6f435;font-size:12px;font-weight:800;letter-spacing:0.16em;text-transform:uppercase;">Portfolio visitor update</p>
        <h1 style="margin:0;font-size:28px;line-height:1.12;">Session summary #${payload.summaryNumber}</h1>
      </section>

      <section style="padding:28px 30px;">
        <table style="width:100%;border-collapse:collapse;font-size:15px;line-height:1.5;">
          <tr>
            <td style="padding:10px 0;color:#6f6f67;width:38%;">Location</td>
            <td style="padding:10px 0;font-weight:700;">${escapeHtml(location.city)}, ${escapeHtml(location.country)}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;color:#6f6f67;">Referrer source</td>
            <td style="padding:10px 0;font-weight:700;">${escapeHtml(referrerSource(payload.referrer))}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;color:#6f6f67;">Total time so far</td>
            <td style="padding:10px 0;font-weight:700;">${escapeHtml(formatDuration(payload.totalTimeSeconds))}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;color:#6f6f67;">CV downloaded</td>
            <td style="padding:10px 0;font-weight:700;">${payload.cvDownloaded ? 'Yes' : 'No'}</td>
          </tr>
        </table>

        <h2 style="margin:28px 0 12px;font-size:15px;letter-spacing:0.12em;text-transform:uppercase;">Pages visited</h2>
        <ol style="margin:0;padding-left:20px;color:#20201d;line-height:1.7;">
          ${listItems(pages)}
        </ol>

        <h2 style="margin:28px 0 12px;font-size:15px;letter-spacing:0.12em;text-transform:uppercase;">CV clicks</h2>
        <ul style="margin:0;padding-left:20px;color:#20201d;line-height:1.7;">
          ${listItems(cvDownloads)}
        </ul>

        <p style="margin:28px 0 0;color:#77776e;font-size:12px;line-height:1.5;">
          Session ID: ${escapeHtml(payload.sessionId)}<br>
          Started: ${escapeHtml(formatDate(payload.startedAt))}
        </p>
      </section>
    </main>
  </body>
</html>`;
};

const buildEmailText = (
  payload: NormalizedPayload,
  location: { city: string; country: string }
) => {
  const pages = payload.pages.map((page, index) =>
    `${index + 1}. ${page.path} (${formatDate(page.at)})`
  ).join('\n');
  const downloads = payload.cvDownloads.map(download =>
    `- ${download.language} from ${download.source} (${formatDate(download.at)})`
  ).join('\n');

  return [
    `Portfolio visitor update #${payload.summaryNumber}`,
    `Location: ${location.city}, ${location.country}`,
    `Referrer source: ${referrerSource(payload.referrer)}`,
    `Total time so far: ${formatDuration(payload.totalTimeSeconds)}`,
    `CV downloaded: ${payload.cvDownloaded ? 'Yes' : 'No'}`,
    '',
    'Pages visited:',
    pages || 'None yet',
    '',
    'CV clicks:',
    downloads || 'None yet',
    '',
    `Session ID: ${payload.sessionId}`,
    `Started: ${formatDate(payload.startedAt)}`,
  ].join('\n');
};

const isSameOrigin = (request: Request) => {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  if (!origin || !host) return true;

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
};

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return json({ ok: false, error: 'Invalid origin' }, 403);
  }

  const rawBody = await request.text();
  if (rawBody.length > MAX_BODY_LENGTH) {
    return json({ ok: false, error: 'Payload too large' }, 413);
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    return json({ ok: false, error: 'Missing RESEND_API_KEY' }, 500);
  }

  let parsed: VisitorSessionPayload;
  try {
    parsed = JSON.parse(rawBody) as VisitorSessionPayload;
  } catch {
    return json({ ok: false, error: 'Invalid JSON' }, 400);
  }

  const payload = normalizePayload(parsed);
  const location = getLocation(request);
  const to = process.env.VISITOR_EMAIL_TO || DEFAULT_TO_EMAIL;
  const from = process.env.VISITOR_EMAIL_FROM || DEFAULT_FROM_EMAIL;
  const resend = new Resend(resendApiKey);

  const { error } = await resend.emails.send({
    from,
    to,
    subject: `Portfolio visitor: ${location.city}, ${location.country} - ${formatDuration(payload.totalTimeSeconds)}`,
    html: buildEmailHtml(payload, location),
    text: buildEmailText(payload, location),
  });

  if (error) {
    return json({ ok: false, error: error.message }, 502);
  }

  return json({ ok: true });
}

export function GET() {
  return json({ ok: true, endpoint: 'visitor-session' });
}
