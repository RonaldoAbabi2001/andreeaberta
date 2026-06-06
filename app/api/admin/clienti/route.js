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
      id BIGINT PRIMARY KEY, nume TEXT, telefon TEXT, email TEXT,
      data_nastere TEXT, observatii TEXT, sursa TEXT DEFAULT 'manual',
      parola TEXT, creat TIMESTAMPTZ DEFAULT NOW()
    )
  `
  await sql`ALTER TABLE clienti ADD COLUMN IF NOT EXISTS parola TEXT`
  await sql`ALTER TABLE clienti ADD COLUMN IF NOT EXISTS provenienta TEXT`
  await sql`ALTER TABLE clienti ADD COLUMN IF NOT EXISTS puncte INTEGER DEFAULT 0`
  await sql`ALTER TABLE clienti ADD COLUMN IF NOT EXISTS vizite_total INTEGER DEFAULT 0`
  return sql
}

export async function DELETE(request) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await request.json()
  const sql = await getDb()
  await sql`DELETE FROM clienti WHERE id = ${id}`
  return NextResponse.json({ success: true })
}

export async function PATCH(request) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const sql = await getDb()
  await sql`
    UPDATE clienti SET
      nume = ${body.nume || ''},
      telefon = ${body.telefon || ''},
      email = ${body.email || ''},
      data_nastere = ${body.data_nastere || ''},
      observatii = ${body.observatii || ''},
      sursa = ${body.sursa || ''},
      provenienta = ${body.provenienta || ''}
    WHERE id = ${body.id}
  `
  return NextResponse.json({ success: true })
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
    const telefoane = body.clienti.map(c => c.telefon).filter(Boolean)
    const existenti = telefoane.length > 0
      ? await sql`SELECT telefon FROM clienti WHERE telefon = ANY(${telefoane})`
      : []
    const existenteSet = new Set(existenti.map(r => r.telefon))

    if (body.preview) {
      const noi = body.clienti.filter(c => c.telefon && !existenteSet.has(c.telefon))
      return NextResponse.json({ success: true, noi: noi.length, duplicate: existenteSet.size, preview: true })
    }

    let inserted = 0, skipped = 0
    for (const c of body.clienti) {
      if (!c.telefon) continue
      if (existenteSet.has(c.telefon)) { skipped++; continue }
      const id = Date.now() + Math.floor(Math.random() * 10000)
      await sql`
        INSERT INTO clienti (id, nume, telefon, email, data_nastere, observatii, sursa)
        VALUES (${id}, ${c.nume || ''}, ${c.telefon}, ${c.email || ''}, ${c.data_nastere || ''}, ${c.observatii || ''}, 'import')
        ON CONFLICT DO NOTHING
      `
      inserted++
    }
    return NextResponse.json({ success: true, inserted, skipped })
  }

  const sql = await getDb()
  await sql`ALTER TABLE clienti ADD COLUMN IF NOT EXISTS tip_client TEXT`
  const existing = await sql`SELECT id FROM clienti WHERE telefon = ${body.telefon}`
  if (existing.length > 0) {
    if (body.tip_client) {
      await sql`UPDATE clienti SET tip_client = ${body.tip_client} WHERE telefon = ${body.telefon}`
    }
    return NextResponse.json({ success: true, id: existing[0].id, duplicate: true })
  }
  const id = Date.now()
  await sql`
    INSERT INTO clienti (id, nume, telefon, email, data_nastere, observatii, sursa, tip_client)
    VALUES (${id}, ${body.nume || ''}, ${body.telefon}, ${body.email || ''}, ${body.data_nastere || ''}, ${body.observatii || ''}, ${body.sursa || 'manual'}, ${body.tip_client || null})
  `
  return NextResponse.json({ success: true, id })
}
