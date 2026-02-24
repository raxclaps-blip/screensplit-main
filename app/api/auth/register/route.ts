import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcrypt"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { authRateLimiter, checkRateLimit } from "@/lib/redis"
import { generateEmailVerificationToken } from "@/lib/tokens"
import { sendVerificationEmail } from "@/lib/email"

const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long")
    .max(128, "Password is too long"),
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
    
    // Get client IP for rate limiting
    const forwarded = request.headers.get("x-forwarded-for")
    const ip = forwarded ? forwarded.split(",")[0] : request.headers.get("x-real-ip") || "unknown"
    
    // Rate limiting with Redis
    const rateLimitResult = await checkRateLimit(authRateLimiter, `register:${ip}`)
    
    if (rateLimitResult && !rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(rateLimitResult.limit),
            'X-RateLimit-Remaining': String(rateLimitResult.remaining),
            'X-RateLimit-Reset': String(rateLimitResult.reset),
          }
        }
      )
    }
    
    // Check if all required fields are present
    if (!body.name || !body.email || !body.password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }
    
    // Validate input
    const validatedData = registerSchema.parse(body)
    const { name, email, password } = validatedData

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Unable to register" },
        { status: 400 }
      )
    }

    // Hash password
    const saltRounds = Number.parseInt(process.env.BCRYPT_COST || "12")
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create user plus Better Auth credential account (email not verified yet)
    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          name: validatedData.name,
          email: validatedData.email,
          password: hashedPassword,
          emailVerified: false,
        },
        select: {
          id: true,
          email: true,
          name: true,
        },
      })

      await tx.account.create({
        data: {
          userId: createdUser.id,
          type: "credentials",
          provider: "credential",
          providerAccountId: createdUser.id,
          password: hashedPassword,
        },
      })

      return createdUser
    })

    let verificationToken: string | null = null
    try {
      verificationToken = await generateEmailVerificationToken(validatedData.email)
      if (verificationToken) {
        if (process.env.NODE_ENV === "production") {
          await sendVerificationEmail(validatedData.email, verificationToken)
        } else {
          void sendVerificationEmail(validatedData.email, verificationToken)
        }
      }
    } catch (emailError) {
      console.error("Error generating/sending verification token:", emailError)
    }

    // Track registration analytics (fire-and-forget)
    prisma.analytics.create({
      data: {
        event: "USER_REGISTERED",
        userId: user.id,
        metadata: {
          method: "credentials"
        }
      }
    }).catch(() => {
      // Silently fail analytics to not break registration flow
    })

    const isProd = process.env.NODE_ENV === "production"
    return NextResponse.json({
      message: "User created successfully",
      user,
      ...(isProd || !verificationToken
        ? {}
        : { devVerificationUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/verify-email?token=${verificationToken}` }),
    }, { status: 201 })

  } catch (error: any) {
    console.error("Registration error:", error)
    
    if (error instanceof z.ZodError) {
      // Return the first validation error in a user-friendly format
      const firstError = error.errors[0]
      return NextResponse.json(
        { error: firstError.message },
        { status: 400 }
      )
    }

    // Handle Prisma specific errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      )
    }

    // Handle other database connection errors
    if (error.code?.startsWith('P')) {
      return NextResponse.json(
        { error: "Database connection error. Please try again." },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
