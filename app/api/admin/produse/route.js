import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const SECRET = 'evolis2026secret'

function checkAuth(request) {
  return request.headers.get('x-admin-token') === SECRET
}

async function getDb() {
  const sql = neon(process.env.DATABASE_URL)
  await sql`
    CREATE TABLE IF NOT EXISTS produse (
      id BIGINT PRIMARY KEY,
      salon_id TEXT DEFAULT 'evolis',
      marca TEXT,
      nume TEXT NOT NULL,
      categorie TEXT,
      volum_ml NUMERIC,
      pret_achizitie NUMERIC,
      moneda TEXT DEFAULT 'RON',
      furnizor_link TEXT,
      inci TEXT,
      observatii TEXT,
      stoc_bucati INTEGER DEFAULT 1,
      stoc_minim INTEGER DEFAULT 3,
      barcode TEXT UNIQUE,
      activ BOOLEAN DEFAULT true,
      creat TIMESTAMPTZ DEFAULT NOW()
    )
  `
  await sql`ALTER TABLE produse ADD COLUMN IF NOT EXISTS stoc_minim INTEGER DEFAULT 3`
  return sql
}

export async function GET(request) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const sql = await getDb()
  const rows = await sql`SELECT * FROM produse WHERE activ = true ORDER BY creat DESC`
  return NextResponse.json(rows)
}

export async function POST(request) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const sql = await getDb()
  const id = Date.now()
  const barcode = '485' + String(id).slice(-10)
  await sql`
    INSERT INTO produse (id, salon_id, marca, nume, categorie, volum_ml, pret_achizitie, moneda, furnizor_link, inci, observatii, stoc_bucati, stoc_minim, barcode)
    VALUES (${id}, 'evolis', ${body.marca || ''}, ${body.nume}, ${body.categorie || ''}, ${body.volum_ml || null},
            ${body.pret_achizitie || null}, 'RON', ${body.furnizor_link || ''},
            ${body.inci || ''}, ${body.observatii || ''}, ${body.stoc_bucati || 1}, ${body.stoc_minim || 3}, ${barcode})
  `
  return NextResponse.json({ success: true, id, barcode })
}

export async function PATCH(request) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const sql = await getDb()

  if (body.stoc_only) {
    await sql`UPDATE produse SET stoc_bucati = ${body.stoc_bucati} WHERE id = ${body.id}`
    return NextResponse.json({ success: true })
  }

  await sql`
    UPDATE produse SET
      marca = ${body.marca || ''},
      nume = ${body.nume},
      categorie = ${body.categorie || ''},
      volum_ml = ${body.volum_ml || null},
      pret_achizitie = ${body.pret_achizitie || null},
      furnizor_link = ${body.furnizor_link || ''},
      inci = ${body.inci || ''},
      observatii = ${body.observatii || ''},
      stoc_bucati = ${body.stoc_bucati || 1},
      stoc_minim = ${body.stoc_minim || 3}
    WHERE id = ${body.id}
  `
  return NextResponse.json({ success: true })
}

export async function DELETE(request) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await request.json()
  const sql = await getDb()
  await sql`UPDATE produse SET activ = false WHERE id = ${id}`
  return NextResponse.json({ success: true })
}
