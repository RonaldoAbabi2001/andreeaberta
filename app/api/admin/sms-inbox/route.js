import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const SECRET = 'evolis2026secret'

// GET — conversatii sau mesaje dintr-o conversatie
export async function GET(request) {
  if (request.headers.get('x-admin-token') !== SECRET)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sql = neon(process.env.DATABASE_URL)
  const { searchParams } = new URL(request.url)
  const telefon = searchParams.get('telefon')

  if (telefon) {
    // Toate mesajele cu un client specific
    const mesaje = await sql`
      SELECT * FROM sms_inbox WHERE telefon = ${telefon}
      ORDER BY creat ASC
    `
    await sql`UPDATE sms_inbox SET citit = true WHERE telefon = ${telefon} AND directie = 'IN'`
    return NextResponse.json(mesaje)
  }

  // Lista conversatii — ultimul mesaj per telefon + numar necitite
  const conversatii = await sql`
    SELECT DISTINCT ON (telefon)
      i.telefon,
      i.mesaj AS ultim_mesaj,
      i.directie AS ultima_directie,
      i.creat AS ultima_data,
      c.nume,
      (SELECT COUNT(*) FROM sms_inbox WHERE telefon = i.telefon AND directie = 'IN' AND citit = false)::int AS necitite
    FROM sms_inbox i
    LEFT JOIN clienti c ON c.telefon = i.telefon
    ORDER BY telefon, creat DESC
  `
  return NextResponse.json(conversatii)
}

// POST — mesaj nou din reader (Beelink) sau reply din admin
export async function POST(request) {
  if (request.headers.get('x-admin-token') !== SECRET)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { telefon, mesaj, directie, creat } = body

  if (!telefon || !mesaj)
    return NextResponse.json({ error: 'Date incomplete' }, { status: 400 })

  const sql = neon(process.env.DATABASE_URL)
  const id = `${telefon}_${new Date(creat || Date.now()).getTime()}`

  await sql`
    INSERT INTO sms_inbox (id, telefon, mesaj, directie, creat)
    VALUES (${id}, ${telefon}, ${mesaj}, ${directie || 'IN'}, ${creat ? new Date(creat).toISOString() : new Date().toISOString()})
    ON CONFLICT (id) DO NOTHING
  `

  // Daca e reply (OUT) — adauga si in sms_queue pentru trimitere
  if (directie === 'OUT') {
    const qid = Date.now()
    await sql`
      INSERT INTO sms_queue (id, telefon, mesaj, tip, de_trimis_la)
      VALUES (${qid}, ${telefon}, ${mesaj}, 'reply', NOW())
    `
  }

  return NextResponse.json({ success: true, id })
}
