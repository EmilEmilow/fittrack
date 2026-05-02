import nodemailer from 'nodemailer'

function createTransport() {
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  }
  // Dev fallback — logs the email URL to the console instead of sending
  return null
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const transport = createTransport()
  const from = process.env.SMTP_FROM ?? 'FitTrack <noreply@fittrack.app>'

  const html = `
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

  if (!transport) {
    console.log('\n--- PASSWORD RESET EMAIL (dev mode, no SMTP configured) ---')
    console.log(`To: ${to}`)
    console.log(`Reset URL: ${resetUrl}`)
    console.log('---\n')
    return
  }

  await transport.sendMail({ from, to, subject: 'Reset your FitTrack password', html })
}
