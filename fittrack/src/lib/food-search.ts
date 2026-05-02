import { FoodSearchResult } from '@/types'

async function searchUSDA(query: string): Promise<FoodSearchResult[]> {
  const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&api_key=${process.env.USDA_API_KEY}&pageSize=5`
  const res = await fetch(url)
  if (!res.ok) return []
  const data = await res.json()

  return (data.foods ?? []).map((food: Record<string, unknown>) => {
    const nutrients = (food.foodNutrients as Array<{ nutrientNumber: string; value: number }>) ?? []
    const get = (num: string) => nutrients.find(n => n.nutrientNumber === num)?.value ?? 0
    return {
      name: food.description as string,
      calories: get('208'),
      protein_g: get('203'),
      carbs_g: get('205'),
      fat_g: get('204'),
      fiber_g: get('291') || null,
      serving_size: (food.servingSize as number) ?? 100,
      serving_unit: (food.servingSizeUnit as string) ?? 'g',
      source: 'usda' as const,
      external_id: String(food.fdcId),
    }
  })
}

async function searchOpenFoodFacts(query: string): Promise<FoodSearchResult[]> {
  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&json=1&page_size=5&fields=product_name,nutriments,id`
  const res = await fetch(url)
  if (!res.ok) return []
  const data = await res.json()

  return (data.products ?? [])
    .filter((p: Record<string, unknown>) => p.product_name && p.nutriments)
    .map((p: Record<string, unknown>) => {
      const n = p.nutriments as Record<string, number>
      return {
        name: p.product_name as string,
        calories: n['energy-kcal_100g'] ?? 0,
        protein_g: n['proteins_100g'] ?? 0,
        carbs_g: n['carbohydrates_100g'] ?? 0,
        fat_g: n['fat_100g'] ?? 0,
        fiber_g: n['fiber_100g'] ?? null,
        serving_size: 100,
        serving_unit: 'g',
        source: 'open_food_facts' as const,
        external_id: String(p.id ?? p.code ?? ''),
      }
    })
}

export function mergeResults(usda: FoodSearchResult[], off: FoodSearchResult[]): FoodSearchResult[] {
  const seen = new Set<string>()
  return [...usda, ...off].filter(item => {
    const key = item.name.toLowerCase().trim()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export async function searchFoods(query: string): Promise<FoodSearchResult[]> {
  const [usdaResult, offResult] = await Promise.allSettled([
    searchUSDA(query),
    searchOpenFoodFacts(query),
  ])
  const usda = usdaResult.status === 'fulfilled' ? usdaResult.value : []
  const off = offResult.status === 'fulfilled' ? offResult.value : []
  return mergeResults(usda, off)
}
