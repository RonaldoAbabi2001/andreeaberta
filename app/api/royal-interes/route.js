import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

// Origini permise (magazinul Royal Nails)
const ALLOWED = [
  'https://royalnails.ro',
  'https://www.royalnails.ro',
  'https://1g1uza-s0.myshopify.com',
]

function corsHeaders(origin) {
  const allow = ALLOWED.includes(origin) ? origin : ALLOWED[0]
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  }
}

export async function OPTIONS(req) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req.headers.get('origin')) })
}

export async function POST(req) {
  const origin = req.headers.get('origin')
  const headers = corsHeaders(origin)
  try {
    const body = await req.json().catch(() => ({}))
    const handle = String(body.handle || '').trim().slice(0, 160)
    const titlu = String(body.titlu || '').trim().slice(0, 200)
    const email = String(body.email || '').trim().toLowerCase().slice(0, 160)

    if (!handle && !titlu) {
      return NextResponse.json({ error: 'Lipsește produsul.' }, { status: 400, headers })
    }

    const sql = neon(process.env.DATABASE_URL)
    await sql`CREATE TABLE IF NOT EXISTS royalnails_interes (
      id text PRIMARY KEY,
      handle text,
      titlu text,
      email text,
      creat timestamptz DEFAULT now()
    )`

    const id = crypto.randomUUID()
    await sql`INSERT INTO royalnails_interes (id, handle, titlu, email)
              VALUES (${id}, ${handle || null}, ${titlu || null}, ${email || null})`

    return NextResponse.json({ ok: true }, { headers })
  } catch (e) {
    console.error('[royal-interes]', e)
    return NextResponse.json({ error: 'Eroare la salvare.' }, { status: 500, headers })
  }
}
