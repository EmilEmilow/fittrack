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

  try {
    // Delete any existing tokens for this user
    await prisma.passwordResetToken.deleteMany({ where: { user_id: user.id } })

    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await prisma.passwordResetToken.create({
      data: { user_id: user.id, token, expires },
    })

    const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
    const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`

    try {
      await sendPasswordResetEmail(email, resetUrl)
    } catch (emailErr) {
      // Email sending failed — log reset URL so dev can still test
      console.error('Email send failed:', emailErr)
      console.log(`\n[DEV] Password reset URL for ${email}:\n${resetUrl}\n`)
    }
  } catch (err) {
    console.error('Forgot-password error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }

  return NextResponse.json({ data: { sent: true } })
}
