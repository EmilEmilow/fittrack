'use client'
import { useState, useCallback, useRef } from 'react'
import { FoodSearchResult } from '@/types'

interface FoodSearchInputProps {
  onSelect: (food: FoodSearchResult) => void
}

export function FoodSearchInput({ onSelect }: FoodSearchInputProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<FoodSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return }
    abortRef.current?.abort()
    abortRef.current = new AbortController()
    setLoading(true)
    try {
      const res = await fetch(`/api/foods/search?q=${encodeURIComponent(q)}`, {
        signal: abortRef.current.signal,
      })
      const { data } = await res.json()
      setResults(data ?? [])
    } catch (e) {
      if ((e as Error).name !== 'AbortError') setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setQuery(val)
    search(val)
  }

  function handleSelect(food: FoodSearchResult) {
    onSelect(food)
    setQuery('')
    setResults([])
  }

  return (
    <div className="relative">
      <input
        type="text" value={query} onChange={handleChange}
        placeholder="Search foods... e.g. chicken breast"
        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
      />
      {loading && (
        <div className="absolute right-3 top-3 text-gray-400 text-xs">Searching...</div>
      )}
      {results.length > 0 && (
        <ul className="absolute z-20 top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-72 overflow-y-auto">
          {results.map((food, i) => (
            <li
              key={`${food.source}-${food.external_id}-${i}`}
              onClick={() => handleSelect(food)}
              className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
            >
              <div className="font-medium text-sm text-gray-800">{food.name}</div>
              <div className="text-xs text-gray-500 mt-0.5">
                {Math.round(food.calories)} kcal · P: {Math.round(food.protein_g)}g · C: {Math.round(food.carbs_g)}g · F: {Math.round(food.fat_g)}g
                <span className="ml-2 text-gray-400">({food.source === 'usda' ? 'USDA' : 'Open Food Facts'})</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
