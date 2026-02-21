import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generatePasswordResetToken } from "@/lib/tokens"
import { authRateLimiter, checkRateLimit } from "@/lib/redis"
import { z } from "zod"
import { sendPasswordResetEmail } from "@/lib/email"

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
})

export async function POST(request: NextRequest) {
  try {
    if (process.env.NODE_ENV === "production") {
      const origin = request.headers.get("origin")
      const allowed = process.env.NEXT_PUBLIC_SITE_URL
      if (!origin || !allowed || origin !== allowed) {
        return NextResponse.json({ error: "Invalid origin" }, { status: 403 })
      }
    }
    const body = await request.json()

    // Validate input
    const validatedData = forgotPasswordSchema.parse(body)

    // Get client IP for rate limiting
    const forwarded = request.headers.get("x-forwarded-for")
    const ip = forwarded ? forwarded.split(",")[0] : request.headers.get("x-real-ip") || "unknown"

    // Rate limiting
    const rateLimitResult = await checkRateLimit(authRateLimiter, `forgot-password:${ip}`)

    if (rateLimitResult && !rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": String(rateLimitResult.limit),
            "X-RateLimit-Remaining": String(rateLimitResult.remaining),
            "X-RateLimit-Reset": String(rateLimitResult.reset),
          },
        }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
      select: {
        email: true,
        password: true, // Check if user has a password (not OAuth only)
      },
    })

    // Always return success to prevent email enumeration
    if (!user || !user.password) {
      return NextResponse.json(
        { message: "If an account exists, a password reset link will be sent to your email." },
        { status: 200 }
      )
    }

    // Generate reset token and send email (fire-and-forget)
    const resetToken = await generatePasswordResetToken(validatedData.email)
    Promise.resolve(sendPasswordResetEmail(validatedData.email, resetToken)).catch(() => {})

    return NextResponse.json(
      { 
        message: "If an account exists, a password reset link will be sent to your email.",
        devResetUrl: process.env.NODE_ENV === "production" ? undefined : `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password?token=${resetToken}`
      },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Forgot password error:", error)
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    )
  }
}
