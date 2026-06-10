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

    // Verifica suprapuneri inainte de INSERT
    if (body.ora && body.data) {
      const existente = await sql`
        SELECT ora, durata, ora_sfarsit FROM programari
        WHERE data = ${body.data} AND status != 'cancelled'
        AND ora IS NOT NULL AND ora != ''
      `
      const toMin = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m }
      const newStart = toMin(body.ora)
      const newEnd = newStart + (Number(body.durata) || 60)
      for (const p of existente) {
        const pStart = toMin(p.ora)
        const pEnd = p.ora_sfarsit ? toMin(p.ora_sfarsit) : pStart + (Number(p.durata) || 60)
        if (newStart < pEnd && newEnd > pStart) {
          return NextResponse.json({ error: 'Ora selectată nu mai este disponibilă. Vă rugăm alegeți altă oră.' }, { status: 409 })
        }
      }
    }

    const id = Date.now()

    await sql`
      INSERT INTO programari (id, nume, telefon, serviciu, pret, durata, data, ora, plata, observatii, status)
      VALUES (${id}, ${body.nume}, ${body.telefon}, ${body.serviciu}, ${body.pret || 0},
              ${body.durata || 0}, ${body.data}, ${body.ora || ''}, ${body.plata || ''}, ${body.observatii || ''}, 'confirmed')
    `

    // Auto-creare cont client
    await sql`
      CREATE TABLE IF NOT EXISTS clienti (
        id BIGINT PRIMARY KEY, nume TEXT, telefon TEXT, email TEXT,
        data_nastere TEXT, observatii TEXT, sursa TEXT DEFAULT 'site',
        parola TEXT, creat TIMESTAMPTZ DEFAULT NOW()
      )
    `
    await sql`ALTER TABLE clienti ADD COLUMN IF NOT EXISTS parola TEXT`
    await sql`ALTER TABLE clienti ADD COLUMN IF NOT EXISTS telefon_secundar TEXT`

    const telefonOriginal = body.telefonOriginal || null
    const telefonNou = body.telefon

    // Dacă clienta e logată și și-a schimbat telefonul → salvez ca număr secundar
    if (telefonOriginal && telefonOriginal !== telefonNou) {
      await sql`
        UPDATE clienti SET telefon_secundar = ${telefonNou}
        WHERE telefon = ${telefonOriginal}
      `
    }

    const existing = await sql`SELECT id FROM clienti WHERE telefon = ${body.telefon}`
    if (existing.length === 0) {
      await sql`
        INSERT INTO clienti (id, nume, telefon, email, parola, sursa)
        VALUES (${Date.now() + 1}, ${body.nume}, ${body.telefon}, ${body.email || ''}, ${body.telefon}, 'site')
      `
    }

    await sendTelegram(
      `🔔 <b>Programare nouă!</b>\n\n` +
      `👤 <b>${body.nume}</b>\n` +
      `📞 ${body.telefon}\n` +
      `💅 ${body.serviciu}\n` +
      `📅 ${body.data} · ${body.ora}\n` +
      `💳 Plată: ${body.plata === 'numerar' ? 'Numerar' : 'Transfer bancar'}\n` +
      `💰 Total: ${body.pret} lei`
    )

    // SMS-uri automate
    await sql`CREATE TABLE IF NOT EXISTS sms_queue (
      id BIGINT PRIMARY KEY, telefon TEXT NOT NULL, mesaj TEXT NOT NULL,
      tip TEXT DEFAULT 'confirmare', programare_id BIGINT,
      de_trimis_la TIMESTAMPTZ DEFAULT NOW(), trimis BOOLEAN DEFAULT FALSE,
      trimis_la TIMESTAMPTZ, eroare TEXT, creat TIMESTAMPTZ DEFAULT NOW()
    )`
    const numeClient = body.nume || 'client'
    const dataF = body.data || ''
    const oraF = body.ora || ''
    const serviciu = body.serviciu || ''
    const acum = new Date()

    let programareInViitor = false
    if (dataF && oraF) {
      const [an, luna, zi] = dataF.split('-').map(Number)
      const [h, m] = oraF.split(':').map(Number)
      programareInViitor = new Date(an, luna - 1, zi, h || 0, m || 0) > acum
    }
    if (programareInViitor) {
      const msgConf = `Buna ziua ${numeClient}! Programarea ta la EVOLIS a fost confirmata pentru ${dataF} ora ${oraF}. Serviciu: ${serviciu}. Te asteptam! :nail_care:`
      await sql`INSERT INTO sms_queue (id,telefon,mesaj,tip,programare_id,de_trimis_la)
        VALUES (${Date.now()},${body.telefon},${msgConf},'confirmare',${id},NOW())`
    }

    if (dataF && oraF) {
      const [an, luna, zi] = dataF.split('-').map(Number)
      const [h, m] = oraF.split(':').map(Number)
      const dataApointment = new Date(an, luna - 1, zi, h || 0, m || 0)
      const reminder24 = new Date(dataApointment.getTime() - 24 * 60 * 60 * 1000)
      if (reminder24 > acum) {
        const msgRem = `Reminder EVOLIS: maine la ${oraF} ai programare pentru ${serviciu}. Ne vedem! :nail_care:`
        await sql`INSERT INTO sms_queue (id,telefon,mesaj,tip,programare_id,de_trimis_la)
          VALUES (${Date.now()+1},${body.telefon},${msgRem},'reminder_24h',${id},${reminder24.toISOString()})`
      }
    }

    if (dataF) {
      const [an, luna, zi] = dataF.split('-').map(Number)
      const dataFeedback = new Date(an, luna - 1, zi + 3, 10, 0)
      if (dataFeedback > acum) {
        const msgFeedback = `Buna ${numeClient}! Cum iti sunt unghiile dupa vizita de ${dataF}? Orice intrebare ne poti contacta. Multumim ca esti clienta noastra! :glowing_star:`
        await sql`INSERT INTO sms_queue (id,telefon,mesaj,tip,programare_id,de_trimis_la)
          VALUES (${Date.now()+2},${body.telefon},${msgFeedback},'feedback',${id},${dataFeedback.toISOString()})`
      }
    }

    if (dataF) {
      const [an, luna, zi] = dataF.split('-').map(Number)
      const dataReprog = new Date(an, luna - 1, zi + 14, 10, 0)
      if (dataReprog > acum) {
        const msgReprog = `Buna ${numeClient}! A trecut cam 2 saptamani de la ultima vizita. Vrei sa-ti faci o noua programare? andreeaberta.com :nail_care:`
        await sql`INSERT INTO sms_queue (id,telefon,mesaj,tip,programare_id,de_trimis_la)
          VALUES (${Date.now()+3},${body.telefon},${msgReprog},'recontact',${id},${dataReprog.toISOString()})`
      }
    }

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
