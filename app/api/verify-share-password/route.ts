import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"
import { passwordRateLimiter, checkRateLimit } from "@/lib/redis"

export async function POST(req: NextRequest) {
  try {
    if (process.env.NODE_ENV === "production") {
      const origin = req.headers.get("origin")
      const allowed = process.env.NEXT_PUBLIC_SITE_URL
      if (!origin || !allowed || origin !== allowed) {
        return NextResponse.json({ error: "Invalid origin" }, { status: 403 })
      }
    }
    const body = await req.json()
    const { slug, password } = body

    if (!slug || !password) {
      return NextResponse.json(
        { error: "Slug and password required" },
        { status: 400 }
      )
    }

    // Get client IP
    const forwarded = req.headers.get("x-forwarded-for")
    const ip = forwarded ? forwarded.split(",")[0] : req.headers.get("x-real-ip") || "unknown"
    
    // Rate limiting to prevent brute force
    const rateLimitResult = await checkRateLimit(passwordRateLimiter, `share:${slug}:${ip}`)
    
    if (rateLimitResult && !rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many password attempts. Please try again later." },
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

    // Find project
    const project = await prisma.project.findUnique({
      where: { shareSlug: slug },
      select: {
        isPrivate: true,
        password: true,
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: "Share not found" },
        { status: 404 }
      )
    }

    if (!project.isPrivate || !project.password) {
      return NextResponse.json(
        { error: "This share is not password protected" },
        { status: 400 }
      )
    }

    // Verify password
    const isValid = await bcrypt.compare(password, project.password)

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      )
    }

    // Create response with cookie
    const response = NextResponse.json({ success: true })

    // Set auth cookie (expires in 24 hours)
    response.cookies.set(`share_auth_${slug}`, "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
    })

    return response
  } catch (error) {
    console.error("Error verifying password:", error)
    return NextResponse.json(
      { error: "Failed to verify password" },
      { status: 500 }
    )
  }
}
