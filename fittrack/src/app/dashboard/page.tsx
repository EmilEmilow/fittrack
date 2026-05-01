import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CalorieRing } from '@/components/CalorieRing'
import { MacroBar } from '@/components/MacroBar'

async function getSummary() {
  const today = new Date().toISOString().split('T')[0]
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/summary?date=${today}`, { cache: 'no-store' })
  if (!res.ok) return null
  const { data } = await res.json()
  return data
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/auth/login')

  const summary = await getSummary()

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
          <p className="text-sm text-gray-500">{goalLabel[summary?.goal_type ?? 'maintain']}</p>
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
