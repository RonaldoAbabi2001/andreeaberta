import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

export async function POST(request) {
  const { email, parola } = await request.json()
  if (!email) return NextResponse.json({ error: 'Emailul este obligatoriu.' }, { status: 400 })

  const sql = neon(process.env.DATABASE_URL)
  const rows = await sql`SELECT * FROM clienti WHERE LOWER(email) = LOWER(${email.trim()})`

  if (rows.length === 0) {
    return NextResponse.json({ error: 'Nu există un cont pentru acest email. Faceți o programare mai întâi.' }, { status: 404 })
  }

  const client = rows[0]
  const parolaCorecta = client.parola || client.telefon

  if (parola !== parolaCorecta) {
    return NextResponse.json({ error: 'Parolă incorectă.' }, { status: 401 })
  }

  return NextResponse.json({
    success: true,
    token: `client_${client.id}`,
    id: client.id,
    nume: client.nume,
    telefon: client.telefon,
    email: client.email || '',
  })
}

export async function PATCH(request) {
  const { token, parola_noua } = await request.json()
  if (!token || !parola_noua) return NextResponse.json({ error: 'Date incomplete.' }, { status: 400 })

  const id = token.replace('client_', '')
  const sql = neon(process.env.DATABASE_URL)
  await sql`UPDATE clienti SET parola = ${parola_noua} WHERE id = ${id}`
  return NextResponse.json({ success: true })
}
