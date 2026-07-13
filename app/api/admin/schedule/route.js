import { neon } from '@neondatabase/serverless'
import { checkAuth as auth } from '../../../lib/adminAuth'

async function initTables(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS workers (
      id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      salon_id TEXT DEFAULT 'evolis',
      nume TEXT,
      activ BOOL DEFAULT true
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS worker_schedule (
      id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      worker_id BIGINT,
      zi INTEGER,
      activ BOOL DEFAULT true,
      ora_start TEXT DEFAULT '09:00',
      ora_sfarsit TEXT DEFAULT '19:00',
      pauza_start TEXT DEFAULT '12:00',
      pauza_sfarsit TEXT DEFAULT '13:00'
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS worker_time_off (
      id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      worker_id BIGINT,
      data TEXT,
      tip TEXT DEFAULT 'zi_libera',
      ora_start TEXT,
      ora_sfarsit TEXT,
      nota TEXT DEFAULT '',
      creat TIMESTAMPTZ DEFAULT NOW()
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS daily_limits (
      id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      worker_id BIGINT,
      data_start TEXT,
      data_end TEXT,
      max_pe_zi INTEGER,
      creat TIMESTAMPTZ DEFAULT NOW()
    )
  `
}

function defaultSchedule() {
  return [0,1,2,3,4,5,6].map(zi => ({
    zi,
    activ: zi <= 5,
    ora_start: '09:00',
    ora_sfarsit: zi === 5 ? '15:00' : '19:00',
    pauza_start: zi === 5 ? null : '12:00',
    pauza_sfarsit: zi === 5 ? null : '13:00',
  }))
}

export async function GET(req) {
  if (!auth(req)) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const sql = neon(process.env.DATABASE_URL)

  try {
    await initTables(sql)

    // Ensure default worker exists
    const existing = await sql`SELECT id FROM workers WHERE salon_id = 'evolis' LIMIT 1`
    if (existing.length === 0) {
      await sql`INSERT INTO workers (salon_id, nume, activ) VALUES ('evolis', 'Andreea Berta', true)`
    }

    const workers = await sql`SELECT * FROM workers WHERE salon_id = 'evolis' AND activ = true ORDER BY id`
    const today = new Date().toISOString().split('T')[0]

    const result = await Promise.all(workers.map(async w => {
      const schedRows = await sql`SELECT * FROM worker_schedule WHERE worker_id = ${w.id} ORDER BY zi`
      const timeOffRows = await sql`
        SELECT * FROM worker_time_off WHERE worker_id = ${w.id}
        ORDER BY creat DESC
      `

      let schedule
      if (schedRows.length === 0) {
        schedule = defaultSchedule()
      } else {
        schedule = [0,1,2,3,4,5,6].map(zi => {
          const row = schedRows.find(r => r.zi === zi)
          if (row) {
            return {
              zi: row.zi,
              activ: row.activ,
              ora_start: row.ora_start,
              ora_sfarsit: row.ora_sfarsit,
              pauza_start: row.pauza_start,
              pauza_sfarsit: row.pauza_sfarsit,
            }
          }
          const def = defaultSchedule()[zi]
          return def
        })
      }

      const time_off = timeOffRows.map(r => ({
        id: Number(r.id),
        data: r.data,
        tip: r.tip,
        ora_start: r.ora_start,
        ora_sfarsit: r.ora_sfarsit,
        nota: r.nota,
      }))

      const limitRows = await sql`
        SELECT * FROM daily_limits WHERE worker_id = ${w.id} ORDER BY creat DESC
      `
      const daily_limits = limitRows.map(r => ({
        id: Number(r.id),
        data_start: r.data_start,
        data_end: r.data_end,
        max_pe_zi: Number(r.max_pe_zi),
      }))

      return {
        id: Number(w.id),
        nume: w.nume,
        schedule,
        time_off,
        daily_limits,
      }
    }))

    return Response.json({ workers: result })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req) {
  if (!auth(req)) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const sql = neon(process.env.DATABASE_URL)
  await initTables(sql)

  try {
    const body = await req.json()

    if (body.type === 'schedule') {
      const { worker_id, schedule } = body
      await sql`DELETE FROM worker_schedule WHERE worker_id = ${worker_id}`
      for (const row of schedule) {
        await sql`
          INSERT INTO worker_schedule (worker_id, zi, activ, ora_start, ora_sfarsit, pauza_start, pauza_sfarsit)
          VALUES (${worker_id}, ${row.zi}, ${row.activ}, ${row.ora_start || '09:00'}, ${row.ora_sfarsit || '19:00'}, ${row.pauza_start || null}, ${row.pauza_sfarsit || null})
        `
      }
      return Response.json({ ok: true })
    }

    if (body.type === 'time_off') {
      const { worker_id, data, tip, ora_start, ora_sfarsit, nota } = body
      const res = await sql`
        INSERT INTO worker_time_off (worker_id, data, tip, ora_start, ora_sfarsit, nota)
        VALUES (${worker_id}, ${data}, ${tip || 'zi_libera'}, ${ora_start || null}, ${ora_sfarsit || null}, ${nota || ''})
        RETURNING id
      `
      return Response.json({ ok: true, id: Number(res[0].id) })
    }

    if (body.type === 'daily_limit') {
      const { worker_id, data_start, data_end, max_pe_zi } = body
      if (!worker_id || !data_start || !(max_pe_zi >= 0)) {
        return Response.json({ error: 'Date invalide' }, { status: 400 })
      }
      const res = await sql`
        INSERT INTO daily_limits (worker_id, data_start, data_end, max_pe_zi)
        VALUES (${worker_id}, ${data_start}, ${data_end || null}, ${Number(max_pe_zi)})
        RETURNING id
      `
      return Response.json({ ok: true, id: Number(res[0].id) })
    }

    if (body.type === 'worker') {
      const res = await sql`
        INSERT INTO workers (salon_id, nume, activ) VALUES ('evolis', ${body.nume}, true) RETURNING id
      `
      return Response.json({ ok: true, id: Number(res[0].id) })
    }

    return Response.json({ error: 'Unknown type' }, { status: 400 })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req) {
  if (!auth(req)) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const sql = neon(process.env.DATABASE_URL)

  try {
    const body = await req.json()

    if (body.type === 'time_off') {
      await sql`DELETE FROM worker_time_off WHERE id = ${body.id}`
      return Response.json({ ok: true })
    }

    if (body.type === 'daily_limit') {
      await sql`DELETE FROM daily_limits WHERE id = ${body.id}`
      return Response.json({ ok: true })
    }

    return Response.json({ error: 'Unknown type' }, { status: 400 })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
