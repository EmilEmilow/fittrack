import { Gender, ActivityLevel, GoalType } from '@/types'

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
}

const GOAL_ADJUSTMENTS: Record<GoalType, number> = {
  cut: -400,
  maintain: 0,
  bulk: 400,
}

export function calculateBMR({ weight_kg, height_cm, age, gender }: {
  weight_kg: number
  height_cm: number
  age: number
  gender: Gender
}): number {
  const base = 10 * weight_kg + 6.25 * height_cm - 5 * age
  return gender === 'male' ? base + 5 : base - 161
}

export function calculateTDEE(bmr: number, activity_level: ActivityLevel): number {
  return bmr * ACTIVITY_MULTIPLIERS[activity_level]
}

export function calculateCalorieTarget(tdee: number, goal_type: GoalType): number {
  return Math.round(tdee + GOAL_ADJUSTMENTS[goal_type])
}

export function calculateMacros({ weight_kg, calorie_target }: {
  weight_kg: number
  calorie_target: number
}): { protein_g: number; fat_g: number; carbs_g: number } {
  const protein_g = Math.round(2 * weight_kg)
  const fat_g = Math.round(weight_kg)
  const carbs_g = Math.round((calorie_target - protein_g * 4 - fat_g * 9) / 4)
  return { protein_g, fat_g, carbs_g }
}

export function calculateAllTargets(user: {
  weight_kg: number
  height_cm: number
  age: number
  gender: Gender
  activity_level: ActivityLevel
  goal_type: GoalType
}) {
  const bmr = calculateBMR(user)
  const tdee = calculateTDEE(bmr, user.activity_level)
  const calorie_target = calculateCalorieTarget(tdee, user.goal_type)
  const { protein_g, fat_g, carbs_g } = calculateMacros({ weight_kg: user.weight_kg, calorie_target })
  return {
    calorie_target,
    protein_target_g: protein_g,
    fat_target_g: fat_g,
    carbs_target_g: carbs_g,
  }
}
