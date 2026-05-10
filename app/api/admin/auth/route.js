import { NextResponse } from 'next/server'

const ADMIN_EMAIL = 'abroansrl@gmail.com'
const ADMIN_PASSWORD = 'ronaldo01Aa@'
const SECRET = 'evolis2026secret'

export async function POST(request) {
  const { email, password } = await request.json()

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    return NextResponse.json({ success: true, token: SECRET })
  }

  return NextResponse.json({ error: 'Date incorecte' }, { status: 401 })
}
