import { describe, it, expect } from 'vitest'
import { mergeResults } from '@/lib/food-search'
import { FoodSearchResult } from '@/types'

const makeFood = (name: string, source: 'usda' | 'open_food_facts'): FoodSearchResult => ({
  name, calories: 100, protein_g: 5, carbs_g: 15, fat_g: 2, fiber_g: null,
  serving_size: 100, serving_unit: 'g', source, external_id: name,
})

describe('mergeResults', () => {
  it('returns empty array when both inputs are empty', () => {
    expect(mergeResults([], [])).toHaveLength(0)
  })

  it('combines results from both sources', () => {
    const result = mergeResults([makeFood('Banana', 'usda')], [makeFood('Apple', 'open_food_facts')])
    expect(result).toHaveLength(2)
  })

  it('deduplicates foods with identical names, keeping the first (USDA priority)', () => {
    const result = mergeResults([makeFood('Banana', 'usda')], [makeFood('Banana', 'open_food_facts')])
    expect(result).toHaveLength(1)
    expect(result[0].source).toBe('usda')
  })

  it('deduplicates case-insensitively', () => {
    const off: FoodSearchResult = { ...makeFood('banana', 'open_food_facts') }
    const result = mergeResults([makeFood('Banana', 'usda')], [off])
    expect(result).toHaveLength(1)
  })

  it('returns all results when no duplicates', () => {
    const usda = [makeFood('Chicken', 'usda'), makeFood('Rice', 'usda')]
    const off = [makeFood('Pasta', 'open_food_facts')]
    expect(mergeResults(usda, off)).toHaveLength(3)
  })
})
