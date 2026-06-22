import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { checkAuth } from '../../../lib/adminAuth'

async function getDb() {
  const sql = neon(process.env.DATABASE_URL)
  await sql`
    CREATE TABLE IF NOT EXISTS servicii_galerie (
      id BIGINT PRIMARY KEY,
      salon_id TEXT DEFAULT 'evolis',
      serviciu_id BIGINT NOT NULL,
      url TEXT NOT NULL,
      titlu TEXT DEFAULT '',
      ordine INTEGER DEFAULT 0,
      creat TIMESTAMPTZ DEFAULT NOW()
    )
  `
  return sql
}

export async function GET(request) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(request.url)
  const serviciu_id = searchParams.get('serviciu_id')
  const sql = await getDb()
  const rows = serviciu_id
    ? await sql`SELECT * FROM servicii_galerie WHERE serviciu_id = ${serviciu_id} ORDER BY ordine ASC`
    : await sql`SELECT * FROM servicii_galerie WHERE salon_id = 'evolis' ORDER BY serviciu_id, ordine ASC`
  return NextResponse.json(rows)
}

export async function POST(request) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const sql = await getDb()
  const id = Date.now()
  const maxOrd = await sql`SELECT COALESCE(MAX(ordine), 0) as m FROM servicii_galerie WHERE serviciu_id = ${body.serviciu_id}`
  await sql`
    INSERT INTO servicii_galerie (id, salon_id, serviciu_id, url, titlu, ordine)
    VALUES (${id}, 'evolis', ${body.serviciu_id}, ${body.url}, ${body.titlu || ''}, ${maxOrd[0].m + 1})
  `
  return NextResponse.json({ success: true, id })
}

export async function DELETE(request) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await request.json()
  const sql = await getDb()
  await sql`DELETE FROM servicii_galerie WHERE id = ${id}`
  return NextResponse.json({ success: true })
}
