import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const SECRET = 'evolis2026secret'
const INTERVAL_ZILE = 14

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

async function codUnic(sql) {
  let cod = genCod()
  for (let i = 0; i < 5; i++) {
    const conflict = await sql`SELECT id FROM roata_norocului WHERE cod = ${cod}`
    if (conflict.length === 0) return cod
    cod = genCod()
  }
  return cod
}

function calcExpirare(creat) {
  return new Date(new Date(creat).getTime() + INTERVAL_ZILE * 24 * 60 * 60 * 1000)
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
  const rows = await sql`SELECT premiu, cod, folosit, creat FROM roata_norocului WHERE telefon = ${telefon}`
  if (rows.length > 0) {
    const expira = calcExpirare(rows[0].creat)
    const blocat = new Date() < expira
    return NextResponse.json({ exists: true, blocat, data_expirare: expira.toISOString(), premiu: rows[0].premiu, cod: rows[0].cod, folosit: rows[0].folosit })
  }
  return NextResponse.json({ exists: false })
}

// POST — salvează un spin nou (sau re-spin după 14 zile)
export async function POST(request) {
  const { telefon, nume, premiu } = await request.json()
  if (!telefon || !premiu) return NextResponse.json({ error: 'Date lipsă' }, { status: 400 })

  const sql = await getDb()

  const existing = await sql`SELECT creat FROM roata_norocului WHERE telefon = ${telefon}`
  if (existing.length > 0) {
    const expira = calcExpirare(existing[0].creat)
    if (new Date() < expira) {
      return NextResponse.json({ error: 'Blocat', blocat: true, data_expirare: expira.toISOString() }, { status: 409 })
    }
    // >= 14 zile → re-spin: actualizăm înregistrarea
    const cod = await codUnic(sql)
    await sql`UPDATE roata_norocului SET premiu=${premiu}, cod=${cod}, creat=NOW(), folosit=FALSE, folosit_la=NULL, nume=${nume || ''} WHERE telefon=${telefon}`
    return NextResponse.json({ success: true, cod, premiu, respin: true })
  }

  const id = Date.now()
  const cod = await codUnic(sql)
  await sql`INSERT INTO roata_norocului (id, telefon, nume, premiu, cod) VALUES (${id}, ${telefon}, ${nume || ''}, ${premiu}, ${cod})`
  return NextResponse.json({ success: true, cod, premiu })
}

// DELETE — admin resetează un număr sau toate intrările
export async function DELETE(request) {
  if (request.headers.get('x-admin-token') !== SECRET)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { telefon, all } = await request.json()
  const sql = await getDb()
  if (all) {
    await sql`DELETE FROM roata_norocului`
    return NextResponse.json({ success: true, tip: 'all' })
  }
  if (telefon) {
    await sql`DELETE FROM roata_norocului WHERE telefon = ${telefon}`
    return NextResponse.json({ success: true, tip: 'single' })
  }
  return NextResponse.json({ error: 'Parametri lipsă' }, { status: 400 })
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
