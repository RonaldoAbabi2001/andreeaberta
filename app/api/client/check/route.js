import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const telefon = searchParams.get('telefon')
  if (!telefon) return NextResponse.json({ exists: false })

  const sql = neon(process.env.DATABASE_URL)
  const rows = await sql`SELECT id, nume FROM clienti WHERE telefon = ${telefon.trim()}`
  return NextResponse.json({ exists: rows.length > 0, nume: rows[0]?.nume || null })
}
