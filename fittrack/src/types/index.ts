export type Gender = 'male' | 'female'
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
export type GoalType = 'cut' | 'maintain' | 'bulk'
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'
export type FoodSource = 'usda' | 'open_food_facts' | 'custom'

export interface FoodSearchResult {
  name: string
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  fiber_g: number | null
  serving_size: number
  serving_unit: string
  source: FoodSource
  external_id: string
}

export interface ApiResponse<T> {
  data?: T
  error?: string
}

export interface DiaryEntry {
  id: string
  meal_type: MealType
  quantity: number
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  food_item: { name: string; serving_unit: string; serving_size: number }
}
