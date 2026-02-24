import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "465"),
  secure: (process.env.SMTP_PORT || "465") === "465",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_APP_PASSWORD,
  },
})

async function sendEmail(to: string, subject: string, html: string, text?: string): Promise<boolean> {
  if (!process.env.SMTP_USER || !process.env.SMTP_APP_PASSWORD) return false
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER!
  try {
    await transporter.sendMail({ from, to, subject, html, text: text || html.replace(/<[^>]*>/g, "") })
    return true
  } catch {
    return false
  }
}

export async function sendVerificationEmail(email: string, token: string): Promise<boolean> {
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/verify-email?token=${token}`
  const html = `<!DOCTYPE html><html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head><body style="font-family:Arial,sans-serif;line-height:1.6;color:#333"><div style="max-width:600px;margin:0 auto;padding:20px"><h1 style="background:#111;color:#fff;padding:24px;border-radius:8px 8px 0 0;margin:0">Verify Your Email</h1><div style="background:#f9f9f9;padding:24px;border-radius:0 0 8px 8px"><p>Thanks for signing up for ScreenSplit.</p><p><a href="${url}" style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none">Verify Email Address</a></p><p>Or copy this link:</p><p style="word-break:break-all">${url}</p><p>This link expires in 24 hours.</p></div></div></body></html>`
  return sendEmail(email, "Verify your email - ScreenSplit", html)
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password?token=${token}`
  const html = `<!DOCTYPE html><html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head><body style="font-family:Arial,sans-serif;line-height:1.6;color:#333"><div style="max-width:600px;margin:0 auto;padding:20px"><h1 style="background:#111;color:#fff;padding:24px;border-radius:8px 8px 0 0;margin:0">Reset Your Password</h1><div style="background:#f9f9f9;padding:24px;border-radius:0 0 8px 8px"><p>Click the button to reset your password.</p><p><a href="${url}" style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none">Reset Password</a></p><p>Or copy this link:</p><p style="word-break:break-all">${url}</p><p>This link expires in 1 hour.</p></div></div></body></html>`
  return sendEmail(email, "Reset your password - ScreenSplit", html)
}

export async function sendWelcomeEmail(email: string, name: string): Promise<boolean> {
  const html = `<!DOCTYPE html><html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head><body style="font-family:Arial,sans-serif;line-height:1.6;color:#333"><div style="max-width:600px;margin:0 auto;padding:20px"><h1 style="background:#111;color:#fff;padding:24px;border-radius:8px 8px 0 0;margin:0">Welcome to ScreenSplit</h1><div style="background:#f9f9f9;padding:24px;border-radius:0 0 8px 8px"><p>Hi ${name || "there"}, your account is now verified.</p><p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/apps/dashboard" style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none">Open App</a></p></div></div></body></html>`
  return sendEmail(email, "Welcome to ScreenSplit!", html)
}
