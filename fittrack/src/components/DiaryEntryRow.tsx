'use client'
import { useState } from 'react'
import { DiaryEntry } from '@/types'

interface DiaryEntryRowProps {
  entry: DiaryEntry
  onDelete: (id: string) => void
}

export function DiaryEntryRow({ entry, onDelete }: DiaryEntryRowProps) {
  const [error, setError] = useState('')

  async function handleDelete() {
    setError('')
    try {
      const res = await fetch(`/api/diary/${entry.id}`, { method: 'DELETE' })
      if (!res.ok) {
        setError('Failed to remove. Try again.')
        return
      }
      onDelete(entry.id)
    } catch {
      setError('Failed to remove. Try again.')
    }
  }

  return (
    <div className="py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-800">{entry.food_item.name}</p>
          <p className="text-xs text-gray-500">
            {entry.quantity} × {entry.food_item.serving_size}{entry.food_item.serving_unit} ·{' '}
            {Math.round(entry.calories)} kcal · P: {Math.round(entry.protein_g)}g · C: {Math.round(entry.carbs_g)}g · F: {Math.round(entry.fat_g)}g
          </p>
        </div>
        <button onClick={handleDelete} className="text-gray-400 hover:text-red-500 text-lg ml-4" title="Remove">
          ×
        </button>
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}
