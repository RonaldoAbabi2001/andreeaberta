import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

export async function GET() {
  try {
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
    await sql`
      CREATE TABLE IF NOT EXISTS servicii_galerie (
        id BIGINT PRIMARY KEY,
        salon_id TEXT DEFAULT 'evolis',
        serviciu_id BIGINT NOT NULL,
        url TEXT NOT NULL,
        titlu TEXT DEFAULT '',
        ordine INTEGER DEFAULT 0,
        creat TIMESTAMPTZ DEFAULT NOW()
      )
    `
    await sql`ALTER TABLE servicii ADD COLUMN IF NOT EXISTS tip TEXT DEFAULT 'principal'`
    const toate = await sql`SELECT * FROM servicii WHERE activ = true AND salon_id = 'evolis' ORDER BY ordine ASC, creat ASC`
    const servicii = toate.filter(s => !s.tip || s.tip === 'principal')
    const extras = toate.filter(s => s.tip === 'extra')
    const galerie = await sql`SELECT * FROM servicii_galerie WHERE salon_id = 'evolis' ORDER BY serviciu_id, ordine ASC`
    return NextResponse.json({ servicii, extras, galerie })
  } catch (e) {
    return NextResponse.json({ servicii: [], extras: [], galerie: [], error: String(e) })
  }
}
