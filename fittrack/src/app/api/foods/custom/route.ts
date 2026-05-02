import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createSchema = z.object({
  name: z.string().min(1).max(200),
  calories: z.number().min(0),
  protein_g: z.number().min(0),
  carbs_g: z.number().min(0),
  fat_g: z.number().min(0),
  fiber_g: z.number().min(0).optional(),
  serving_size: z.number().positive(),
  serving_unit: z.string().min(1).max(50),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

  const { name, calories, protein_g, carbs_g, fat_g, fiber_g, serving_size, serving_unit } = parsed.data

  const timestamp = Date.now()
  const external_id = `custom-${session.user.id}-${timestamp}`

  const foodItem = await prisma.foodItem.create({
    data: {
      name,
      calories,
      protein_g,
      carbs_g,
      fat_g,
      fiber_g: fiber_g ?? null,
      serving_size,
      serving_unit,
      source: 'custom',
      external_id,
      created_by: session.user.id,
    },
  })

  await prisma.userPreference.upsert({
    where: { user_id_food_item_id: { user_id: session.user.id, food_item_id: foodItem.id } },
    create: { user_id: session.user.id, food_item_id: foodItem.id, frequency_count: 10 },
    update: { frequency_count: 10 },
  })

  return NextResponse.json({ data: foodItem }, { status: 201 })
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const preferences = await prisma.userPreference.findMany({
    where: {
      user_id: session.user.id,
      food_item: { source: 'custom' },
    },
    include: { food_item: true },
  })

  const foods = preferences.map(p => p.food_item)
  return NextResponse.json({ data: foods })
}
