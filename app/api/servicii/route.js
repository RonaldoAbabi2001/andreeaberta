import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL)
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
    const servicii = await sql`SELECT * FROM servicii WHERE activ = true AND salon_id = 'evolis' ORDER BY ordine ASC, creat ASC`
    const galerie = await sql`SELECT * FROM servicii_galerie WHERE salon_id = 'evolis' ORDER BY serviciu_id, ordine ASC`
    return NextResponse.json({ servicii, galerie })
  } catch {
    return NextResponse.json({ servicii: [], galerie: [] })
  }
}
