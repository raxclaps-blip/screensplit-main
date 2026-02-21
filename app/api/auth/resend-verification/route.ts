import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateEmailVerificationToken } from "@/lib/tokens"
import { authRateLimiter, checkRateLimit } from "@/lib/redis"
import { sendVerificationEmail } from "@/lib/email"

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
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    // Get client IP for rate limiting
    const forwarded = request.headers.get("x-forwarded-for")
    const ip = forwarded ? forwarded.split(",")[0] : request.headers.get("x-real-ip") || "unknown"

    // Rate limiting
    const rateLimitResult = await checkRateLimit(authRateLimiter, `resend-verification:${ip}`)

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
      where: { email },
      select: {
        email: true,
        emailVerified: true,
      },
    })

    if (!user || user.emailVerified) {
      return NextResponse.json(
        { message: "If an account exists, a verification email will be sent." },
        { status: 200 }
      )
    }

    // Generate new token and send email (fire-and-forget)
    const verificationToken = await generateEmailVerificationToken(email)
    Promise.resolve(sendVerificationEmail(email, verificationToken)).catch(() => {})

    return NextResponse.json(
      { 
        message: "If an account exists, a verification email will be sent.",
        devVerificationUrl: process.env.NODE_ENV === "production" ? undefined : `${process.env.NEXT_PUBLIC_SITE_URL}/auth/verify-email?token=${verificationToken}`
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Resend verification error:", error)
    return NextResponse.json(
      { error: "Failed to resend verification email" },
      { status: 500 }
    )
  }
}
