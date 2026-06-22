import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { checkAuth } from '../../../lib/adminAuth'

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQbkaHugNVWV0Bf4l-CYY6stGjO3qXGHzcRx3vLZBMXwKa6pLqRLdDlhFKm4AEnedElsAhXBg1hdCqE/pub?output=csv'
const LUNI = ['Ianuarie','Februarie','Martie','Aprilie','Mai','Iunie','Iulie','August','Septembrie','Octombrie','Noiembrie','Decembrie']

function parseCSV(text) {
  const lines = text.trim().split('\n')
  const headers = lines[0].split(',').map(h =>
    h.trim().replace(/"/g, '').toLowerCase().replace(/\//g, '_').replace(/ /g, '_')
  )
  return lines.slice(1).map(line => {
    const vals = []
    let cur = '', inQuote = false
    for (const ch of line) {
      if (ch === '"') inQuote = !inQuote
      else if (ch === ',' && !inQuote) { vals.push(cur); cur = '' }
      else cur += ch
    }
    vals.push(cur)
    const obj = {}
    headers.forEach((h, i) => { obj[h] = (vals[i] || '').trim().replace(/^"|"$/g, '') })
    return obj
  })
}

// DD/MM/YYYY → "10 Mai 2026"
function csvDateToRO(str) {
  if (!str) return null
  const parts = str.trim().split('/')
  if (parts.length !== 3) return null
  const day = parseInt(parts[0])
  const month = parseInt(parts[1]) - 1
  const year = parseInt(parts[2])
  if (isNaN(day) || isNaN(month) || isNaN(year) || month < 0 || month > 11) return null
  return `${day} ${LUNI[month]} ${year}`
}

function isModel(row) {
  const tip = (row.tip_client || '').toLowerCase()
  const sursa = (row.sursa || '').toLowerCase()
  const obs = (row.observatii || '').toLowerCase()
  return tip.includes('model') || sursa.includes('model') || obs.includes('modela')
}

function buildServiceName(row) {
  const tip = (row.tip_serviciu || '').trim()
  const gel = (row.tip_gel || '').trim()
  const sablon = (row.sablon_tips || '').trim()
  if (tip) return tip
  if (gel) return `Serviciu gel ${gel}${sablon ? ' · ' + sablon : ''}`
  return 'Serviciu salon'
}

export async function POST(request) {
  if (!checkAuth(request))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sql = neon(process.env.DATABASE_URL)

  // Ensure all needed columns exist
  await sql`ALTER TABLE clienti ADD COLUMN IF NOT EXISTS tip_client TEXT`
  await sql`ALTER TABLE clienti ADD COLUMN IF NOT EXISTS oras TEXT`
  await sql`ALTER TABLE clienti ADD COLUMN IF NOT EXISTS instagram TEXT`
  await sql`ALTER TABLE clienti ADD COLUMN IF NOT EXISTS parola TEXT`

  // Fetch CSV — Node.js fetch follows redirects automatically
  const res = await fetch(CSV_URL, { redirect: 'follow' })
  if (!res.ok) return NextResponse.json({ error: 'Nu am putut prelua CSV-ul' }, { status: 500 })
  const text = await res.text()
  const rows = parseCSV(text).filter(r => r.nume && r.telefon)

  // ── 1. IMPORT CLIENTI ─────────────────────────────────────────
  const byPhone = {}
  rows.forEach(row => {
    const phone = row.telefon.trim()
    if (!byPhone[phone]) {
      byPhone[phone] = {
        phone,
        name: row.nume.trim(),
        oras: (row.oras_zona || '').trim(),
        instagram: (row.instagram || '').trim(),
        tip_client: isModel(row) ? 'modela' : (row.tip_client || '').toLowerCase().trim(),
        sursa: (row.sursa || '').trim(),
        observatii: [(row.observatii || ''), (row.note_personale || '')].filter(Boolean).join(' | ').trim(),
      }
    } else {
      // Upgrade tip_client if better info
      if (isModel(row)) byPhone[phone].tip_client = 'modela'
      else if (row.tip_client?.toLowerCase() === 'fidela' && byPhone[phone].tip_client !== 'modela')
        byPhone[phone].tip_client = 'fidela'
    }
  })

  let clientiInserted = 0, clientiUpdated = 0
  let baseId = Date.now()

  for (const c of Object.values(byPhone)) {
    const exists = await sql`SELECT id FROM clienti WHERE telefon = ${c.phone}`
    if (exists.length > 0) {
      await sql`UPDATE clienti SET
        tip_client = CASE WHEN tip_client IS NULL OR tip_client = '' THEN ${c.tip_client} ELSE tip_client END,
        oras       = CASE WHEN oras IS NULL OR oras = ''       THEN ${c.oras}       ELSE oras END,
        instagram  = CASE WHEN instagram IS NULL OR instagram = '' THEN ${c.instagram} ELSE instagram END
        WHERE telefon = ${c.phone}`
      clientiUpdated++
    } else {
      await sql`INSERT INTO clienti (id, nume, telefon, oras, instagram, tip_client, sursa, observatii, parola)
        VALUES (${baseId++}, ${c.name}, ${c.phone}, ${c.oras}, ${c.instagram}, ${c.tip_client}, ${c.sursa}, ${c.observatii}, ${c.phone})`
      clientiInserted++
    }
  }

  // ── 2. IMPORT PROGRAMARI ISTORICE ────────────────────────────
  let progInserted = 0, progSkipped = 0

  for (const row of rows) {
    const dataRO = csvDateToRO(row.ultima_vizita)
    if (!dataRO) { progSkipped++; continue }

    const phone = row.telefon.trim()
    const serviciu = buildServiceName(row)
    const pret = parseInt(row.pret) || 0

    // Skip if this appointment already exists
    const exists = await sql`
      SELECT id FROM programari WHERE telefon = ${phone} AND data = ${dataRO}
    `
    if (exists.length > 0) { progSkipped++; continue }

    await sql`INSERT INTO programari
      (id, nume, telefon, serviciu, pret, durata, data, ora, plata, observatii, status)
      VALUES (
        ${baseId++},
        ${row.nume.trim()},
        ${phone},
        ${serviciu},
        ${pret},
        ${60},
        ${dataRO},
        ${''},
        ${'numerar'},
        ${(row.observatii || '').trim()},
        ${'confirmed'}
      )`
    progInserted++
  }

  return NextResponse.json({
    clienti: { inserted: clientiInserted, updated: clientiUpdated },
    programari: { inserted: progInserted, skipped: progSkipped },
    total_rows: rows.length,
  })
}
