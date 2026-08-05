import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import crypto from 'crypto'
import { checkAuth } from '../../lib/adminAuth'

export const dynamic = 'force-dynamic'

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

function normTel(t) {
  if (!t) return ''
  t = String(t).replace(/[^0-9+]/g, '')
  if (t.startsWith('+40')) t = '0' + t.slice(3)
  return t
}

async function ensureTable(sql) {
  await sql`CREATE TABLE IF NOT EXISTS lista_asteptare (
    id text PRIMARY KEY,
    nume text,
    telefon text,
    data_dorita text,
    serviciu text,
    mesaj text,
    status text DEFAULT 'nou',
    creat timestamptz DEFAULT now()
  )`
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}))
    const nume = (body.nume || '').trim()
    const telefon = normTel(body.telefon)
    const data_dorita = (body.data || '').trim()
    const serviciu = (body.serviciu || '').trim()
    const mesaj = (body.mesaj || '').trim()

    if (!nume || !/^0\d{9}$/.test(telefon)) {
      return NextResponse.json({ error: 'Nume și telefon valid (07...) sunt necesare.' }, { status: 400 })
    }

    const sql = neon(process.env.DATABASE_URL)
    await ensureTable(sql)
    await sql`INSERT INTO lista_asteptare (id, nume, telefon, data_dorita, serviciu, mesaj)
      VALUES (${crypto.randomUUID()}, ${nume}, ${telefon}, ${data_dorita || null}, ${serviciu || null}, ${mesaj || null})`

    const tg =
      `📝 <b>CERERE LISTĂ DE AȘTEPTARE</b>\n\n` +
      `👤 ${nume}\n` +
      `📞 ${telefon}\n` +
      (data_dorita ? `📅 Ziua dorită: <b>${data_dorita}</b>\n` : '') +
      (serviciu ? `💅 Serviciu: ${serviciu}\n` : '') +
      (mesaj ? `💬 Mesaj: ${mesaj}\n` : '') +
      `\nDecizi tu: o contactezi cu o oră disponibilă, sau refuzi dacă nu sunt locuri.`
    await sendTelegram(tg)

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Eroare server.' }, { status: 500 })
  }
}

// GET — listare cereri pentru admin
export async function GET(request) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const sql = neon(process.env.DATABASE_URL)
  await ensureTable(sql)
  const rows = await sql`SELECT * FROM lista_asteptare ORDER BY creat DESC LIMIT 100`
  return NextResponse.json(rows)
}

// PATCH — admin schimba statusul (aprobat/refuzat/contactat)
export async function PATCH(request) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, status } = await request.json()
  if (!id) return NextResponse.json({ error: 'id lipsă' }, { status: 400 })
  const sql = neon(process.env.DATABASE_URL)
  await sql`UPDATE lista_asteptare SET status = ${status || 'nou'} WHERE id = ${id}`
  return NextResponse.json({ ok: true })
}
