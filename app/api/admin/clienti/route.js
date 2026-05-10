import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const SECRET = 'evolis2026secret'

function checkAuth(request) {
  const token = request.headers.get('x-admin-token')
  return token === SECRET
}

async function getDb() {
  const sql = neon(process.env.DATABASE_URL)
  await sql`
    CREATE TABLE IF NOT EXISTS clienti (
      id BIGINT PRIMARY KEY,
      nume TEXT,
      telefon TEXT,
      email TEXT,
      data_nastere TEXT,
      observatii TEXT,
      sursa TEXT DEFAULT 'manual',
      creat TIMESTAMPTZ DEFAULT NOW()
    )
  `
  return sql
}

export async function GET(request) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const sql = await getDb()
  const clienti = await sql`SELECT * FROM clienti ORDER BY creat DESC`
  return NextResponse.json(clienti)
}

export async function POST(request) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()

  if (body.bulk) {
    const sql = await getDb()
    let inserted = 0
    for (const c of body.clienti) {
      if (!c.telefon) continue
      const id = Date.now() + Math.floor(Math.random() * 10000)
      await sql`
        INSERT INTO clienti (id, nume, telefon, email, data_nastere, observatii, sursa)
        VALUES (${id}, ${c.nume || ''}, ${c.telefon}, ${c.email || ''}, ${c.data_nastere || ''}, ${c.observatii || ''}, 'import')
        ON CONFLICT DO NOTHING
      `
      inserted++
    }
    return NextResponse.json({ success: true, inserted })
  }

  const sql = await getDb()
  const existing = await sql`SELECT id FROM clienti WHERE telefon = ${body.telefon}`
  if (existing.length > 0) return NextResponse.json({ success: true, id: existing[0].id, duplicate: true })
  const id = Date.now()
  await sql`
    INSERT INTO clienti (id, nume, telefon, email, data_nastere, observatii, sursa)
    VALUES (${id}, ${body.nume || ''}, ${body.telefon}, ${body.email || ''}, ${body.data_nastere || ''}, ${body.observatii || ''}, ${body.sursa || 'manual'})
  `
  return NextResponse.json({ success: true, id })
}
