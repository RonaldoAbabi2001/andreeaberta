import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const { pagina, referrer, session_id } = await request.json()
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const ua = request.headers.get('user-agent') || ''

    // Ignoră boți
    if (/bot|crawl|spider|slurp|lighthouse|vercel|prerender/i.test(ua)) {
      return NextResponse.json({ ok: true })
    }

    const sql = neon(process.env.DATABASE_URL)
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
      INSERT INTO vizite (id, pagina, referrer, session_id, ip)
      VALUES (${Date.now()}, ${pagina || '/'}, ${referrer || ''}, ${session_id || ''}, ${ip})
    `
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

  const [azi, saptamana, luna, totalRows, paginaTop, zilnice] = await Promise.all([
    sql`SELECT COUNT(DISTINCT session_id)::int AS n FROM vizite WHERE creat >= NOW() - INTERVAL '24 hours'`,
    sql`SELECT COUNT(DISTINCT session_id)::int AS n FROM vizite WHERE creat >= NOW() - INTERVAL '7 days'`,
    sql`SELECT COUNT(DISTINCT session_id)::int AS n FROM vizite WHERE creat >= NOW() - INTERVAL '30 days'`,
    sql`SELECT COUNT(DISTINCT session_id)::int AS n FROM vizite`,
    sql`
      SELECT pagina, COUNT(*)::int AS vizite
      FROM vizite WHERE creat >= NOW() - INTERVAL '30 days'
      GROUP BY pagina ORDER BY vizite DESC LIMIT 8
    `,
    sql`
      SELECT DATE(creat) AS zi, COUNT(DISTINCT session_id)::int AS sesiuni
      FROM vizite
      WHERE creat >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(creat) ORDER BY zi ASC
    `,
  ])

  return NextResponse.json({
    azi: azi[0].n,
    saptamana: saptamana[0].n,
    luna: luna[0].n,
    total: totalRows[0].n,
    paginaTop,
    zilnice,
  })
}
