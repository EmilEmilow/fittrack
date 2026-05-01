import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const dateStr = searchParams.get('date') ?? new Date().toISOString().split('T')[0]

  const startOfDay = new Date(dateStr)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(dateStr)
  endOfDay.setHours(23, 59, 59, 999)

  const [user, entries] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id } }),
    prisma.diaryEntry.findMany({
      where: { user_id: session.user.id, date: { gte: startOfDay, lte: endOfDay } },
    }),
  ])

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const totals = entries.reduce(
    (acc, e) => ({
      calories: acc.calories + e.calories,
      protein_g: acc.protein_g + e.protein_g,
      carbs_g: acc.carbs_g + e.carbs_g,
      fat_g: acc.fat_g + e.fat_g,
    }),
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
  )

  return NextResponse.json({
    data: {
      consumed: totals,
      targets: {
        calorie_target: user.calorie_target,
        protein_target_g: user.protein_target_g,
        carbs_target_g: user.carbs_target_g,
        fat_target_g: user.fat_target_g,
      },
      goal_type: user.goal_type,
      name: user.name,
    },
  })
}
