export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const data = searchParams.get('data')
  if (!data) return NextResponse.json([])

  try {
    const sql = neon(process.env.DATABASE_URL)
    const rows = await sql`
      SELECT ora, durata, ora_sfarsit FROM programari
      WHERE data = ${data}
        AND status != 'cancelled'
        AND ora IS NOT NULL AND ora != ''
    `
    return NextResponse.json(rows)
  } catch (e) {
    return NextResponse.json([])
  }
}
