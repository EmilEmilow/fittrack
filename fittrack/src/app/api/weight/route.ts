import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const weightSchema = z.object({
  weight_kg: z.number().min(1).max(999),
  date: z.string().optional(),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const entries = await prisma.weightLog.findMany({
    where: { user_id: session.user.id },
    orderBy: { date: 'asc' },
    select: { id: true, date: true, weight_kg: true },
  })

  const data = entries.map(e => ({
    id: e.id,
    date: e.date.toISOString().split('T')[0],
    weight_kg: e.weight_kg,
  }))

  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = weightSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

  const { weight_kg, date } = parsed.data
  const dateStr = date ?? new Date().toISOString().split('T')[0]

  const dayStart = new Date(dateStr)
  dayStart.setHours(0, 0, 0, 0)
  const dayEnd = new Date(dateStr)
  dayEnd.setHours(23, 59, 59, 999)

  // Upsert: find existing entry for that date and update, otherwise create
  const existing = await prisma.weightLog.findFirst({
    where: {
      user_id: session.user.id,
      date: { gte: dayStart, lte: dayEnd },
    },
  })

  let entry
  if (existing) {
    entry = await prisma.weightLog.update({
      where: { id: existing.id },
      data: { weight_kg },
    })
  } else {
    entry = await prisma.weightLog.create({
      data: {
        user_id: session.user.id,
        date: new Date(dateStr),
        weight_kg,
      },
    })
  }

  return NextResponse.json({
    data: {
      id: entry.id,
      date: entry.date.toISOString().split('T')[0],
      weight_kg: entry.weight_kg,
    },
  })
}
