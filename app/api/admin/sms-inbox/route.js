import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { checkAuth } from '../../../lib/adminAuth'

export const dynamic = 'force-dynamic'

function normTel(t) {
  if (!t) return t
  // scoate tot ce nu e cifra sau + (spatii, marcaje Unicode de directie, etc.)
  t = String(t).replace(/[^0-9+]/g, '')
  if (t.startsWith('+40')) t = '0' + t.slice(3)
  else if (t.startsWith('0040')) t = '0' + t.slice(4)
  return t
}

export async function GET(request) {
  if (!checkAuth(request))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sql = neon(process.env.DATABASE_URL)
  const { searchParams } = new URL(request.url)
  const telefon = normTel(searchParams.get('telefon'))
  const esuate = searchParams.get('esuate')

  // Mesaje esuate — toate OUT cu status esuat
  if (esuate) {
    const rows = await sql`
      SELECT i.*, c.nume
      FROM sms_inbox i
      LEFT JOIN clienti c ON c.telefon = i.telefon
      WHERE i.directie = 'OUT' AND i.status = 'esuat'
      ORDER BY i.creat DESC
      LIMIT 50
    `
    return NextResponse.json(rows)
  }

  if (telefon) {
    // Firul conversatiei = mesaje manuale (sms_inbox) + mesaje automate (sms_queue)
    // Automatele (confirmare/reminder/feedback/recontact) traiesc doar in sms_queue,
    // deci le adaugam aici ca sa apara in conversatie. Bulk-ul si reply-urile sunt deja
    // oglindite in sms_inbox -> le excludem prin sms_queue_id ca sa nu se dubleze.
    const mesaje = await sql`
      SELECT id, telefon, mesaj, directie, creat, status, eroare, citit, NULL::text AS tip
      FROM sms_inbox WHERE telefon = ${telefon}
      UNION ALL
      SELECT 'q_' || q.id::text AS id, q.telefon, q.mesaj, 'OUT' AS directie,
             COALESCE(q.trimis_la, q.de_trimis_la) AS creat,
             CASE WHEN q.trimis THEN 'trimis' WHEN q.eroare IS NOT NULL THEN 'esuat' ELSE 'pending' END AS status,
             q.eroare, true AS citit, q.tip
      FROM sms_queue q
      WHERE q.telefon = ${telefon}
        AND q.tip IN ('confirmare', 'reminder_24h', 'feedback', 'recontact')
        AND q.id NOT IN (SELECT sms_queue_id FROM sms_inbox WHERE sms_queue_id IS NOT NULL)
      ORDER BY creat ASC
    `
    await sql`UPDATE sms_inbox SET citit = true WHERE telefon = ${telefon} AND directie = 'IN'`
    return NextResponse.json(mesaje)
  }

  // Lista conversatii
  const conversatii = await sql`
    SELECT
      sub.telefon,
      sub.ultim_mesaj,
      sub.ultima_directie,
      sub.ultima_data,
      c.nume,
      (SELECT COUNT(*)::int FROM sms_inbox WHERE telefon = sub.telefon AND directie = 'IN' AND citit = false) AS necitite
    FROM (
      SELECT DISTINCT ON (telefon)
        telefon,
        mesaj AS ultim_mesaj,
        directie AS ultima_directie,
        creat AS ultima_data
      FROM sms_inbox
      ORDER BY telefon, creat DESC
    ) sub
    LEFT JOIN clienti c ON c.telefon = sub.telefon
    ORDER BY sub.ultima_data DESC
  `
  return NextResponse.json(conversatii)
}

export async function POST(request) {
  if (!checkAuth(request))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { mesaj, directie, creat } = body
  const telefon = normTel(body.telefon)

  if (!telefon || !mesaj)
    return NextResponse.json({ error: 'Date incomplete' }, { status: 400 })

  const sql = neon(process.env.DATABASE_URL)
  const ts = new Date(creat || Date.now()).getTime()
  const id = `${telefon}_${ts}`

  let queueId = null

  // Daca e reply OUT — adauga in sms_queue si retine id-ul
  if (directie === 'OUT') {
    queueId = Date.now()
    await sql`
      INSERT INTO sms_queue (id, telefon, mesaj, tip, de_trimis_la)
      VALUES (${queueId}, ${telefon}, ${mesaj}, 'reply', NOW())
    `
  }

  // Upsert: daca vine o versiune mai LUNGA a aceluiasi mesaj (id = telefon_timestamp),
  // o actualizam. Asa se vindeca automat mesajele care intrasera trunchiate de router.
  await sql`
    INSERT INTO sms_inbox (id, telefon, mesaj, directie, creat, status, sms_queue_id)
    VALUES (
      ${id}, ${telefon}, ${mesaj}, ${directie || 'IN'},
      ${creat ? new Date(creat).toISOString() : new Date().toISOString()},
      ${directie === 'OUT' ? 'pending' : 'trimis'},
      ${queueId}
    )
    ON CONFLICT (id) DO UPDATE
      SET mesaj = EXCLUDED.mesaj
      WHERE LENGTH(EXCLUDED.mesaj) > LENGTH(sms_inbox.mesaj)
  `

  return NextResponse.json({ success: true, id })
}

// PATCH — worker actualizeaza statusul unui mesaj OUT
export async function PATCH(request) {
  if (!checkAuth(request))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { sms_queue_id, status, eroare } = await request.json()
  if (!sms_queue_id) return NextResponse.json({ error: 'sms_queue_id lipsa' }, { status: 400 })

  const sql = neon(process.env.DATABASE_URL)
  await sql`
    UPDATE sms_inbox
    SET status = ${status || 'esuat'}, eroare = ${eroare || null}
    WHERE sms_queue_id = ${sms_queue_id}
  `
  return NextResponse.json({ success: true })
}
