import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const BOT_TOKEN = '8465613425:AAEawrbtzjSTyIpmtAtgYQEeOBCjc2T3iAE'
const CHAT_ID = '645634084'

async function getDb() {
  const sql = neon(process.env.DATABASE_URL)
  await sql`
    CREATE TABLE IF NOT EXISTS programari (
      id BIGINT PRIMARY KEY,
      nume TEXT,
      telefon TEXT,
      serviciu TEXT,
      pret INT,
      durata INT,
      data TEXT,
      ora TEXT,
      plata TEXT,
      observatii TEXT,
      creat TIMESTAMPTZ DEFAULT NOW(),
      status TEXT DEFAULT 'pending'
    )
  `
  return sql
}

async function sendTelegram(text) {
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'HTML' })
    })
  } catch {}
}

export async function POST(request) {
  const body = await request.json()
  const { nume, telefon, serviciu, data } = body

  if (!nume || !telefon || !serviciu || !data) {
    return NextResponse.json({ error: 'Câmpuri obligatorii lipsă' }, { status: 400 })
  }

  try {
    const sql = await getDb()
    const id = Date.now()

    await sql`
      INSERT INTO programari (id, nume, telefon, serviciu, pret, durata, data, ora, plata, observatii)
      VALUES (${id}, ${body.nume}, ${body.telefon}, ${body.serviciu}, ${body.pret || 0},
              ${body.durata || 0}, ${body.data}, ${body.ora || ''}, ${body.plata || ''}, ${body.observatii || ''})
    `

    await sendTelegram(
      `🔔 <b>Programare nouă!</b>\n\n` +
      `👤 <b>${body.nume}</b>\n` +
      `📞 ${body.telefon}\n` +
      `💅 ${body.serviciu}\n` +
      `📅 ${body.data} · ${body.ora}\n` +
      `💳 Plată: ${body.plata === 'numerar' ? 'Numerar' : 'Transfer bancar'}\n` +
      `💰 Total: ${body.pret} lei`
    )

    return NextResponse.json({ success: true, id })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function GET() {
  try {
    const sql = await getDb()
    const rows = await sql`SELECT * FROM programari ORDER BY creat DESC`
    return NextResponse.json(rows)
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
