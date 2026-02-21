import { NextRequest, NextResponse } from "next/server"
import { uploadToR2 } from "@/lib/r2"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { nanoid } from "nanoid"
import bcrypt from "bcrypt"
import { uploadRateLimiter, checkRateLimit } from "@/lib/redis"
import { revalidateTag } from "next/cache"

export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Rate limiting with Redis
    const rateLimitResult = await checkRateLimit(uploadRateLimiter, `upload:${session.user.id}`)
    
    if (rateLimitResult && !rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many uploads. Please slow down." },
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

    // Parse JSON body
    const body = await req.json()
    const {
      imageDataUrl,
      title,
      layout,
      beforeLabel,
      afterLabel,
      beforeSubtext,
      afterSubtext,
      fontSize,
      textColor,
      bgColor,
      textBgColor,
      textPosition,
      exportFormat,
      isPrivate = false,
      password,
    } = body

    if (!imageDataUrl) {
      return NextResponse.json(
        { error: "Image data is required" },
        { status: 400 }
      )
    }

    // Convert data URL to buffer
    const base64Data = imageDataUrl.replace(/^data:image\/\w+;base64,/, "")
    const buffer = Buffer.from(base64Data, "base64")

    // Generate unique filename and upload to cloud storage
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const extension = exportFormat || "png"
    const fileName = `screensplit-${timestamp}-${randomString}.${extension}`
    
    const contentType = `image/${extension === "jpg" ? "jpeg" : extension}`
    const imageUrl = await uploadToR2(buffer, fileName, contentType)

    // Generate unique share slug
    const shareSlug = nanoid(10)

    // Hash password if provided
    let hashedPassword = null
    if (password) {
      const saltRounds = Number.parseInt(process.env.BCRYPT_COST || "12")
      hashedPassword = await bcrypt.hash(password, saltRounds)
    }

    // Save to database
    const project = await prisma.project.create({
      data: {
        userId: session.user.id,
        title:
          typeof title === "string" && title.trim().length > 0
            ? title.trim().slice(0, 120)
            : `${beforeLabel || "Before"} vs ${afterLabel || "After"}`,
        shareSlug,
        finalImageUrl: imageUrl,
        beforeImage: imageUrl, // Using the same image for now
        afterImage: imageUrl,  // Using the same image for now
        layout: layout === "horizontal" ? "SIDE_BY_SIDE" : "TOP_TO_BOTTOM",
        beforeLabel: beforeLabel || "Before",
        afterLabel: afterLabel || "After",
        fontSize: fontSize || 48,
        textColor: textColor || "#ffffff",
        bgColor: bgColor || "#000000",
        exportFormat: (exportFormat === "jpg" || exportFormat === "jpeg") ? "JPEG" : "PNG",
        isPrivate: isPrivate || false,
        password: hashedPassword,
        viewCount: 0,
      },
    })

    // Invalidate caches for user images and share page (if applicable)
    if (session.user.id) {
      revalidateTag(`user-images:${session.user.id}`, { expire: 0 })
    }
    if (project.shareSlug) {
      revalidateTag(`share:${project.shareSlug}`, { expire: 0 })
    }

    return NextResponse.json({
      success: true,
      shareSlug: project.shareSlug,
      imageUrl: project.finalImageUrl,
      projectId: project.id,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    )
  }
}
