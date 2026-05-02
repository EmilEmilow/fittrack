import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getRecommendations } from '@/lib/claude'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const recent = await prisma.recommendation.findFirst({
    where: { user_id: session.user.id, date: { gte: new Date(Date.now() - 60_000) } },
    orderBy: { date: 'desc' },
  })
  if (recent) return NextResponse.json({ error: 'Please wait before requesting again' }, { status: 429 })

  try {
    const data = await getRecommendations(session.user.id)
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: 'Could not generate recommendations right now' }, { status: 500 })
  }
}
