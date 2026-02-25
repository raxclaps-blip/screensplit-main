import { NextRequest, NextResponse } from "next/server"
import { nanoid } from "nanoid"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createPresignedR2Upload } from "@/lib/r2"
import { uploadRateLimiter, checkRateLimit } from "@/lib/redis"

function normalizeExtension(value: string | undefined): string {
  const raw = (value || "").trim().toLowerCase()
  if (raw === "jpg" || raw === "jpeg") return "jpg"
  if (raw === "webp") return "webp"
  if (raw === "avif") return "avif"
  if (raw === "bmp") return "bmp"
  return "png"
}

function normalizeContentType(extension: string, input?: string): string {
  const candidate = (input || "").trim().toLowerCase()
  if (candidate.startsWith("image/")) return candidate
  return `image/${extension === "jpg" ? "jpeg" : extension}`
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const rateLimitResult = await checkRateLimit(uploadRateLimiter, `upload:${session.user.id}`)
    if (rateLimitResult && !rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many uploads. Please slow down." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": String(rateLimitResult.limit),
            "X-RateLimit-Remaining": String(rateLimitResult.remaining),
            "X-RateLimit-Reset": String(rateLimitResult.reset),
          },
        },
      )
    }

    const body = await req.json()
    const fileExtension = normalizeExtension(typeof body?.fileExtension === "string" ? body.fileExtension : undefined)
    const contentType = normalizeContentType(fileExtension, typeof body?.contentType === "string" ? body.contentType : undefined)

    const timestamp = Date.now()
    const randomString = Math.random().toString(36).slice(2, 15)
    const fileName = `screensplit-${timestamp}-${randomString}.${fileExtension}`

    const { uploadUrl, objectUrl, expiresInSeconds } = await createPresignedR2Upload({
      key: fileName,
      contentType,
      expiresInSeconds: 15 * 60,
    })

    const beforeLabel = typeof body?.beforeLabel === "string" && body.beforeLabel.trim().length > 0
      ? body.beforeLabel.trim().slice(0, 60)
      : "Before"

    const afterLabel = typeof body?.afterLabel === "string" && body.afterLabel.trim().length > 0
      ? body.afterLabel.trim().slice(0, 60)
      : "After"

    const beforeSubtext = typeof body?.beforeSubtext === "string" ? body.beforeSubtext.slice(0, 120) : ""
    const afterSubtext = typeof body?.afterSubtext === "string" ? body.afterSubtext.slice(0, 120) : ""
    const textColor = typeof body?.textColor === "string" ? body.textColor : "#ffffff"
    const bgColor = typeof body?.bgColor === "string" ? body.bgColor : "#000000"

    const parsedFontSize = Number.parseInt(String(body?.fontSize ?? ""), 10)
    const fontSize = Number.isFinite(parsedFontSize) ? Math.min(Math.max(parsedFontSize, 16), 160) : 48

    const isPrivate = Boolean(body?.isPrivate)
    const password = typeof body?.password === "string" ? body.password.trim() : ""

    let hashedPassword: string | null = null
    if (isPrivate) {
      if (!password) {
        return NextResponse.json({ error: "Password required for private shares" }, { status: 400 })
      }
      const saltRounds = Number.parseInt(process.env.BCRYPT_COST || "12")
      const { default: bcrypt } = await import("bcrypt")
      hashedPassword = await bcrypt.hash(password, saltRounds)
    }

    const shareSlug = nanoid(10)
    const layout = body?.layout === "horizontal" ? "SIDE_BY_SIDE" : "TOP_TO_BOTTOM"

    const title = typeof body?.title === "string" && body.title.trim().length > 0
      ? body.title.trim().slice(0, 120)
      : `${beforeLabel} vs ${afterLabel}`

    const project = await prisma.project.create({
      data: {
        userId: session.user.id,
        title,
        shareSlug,
        finalImageUrl: null,
        beforeImage: objectUrl,
        afterImage: objectUrl,
        layout,
        beforeLabel,
        afterLabel,
        description: null,
        fontSize,
        textColor,
        bgColor,
        exportFormat: fileExtension === "jpg" ? "JPEG" : "PNG",
        shareMessage: null,
        isPrivate,
        isPublic: !isPrivate,
        password: hashedPassword,
        viewCount: 0,
      },
      select: {
        id: true,
        shareSlug: true,
      },
    })

    return NextResponse.json({
      success: true,
      projectId: project.id,
      shareSlug: project.shareSlug,
      uploadUrl,
      objectUrl,
      expiresInSeconds,
    })
  } catch (error) {
    console.error("Presign upload error:", error)
    return NextResponse.json({ error: "Failed to prepare upload" }, { status: 500 })
  }
}
