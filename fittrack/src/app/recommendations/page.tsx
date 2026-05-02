'use client'
import { useState } from 'react'
import Link from 'next/link'

interface Suggestion {
  food: string
  reason: string
}

interface RecommendationResult {
  suggestions: Suggestion[]
  summary: string
}

export default function RecommendationsPage() {
  const [result, setResult] = useState<RecommendationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function fetchRecommendations() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/recommendations')
      const { data, error: err } = await res.json()
      if (err) {
        setError(err)
      } else {
        setResult(data)
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">AI Food Suggestions</h1>
      <p className="text-sm text-gray-500 mb-6">
        Based on your remaining macros, favourite foods, and eating history.
      </p>

      <button
        onClick={fetchRecommendations}
        disabled={loading}
        className="w-full bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 disabled:opacity-50 mb-6"
      >
        {loading ? '🤖 Asking Claude...' : '🤖 Get Recommendations'}
      </button>

      {error !== null && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600 mb-4">
          {error}
        </div>
      )}

      {result && (
        <div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
            <p className="text-sm text-green-800">{result.summary}</p>
          </div>
          <div className="space-y-3">
            {result.suggestions.map((s) => (
              <div key={s.food} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-800 mb-1">🍽 {s.food}</p>
                    <p className="text-sm text-gray-500">{s.reason}</p>
                  </div>
                  <Link
                    href={`/search?q=${encodeURIComponent(s.food)}`}
                    className="shrink-0 text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-200 font-medium"
                  >
                    Log it
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
