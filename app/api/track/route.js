import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

export const dynamic = 'force-dynamic'

async function initTables(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS vizite (
      id BIGINT PRIMARY KEY,
      pagina TEXT,
      referrer TEXT,
      session_id TEXT,
      ip TEXT,
      creat TIMESTAMPTZ DEFAULT NOW()
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS evenimente (
      id BIGINT PRIMARY KEY,
      session_id TEXT,
      eveniment TEXT NOT NULL,
      pagina TEXT,
      meta TEXT,
      creat TIMESTAMPTZ DEFAULT NOW()
    )
  `
}

export async function POST(request) {
  try {
    const body = await request.json()
    const ua = request.headers.get('user-agent') || ''
    if (/bot|crawl|spider|slurp|lighthouse|vercel|prerender/i.test(ua))
      return NextResponse.json({ ok: true })

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const sql = neon(process.env.DATABASE_URL)
    await initTables(sql)

    if (body.eveniment) {
      // Event tracking
      await sql`
        INSERT INTO evenimente (id, session_id, eveniment, pagina, meta)
        VALUES (${Date.now()}, ${body.session_id || ''}, ${body.eveniment},
                ${body.pagina || ''}, ${body.meta ? JSON.stringify(body.meta) : null})
      `
    } else {
      // Page view
      await sql`
        INSERT INTO vizite (id, pagina, referrer, session_id, ip)
        VALUES (${Date.now()}, ${body.pagina || '/'}, ${body.referrer || ''}, ${body.session_id || ''}, ${ip})
      `
    }
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true })
  }
}

export async function GET(request) {
  const SECRET = 'evolis2026secret'
  if (request.headers.get('x-admin-token') !== SECRET)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sql = neon(process.env.DATABASE_URL)
  await initTables(sql)

  const [azi, saptamana, luna, totalRows, paginaTop, zilnice, evenimenteTop, funnel] = await Promise.all([
    sql`SELECT COUNT(DISTINCT session_id)::int AS n FROM vizite WHERE creat >= NOW() - INTERVAL '24 hours'`,
    sql`SELECT COUNT(DISTINCT session_id)::int AS n FROM vizite WHERE creat >= NOW() - INTERVAL '7 days'`,
    sql`SELECT COUNT(DISTINCT session_id)::int AS n FROM vizite WHERE creat >= NOW() - INTERVAL '30 days'`,
    sql`SELECT COUNT(DISTINCT session_id)::int AS n FROM vizite`,
    sql`SELECT pagina, COUNT(*)::int AS vizite FROM vizite WHERE creat >= NOW() - INTERVAL '30 days' GROUP BY pagina ORDER BY vizite DESC LIMIT 8`,
    sql`SELECT DATE(creat) AS zi, COUNT(DISTINCT session_id)::int AS sesiuni FROM vizite WHERE creat >= NOW() - INTERVAL '30 days' GROUP BY DATE(creat) ORDER BY zi ASC`,
    sql`SELECT eveniment, COUNT(*)::int AS n FROM evenimente WHERE creat >= NOW() - INTERVAL '30 days' GROUP BY eveniment ORDER BY n DESC LIMIT 20`,
    sql`
      SELECT
        COUNT(DISTINCT CASE WHEN eveniment = 'booking_start' THEN session_id END)::int AS booking_start,
        COUNT(DISTINCT CASE WHEN eveniment = 'booking_serviciu' THEN session_id END)::int AS booking_serviciu,
        COUNT(DISTINCT CASE WHEN eveniment = 'booking_data' THEN session_id END)::int AS booking_data,
        COUNT(DISTINCT CASE WHEN eveniment = 'booking_complet' THEN session_id END)::int AS booking_complet,
        COUNT(DISTINCT CASE WHEN eveniment = 'roata_spin' THEN session_id END)::int AS roata_spin,
        COUNT(DISTINCT CASE WHEN eveniment = 'roata_castig' THEN session_id END)::int AS roata_castig
      FROM evenimente WHERE creat >= NOW() - INTERVAL '30 days'
    `,
  ])

  return NextResponse.json({
    azi: azi[0].n, saptamana: saptamana[0].n, luna: luna[0].n, total: totalRows[0].n,
    paginaTop, zilnice, evenimenteTop,
    funnel: funnel[0],
  })
}
