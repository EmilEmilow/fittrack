'use client'
import { useState, useEffect, useCallback } from 'react'

interface FoodItem {
  id: string
  name: string
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  fiber_g: number | null
  serving_size: number
  serving_unit: string
}

const defaultForm = {
  name: '',
  calories: '',
  protein_g: '',
  carbs_g: '',
  fat_g: '',
  fiber_g: '',
  serving_size: '',
  serving_unit: 'g',
}

export default function CustomFoodsPage() {
  const [foods, setFoods] = useState<FoodItem[]>([])
  const [form, setForm] = useState(defaultForm)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const fetchFoods = useCallback(async () => {
    setFetching(true)
    try {
      const res = await fetch('/api/foods/custom')
      if (res.ok) {
        const json = await res.json()
        setFoods(json.data ?? [])
      }
    } finally {
      setFetching(false)
    }
  }, [])

  useEffect(() => {
    fetchFoods()
  }, [fetchFoods])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setStatus('idle')
    setErrorMsg('')

    const body: Record<string, unknown> = {
      name: form.name,
      calories: parseFloat(form.calories),
      protein_g: parseFloat(form.protein_g),
      carbs_g: parseFloat(form.carbs_g),
      fat_g: parseFloat(form.fat_g),
      serving_size: parseFloat(form.serving_size),
      serving_unit: form.serving_unit,
    }
    if (form.fiber_g !== '') body.fiber_g = parseFloat(form.fiber_g)

    try {
      const res = await fetch('/api/foods/custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        setStatus('success')
        setForm(defaultForm)
        await fetchFoods()
      } else {
        const json = await res.json()
        setErrorMsg(json.error ?? 'Failed to create food')
        setStatus('error')
      }
    } catch {
      setErrorMsg('Network error. Please try again.')
      setStatus('error')
    } finally {
      setLoading(false)
    }
  }

  const fieldClass =
    'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500'
  const labelClass = 'block text-xs font-medium text-gray-600 mb-1'

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Custom Foods</h1>

      {/* Create form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Add New Custom Food</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Name *</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              maxLength={200}
              placeholder="e.g. Homemade Protein Bar"
              className={fieldClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Calories (kcal) *</label>
              <input
                type="number"
                name="calories"
                value={form.calories}
                onChange={handleChange}
                required
                min={0}
                step="0.1"
                placeholder="0"
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass}>Protein (g) *</label>
              <input
                type="number"
                name="protein_g"
                value={form.protein_g}
                onChange={handleChange}
                required
                min={0}
                step="0.1"
                placeholder="0"
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass}>Carbs (g) *</label>
              <input
                type="number"
                name="carbs_g"
                value={form.carbs_g}
                onChange={handleChange}
                required
                min={0}
                step="0.1"
                placeholder="0"
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass}>Fat (g) *</label>
              <input
                type="number"
                name="fat_g"
                value={form.fat_g}
                onChange={handleChange}
                required
                min={0}
                step="0.1"
                placeholder="0"
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass}>Fiber (g)</label>
              <input
                type="number"
                name="fiber_g"
                value={form.fiber_g}
                onChange={handleChange}
                min={0}
                step="0.1"
                placeholder="Optional"
                className={fieldClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Serving Size *</label>
              <input
                type="number"
                name="serving_size"
                value={form.serving_size}
                onChange={handleChange}
                required
                min={0.1}
                step="0.1"
                placeholder="100"
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass}>Serving Unit *</label>
              <input
                type="text"
                name="serving_unit"
                value={form.serving_unit}
                onChange={handleChange}
                required
                maxLength={50}
                placeholder="g"
                className={fieldClass}
              />
            </div>
          </div>

          {status === 'success' && (
            <p className="text-green-600 text-sm">Food created successfully!</p>
          )}
          {status === 'error' && (
            <p className="text-red-500 text-sm">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Creating...' : 'Create Food'}
          </button>
        </form>
      </div>

      {/* Foods list */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Your Custom Foods</h2>
        {fetching ? (
          <p className="text-gray-500 text-sm">Loading...</p>
        ) : foods.length === 0 ? (
          <p className="text-gray-500 text-sm">No custom foods yet. Create one above!</p>
        ) : (
          <div className="space-y-3">
            {foods.map(food => (
              <div
                key={food.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{food.name}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {Math.round(food.calories)} kcal &middot; {Math.round(food.protein_g)}g protein &middot; {Math.round(food.carbs_g)}g carbs &middot; {Math.round(food.fat_g)}g fat
                      {food.fiber_g != null && ` · ${Math.round(food.fiber_g)}g fiber`}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 bg-gray-100 rounded px-2 py-0.5 ml-3 shrink-0">
                    per {food.serving_size}{food.serving_unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
