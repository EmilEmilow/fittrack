import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { searchFoods } from '@/lib/food-search'
import { prisma } from '@/lib/prisma'
import { FoodSearchResult } from '@/types'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q')
  const trimmed = (query ?? '').trim()
  if (trimmed.length < 2 || trimmed.length > 100) {
    return NextResponse.json({ data: [] })
  }

  // Search custom foods in DB for this user (case-insensitive via JS filter, SQLite has no insensitive mode)
  const allCustomPreferences = await prisma.userPreference.findMany({
    where: {
      user_id: session.user.id,
      food_item: { source: 'custom' },
    },
    include: { food_item: true },
  })

  const lowerTrimmed = trimmed.toLowerCase()
  const customPreferences = allCustomPreferences.filter(p =>
    p.food_item.name.toLowerCase().includes(lowerTrimmed)
  )

  const customResults: FoodSearchResult[] = customPreferences.map(p => ({
    name: p.food_item.name,
    calories: p.food_item.calories,
    protein_g: p.food_item.protein_g,
    carbs_g: p.food_item.carbs_g,
    fat_g: p.food_item.fat_g,
    fiber_g: p.food_item.fiber_g,
    serving_size: p.food_item.serving_size,
    serving_unit: p.food_item.serving_unit,
    source: 'custom' as const,
    external_id: p.food_item.external_id ?? '',
  }))

  const externalResults = await searchFoods(trimmed)
  return NextResponse.json({ data: [...customResults, ...externalResults] })
}
