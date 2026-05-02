'use client'
import { useState } from 'react'
import { FoodSearchInput } from '@/components/FoodSearchInput'
import { FoodSearchResult, MealType } from '@/types'

export default function SearchPage() {
  const [selected, setSelected] = useState<FoodSearchResult | null>(null)
  const [mealType, setMealType] = useState<MealType>('breakfast')
  const [quantity, setQuantity] = useState('1')
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [adding, setAdding] = useState(false)

  async function handleAdd() {
    if (!selected || adding) return
    setAdding(true)
    setStatus('idle')
    const date = new Date().toISOString().split('T')[0]
    try {
      const res = await fetch('/api/diary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          food: selected,
          meal_type: mealType,
          quantity: parseFloat(quantity),
          date,
        }),
      })
      setStatus(res.ok ? 'success' : 'error')
      if (res.ok) setSelected(null)
    } catch {
      setStatus('error')
    } finally {
      setAdding(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Search Foods</h1>

      <FoodSearchInput onSelect={setSelected} />

      {selected && (
        <div className="mt-4 bg-white rounded-xl shadow-sm p-5 border border-green-200">
          <h2 className="font-semibold text-gray-800 mb-1">{selected.name}</h2>
          <p className="text-sm text-gray-500 mb-4">
            {Math.round(selected.calories)} kcal · {Math.round(selected.protein_g)}g protein · {Math.round(selected.carbs_g)}g carbs · {Math.round(selected.fat_g)}g fat
            <span className="ml-2">per {selected.serving_size}{selected.serving_unit}</span>
          </p>

          <div className="flex gap-3 mb-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">Servings</label>
              <input
                type="number" step="0.1" min="0.1" value={quantity}
                onChange={e => setQuantity(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">Meal</label>
              <select value={mealType} onChange={e => setMealType(e.target.value as MealType)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleAdd}
            disabled={adding}
            className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
          >
            {adding ? 'Adding...' : 'Add to Diary'}
          </button>

          {status === 'success' && <p className="text-green-600 text-sm mt-2 text-center">Added successfully!</p>}
          {status === 'error' && <p className="text-red-500 text-sm mt-2 text-center">Failed to add. Try again.</p>}
        </div>
      )}
    </div>
  )
}
