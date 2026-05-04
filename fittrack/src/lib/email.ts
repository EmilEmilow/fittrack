import nodemailer from 'nodemailer'

const html = (resetUrl: string) => `
  <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
    <h2 style="color:#16a34a">Reset your FitTrack password</h2>
    <p>We received a request to reset the password for your account.</p>
    <p>Click the button below to choose a new password. This link expires in <strong>1 hour</strong>.</p>
    <a href="${resetUrl}"
      style="display:inline-block;background:#16a34a;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">
      Reset Password
    </a>
    <p style="color:#6b7280;font-size:14px">If you didn't request this, you can safely ignore this email.</p>
    <p style="color:#6b7280;font-size:12px">Or copy this link: ${resetUrl}</p>
  </div>
`

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const from = process.env.SMTP_FROM ?? 'FitTrack <noreply@fittrack.app>'

  if (process.env.SMTP_HOST) {
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
    await transport.sendMail({ from, to, subject: 'Reset your FitTrack password', html: html(resetUrl) })
    return
  }

  // Dev fallback: use Ethereal test account so you can preview the email in a browser
  const testAccount = await nodemailer.createTestAccount()
  const transport = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass },
  })
  const info = await transport.sendMail({ from, to, subject: 'Reset your FitTrack password', html: html(resetUrl) })
  console.log('\n--- PASSWORD RESET EMAIL (dev / Ethereal) ---')
  console.log(`To: ${to}`)
  console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`)
  console.log(`Direct reset URL: ${resetUrl}`)
  console.log('---\n')
}
