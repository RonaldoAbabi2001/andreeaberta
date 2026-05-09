import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), 'data', 'programari.json')
const BOT_TOKEN = '8465613425:AAEawrbtzjSTyIpmtAtgYQEeOBCjc2T3iAE'
const CHAT_ID = '645634084'

function loadProgramari() {
  if (!fs.existsSync(DATA_FILE)) return []
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'))
}

function saveProgramari(list) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true })
  fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2))
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

  const programari = loadProgramari()
  const programare = {
    id: Date.now(),
    ...body,
    creat: new Date().toISOString(),
    status: 'pending'
  }
  programari.push(programare)
  saveProgramari(programari)

  await sendTelegram(
    `🔔 <b>Programare nouă!</b>\n\n` +
    `👤 <b>${body.nume}</b>\n` +
    `📞 ${body.telefon}\n` +
    `💅 ${body.serviciu}\n` +
    `📅 ${body.data} · ${body.ora}\n` +
    `💳 Plată: ${body.plata === 'numerar' ? 'Numerar' : 'Transfer bancar'}\n` +
    `💰 Total: ${body.pret} lei`
  )

  return NextResponse.json({ success: true, id: programare.id })
}

export async function GET() {
  const programari = loadProgramari()
  return NextResponse.json(programari)
}
