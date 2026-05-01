import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { calculateAllTargets } from '@/lib/calculations'

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  weight_kg: z.number().positive(),
  height_cm: z.number().positive(),
  age: z.number().int().min(10).max(120),
  gender: z.enum(['male', 'female']),
  activity_level: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
  goal_type: z.enum(['cut', 'maintain', 'bulk']),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const { name, email, password, ...profile } = parsed.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
  }

  const password_hash = await bcrypt.hash(password, 10)
  const targets = calculateAllTargets(profile)

  const user = await prisma.user.create({
    data: { name, email, password_hash, ...profile, ...targets },
  })

  return NextResponse.json({ data: { id: user.id } }, { status: 201 })
}
