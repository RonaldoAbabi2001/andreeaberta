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

function normTel(t) {
  if (!t) return ''
  t = String(t).trim().replace(/\s+/g, '')
  if (t.startsWith('+40')) t = '0' + t.slice(3)
  return t
}

export async function OPTIONS(req) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req.headers.get('origin')) })
}

export async function POST(req) {
  const origin = req.headers.get('origin')
  const headers = corsHeaders(origin)
  try {
    const body = await req.json().catch(() => ({}))
    const email = (body.email || '').trim().toLowerCase()
    const telefon = normTel(body.telefon)
    const consent = body.consent === true || body.consent === 'true'

    const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)
    const telOk = /^0\d{9}$/.test(telefon)
    if (!emailOk && !telOk) {
      return NextResponse.json({ error: 'Email sau telefon invalid.' }, { status: 400, headers })
    }
    if (!consent) {
      return NextResponse.json({ error: 'Consimțământul e necesar.' }, { status: 400, headers })
    }

    const sql = neon(process.env.DATABASE_URL)
    await sql`CREATE TABLE IF NOT EXISTS royalnails_leads (
      id text PRIMARY KEY,
      email text,
      telefon text,
      consent boolean DEFAULT false,
      sursa text,
      creat timestamptz DEFAULT now(),
      notificat boolean DEFAULT false
    )`
    // dedup simplu pe email sau telefon
    const existent = await sql`
      SELECT id FROM royalnails_leads
      WHERE (${email} <> '' AND email = ${email}) OR (${telefon} <> '' AND telefon = ${telefon})
      LIMIT 1`
    if (existent.length > 0) {
      return NextResponse.json({ ok: true, duplicat: true }, { status: 200, headers })
    }

    await sql`INSERT INTO royalnails_leads (id, email, telefon, consent, sursa)
      VALUES (${crypto.randomUUID()}, ${email || null}, ${telefon || null}, ${consent}, ${'popup_prelansare'})`

    return NextResponse.json({ ok: true }, { status: 200, headers })
  } catch (e) {
    return NextResponse.json({ error: 'Eroare server.' }, { status: 500, headers })
  }
}
