import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const SECRET = 'evolis2026secret'

async function getDb() {
  const sql = neon(process.env.DATABASE_URL)
  await sql`
    CREATE TABLE IF NOT EXISTS roata_norocului (
      id BIGINT PRIMARY KEY,
      telefon TEXT NOT NULL UNIQUE,
      nume TEXT,
      premiu TEXT NOT NULL,
      cod TEXT NOT NULL UNIQUE,
      creat TIMESTAMPTZ DEFAULT NOW(),
      folosit BOOLEAN DEFAULT FALSE,
      folosit_la TIMESTAMPTZ
    )
  `
  return sql
}

function genCod() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let cod = 'EV-'
  for (let i = 0; i < 5; i++) cod += chars[Math.floor(Math.random() * chars.length)]
  return cod
}

// GET — verifică dacă telefonul a mai jucat (public) sau listează toate (admin)
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const telefon = searchParams.get('telefon')
  const isAdmin = request.headers.get('x-admin-token') === SECRET

  const sql = await getDb()

  if (isAdmin) {
    const rows = await sql`SELECT * FROM roata_norocului ORDER BY creat DESC`
    return NextResponse.json(rows)
  }

  if (!telefon) return NextResponse.json({ error: 'Telefon lipsă' }, { status: 400 })
  const rows = await sql`SELECT premiu, cod, folosit FROM roata_norocului WHERE telefon = ${telefon}`
  if (rows.length > 0) return NextResponse.json({ exists: true, ...rows[0] })
  return NextResponse.json({ exists: false })
}

// POST — salvează un spin nou
export async function POST(request) {
  const { telefon, nume, premiu } = await request.json()
  if (!telefon || !premiu) return NextResponse.json({ error: 'Date lipsă' }, { status: 400 })

  const sql = await getDb()

  // dublu check să nu joace de 2x
  const existing = await sql`SELECT cod, premiu FROM roata_norocului WHERE telefon = ${telefon}`
  if (existing.length > 0) return NextResponse.json({ error: 'Deja jucat', exists: true, cod: existing[0].cod, premiu: existing[0].premiu }, { status: 409 })

  const id = Date.now()
  let cod = genCod()
  // ensure unique cod
  let attempts = 0
  while (attempts < 5) {
    const conflict = await sql`SELECT id FROM roata_norocului WHERE cod = ${cod}`
    if (conflict.length === 0) break
    cod = genCod()
    attempts++
  }

  await sql`INSERT INTO roata_norocului (id, telefon, nume, premiu, cod) VALUES (${id}, ${telefon}, ${nume || ''}, ${premiu}, ${cod})`
  return NextResponse.json({ success: true, cod, premiu })
}

// PATCH — admin marchează codul ca folosit
export async function PATCH(request) {
  if (request.headers.get('x-admin-token') !== SECRET)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { cod } = await request.json()
  const sql = await getDb()
  await sql`UPDATE roata_norocului SET folosit = TRUE, folosit_la = NOW() WHERE cod = ${cod}`
  return NextResponse.json({ success: true })
}
