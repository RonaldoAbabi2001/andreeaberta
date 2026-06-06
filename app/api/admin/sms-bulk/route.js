import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const SECRET = 'evolis2026secret'

export async function POST(request) {
  if (request.headers.get('x-admin-token') !== SECRET)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { mesaj } = await request.json()
  if (!mesaj?.trim())
    return NextResponse.json({ error: 'Mesaj gol' }, { status: 400 })

  const sql = neon(process.env.DATABASE_URL)
  const clienti = await sql`SELECT telefon FROM clienti WHERE telefon IS NOT NULL AND telefon != '' ORDER BY creat DESC`

  let adaugate = 0
  const now = Date.now()
  for (let i = 0; i < clienti.length; i++) {
    const telefon = clienti[i].telefon
    const id = now + i
    await sql`
      INSERT INTO sms_queue (id, telefon, mesaj, tip, de_trimis_la)
      VALUES (${id}, ${telefon}, ${mesaj.trim()}, 'bulk', NOW())
      ON CONFLICT DO NOTHING
    `
    adaugate++
  }

  return NextResponse.json({ success: true, adaugate })
}
