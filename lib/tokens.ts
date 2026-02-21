import { prisma } from "@/lib/prisma"
import { nanoid } from "nanoid"
import crypto from "crypto"

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex")
}

/**
 * Generate and store email verification token
 */
export async function generateEmailVerificationToken(email: string): Promise<string> {
  const token = nanoid(64)
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

  // Delete any existing tokens for this email
  await prisma.emailVerificationToken.deleteMany({
    where: { email },
  })

  // Create new token
  await prisma.emailVerificationToken.create({
    data: {
      email,
      token: hashToken(token),
      expires,
    },
  })

  return token
}

/**
 * Verify email verification token
 */
export async function verifyEmailToken(token: string): Promise<string | null> {
  const verificationToken = await prisma.emailVerificationToken.findUnique({
    where: { token: hashToken(token) },
  })

  if (!verificationToken) {
    return null
  }

  // Check if token is expired
  if (verificationToken.expires < new Date()) {
    await prisma.emailVerificationToken.delete({
      where: { token: verificationToken.token },
    })
    return null
  }

  // Delete the token after use
  await prisma.emailVerificationToken.delete({
    where: { token: verificationToken.token },
  })

  return verificationToken.email
}

/**
 * Generate and store password reset token
 */
export async function generatePasswordResetToken(email: string): Promise<string> {
  const token = nanoid(64)
  const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

  // Delete any existing tokens for this email
  await prisma.passwordResetToken.deleteMany({
    where: { email },
  })

  // Create new token
  await prisma.passwordResetToken.create({
    data: {
      email,
      token: hashToken(token),
      expires,
    },
  })

  return token
}

/**
 * Verify password reset token
 */
export async function verifyPasswordResetToken(token: string): Promise<string | null> {
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token: hashToken(token) },
  })

  if (!resetToken) {
    return null
  }

  // Check if token is expired
  if (resetToken.expires < new Date()) {
    await prisma.passwordResetToken.delete({
      where: { token: resetToken.token },
    })
    return null
  }

  return resetToken.email
}

/**
 * Delete password reset token after use
 */
export async function deletePasswordResetToken(token: string): Promise<void> {
  await prisma.passwordResetToken.delete({
    where: { token: hashToken(token) },
  }).catch(() => {
    // Ignore if token doesn't exist
  })
}

export { hashToken }
