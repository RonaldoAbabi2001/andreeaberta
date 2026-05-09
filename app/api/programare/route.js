import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), 'data', 'programari.json')

function loadProgramari() {
  if (!fs.existsSync(DATA_FILE)) return []
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'))
}

function saveProgramari(list) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true })
  fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2))
}

export async function POST(request) {
  const body = await request.json()
  const { nume, telefon, serviciu, data } = body

  if (!nume || !telefon || !serviciu || !data) {
    return NextResponse.json({ error: 'Câmpuri obligatorii lipsă' }, { status: 400 })
  }

  const programari = loadProgramari()
  const programare = {
    id: Date.now(),
    ...body,
    creat: new Date().toISOString(),
    status: 'pending'
  }
  programari.push(programare)
  saveProgramari(programari)

  return NextResponse.json({ success: true, id: programare.id })
}

export async function GET() {
  const programari = loadProgramari()
  return NextResponse.json(programari)
}
