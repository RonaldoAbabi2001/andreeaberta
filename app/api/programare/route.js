import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { enqueueReminders } from '../../lib/reminders'

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
  await sql`ALTER TABLE programari ADD COLUMN IF NOT EXISTS extra_servicii TEXT DEFAULT '[]'`
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

    // Verifica daca ziua e blocata (zi_libera / concediu fara ora specifica)
    // Atat programari.data cat si worker_time_off.data sunt in format roman "8 Iulie 2026"
    const LUNI_RO = ['Ianuarie','Februarie','Martie','Aprilie','Mai','Iunie','Iulie','August','Septembrie','Octombrie','Noiembrie','Decembrie']
    const dataRo = data
    const worker = await sql`SELECT id FROM workers WHERE salon_id = 'evolis' AND activ = true ORDER BY id LIMIT 1`
    if (worker.length > 0) {
      const timeOff = await sql`
        SELECT tip FROM worker_time_off
        WHERE worker_id = ${worker[0].id} AND data = ${dataRo}
        AND (tip = 'zi_libera' OR tip = 'concediu')
        AND ora_start IS NULL
      `
      if (timeOff.length > 0) {
        return NextResponse.json({ error: 'Ziua selectată nu este disponibilă pentru programări.' }, { status: 409 })
      }
    }

    // Verifica limita zilnica de programari acceptate (Programari acceptate)
    if (worker.length > 0 && body.data) {
      function roToIso(ro) {
        const parts = String(ro).trim().split(' ')
        if (parts.length !== 3) return null
        const d = parseInt(parts[0])
        const mi = LUNI_RO.indexOf(parts[1])
        const y = parseInt(parts[2])
        if (mi === -1 || isNaN(d) || isNaN(y)) return null
        const pad = n => String(n).padStart(2, '0')
        return `${y}-${pad(mi + 1)}-${pad(d)}`
      }
      const iso = roToIso(body.data)
      if (iso) {
        const limits = await sql`
          SELECT max_pe_zi FROM daily_limits
          WHERE worker_id = ${worker[0].id}
            AND data_start <= ${iso}
            AND (data_end IS NULL OR data_end >= ${iso})
          ORDER BY creat DESC LIMIT 1
        `
        if (limits.length > 0) {
          const max = Number(limits[0].max_pe_zi)
          const cnt = await sql`
            SELECT COUNT(*)::int AS n FROM programari
            WHERE data = ${body.data} AND status != 'cancelled'
          `
          if ((cnt[0]?.n || 0) >= max) {
            return NextResponse.json({ error: 'Ziua selectată este completă — s-a atins numărul maxim de programări.' }, { status: 409 })
          }
        }
      }
    }

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
    const extraJson = JSON.stringify(body.extra_servicii || [])

    await sql`
      INSERT INTO programari (id, nume, telefon, serviciu, pret, durata, data, ora, plata, observatii, status, extra_servicii)
      VALUES (${id}, ${body.nume}, ${body.telefon}, ${body.serviciu}, ${body.pret || 0},
              ${body.durata || 0}, ${body.data}, ${body.ora || ''}, ${body.plata || ''}, ${body.observatii || ''}, 'confirmed', ${extraJson})
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
    await enqueueReminders(sql, {
      programareId: id,
      telefon: body.telefon,
      numeClient: body.nume || 'client',
      dataF: body.data || '',
      oraF: body.ora || '',
      serviciu: body.serviciu || '',
    })

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
