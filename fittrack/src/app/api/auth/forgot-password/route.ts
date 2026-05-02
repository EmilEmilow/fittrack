import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/email'

const schema = z.object({ email: z.string().email() })

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }

  const { email } = parsed.data
  const user = await prisma.user.findUnique({ where: { email } })

  // Always return success — don't reveal whether the email exists
  if (!user) {
    return NextResponse.json({ data: { sent: true } })
  }

  // Delete any existing tokens for this user
  await prisma.passwordResetToken.deleteMany({ where: { user_id: user.id } })

  const token = crypto.randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

  await prisma.passwordResetToken.create({
    data: { user_id: user.id, token, expires },
  })

  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
  const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`

  await sendPasswordResetEmail(email, resetUrl)

  return NextResponse.json({ data: { sent: true } })
}
