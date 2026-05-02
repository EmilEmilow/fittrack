import Anthropic from '@anthropic-ai/sdk'
import { prisma } from '@/lib/prisma'

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY is not set')
}
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function getRecommendations(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new Error('User not found')

  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const [todayEntries, topFoods, recentEntries] = await Promise.all([
    prisma.diaryEntry.findMany({
      where: { user_id: userId, date: { gte: startOfToday } },
    }),
    prisma.userPreference.findMany({
      where: { user_id: userId },
      orderBy: { frequency_count: 'desc' },
      take: 20,
      include: { food_item: true },
    }),
    prisma.diaryEntry.findMany({
      where: { user_id: userId, date: { gte: sevenDaysAgo } },
      include: { food_item: true },
      orderBy: { date: 'desc' },
      take: 50,
    }),
  ])

  const loggedCalories = todayEntries.reduce((s, e) => s + e.calories, 0)
  const loggedProtein = todayEntries.reduce((s, e) => s + e.protein_g, 0)
  const loggedCarbs = todayEntries.reduce((s, e) => s + e.carbs_g, 0)
  const loggedFat = todayEntries.reduce((s, e) => s + e.fat_g, 0)

  const remaining = {
    calories: Math.round(user.calorie_target - loggedCalories),
    protein: Math.round(user.protein_target_g - loggedProtein),
    carbs: Math.round(user.carbs_target_g - loggedCarbs),
    fat: Math.round(user.fat_target_g - loggedFat),
  }

  const favFoods = topFoods.map(p => `${p.food_item.name} (logged ${p.frequency_count}×)`).join(', ') || 'none yet'
  const recentNames = Array.from(new Set(recentEntries.map(e => e.food_item.name))).slice(0, 10).join(', ') || 'none yet'

  const goalDesc: Record<string, string> = {
    cut: 'cutting (weight loss, calorie deficit)',
    maintain: 'maintaining weight',
    bulk: 'bulking (muscle gain, calorie surplus)',
  }
  const goalLabel = goalDesc[user.goal_type] ?? user.goal_type

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `You are a nutrition coach. Suggest 3-5 foods for a user based on their goals and eating history.

Goal: ${goalLabel}
Remaining today: ${remaining.calories} kcal | ${remaining.protein}g protein | ${remaining.carbs}g carbs | ${remaining.fat}g fat
Favourite foods: ${favFoods}
Recent meals (7 days): ${recentNames}

Return ONLY a JSON object with this exact shape, no extra text:
{
  "suggestions": [
    { "food": "food name", "reason": "one sentence why this fits their goals" }
  ],
  "summary": "one sentence overview"
}`,
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') throw new Error('Unexpected Claude response type')

  let parsed: { suggestions: { food: string; reason: string }[]; summary: string }
  try {
    parsed = JSON.parse(content.text)
  } catch {
    throw new Error('Claude returned invalid JSON')
  }
  if (!parsed || !Array.isArray(parsed.suggestions) || typeof parsed.summary !== 'string') {
    throw new Error('Claude response has unexpected shape')
  }

  await prisma.recommendation.create({
    data: {
      user_id: userId,
      suggestion_text: parsed.summary,
      reasoning: parsed.suggestions.map(s => `${s.food}: ${s.reason}`).join(' | '),
      foods_suggested: JSON.stringify(parsed.suggestions.map(s => s.food)),
    },
  })

  return parsed
}
