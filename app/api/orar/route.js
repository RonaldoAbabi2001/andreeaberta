import { neon } from '@neondatabase/serverless'

const LUNI_RO = ['Ianuarie','Februarie','Martie','Aprilie','Mai','Iunie','Iulie','August','Septembrie','Octombrie','Noiembrie','Decembrie']

function parseDateRO(str) {
  if (!str) return null
  const parts = str.trim().split(' ')
  if (parts.length !== 3) return null
  const day = parseInt(parts[0])
  const monthIdx = LUNI_RO.indexOf(parts[1])
  const year = parseInt(parts[2])
  if (monthIdx === -1 || isNaN(day) || isNaN(year)) return null
  return new Date(year, monthIdx, day)
}

function defaultForDay(zi) {
  // zi: 0=Luni...5=Sambata, 6=Duminica
  if (zi === 6) return { inchis: true }
  if (zi === 5) return { inchis: false, ora_start: '09:00', ora_sfarsit: '15:00', pauza_start: null, pauza_sfarsit: null }
  return { inchis: false, ora_start: '09:00', ora_sfarsit: '19:00', pauza_start: '12:00', pauza_sfarsit: '13:00' }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const dataStr = searchParams.get('data')

  if (!dataStr) return Response.json({ error: 'Missing data param' }, { status: 400 })

  const dateObj = parseDateRO(dataStr)
  if (!dateObj) return Response.json({ error: 'Invalid date format' }, { status: 400 })

  // JS getDay(): 0=Sun, 1=Mon...6=Sat → convert to 0=Mon: (jsDay + 6) % 7
  const jsDay = dateObj.getDay()
  const zi = (jsDay + 6) % 7

  try {
    const sql = neon(process.env.DATABASE_URL)

    // Get first active worker
    let worker
    try {
      const workers = await sql`SELECT id FROM workers WHERE salon_id = 'evolis' AND activ = true ORDER BY id LIMIT 1`
      worker = workers[0]
    } catch {
      // Tables don't exist yet
      return Response.json(defaultForDay(zi))
    }

    if (!worker) return Response.json(defaultForDay(zi))

    // Check time_off for this exact date
    const timeOff = await sql`
      SELECT * FROM worker_time_off WHERE worker_id = ${worker.id} AND data = ${dataStr}
    `

    // Check for full-day closure
    const fullDayClosure = timeOff.find(t =>
      (t.tip === 'zi_libera' || t.tip === 'concediu') && !t.ora_start
    )
    if (fullDayClosure) return Response.json({ inchis: true })

    // Check for custom orar override
    const orarCustom = timeOff.find(t => t.tip === 'orar_zi')
    if (orarCustom) {
      return Response.json({
        inchis: false,
        ora_start: orarCustom.ora_start || '09:00',
        ora_sfarsit: orarCustom.ora_sfarsit || '19:00',
        pauza_start: null,
        pauza_sfarsit: null,
      })
    }

    // Get worker schedule for this day
    const schedRows = await sql`
      SELECT * FROM worker_schedule WHERE worker_id = ${worker.id} AND zi = ${zi} LIMIT 1
    `

    let sched
    if (schedRows.length === 0) {
      sched = defaultForDay(zi)
    } else {
      const row = schedRows[0]
      if (!row.activ) return Response.json({ inchis: true })
      sched = {
        inchis: false,
        ora_start: row.ora_start || '09:00',
        ora_sfarsit: row.ora_sfarsit || '19:00',
        pauza_start: row.pauza_start || null,
        pauza_sfarsit: row.pauza_sfarsit || null,
      }
    }

    // Apply any extra pauza from time_off
    const pauzaEntry = timeOff.find(t => t.tip === 'pauza' && t.ora_start && t.ora_sfarsit)
    if (pauzaEntry) {
      sched.pauza_start = pauzaEntry.ora_start
      sched.pauza_sfarsit = pauzaEntry.ora_sfarsit
    }

    return Response.json(sched)
  } catch (err) {
    // If any DB error (tables not exist, etc), return defaults
    return Response.json(defaultForDay(zi))
  }
}
