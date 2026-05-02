'use client'

interface DiaryEntry {
  id: string
  quantity: number
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  food_item: { name: string; serving_unit: string; serving_size: number }
}

interface DiaryEntryRowProps {
  entry: DiaryEntry
  onDelete: (id: string) => void
}

export function DiaryEntryRow({ entry, onDelete }: DiaryEntryRowProps) {
  async function handleDelete() {
    await fetch(`/api/diary/${entry.id}`, { method: 'DELETE' })
    onDelete(entry.id)
  }

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
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
  )
}
