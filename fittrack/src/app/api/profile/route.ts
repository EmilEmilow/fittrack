import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { calculateAllTargets } from '@/lib/calculations'

const patchSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  age: z.number().int().min(13).max(120).optional(),
  height_cm: z.number().min(100).max(250).optional(),
  weight_kg: z.number().min(30).max(300).optional(),
  goal_type: z.enum(['cut', 'maintain', 'bulk']).optional(),
  activity_level: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']).optional(),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      age: true,
      gender: true,
      height_cm: true,
      weight_kg: true,
      goal_type: true,
      activity_level: true,
      calorie_target: true,
      protein_target_g: true,
      carbs_target_g: true,
      fat_target_g: true,
    },
  })

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  return NextResponse.json({ data: user })
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const updates = parsed.data

  // Fetch current user to fill in missing fields for target recalculation
  const current = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      weight_kg: true,
      height_cm: true,
      age: true,
      gender: true,
      activity_level: true,
      goal_type: true,
    },
  })

  if (!current) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const merged = {
    weight_kg: updates.weight_kg ?? current.weight_kg,
    height_cm: updates.height_cm ?? current.height_cm,
    age: updates.age ?? current.age,
    gender: current.gender as 'male' | 'female',
    activity_level: (updates.activity_level ?? current.activity_level) as import('@/types').ActivityLevel,
    goal_type: (updates.goal_type ?? current.goal_type) as import('@/types').GoalType,
  }

  const targets = calculateAllTargets(merged)

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...updates,
      ...targets,
    },
    select: {
      name: true,
      email: true,
      age: true,
      gender: true,
      height_cm: true,
      weight_kg: true,
      goal_type: true,
      activity_level: true,
      calorie_target: true,
      protein_target_g: true,
      carbs_target_g: true,
      fat_target_g: true,
    },
  })

  return NextResponse.json({ data: user })
}
