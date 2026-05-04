'use client'
import { useState, useEffect, useCallback } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
} from 'recharts'

interface WeightEntry {
  id: string
  date: string
  weight_kg: number
}

interface DiaryEntry {
  id: string
  date: string
  calories: number
}

interface CalorieDay {
  date: string
  calories: number
}

function getDateString(daysAgo: number): string {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().split('T')[0]
}

function calculateStreak(entries: DiaryEntry[]): number {
  if (entries.length === 0) return 0

  const datesWithEntries = new Set(
    entries.map(e => e.date.split('T')[0])
  )

  let streak = 0
  let checkDate = new Date()

  // Check from today going backward
  for (let i = 0; i < 90; i++) {
    const dateStr = checkDate.toISOString().split('T')[0]
    if (datesWithEntries.has(dateStr)) {
      streak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else {
      // If today has no entry yet, skip today and start from yesterday
      if (i === 0) {
        checkDate.setDate(checkDate.getDate() - 1)
        continue
      }
      break
    }
  }

  return streak
}

function groupCaloriesByDay(entries: DiaryEntry[]): CalorieDay[] {
  const map: Record<string, number> = {}
  for (const entry of entries) {
    const day = entry.date.split('T')[0]
    map[day] = (map[day] ?? 0) + entry.calories
  }
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, calories]) => ({ date, calories: Math.round(calories) }))
}

export default function ProgressPage() {
  const [activeTab, setActiveTab] = useState<'weight' | 'calories'>('weight')
  const [weightData, setWeightData] = useState<WeightEntry[]>([])
  const [calorieData, setCalorieData] = useState<CalorieDay[]>([])
  const [streak, setStreak] = useState(0)
  const [loadingWeight, setLoadingWeight] = useState(true)
  const [loadingCalories, setLoadingCalories] = useState(true)
  const [weightInput, setWeightInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState('')

  const fetchWeightData = useCallback(async () => {
    setLoadingWeight(true)
    try {
      const res = await fetch('/api/weight')
      const json = await res.json()
      setWeightData(json.data ?? [])
    } catch {
      // silently fail, show empty chart
    } finally {
      setLoadingWeight(false)
    }
  }, [])

  const fetchCalorieAndStreakData = useCallback(async () => {
    setLoadingCalories(true)
    try {
      const today = getDateString(0)
      const start90 = getDateString(89)
      const start30 = getDateString(29)

      const res = await fetch(`/api/diary?start=${start90}&end=${today}`)
      const json = await res.json()
      const entries90: DiaryEntry[] = json.data ?? []

      setStreak(calculateStreak(entries90))
      setCalorieData(groupCaloriesByDay(entries90.filter(e => e.date.split('T')[0] >= start30)))
    } catch {
      // silently fail
    } finally {
      setLoadingCalories(false)
    }
  }, [])

  useEffect(() => {
    fetchWeightData()
    fetchCalorieAndStreakData()
  }, [fetchWeightData, fetchCalorieAndStreakData])

  async function handleLogWeight(e: React.FormEvent) {
    e.preventDefault()
    setSubmitError('')
    setSubmitSuccess('')

    const weight = parseFloat(weightInput)
    if (isNaN(weight) || weight < 1 || weight > 999) {
      setSubmitError('Enter a valid weight between 1 and 999 kg.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/weight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weight_kg: weight }),
      })
      if (!res.ok) {
        const json = await res.json()
        setSubmitError(json.error ?? 'Failed to log weight.')
        return
      }
      setSubmitSuccess('Weight logged!')
      setWeightInput('')
      await fetchWeightData()
    } catch {
      setSubmitError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const parts = dateStr.split('-')
    return `${parts[1]}/${parts[2]}`
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Progress</h1>

      {/* Streak indicator */}
      <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-6 flex items-center gap-2">
        <span className="text-2xl">🔥</span>
        <div>
          <p className="text-sm font-medium text-green-800">
            Current streak: <span className="font-bold">{streak} {streak === 1 ? 'day' : 'days'}</span>
          </p>
          <p className="text-xs text-green-600">Consecutive days with at least one diary entry</p>
        </div>
      </div>

      {/* Tab controls */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('weight')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'weight'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Weight
        </button>
        <button
          onClick={() => setActiveTab('calories')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'calories'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Calories
        </button>
      </div>

      {/* Weight Tab */}
      {activeTab === 'weight' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Weight Over Time (kg)</h2>
            {loadingWeight ? (
              <div className="h-56 flex items-center justify-center text-gray-400">Loading...</div>
            ) : weightData.length === 0 ? (
              <div className="h-56 flex items-center justify-center text-gray-400 text-sm">
                No weight entries yet. Log your first weight below.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={weightData}>
                  <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11 }} />
                  <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11 }} unit=" kg" />
                  <Tooltip
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(value: any) => [`${value} kg`, 'Weight']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Line type="monotone" dataKey="weight_kg" stroke="#16a34a" dot={{ r: 3 }} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Log Weight Form */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Log Today&apos;s Weight</h2>
            <form onSubmit={handleLogWeight} className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="block text-sm text-gray-600 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="999"
                  value={weightInput}
                  onChange={e => setWeightInput(e.target.value)}
                  placeholder="e.g. 75.5"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <button
                type="submit"
                disabled={submitting || !weightInput}
                className="bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Saving...' : 'Log Weight'}
              </button>
            </form>
            {submitError && <p className="text-red-500 text-sm mt-2">{submitError}</p>}
            {submitSuccess && <p className="text-green-600 text-sm mt-2">{submitSuccess}</p>}
          </div>
        </div>
      )}

      {/* Calories Tab */}
      {activeTab === 'calories' && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Daily Calorie Intake — Last 30 Days</h2>
          {loadingCalories ? (
            <div className="h-56 flex items-center justify-center text-gray-400">Loading...</div>
          ) : calorieData.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-gray-400 text-sm">
              No diary entries in the last 30 days.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={calorieData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} unit=" kcal" />
                <Tooltip
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value: any) => [`${value} kcal`, 'Calories']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Bar dataKey="calories" fill="#16a34a" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      )}
    </div>
  )
}
