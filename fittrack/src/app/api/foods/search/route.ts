import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { searchFoods } from '@/lib/food-search'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q')
  if (!query || query.trim().length < 2) {
    return NextResponse.json({ data: [] })
  }

  const results = await searchFoods(query.trim())
  return NextResponse.json({ data: results })
}
