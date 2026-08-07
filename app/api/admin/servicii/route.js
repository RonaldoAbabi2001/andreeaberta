import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { checkAuth } from '../../../lib/adminAuth'

async function getDb() {
  const sql = neon(process.env.DATABASE_URL)
  await sql`
    CREATE TABLE IF NOT EXISTS servicii (
      id BIGINT PRIMARY KEY,
      salon_id TEXT DEFAULT 'evolis',
      nume TEXT NOT NULL,
      pret NUMERIC NOT NULL DEFAULT 0,
      durata INTEGER NOT NULL DEFAULT 60,
      activ BOOLEAN DEFAULT true,
      ordine INTEGER DEFAULT 0,
      creat TIMESTAMPTZ DEFAULT NOW()
    )
  `
  await sql`ALTER TABLE servicii ADD COLUMN IF NOT EXISTS tip TEXT DEFAULT 'principal'`
  const count = await sql`SELECT COUNT(*) FROM servicii WHERE salon_id = 'evolis'`
  if (parseInt(count[0].count) === 0) {
    const seed = [
      { nume: 'Manichiură Clasică', pret: 70, durata: 30 },
      { nume: 'Rubber Base cu Apex + 1 Design', pret: 145, durata: 80 },
      { nume: 'Ojă Semi + Culoare', pret: 140, durata: 60 },
      { nume: 'Gel pe Unghia Naturală', pret: 150, durata: 60 },
      { nume: 'Construcție Gel/Polygel 1-2', pret: 165, durata: 90 },
      { nume: 'Construcție Gel/Polygel 3-4', pret: 175, durata: 90 },
      { nume: 'Construcție Gel/Polygel 4+', pret: 185, durata: 90 },
      { nume: 'Întreținere Gel/Polygel 1-2', pret: 145, durata: 90 },
      { nume: 'Întreținere Gel/Polygel 3-4', pret: 155, durata: 90 },
      { nume: 'Întreținere Gel/Polygel 4+', pret: 165, durata: 90 },
      { nume: 'Întreținere din altă parte', pret: 20, durata: 10 },
      { nume: 'Construcție SLIM', pret: 210, durata: 100 },
      { nume: 'Îndepărtare material tehnic', pret: 25, durata: 15 },
      { nume: 'French / Babyboomer / Culoare', pret: 15, durata: 15 },
      { nume: 'Taxă întreținere după 4 săptămâni', pret: 20, durata: 5 },
    ]
    for (let i = 0; i < seed.length; i++) {
      const id = Date.now() + i
      await sql`INSERT INTO servicii (id, nume, pret, durata, ordine) VALUES (${id}, ${seed[i].nume}, ${seed[i].pret}, ${seed[i].durata}, ${i})`
    }
  }
  return sql
}

export async function GET(request) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const sql = await getDb()
  const rows = await sql`SELECT * FROM servicii WHERE activ = true AND salon_id = 'evolis' ORDER BY ordine ASC, creat ASC`
  return NextResponse.json(rows)
}

export async function POST(request) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const sql = await getDb()
  const id = Date.now()
  const maxOrdine = await sql`SELECT COALESCE(MAX(ordine), 0) as m FROM servicii WHERE salon_id = 'evolis'`
  await sql`INSERT INTO servicii (id, nume, pret, durata, ordine, tip) VALUES (${id}, ${body.nume}, ${body.pret || 0}, ${body.durata || 60}, ${maxOrdine[0].m + 1}, ${body.tip || 'principal'})`
  return NextResponse.json({ success: true, id })
}

export async function PATCH(request) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const sql = await getDb()
  // Reordonare: primeste un array de id-uri in ordinea dorita -> seteaza ordine = pozitie
  if (Array.isArray(body.reorder)) {
    for (let i = 0; i < body.reorder.length; i++) {
      await sql`UPDATE servicii SET ordine = ${i} WHERE id = ${body.reorder[i]} AND salon_id = 'evolis'`
    }
    return NextResponse.json({ success: true })
  }
  await sql`UPDATE servicii SET nume = ${body.nume}, pret = ${body.pret || 0}, durata = ${body.durata || 60}, tip = ${body.tip || 'principal'} WHERE id = ${body.id}`
  return NextResponse.json({ success: true })
}

export async function DELETE(request) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await request.json()
  const sql = await getDb()
  await sql`UPDATE servicii SET activ = false WHERE id = ${id}`
  return NextResponse.json({ success: true })
}
