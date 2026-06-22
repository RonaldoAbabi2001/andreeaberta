import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { checkAuth } from '../../lib/adminAuth'

export const dynamic = 'force-dynamic'

async function initTable(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS sms_queue (
      id BIGINT PRIMARY KEY,
      telefon TEXT NOT NULL,
      mesaj TEXT NOT NULL,
      tip TEXT DEFAULT 'confirmare',
      programare_id BIGINT,
      de_trimis_la TIMESTAMPTZ DEFAULT NOW(),
      trimis BOOLEAN DEFAULT FALSE,
      trimis_la TIMESTAMPTZ,
      eroare TEXT,
      creat TIMESTAMPTZ DEFAULT NOW()
    )
  `
}

// GET — Beelink cere SMS-urile pending, sau admin cere SMS-urile unei programari
export async function GET(request) {
  if (!checkAuth(request))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const sql = neon(process.env.DATABASE_URL)
  await initTable(sql)
  const { searchParams } = new URL(request.url)
  const programare_id = searchParams.get('programare_id')
  if (programare_id) {
    const rows = await sql`
      SELECT * FROM sms_queue WHERE programare_id = ${programare_id}
      ORDER BY de_trimis_la ASC
    `
    return NextResponse.json(rows)
  }
  const rows = await sql`
    SELECT * FROM sms_queue
    WHERE trimis = false AND de_trimis_la <= NOW()
    ORDER BY de_trimis_la ASC
    LIMIT 10
  `
  return NextResponse.json(rows)
}

// POST — adauga SMS in coada
export async function POST(request) {
  if (!checkAuth(request))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const sql = neon(process.env.DATABASE_URL)
  await initTable(sql)
  const id = Date.now()
  await sql`
    INSERT INTO sms_queue (id, telefon, mesaj, tip, programare_id, de_trimis_la)
    VALUES (${id}, ${body.telefon}, ${body.mesaj}, ${body.tip || 'confirmare'},
            ${body.programare_id || null},
            ${body.de_trimis_la ? new Date(body.de_trimis_la).toISOString() : new Date().toISOString()})
  `
  return NextResponse.json({ success: true, id })
}

// PATCH — marcheaza ca trimis sau eroare
export async function PATCH(request) {
  if (!checkAuth(request))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const sql = neon(process.env.DATABASE_URL)
  if (body.eroare) {
    await sql`UPDATE sms_queue SET eroare = ${body.eroare} WHERE id = ${body.id}`
  } else {
    await sql`UPDATE sms_queue SET trimis = true, trimis_la = NOW() WHERE id = ${body.id}`
  }
  return NextResponse.json({ success: true })
}
