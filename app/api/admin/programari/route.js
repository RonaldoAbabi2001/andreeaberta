export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

import { checkAuth } from '../../../lib/adminAuth'
import { enqueueReminders, resyncReminders, stergeRemindere } from '../../../lib/reminders'

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
    // Citim ora VECHE inainte de update, ca sa stim daca s-a schimbat cu adevarat.
    const [vechi] = await sql`SELECT ora FROM programari WHERE id = ${body.id}`
    await sql`UPDATE programari SET ora = ${body.ora || ''}, ora_sfarsit = ${body.ora_sfarsit || ''} WHERE id = ${body.id}`
    // Ora s-a schimbat -> reminderele vechi contin ora GRESITA. Le refacem.
    const [p] = await sql`SELECT nume, telefon, data, ora, serviciu, status FROM programari WHERE id = ${body.id}`
    if (p && p.status !== 'cancelled' && p.status !== 'noshow') {
      await resyncReminders(sql, {
        programareId: body.id, telefon: p.telefon, numeClient: p.nume || 'client',
        dataF: p.data || '', oraF: p.ora || '', serviciu: p.serviciu || '',
        notificaModificare: !!vechi && vechi.ora !== p.ora,
      })
    }
  } else if (body._mainOnly) {
    await sql`UPDATE programari SET serviciu = ${body.serviciu}, pret = ${body.pret || 0}, tips = ${body.tips || 0}, detalii_tehnice = ${body.detalii_tehnice || ''}, despre_client = ${body.despre_client || ''} WHERE id = ${body.id}`
  } else if (body.status !== undefined && Object.keys(body).length === 2) {
    await sql`UPDATE programari SET status = ${body.status} WHERE id = ${body.id}`
    // Anulare / neprezentare -> NU mai trimitem nimic pentru programarea asta.
    if (body.status === 'cancelled' || body.status === 'noshow') {
      await stergeRemindere(sql, body.id)
    }
  } else {
    // Retinem data+ora VECHI: daca se schimba, clienta trebuie anuntata.
    const [inainte] = await sql`SELECT data, ora FROM programari WHERE id = ${body.id}`
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
    // Modificare completa (data/ora/serviciu) -> refacem reminderele cu datele NOI.
    // Daca programarea a fost anulata, doar le stergem.
    const status = body.status || 'confirmed'
    if (status === 'cancelled' || status === 'noshow') {
      await stergeRemindere(sql, body.id)
    } else if (body.telefon) {
      const sAMutat = !!inainte && (inainte.data !== body.data || inainte.ora !== body.ora)
      await resyncReminders(sql, {
        programareId: body.id, telefon: body.telefon, numeClient: body.nume || 'client',
        dataF: body.data || '', oraF: body.ora || '', serviciu: body.serviciu || '',
        notificaModificare: sAMutat,
      })
    }
  }
  return NextResponse.json({ success: true })
}

export async function DELETE(request) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await request.json()
  const sql = await getDb()
  // Sterge intai SMS-urile netrimise, altfel raman orfane si pleaca oricum.
  await stergeRemindere(sql, id)
  await sql`DELETE FROM programari WHERE id = ${id}`
  return NextResponse.json({ success: true })
}
