import { NextRequest, NextResponse } from "next/server"
import { uploadToR2 } from "@/lib/r2"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { nanoid } from "nanoid"
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

    const contentType = req.headers.get("content-type") || ""
    let buffer: Buffer
    let title: string | undefined
    let layout: string | undefined
    let beforeLabel: string | undefined
    let afterLabel: string | undefined
    let beforeSubtext: string | undefined
    let afterSubtext: string | undefined
    let fontSize: number | undefined
    let textColor: string | undefined
    let bgColor: string | undefined
    let textBgColor: string | undefined
    let textPosition: string | undefined
    let exportFormat: string | undefined
    let isPrivate = false
    let password: string | undefined

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData()
      const image = formData.get("image")
      if (!(image instanceof File)) {
        return NextResponse.json({ error: "Image file is required" }, { status: 400 })
      }
      if (image.size <= 0) {
        return NextResponse.json({ error: "Image file is empty" }, { status: 400 })
      }

      const getString = (key: string): string | undefined => {
        const value = formData.get(key)
        return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined
      }

      buffer = Buffer.from(await image.arrayBuffer())
      title = getString("title")
      layout = getString("layout")
      beforeLabel = getString("beforeLabel")
      afterLabel = getString("afterLabel")
      beforeSubtext = getString("beforeSubtext")
      afterSubtext = getString("afterSubtext")
      textColor = getString("textColor")
      bgColor = getString("bgColor")
      textBgColor = getString("textBgColor")
      textPosition = getString("textPosition")
      exportFormat = getString("exportFormat")
      password = getString("password")
      isPrivate = (getString("isPrivate") || "").toLowerCase() === "true"
      const parsedFontSize = Number.parseInt(getString("fontSize") || "", 10)
      fontSize = Number.isFinite(parsedFontSize) ? parsedFontSize : undefined

      if (!exportFormat) {
        const ext = image.name.split(".").pop()?.toLowerCase()
        exportFormat = ext || "png"
      }
    } else {
      // Existing JSON payload path (backward compatible)
      const body = await req.json()
      const imageDataUrl = body?.imageDataUrl as string | undefined
      title = body?.title
      layout = body?.layout
      beforeLabel = body?.beforeLabel
      afterLabel = body?.afterLabel
      beforeSubtext = body?.beforeSubtext
      afterSubtext = body?.afterSubtext
      fontSize = body?.fontSize
      textColor = body?.textColor
      bgColor = body?.bgColor
      textBgColor = body?.textBgColor
      textPosition = body?.textPosition
      exportFormat = body?.exportFormat
      isPrivate = Boolean(body?.isPrivate)
      password = body?.password

      if (!imageDataUrl) {
        return NextResponse.json(
          { error: "Image data is required" },
          { status: 400 }
        )
      }

      const base64Data = imageDataUrl.replace(/^data:image\/\w+;base64,/, "")
      buffer = Buffer.from(base64Data, "base64")
    }

    // Generate unique filename and upload to cloud storage
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const rawExtension = (exportFormat || "png").toLowerCase()
    const extension =
      rawExtension === "jpg" || rawExtension === "jpeg"
        ? "jpg"
        : rawExtension === "webp"
        ? "webp"
        : rawExtension === "avif"
        ? "avif"
        : rawExtension === "bmp"
        ? "bmp"
        : "png"
    const fileName = `screensplit-${timestamp}-${randomString}.${extension}`
    
    const uploadContentType = `image/${extension === "jpg" ? "jpeg" : extension}`
    const imageUrl = await uploadToR2(buffer, fileName, uploadContentType)

    // Generate unique share slug
    const shareSlug = nanoid(10)

    // Hash password if provided
    let hashedPassword = null
    if (password) {
      const saltRounds = Number.parseInt(process.env.BCRYPT_COST || "12")
      const { default: bcrypt } = await import("bcrypt")
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
        isPublic: !isPrivate,
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
