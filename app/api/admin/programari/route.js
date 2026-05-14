import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const SECRET = 'evolis2026secret'

function checkAuth(request) {
  return request.headers.get('x-admin-token') === SECRET
}

async function getDb() {
  return neon(process.env.DATABASE_URL)
}

export async function GET(request) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const sql = await getDb()
  await sql`ALTER TABLE programari ADD COLUMN IF NOT EXISTS extra_servicii TEXT DEFAULT '[]'`
  await sql`ALTER TABLE programari ADD COLUMN IF NOT EXISTS before_foto TEXT`
  await sql`ALTER TABLE programari ADD COLUMN IF NOT EXISTS after_foto TEXT`
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
  return NextResponse.json({ success: true, id })
}

export async function PATCH(request) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const sql = await getDb()
  if (body._fotosOnly) {
    await sql`UPDATE programari SET before_foto = ${body.before_foto || ''}, after_foto = ${body.after_foto || ''} WHERE id = ${body.id}`
  } else if (body.status !== undefined && Object.keys(body).length === 2) {
    await sql`UPDATE programari SET status = ${body.status} WHERE id = ${body.id}`
  } else {
    const extraJson = JSON.stringify(body.extra_servicii || [])
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
