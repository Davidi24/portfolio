import { ensureSessionsTable, getSql, json } from './visitorTracking.js';

export async function GET() {
  try {
    const sql = getSql();
    await ensureSessionsTable(sql);
    await sql.query("DELETE FROM sessions WHERE created_at < NOW() - INTERVAL '7 days'");
    return json({ ok: true });
  } catch (error) {
    console.error('Cleanup failed', error);
    return json({ ok: false, error: 'Cleanup failed' }, 500);
  }
}
