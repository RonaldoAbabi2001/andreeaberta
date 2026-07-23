export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

import { checkAuth } from '../../../lib/adminAuth'
import { enqueueReminders } from '../../../lib/reminders'

async function getDb() {
  return neon(process.env.DATABASE_URL)
}

export async function GET(request) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const sql = await getDb()
  await sql`ALTER TABLE programari ADD COLUMN IF NOT EXISTS extra_servicii TEXT DEFAULT '[]'`
  await sql`ALTER TABLE programari ADD COLUMN IF NOT EXISTS before_foto TEXT`
  await sql`ALTER TABLE programari ADD COLUMN IF NOT EXISTS after_foto TEXT`
  await sql`ALTER TABLE programari ADD COLUMN IF NOT EXISTS ora_sfarsit TEXT`
  await sql`ALTER TABLE programari ADD COLUMN IF NOT EXISTS tips NUMERIC DEFAULT 0`
  await sql`ALTER TABLE programari ADD COLUMN IF NOT EXISTS detalii_tehnice TEXT`
  await sql`ALTER TABLE programari ADD COLUMN IF NOT EXISTS despre_client TEXT`
  const rows = await sql`SELECT * FROM programari ORDER BY data ASC, ora ASC`
  return NextResponse.json(rows)
}

export async function POST(request) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const sql = await getDb()
  const id = body.id || Date.now()
  await sql`ALTER TABLE programari ADD COLUMN IF NOT EXISTS tip_vizita TEXT DEFAULT 'client'`
  await sql`ALTER TABLE programari ADD COLUMN IF NOT EXISTS extra_servicii TEXT DEFAULT '[]'`
  const extraJson = JSON.stringify(body.extra_servicii || [])
  await sql`
    INSERT INTO programari (id, nume, telefon, serviciu, pret, durata, data, ora, plata, observatii, status, tip_vizita, extra_servicii)
    VALUES (${id}, ${body.nume}, ${body.telefon}, ${body.serviciu}, ${body.pret || 0},
            ${body.durata || 0}, ${body.data}, ${body.ora || ''}, ${body.plata || 'numerar'},
            ${body.observatii || ''}, 'confirmed', ${body.tip_vizita || 'client'}, ${extraJson})
  `
  if ((body.tip_vizita || 'client') !== 'modela' && body.telefon) {
    const puncteAdaugate = Number(body.pret) || 0
    await sql`
      UPDATE clienti SET
        puncte = COALESCE(puncte, 0) + ${puncteAdaugate},
        vizite_total = COALESCE(vizite_total, 0) + 1
      WHERE telefon = ${body.telefon}
    `
    // Adauga SMS-uri in coada
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
  }
  return NextResponse.json({ success: true, id })
}

export async function PATCH(request) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const sql = await getDb()
  await sql`ALTER TABLE programari ADD COLUMN IF NOT EXISTS tips NUMERIC DEFAULT 0`
  await sql`ALTER TABLE programari ADD COLUMN IF NOT EXISTS detalii_tehnice TEXT`
  await sql`ALTER TABLE programari ADD COLUMN IF NOT EXISTS despre_client TEXT`
  if (body._fotosOnly) {
    await sql`UPDATE programari SET before_foto = ${body.before_foto || ''}, after_foto = ${body.after_foto || ''} WHERE id = ${body.id}`
  } else if (body._plataOnly) {
    await sql`UPDATE programari SET plata = ${body.plata} WHERE id = ${body.id}`
  } else if (body._oreOnly) {
    await sql`UPDATE programari SET ora = ${body.ora || ''}, ora_sfarsit = ${body.ora_sfarsit || ''} WHERE id = ${body.id}`
  } else if (body._mainOnly) {
    await sql`UPDATE programari SET serviciu = ${body.serviciu}, pret = ${body.pret || 0}, tips = ${body.tips || 0}, detalii_tehnice = ${body.detalii_tehnice || ''}, despre_client = ${body.despre_client || ''} WHERE id = ${body.id}`
  } else if (body.status !== undefined && Object.keys(body).length === 2) {
    await sql`UPDATE programari SET status = ${body.status} WHERE id = ${body.id}`
  } else {
    let extrasVal = body.extra_servicii || []
    if (typeof extrasVal === 'string') { try { extrasVal = JSON.parse(extrasVal) } catch { extrasVal = [] } }
    const extraJson = JSON.stringify(extrasVal)
    await sql`
      UPDATE programari SET
        nume = ${body.nume}, telefon = ${body.telefon}, serviciu = ${body.serviciu},
        pret = ${body.pret || 0}, durata = ${body.durata || 0},
        data = ${body.data}, ora = ${body.ora}, plata = ${body.plata || 'numerar'},
        observatii = ${body.observatii || ''}, status = ${body.status || 'confirmed'},
        extra_servicii = ${extraJson}
      WHERE id = ${body.id}
    `
  }
  return NextResponse.json({ success: true })
}

export async function DELETE(request) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await request.json()
  const sql = await getDb()
  await sql`DELETE FROM programari WHERE id = ${id}`
  return NextResponse.json({ success: true })
}
