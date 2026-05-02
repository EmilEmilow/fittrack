import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const addSchema = z.object({
  food: z.object({
    name: z.string(),
    calories: z.number(),
    protein_g: z.number(),
    carbs_g: z.number(),
    fat_g: z.number(),
    fiber_g: z.number().nullable(),
    serving_size: z.number(),
    serving_unit: z.string(),
    source: z.enum(['usda', 'open_food_facts', 'custom']),
    external_id: z.string(),
  }),
  meal_type: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  quantity: z.number().positive(),
  date: z.string(),
})

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const startParam = searchParams.get('start')
  const endParam = searchParams.get('end')
  const dateStr = searchParams.get('date') ?? new Date().toISOString().split('T')[0]

  let start: Date
  let end: Date

  if (startParam && endParam) {
    start = new Date(startParam)
    start.setHours(0, 0, 0, 0)
    end = new Date(endParam)
    end.setHours(23, 59, 59, 999)
  } else {
    start = new Date(dateStr)
    start.setHours(0, 0, 0, 0)
    end = new Date(dateStr)
    end.setHours(23, 59, 59, 999)
  }

  const entries = await prisma.diaryEntry.findMany({
    where: { user_id: session.user.id, date: { gte: start, lte: end } },
    include: { food_item: true },
    orderBy: { date: 'asc' },
  })

  return NextResponse.json({ data: entries })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = addSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

  const { food, meal_type, quantity, date } = parsed.data

  const foodData = {
    name: food.name,
    calories: food.calories,
    protein_g: food.protein_g,
    carbs_g: food.carbs_g,
    fat_g: food.fat_g,
    fiber_g: food.fiber_g,
    serving_size: food.serving_size,
    serving_unit: food.serving_unit,
    source: food.source,
    external_id: food.external_id,
  }

  let foodItem = await prisma.foodItem.findFirst({
    where: { source: food.source, external_id: food.external_id },
  })

  if (!foodItem) {
    try {
      foodItem = await prisma.foodItem.create({ data: foodData })
    } catch {
      foodItem = await prisma.foodItem.findFirst({
        where: { source: food.source, external_id: food.external_id },
      })
      if (!foodItem) return NextResponse.json({ error: 'Failed to create food item' }, { status: 500 })
    }
  }

  const entry = await prisma.diaryEntry.create({
    data: {
      user_id: session.user.id,
      food_item_id: foodItem.id,
      date: new Date(date),
      meal_type,
      quantity,
      calories: foodItem.calories * quantity,
      protein_g: foodItem.protein_g * quantity,
      carbs_g: foodItem.carbs_g * quantity,
      fat_g: foodItem.fat_g * quantity,
    },
    include: { food_item: true },
  })

  await prisma.userPreference.upsert({
    where: { user_id_food_item_id: { user_id: session.user.id, food_item_id: foodItem.id } },
    create: { user_id: session.user.id, food_item_id: foodItem.id, frequency_count: 1 },
    update: { frequency_count: { increment: 1 } },
  })

  return NextResponse.json({ data: entry }, { status: 201 })
}
