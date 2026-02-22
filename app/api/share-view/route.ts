import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiRateLimiter, checkRateLimit } from "@/lib/redis"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { slug } = body

    if (!slug) {
      return NextResponse.json(
        { error: "Slug required" },
        { status: 400 }
      )
    }

    // Get client IP
    const forwarded = req.headers.get("x-forwarded-for")
    const ip = forwarded ? forwarded.split(",")[0] : req.headers.get("x-real-ip") || "unknown"
    
    // Rate limiting to prevent view count manipulation
    const rateLimitResult = await checkRateLimit(apiRateLimiter, `view:${slug}:${ip}`)
    
    if (rateLimitResult && !rateLimitResult.success) {
      // Don't increment if rate limited, but still return success to avoid exposing limit
      return NextResponse.json({ success: true })
    }

    // Increment view count with retry logic
    try {
      await prisma.project.update({
        where: { shareSlug: slug },
        data: {
          viewCount: {
            increment: 1,
          },
        },
      })
    } catch (dbError: any) {
      // Log the error but don't fail the request
      console.error("Database error incrementing view count:", dbError?.code, dbError?.message)
      
      // If connection error, try to reconnect on next request
      if (dbError?.code === 'P1017' || dbError?.code === 'P1001') {
        await prisma.$disconnect()
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error incrementing view count:", error)
    // Still return success to not block the user experience
    return NextResponse.json({ success: true })
  }
}
