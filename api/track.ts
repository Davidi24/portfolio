import {
  asNumber,
  asString,
  buildReplyEmail,
  buildStartEmail,
  emailRecipients,
  ensureSessionsTable,
  getLocation,
  getSql,
  json,
  makeThreadMessageId,
  normalizeActivities,
  normalizeIso,
  parseStoredInfo,
  sendEmailWithRetry,
  type ActivityItem,
  type SessionRow,
  type StoredVisitorInfo,
  type VisitorInfo,
} from './visitorTracking.js';

const MAX_BODY_LENGTH = 64_000;

type TrackPayload = {
  action?: unknown;
  sessionId?: unknown;
  timestamp?: unknown;
  currentUrl?: unknown;
  referrer?: unknown;
  deviceType?: unknown;
  browserName?: unknown;
  userAgent?: unknown;
  activities?: unknown;
  allActivities?: unknown;
  totalTimeSeconds?: unknown;
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

const readPayload = async (request: Request): Promise<TrackPayload> => {
  const rawBody = await request.text();
  if (rawBody.length > MAX_BODY_LENGTH) {
    throw new Error('Payload too large');
  }

  return JSON.parse(rawBody) as TrackPayload;
};

const loadSession = async (sessionId: string): Promise<SessionRow | null> => {
  const sql = getSql();
  const rows = await sql`
    SELECT id, message_id, visitor_info, created_at
    FROM sessions
    WHERE id = ${sessionId}
    LIMIT 1
  ` as SessionRow[];

  return rows[0] ?? null;
};

const updateStoredInfo = async (sessionId: string, info: StoredVisitorInfo) => {
  try {
    const sql = getSql();
    await sql`
      UPDATE sessions
      SET visitor_info = ${JSON.stringify(info)}::jsonb
      WHERE id = ${sessionId}
    `;
  } catch (error) {
    console.error('DB update failed', error);
  }
};

async function handleStart(request: Request, payload: TrackPayload) {
  const location = getLocation(request);
  const timestamp = normalizeIso(payload.timestamp);
  const sessionId = asString(payload.sessionId, crypto.randomUUID(), 180);
  const { from, to } = emailRecipients();
  const messageId = makeThreadMessageId(sessionId);

  const info: VisitorInfo = {
    sessionId,
    city: location.city,
    country: location.country,
    deviceType: asString(payload.deviceType, 'unknown', 80),
    browserName: asString(payload.browserName, 'unknown', 120),
    currentUrl: asString(payload.currentUrl, '', 1000),
    referrer: asString(payload.referrer, '', 1000),
    timestamp,
    userAgent: asString(payload.userAgent, request.headers.get('user-agent') || '', 1000),
  };

  const email = buildStartEmail(info);
  const resendData = await sendEmailWithRetry({
    from,
    to,
    subject: `Portfolio visitor: ${info.city}, ${info.country}`,
    html: email.html,
    text: email.text,
    headers: {
      'Message-ID': messageId,
    },
  });

  const storedInfo: StoredVisitorInfo = {
    ...info,
    resendEmailId: resendData?.id,
    activities: [],
    updates: [],
  };

  try {
    const sql = getSql();
    await ensureSessionsTable(sql);
    await sql`
      INSERT INTO sessions (id, message_id, visitor_info, created_at)
      VALUES (${sessionId}, ${messageId}, ${JSON.stringify(storedInfo)}::jsonb, ${timestamp})
      ON CONFLICT (id) DO UPDATE
      SET message_id = EXCLUDED.message_id,
          visitor_info = EXCLUDED.visitor_info
    `;
  } catch (error) {
    console.error('DB write failed after initial email', error);
  }

  return json({ ok: true, sessionId });
}

async function handleReply(action: 'update' | 'final', payload: TrackPayload) {
  const timestamp = normalizeIso(payload.timestamp);
  const sessionId = asString(payload.sessionId, '', 180);
  if (!sessionId) return json({ ok: false, error: 'Missing sessionId' }, 400);

  const sql = getSql();
  await ensureSessionsTable(sql);
  const row = await loadSession(sessionId);
  if (!row) {
    console.error('Session not found for reply', { sessionId, action });
    return json({ ok: false, error: 'Session not found' }, 404);
  }

  const storedInfo = parseStoredInfo(row.visitor_info);
  if (!storedInfo) {
    console.error('Session has invalid visitor_info', { sessionId, action });
    return json({ ok: false, error: 'Invalid stored session' }, 500);
  }

  const activities = normalizeActivities(payload.activities);
  const allActivities = normalizeActivities(payload.allActivities);
  const mergedActivities = allActivities.length > 0
    ? allActivities
    : [...(storedInfo.activities ?? []), ...activities].slice(-160);
  const totalTimeSeconds = asNumber(payload.totalTimeSeconds);
  const { from, to } = emailRecipients();
  const email = buildReplyEmail({
    action,
    info: storedInfo,
    activities,
    allActivities: mergedActivities,
    totalTimeSeconds,
    timestamp,
  });

  const resendData = await sendEmailWithRetry({
    from,
    to,
    subject: `Re: Portfolio visitor: ${storedInfo.city}, ${storedInfo.country}`,
    html: email.html,
    text: email.text,
    headers: {
      'In-Reply-To': row.message_id,
      References: row.message_id,
    },
  });

  const updatedInfo: StoredVisitorInfo = {
    ...storedInfo,
    currentUrl: asString(payload.currentUrl, storedInfo.currentUrl, 1000),
    activities: mergedActivities,
    updates: [
      ...(storedInfo.updates ?? []),
      {
        action,
        sentAt: timestamp,
        resendEmailId: resendData?.id,
        activities,
        totalTimeSeconds,
      },
    ].slice(-80),
    finalSentAt: action === 'final' ? timestamp : storedInfo.finalSentAt,
  };

  await updateStoredInfo(sessionId, updatedInfo);
  return json({ ok: true });
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return json({ ok: false, error: 'Invalid origin' }, 403);
  }

  let payload: TrackPayload;
  try {
    payload = await readPayload(request);
  } catch (error) {
    console.error('Invalid tracking payload', error);
    return json({ ok: false, error: 'Invalid payload' }, 400);
  }

  const action = asString(payload.action);

  try {
    if (action === 'start') return await handleStart(request, payload);
    if (action === 'update' || action === 'final') return await handleReply(action, payload);
    return json({ ok: false, error: 'Unknown action' }, 400);
  } catch (error) {
    console.error('Tracking endpoint failed', error);
    return json({ ok: false, error: 'Tracking failed' }, 500);
  }
}

export function GET() {
  return json({ ok: true, endpoint: 'track' });
}
