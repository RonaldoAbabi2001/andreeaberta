import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const SECRET = 'evolis2026secret'
const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQbkaHugNVWV0Bf4l-CYY6stGjO3qXGHzcRx3vLZBMXwKa6pLqRLdDlhFKm4AEnedElsAhXBg1hdCqE/pub?output=csv'

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

function isModel(row) {
  const tip = (row.tip_client || '').toLowerCase()
  const sursa = (row.sursa || '').toLowerCase()
  const obs = (row.observatii || '').toLowerCase()
  const note = (row.note_personale || '').toLowerCase()
  return tip.includes('model') || sursa.includes('model') ||
         obs.includes('modela') || note.includes('model')
}

export async function POST(request) {
  if (request.headers.get('x-admin-token') !== SECRET)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sql = neon(process.env.DATABASE_URL)

  await sql`ALTER TABLE clienti ADD COLUMN IF NOT EXISTS tip_client TEXT`
  await sql`ALTER TABLE clienti ADD COLUMN IF NOT EXISTS oras TEXT`
  await sql`ALTER TABLE clienti ADD COLUMN IF NOT EXISTS instagram TEXT`
  await sql`ALTER TABLE clienti ADD COLUMN IF NOT EXISTS parola TEXT`

  const res = await fetch(CSV_URL, { redirect: 'follow' })
  const text = await res.text()
  const rows = parseCSV(text)

  const byPhone = {}
  rows.forEach(row => {
    const phone = (row.telefon || '').trim()
    if (!phone || !row.nume) return
    const modela = isModel(row)
    const tip = modela ? 'modela' : (row.tip_client || '').toLowerCase()
    const existing = byPhone[phone]
    if (!existing || modela || tip === 'fidela') {
      byPhone[phone] = {
        phone,
        name: row.nume.trim(),
        oras: (row.oras_zona || '').trim(),
        instagram: (row.instagram || '').trim(),
        tip_client: tip,
        sursa: (row.sursa || '').trim(),
        observatii: [(row.observatii || ''), (row.note_personale || '')].filter(Boolean).join(' | ').trim(),
      }
    } else {
      if (tip && !byPhone[phone].tip_client) byPhone[phone].tip_client = tip
      if (!byPhone[phone].oras && row.oras_zona) byPhone[phone].oras = row.oras_zona.trim()
    }
  })

  const toImport = Object.values(byPhone).filter(c => c.name && c.phone)
  let inserted = 0, updated = 0

  let baseId = Date.now()
  for (const c of toImport) {
    const exists = await sql`SELECT id FROM clienti WHERE telefon = ${c.phone}`
    if (exists.length > 0) {
      await sql`UPDATE clienti SET
        tip_client = COALESCE(NULLIF(tip_client, ''), ${c.tip_client}),
        oras       = COALESCE(NULLIF(oras, ''),       ${c.oras}),
        instagram  = COALESCE(NULLIF(instagram, ''),  ${c.instagram})
        WHERE telefon = ${c.phone}`
      updated++
    } else {
      await sql`INSERT INTO clienti (id, nume, telefon, oras, instagram, tip_client, sursa, observatii, parola)
        VALUES (${baseId++}, ${c.name}, ${c.phone}, ${c.oras}, ${c.instagram}, ${c.tip_client}, ${c.sursa}, ${c.observatii}, ${c.phone})`
      inserted++
    }
  }

  return NextResponse.json({ inserted, updated, total: toImport.length })
}
