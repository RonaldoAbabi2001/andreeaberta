import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const BOT_TOKEN = '8465613425:AAEawrbtzjSTyIpmtAtgYQEeOBCjc2T3iAE'
const CHAT_ID = '645634084'

async function sendTelegram(text) {
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'HTML' })
    })
  } catch {}
}

const LUNI = ['Ianuarie','Februarie','Martie','Aprilie','Mai','Iunie','Iulie','August','Septembrie','Octombrie','Noiembrie','Decembrie']

function parseDateRO(str) {
  if (!str) return null
  const parts = str.trim().split(' ')
  if (parts.length !== 3) return null
  const day = parseInt(parts[0])
  const month = LUNI.indexOf(parts[1])
  const year = parseInt(parts[2])
  if (month === -1 || isNaN(day) || isNaN(year)) return null
  return new Date(year, month, day)
}

function getClientId(request) {
  const token = request.headers.get('x-client-token')
  if (!token?.startsWith('client_')) return null
  return token.replace('client_', '')
}

export async function GET(request) {
  const clientId = getClientId(request)
  if (!clientId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sql = neon(process.env.DATABASE_URL)
  const clients = await sql`SELECT * FROM clienti WHERE id = ${clientId}`
  if (clients.length === 0) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const client = clients[0]
  const programari = await sql`
    SELECT * FROM programari WHERE telefon = ${client.telefon}
    ORDER BY creat DESC
  `
  return NextResponse.json({ client, programari })
}

export async function PATCH(request) {
  const clientId = getClientId(request)
  if (!clientId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sql = neon(process.env.DATABASE_URL)
  const clients = await sql`SELECT * FROM clienti WHERE id = ${clientId}`
  if (clients.length === 0) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const client = clients[0]
  const { id } = await request.json()

  const rows = await sql`SELECT * FROM programari WHERE id = ${id} AND telefon = ${client.telefon}`
  if (rows.length === 0) return NextResponse.json({ error: 'Programarea nu a fost găsită' }, { status: 404 })

  const p = rows[0]

  // Check 24h rule
  const bookingDate = parseDateRO(p.data)
  if (!bookingDate) return NextResponse.json({ error: 'Dată invalidă' }, { status: 400 })

  // Add time of appointment to the date
  if (p.ora) {
    const [h, m] = p.ora.split(':').map(Number)
    bookingDate.setHours(h, m, 0, 0)
  } else {
    bookingDate.setHours(23, 59, 0, 0)
  }

  const msUntil = bookingDate.getTime() - Date.now()
  if (msUntil < 24 * 60 * 60 * 1000) {
    return NextResponse.json({ error: 'Anularea nu mai este posibilă cu mai puțin de 24h înainte de programare.' }, { status: 400 })
  }

  await sql`UPDATE programari SET status = 'cancelled' WHERE id = ${id}`

  // Notificare Telegram — clienta si-a anulat singura programarea
  await sendTelegram(
    `❌ <b>Anulare programare</b>\n\n` +
    `👤 <b>${p.nume || client.nume || 'Client'}</b>\n` +
    `📞 ${p.telefon}\n` +
    `💅 ${p.serviciu || '—'}\n` +
    `📅 ${p.data}${p.ora ? ' · ' + p.ora : ''}\n\n` +
    `<i>Anulată de clientă din contul propriu.</i>`
  )

  return NextResponse.json({ success: true })
}
