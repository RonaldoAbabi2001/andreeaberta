import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const SECRET = 'evolis2026secret'

export async function GET(request) {
  if (request.headers.get('x-admin-token') !== SECRET)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sql = neon(process.env.DATABASE_URL)
  const campanii = await sql`
    SELECT
      c.id, c.mesaj, c.creat, c.total,
      COUNT(q.id) FILTER (WHERE q.trimis = true)::int AS trimise,
      COUNT(q.id) FILTER (WHERE q.eroare IS NOT NULL)::int AS erori,
      COUNT(q.id) FILTER (WHERE q.trimis = false AND q.eroare IS NULL)::int AS pending
    FROM sms_bulk_campaigns c
    LEFT JOIN sms_queue q ON q.campaign_id = c.id
    GROUP BY c.id, c.mesaj, c.creat, c.total
    ORDER BY c.creat DESC
    LIMIT 10
  `
  return NextResponse.json(campanii)
}

export async function POST(request) {
  if (request.headers.get('x-admin-token') !== SECRET)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { mesaj } = await request.json()
  if (!mesaj?.trim())
    return NextResponse.json({ error: 'Mesaj gol' }, { status: 400 })

  const sql = neon(process.env.DATABASE_URL)

  const recent = await sql`
    SELECT id FROM sms_bulk_campaigns
    WHERE mesaj = ${mesaj.trim()} AND creat > NOW() - INTERVAL '24 hours'
    LIMIT 1
  `
  if (recent.length > 0)
    return NextResponse.json({
      error: 'Același mesaj a fost trimis în ultimele 24 de ore. Modifică textul sau așteaptă.',
      duplicate: true
    }, { status: 409 })

  const clienti = await sql`SELECT telefon, nume FROM clienti WHERE telefon IS NOT NULL AND telefon != '' ORDER BY creat DESC`

  const campaignId = `bulk_${Date.now()}`
  await sql`INSERT INTO sms_bulk_campaigns (id, mesaj, total) VALUES (${campaignId}, ${mesaj.trim()}, ${clienti.length})`

  let adaugate = 0
  const now = Date.now()
  for (let i = 0; i < clienti.length; i++) {
    const { telefon, nume } = clienti[i]
    const prenume = (nume || '').split(' ')[0] || 'dragă'
    const mesajPersonalizat = mesaj.trim().replace(/\{nume\}/gi, prenume)
    const id = now + i
    await sql`
      INSERT INTO sms_queue (id, telefon, mesaj, tip, de_trimis_la, campaign_id)
      VALUES (${id}, ${telefon}, ${mesajPersonalizat}, 'bulk', NOW(), ${campaignId})
      ON CONFLICT DO NOTHING
    `
    adaugate++
  }

  return NextResponse.json({ success: true, adaugate, campaignId })
}
