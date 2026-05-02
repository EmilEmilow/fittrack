'use client'
import { useState, useEffect } from 'react'
import { DiaryEntryRow } from '@/components/DiaryEntryRow'
import Link from 'next/link'

const MEALS = ['breakfast', 'lunch', 'dinner', 'snack'] as const

interface DiaryEntry {
  id: string
  meal_type: string
  quantity: number
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  food_item: { name: string; serving_unit: string; serving_size: number }
}

export default function DiaryPage() {
  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(today)
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/diary?date=${date}`)
      .then(r => r.json())
      .then(({ data }) => { setEntries(data ?? []); setLoading(false) })
  }, [date])

  function handleDelete(id: string) {
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  const totals = entries.reduce(
    (acc, e) => ({ calories: acc.calories + e.calories, protein_g: acc.protein_g + e.protein_g, carbs_g: acc.carbs_g + e.carbs_g, fat_g: acc.fat_g + e.fat_g }),
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Food Diary</h1>
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
      </div>

      {loading ? (
        <p className="text-gray-400 text-center py-12">Loading...</p>
      ) : (
        <>
          {MEALS.map(meal => {
            const mealEntries = entries.filter(e => e.meal_type === meal)
            return (
              <div key={meal} className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="font-semibold text-gray-700 capitalize">{meal}</h2>
                  <Link href="/search" className="text-green-600 text-sm hover:underline">+ Add</Link>
                </div>
                <div className="px-4">
                  {mealEntries.length === 0 ? (
                    <p className="text-sm text-gray-400 py-4 text-center">No foods logged</p>
                  ) : (
                    mealEntries.map(entry => (
                      <DiaryEntryRow key={entry.id} entry={entry} onDelete={handleDelete} />
                    ))
                  )}
                </div>
              </div>
            )
          })}

          <div className="bg-green-50 rounded-xl p-4 border border-green-200">
            <h3 className="font-semibold text-gray-800 mb-2">Daily Total</h3>
            <p className="text-sm text-gray-700">
              {Math.round(totals.calories)} kcal · Protein: {Math.round(totals.protein_g)}g · Carbs: {Math.round(totals.carbs_g)}g · Fat: {Math.round(totals.fat_g)}g
            </p>
          </div>
        </>
      )}
    </div>
  )
}
