import { neon } from '@neondatabase/serverless'

const MASTER_TOKEN = 'evolis2026secret'

async function checkAuth(req) {
  const token = req.headers.get('x-admin-token')
  if (!token) return false
  if (token === MASTER_TOKEN) return true
  try {
    const sql = neon(process.env.DATABASE_URL)
    const rows = await sql`SELECT valoare FROM salon_settings WHERE cheie = 'admin_password' LIMIT 1`
    if (rows.length > 0 && rows[0].valoare === token) return true
  } catch {}
  return false
}

async function initTable(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS salon_settings (
      cheie TEXT PRIMARY KEY,
      valoare TEXT,
      actualizat TIMESTAMPTZ DEFAULT NOW()
    )
  `
}

export async function GET(req) {
  if (!(await checkAuth(req))) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const sql = neon(process.env.DATABASE_URL)
  await initTable(sql)

  const rows = await sql`SELECT cheie, valoare FROM salon_settings`
  const settings = {}
  for (const r of rows) settings[r.cheie] = r.valoare

  return Response.json({ settings })
}

export async function POST(req) {
  if (!(await checkAuth(req))) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const sql = neon(process.env.DATABASE_URL)
  await initTable(sql)

  const body = await req.json()
  const { cheie, valoare } = body

  if (!cheie || valoare === undefined) return Response.json({ error: 'Missing cheie/valoare' }, { status: 400 })

  await sql`
    INSERT INTO salon_settings (cheie, valoare, actualizat)
    VALUES (${cheie}, ${valoare}, NOW())
    ON CONFLICT (cheie) DO UPDATE SET valoare = ${valoare}, actualizat = NOW()
  `

  return Response.json({ ok: true })
}
