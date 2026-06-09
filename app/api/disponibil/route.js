export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

// GET /api/disponibil?data=2026-05-27
// Returneaza programarile existente pentru o zi (ora + durata)
// Clientul filtreaza local ce sloturi se suprapun
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const data = searchParams.get('data')
  if (!data) return NextResponse.json([])

  try {
    const sql = neon(process.env.DATABASE_URL)
    const rows = await sql`
      SELECT ora, COALESCE(durata, 60) as durata
      FROM programari
      WHERE data = ${data}
        AND status != 'cancelled'
        AND ora IS NOT NULL AND ora != ''
    `
    return NextResponse.json(rows)
  } catch (e) {
    return NextResponse.json([])
  }
}
