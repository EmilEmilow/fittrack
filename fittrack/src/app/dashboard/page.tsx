import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { CalorieRing } from '@/components/CalorieRing'
import { MacroBar } from '@/components/MacroBar'

async function getSummary(userId: string) {
  const today = new Date().toISOString().split('T')[0]
  const startOfDay = new Date(today)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(today)
  endOfDay.setHours(23, 59, 59, 999)

  const [user, entries] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.diaryEntry.findMany({
      where: { user_id: userId, date: { gte: startOfDay, lte: endOfDay } },
    }),
  ])

  if (!user) return null

  const consumed = entries.reduce(
    (acc, e) => ({
      calories: acc.calories + e.calories,
      protein_g: acc.protein_g + e.protein_g,
      carbs_g: acc.carbs_g + e.carbs_g,
      fat_g: acc.fat_g + e.fat_g,
    }),
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
  )

  return {
    consumed,
    targets: {
      calorie_target: user.calorie_target,
      protein_target_g: user.protein_target_g,
      carbs_target_g: user.carbs_target_g,
      fat_target_g: user.fat_target_g,
    },
    goal_type: user.goal_type,
    name: user.name,
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/auth/login')

  const summary = await getSummary(session.user.id)

  const goalLabel: Record<string, string> = {
    cut: 'Cutting — weight loss',
    maintain: 'Maintaining weight',
    bulk: 'Bulking — muscle gain',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hello, {session.user.name} 👋</h1>
          <p className="text-sm text-gray-500">{goalLabel[summary?.goal_type ?? 'maintain'] ?? 'Goal set'}</p>
        </div>
        <Link href="/search"
          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700">
          + Add Food
        </Link>
      </div>

      {summary ? (
        <>
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 flex flex-col items-center">
            <CalorieRing consumed={summary.consumed.calories} target={summary.targets.calorie_target} />
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h2 className="font-semibold text-gray-800 mb-4">Macros Today</h2>
            <MacroBar label="Protein" consumed={summary.consumed.protein_g} target={summary.targets.protein_target_g} color="#3b82f6" />
            <MacroBar label="Carbs" consumed={summary.consumed.carbs_g} target={summary.targets.carbs_target_g} color="#f59e0b" />
            <MacroBar label="Fat" consumed={summary.consumed.fat_g} target={summary.targets.fat_target_g} color="#ec4899" />
          </div>
        </>
      ) : (
        <p className="text-gray-500 text-center py-12">Could not load today&apos;s summary.</p>
      )}

      <div className="flex gap-3">
        <Link href="/diary" className="flex-1 bg-white border border-gray-200 rounded-xl p-4 text-center hover:border-green-400 transition-colors">
          <div className="text-2xl mb-1">📔</div>
          <div className="text-sm font-medium text-gray-700">View Diary</div>
        </Link>
        <Link href="/recommendations" className="flex-1 bg-white border border-gray-200 rounded-xl p-4 text-center hover:border-green-400 transition-colors">
          <div className="text-2xl mb-1">🤖</div>
          <div className="text-sm font-medium text-gray-700">AI Suggestions</div>
        </Link>
        <Link href="/progress" className="flex-1 bg-white border border-gray-200 rounded-xl p-4 text-center hover:border-green-400 transition-colors">
          <div className="text-2xl mb-1">📈</div>
          <div className="text-sm font-medium text-gray-700">Progress</div>
        </Link>
      </div>
    </div>
  )
}
