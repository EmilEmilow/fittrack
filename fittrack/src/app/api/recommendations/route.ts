import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getRecommendations } from '@/lib/claude'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const data = await getRecommendations(session.user.id)
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: 'Could not generate recommendations right now' }, { status: 500 })
  }
}
