'use client'
import { useState, useEffect } from 'react'

interface ProfileData {
  name: string
  email: string
  age: number
  gender: string
  height_cm: number
  weight_kg: number
  goal_type: string
  activity_level: string
  calorie_target: number
  protein_target_g: number
  carbs_target_g: number
  fat_target_g: number
}

const GOAL_LABELS: Record<string, string> = {
  cut: 'Cut (lose fat)',
  maintain: 'Maintain',
  bulk: 'Bulk (gain muscle)',
}

const ACTIVITY_LABELS: Record<string, string> = {
  sedentary: 'Sedentary (little or no exercise)',
  light: 'Lightly Active (1–3 days/week)',
  moderate: 'Moderately Active (3–5 days/week)',
  active: 'Very Active (6–7 days/week)',
  very_active: 'Extremely Active (physical job or 2x/day)',
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  // Form fields
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [heightCm, setHeightCm] = useState('')
  const [weightKg, setWeightKg] = useState('')
  const [goalType, setGoalType] = useState('')
  const [activityLevel, setActivityLevel] = useState('')

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/profile')
        if (!res.ok) throw new Error('Failed to load profile')
        const json = await res.json()
        const data: ProfileData = json.data
        setProfile(data)
        setName(data.name)
        setAge(String(data.age))
        setHeightCm(String(data.height_cm))
        setWeightKg(String(data.weight_kg))
        setGoalType(data.goal_type)
        setActivityLevel(data.activity_level)
      } catch {
        setError('Could not load profile. Please refresh.')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSuccess('')
    setError('')

    const ageNum = parseInt(age, 10)
    const heightNum = parseFloat(heightCm)
    const weightNum = parseFloat(weightKg)

    if (isNaN(ageNum) || ageNum < 13 || ageNum > 120) {
      setError('Age must be between 13 and 120.')
      return
    }
    if (isNaN(heightNum) || heightNum < 100 || heightNum > 250) {
      setError('Height must be between 100 and 250 cm.')
      return
    }
    if (isNaN(weightNum) || weightNum < 30 || weightNum > 300) {
      setError('Weight must be between 30 and 300 kg.')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          age: ageNum,
          height_cm: heightNum,
          weight_kg: weightNum,
          goal_type: goalType,
          activity_level: activityLevel,
        }),
      })

      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? 'Failed to save profile.')
        return
      }

      setProfile(json.data)
      setSuccess('Profile saved successfully!')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="text-gray-400 text-sm">Loading profile...</div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile</h1>

      <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm p-6 space-y-5 mb-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={100}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Email (read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={profile?.email ?? ''}
            readOnly
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
          />
        </div>

        {/* Age */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
          <input
            type="number"
            value={age}
            onChange={e => setAge(e.target.value)}
            min={13}
            max={120}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Height */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
          <input
            type="number"
            value={heightCm}
            onChange={e => setHeightCm(e.target.value)}
            min={100}
            max={250}
            step="0.1"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Weight */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
          <input
            type="number"
            value={weightKg}
            onChange={e => setWeightKg(e.target.value)}
            min={30}
            max={300}
            step="0.1"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Goal */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Goal</label>
          <select
            value={goalType}
            onChange={e => setGoalType(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="cut">Cut (lose fat)</option>
            <option value="maintain">Maintain</option>
            <option value="bulk">Bulk (gain muscle)</option>
          </select>
        </div>

        {/* Activity Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Activity Level</label>
          <select
            value={activityLevel}
            onChange={e => setActivityLevel(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="sedentary">Sedentary (little or no exercise)</option>
            <option value="light">Lightly Active (1–3 days/week)</option>
            <option value="moderate">Moderately Active (3–5 days/week)</option>
            <option value="active">Very Active (6–7 days/week)</option>
            <option value="very_active">Extremely Active (physical job or 2x/day)</option>
          </select>
        </div>

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}
        {success && (
          <p className="text-green-600 text-sm">{success}</p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-green-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>

      {/* Calculated Targets */}
      {profile && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Your Daily Targets</h2>
          <p className="text-xs text-gray-500 mb-4">
            Recalculated based on your stats. Goal: <span className="font-medium">{GOAL_LABELS[profile.goal_type] ?? profile.goal_type}</span> &middot; Activity: <span className="font-medium">{ACTIVITY_LABELS[profile.activity_level] ?? profile.activity_level}</span>
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-green-700">{profile.calorie_target}</p>
              <p className="text-xs text-green-600 mt-1">kcal / day</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-blue-700">{profile.protein_target_g}g</p>
              <p className="text-xs text-blue-600 mt-1">Protein</p>
            </div>
            <div className="bg-yellow-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-yellow-700">{profile.carbs_target_g}g</p>
              <p className="text-xs text-yellow-600 mt-1">Carbs</p>
            </div>
            <div className="bg-red-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-red-700">{profile.fat_target_g}g</p>
              <p className="text-xs text-red-600 mt-1">Fat</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
