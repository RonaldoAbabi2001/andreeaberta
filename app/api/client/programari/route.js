import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

function getClientId(request) {
  const token = request.headers.get('x-client-token')
  if (!token?.startsWith('client_')) return null
  return token.replace('client_', '')
}

export async function GET(request) {
  const clientId = getClientId(request)
  if (!clientId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sql = neon(process.env.DATABASE_URL)
  const clients = await sql`SELECT * FROM clienti WHERE id = ${clientId}`
  if (clients.length === 0) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const client = clients[0]
  const programari = await sql`
    SELECT * FROM programari WHERE telefon = ${client.telefon}
    ORDER BY creat DESC
  `
  return NextResponse.json({ client, programari })
}
