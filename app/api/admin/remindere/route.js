import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { checkAuth as checkSessionAuth } from '../../../lib/adminAuth'
import { getReminderSettings, REMINDER_TYPES } from '../../../lib/reminders'

export const dynamic = 'force-dynamic'

// Auth: token de sesiune admin SAU parola stocată în salon_settings (ca la /api/admin/setari)
async function checkAuth(req, sql) {
  if (checkSessionAuth(req)) return true
  const token = req.headers.get('x-admin-token')
  if (!token) return false
  try {
    const rows = await sql`SELECT valoare FROM salon_settings WHERE cheie = 'admin_password' LIMIT 1`
    if (rows.length > 0 && rows[0].valoare === token) return true
  } catch {}
  return false
}

async function initTables(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS salon_settings (
      cheie TEXT PRIMARY KEY, valoare TEXT, actualizat TIMESTAMPTZ DEFAULT NOW()
    )`
  await sql`
    CREATE TABLE IF NOT EXISTS sms_queue (
      id BIGINT PRIMARY KEY, telefon TEXT NOT NULL, mesaj TEXT NOT NULL,
      tip TEXT DEFAULT 'confirmare', programare_id BIGINT,
      de_trimis_la TIMESTAMPTZ DEFAULT NOW(), trimis BOOLEAN DEFAULT FALSE,
      trimis_la TIMESTAMPTZ, eroare TEXT, creat TIMESTAMPTZ DEFAULT NOW()
    )`
}

// GET — listă SMS din coadă + setările de reminder. ?status=pending|trimis|eroare
export async function GET(request) {
  const sql = neon(process.env.DATABASE_URL)
  await initTables(sql)
  if (!(await checkAuth(request, sql)))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')

  let sms
  if (status === 'pending') {
    sms = await sql`
      SELECT id, telefon, mesaj, tip, programare_id, de_trimis_la, trimis, trimis_la, eroare
      FROM sms_queue WHERE trimis = false AND (eroare IS NULL OR eroare = '')
      ORDER BY de_trimis_la DESC LIMIT 100`
  } else if (status === 'trimis') {
    sms = await sql`
      SELECT id, telefon, mesaj, tip, programare_id, de_trimis_la, trimis, trimis_la, eroare
      FROM sms_queue WHERE trimis = true
      ORDER BY trimis_la DESC LIMIT 100`
  } else if (status === 'eroare') {
    sms = await sql`
      SELECT id, telefon, mesaj, tip, programare_id, de_trimis_la, trimis, trimis_la, eroare
      FROM sms_queue WHERE eroare IS NOT NULL AND eroare <> ''
      ORDER BY de_trimis_la DESC LIMIT 100`
  } else {
    sms = await sql`
      SELECT id, telefon, mesaj, tip, programare_id, de_trimis_la, trimis, trimis_la, eroare
      FROM sms_queue ORDER BY creat DESC LIMIT 100`
  }

  // Statistici rapide
  const statsRows = await sql`
    SELECT
      COUNT(*) FILTER (WHERE trimis = false AND (eroare IS NULL OR eroare = '')) AS pending,
      COUNT(*) FILTER (WHERE trimis = true) AS trimise,
      COUNT(*) FILTER (WHERE eroare IS NOT NULL AND eroare <> '') AS erori
    FROM sms_queue`
  const stats = statsRows[0] || { pending: 0, trimise: 0, erori: 0 }

  const settings = await getReminderSettings(sql)
  return NextResponse.json({ sms, settings, stats })
}

// POST — salvează setările de reminder (cheia 'reminder_settings' în salon_settings)
export async function POST(request) {
  const sql = neon(process.env.DATABASE_URL)
  await initTables(sql)
  if (!(await checkAuth(request, sql)))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const incoming = body.settings || {}

  // Validare minimă: păstrează doar tipurile cunoscute, curăță câmpurile
  const clean = {}
  for (const t of REMINDER_TYPES) {
    const s = incoming[t] || {}
    clean[t] = {
      activ: !!s.activ,
      unit: ['imediat', 'ore_inainte', 'zile_dupa'].includes(s.unit) ? s.unit : 'imediat',
      offset: Math.max(0, Math.min(365, Number(s.offset) || 0)),
      text: String(s.text || '').slice(0, 500),
    }
  }

  await sql`
    INSERT INTO salon_settings (cheie, valoare, actualizat)
    VALUES ('reminder_settings', ${JSON.stringify(clean)}, NOW())
    ON CONFLICT (cheie) DO UPDATE SET valoare = ${JSON.stringify(clean)}, actualizat = NOW()`

  return NextResponse.json({ ok: true, settings: clean })
}

// PATCH — retrimite un SMS eșuat (îl repune în coadă pentru worker-ul de pe Beelink)
export async function PATCH(request) {
  const sql = neon(process.env.DATABASE_URL)
  await initTables(sql)
  if (!(await checkAuth(request, sql)))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  if (!body.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  await sql`
    UPDATE sms_queue
    SET trimis = false, eroare = NULL, de_trimis_la = NOW()
    WHERE id = ${body.id}`

  return NextResponse.json({ ok: true })
}
