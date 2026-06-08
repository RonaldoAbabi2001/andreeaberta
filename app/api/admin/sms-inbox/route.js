import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const SECRET = 'evolis2026secret'

// GET — conversatii sau mesaje dintr-o conversatie
export async function GET(request) {
  if (request.headers.get('x-admin-token') !== SECRET)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sql = neon(process.env.DATABASE_URL)
  const { searchParams } = new URL(request.url)
  const telefon = normTel(searchParams.get('telefon'))

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
    SELECT
      sub.telefon,
      sub.ultim_mesaj,
      sub.ultima_directie,
      sub.ultima_data,
      c.nume,
      (SELECT COUNT(*)::int FROM sms_inbox WHERE telefon = sub.telefon AND directie = 'IN' AND citit = false) AS necitite
    FROM (
      SELECT DISTINCT ON (telefon)
        telefon,
        mesaj AS ultim_mesaj,
        directie AS ultima_directie,
        creat AS ultima_data
      FROM sms_inbox
      ORDER BY telefon, creat DESC
    ) sub
    LEFT JOIN clienti c ON c.telefon = sub.telefon
    ORDER BY sub.ultima_data DESC
  `
  return NextResponse.json(conversatii)
}

function normTel(t) {
  if (!t) return t
  t = t.trim().replace(/\s+/g, '')
  if (t.startsWith('+40')) t = '0' + t.slice(3)
  return t
}

// POST — mesaj nou din reader (Beelink) sau reply din admin
export async function POST(request) {
  if (request.headers.get('x-admin-token') !== SECRET)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { mesaj, directie, creat } = body
  const telefon = normTel(body.telefon)

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
