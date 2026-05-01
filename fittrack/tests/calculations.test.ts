import { describe, it, expect } from 'vitest'
import {
  calculateBMR,
  calculateTDEE,
  calculateCalorieTarget,
  calculateMacros,
  calculateAllTargets,
} from '@/lib/calculations'

describe('calculateBMR', () => {
  it('calculates BMR for a male', () => {
    // (10 × 80) + (6.25 × 180) - (5 × 25) + 5 = 800 + 1125 - 125 + 5 = 1805
    expect(calculateBMR({ weight_kg: 80, height_cm: 180, age: 25, gender: 'male' })).toBe(1805)
  })

  it('calculates BMR for a female', () => {
    // (10 × 60) + (6.25 × 165) - (5 × 30) - 161 = 600 + 1031.25 - 150 - 161 = 1320.25
    expect(calculateBMR({ weight_kg: 60, height_cm: 165, age: 30, gender: 'female' })).toBeCloseTo(1320.25)
  })
})

describe('calculateTDEE', () => {
  it('applies sedentary multiplier (×1.2)', () => {
    expect(calculateTDEE(1805, 'sedentary')).toBeCloseTo(1805 * 1.2)
  })
  it('applies moderate multiplier (×1.55)', () => {
    expect(calculateTDEE(1805, 'moderate')).toBeCloseTo(1805 * 1.55)
  })
  it('applies very_active multiplier (×1.9)', () => {
    expect(calculateTDEE(1805, 'very_active')).toBeCloseTo(1805 * 1.9)
  })
})

describe('calculateCalorieTarget', () => {
  it('subtracts 400 for cut', () => {
    expect(calculateCalorieTarget(2500, 'cut')).toBe(2100)
  })
  it('keeps same for maintain', () => {
    expect(calculateCalorieTarget(2500, 'maintain')).toBe(2500)
  })
  it('adds 400 for bulk', () => {
    expect(calculateCalorieTarget(2500, 'bulk')).toBe(2900)
  })
})

describe('calculateMacros', () => {
  it('calculates protein as 2g per kg bodyweight', () => {
    const result = calculateMacros({ weight_kg: 80, calorie_target: 2500 })
    expect(result.protein_g).toBe(160) // 2 × 80
  })

  it('calculates fat as 1g per kg bodyweight', () => {
    const result = calculateMacros({ weight_kg: 80, calorie_target: 2500 })
    expect(result.fat_g).toBe(80) // 1 × 80
  })

  it('fills remaining calories with carbs', () => {
    // protein: 160 × 4 = 640 kcal, fat: 80 × 9 = 720 kcal
    // remaining: 2500 - 640 - 720 = 1140 kcal → 1140 / 4 = 285g carbs
    const result = calculateMacros({ weight_kg: 80, calorie_target: 2500 })
    expect(result.carbs_g).toBe(285)
  })

  it('clamps carbs to zero when calories are insufficient', () => {
    const result = calculateMacros({ weight_kg: 80, calorie_target: 1000 })
    expect(result.carbs_g).toBeGreaterThanOrEqual(0)
  })
})

describe('calculateAllTargets', () => {
  it('returns all four targets for a male cutting', () => {
    const result = calculateAllTargets({
      weight_kg: 80,
      height_cm: 180,
      age: 25,
      gender: 'male',
      activity_level: 'moderate',
      goal_type: 'cut',
    })
    expect(result.calorie_target).toBeTypeOf('number')
    expect(result.protein_target_g).toBeTypeOf('number')
    expect(result.carbs_target_g).toBeTypeOf('number')
    expect(result.fat_target_g).toBeTypeOf('number')
    expect(result.calorie_target).toBeLessThan(Math.round(1805 * 1.55)) // less than TDEE
  })
})
