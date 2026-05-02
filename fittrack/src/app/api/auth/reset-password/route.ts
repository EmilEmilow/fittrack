import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(6).max(72),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const { token, password } = parsed.data

  const record = await prisma.passwordResetToken.findUnique({ where: { token } })

  if (!record || record.expires < new Date()) {
    return NextResponse.json({ error: 'Reset link is invalid or has expired' }, { status: 400 })
  }

  const password_hash = await bcrypt.hash(password, 10)

  await prisma.user.update({
    where: { id: record.user_id },
    data: { password_hash },
  })

  await prisma.passwordResetToken.delete({ where: { token } })

  return NextResponse.json({ data: { success: true } })
}
