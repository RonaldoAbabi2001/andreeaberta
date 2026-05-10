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
  const rows = await sql`SELECT * FROM programari ORDER BY data ASC, ora ASC`
  return NextResponse.json(rows)
}

export async function POST(request) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const sql = await getDb()
  const id = Date.now()
  await sql`
    INSERT INTO programari (id, nume, telefon, serviciu, pret, durata, data, ora, plata, observatii, status)
    VALUES (${id}, ${body.nume}, ${body.telefon}, ${body.serviciu}, ${body.pret || 0},
            ${body.durata || 0}, ${body.data}, ${body.ora || ''}, ${body.plata || 'numerar'},
            ${body.observatii || ''}, 'confirmed')
  `
  return NextResponse.json({ success: true, id })
}

export async function PATCH(request) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, status } = await request.json()
  const sql = await getDb()
  await sql`UPDATE programari SET status = ${status} WHERE id = ${id}`
  return NextResponse.json({ success: true })
}
