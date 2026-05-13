import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const SECRET = 'evolis2026secret'
function checkAuth(r) { return r.headers.get('x-admin-token') === SECRET }

async function getDb() {
  const sql = neon(process.env.DATABASE_URL)
  await sql`
    CREATE TABLE IF NOT EXISTS programare_materiale (
      id BIGINT PRIMARY KEY,
      salon_id TEXT DEFAULT 'evolis',
      programare_id BIGINT NOT NULL,
      produs_id BIGINT,
      produs_nume TEXT NOT NULL,
      marca TEXT DEFAULT '',
      cantitate NUMERIC DEFAULT 1,
      creat TIMESTAMPTZ DEFAULT NOW()
    )
  `
  return sql
}

export async function GET(request) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(request.url)
  const programare_id = searchParams.get('programare_id')
  if (!programare_id) return NextResponse.json([])
  const sql = await getDb()
  const rows = await sql`SELECT * FROM programare_materiale WHERE programare_id = ${programare_id} ORDER BY creat ASC`
  return NextResponse.json(rows)
}

export async function POST(request) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const sql = await getDb()
  const id = Date.now()
  await sql`
    INSERT INTO programare_materiale (id, salon_id, programare_id, produs_id, produs_nume, marca, cantitate)
    VALUES (${id}, 'evolis', ${body.programare_id}, ${body.produs_id || null}, ${body.produs_nume}, ${body.marca || ''}, ${body.cantitate || 1})
  `
  return NextResponse.json({ success: true, id })
}

export async function DELETE(request) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await request.json()
  const sql = await getDb()
  await sql`DELETE FROM programare_materiale WHERE id = ${id}`
  return NextResponse.json({ success: true })
}
