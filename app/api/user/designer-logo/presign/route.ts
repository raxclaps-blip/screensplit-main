import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { createPresignedR2Upload } from "@/lib/r2"
import { checkRateLimit, uploadRateLimiter } from "@/lib/redis"

const ALLOWED_LOGO_EXTENSIONS = new Set(["png", "jpg", "jpeg", "webp", "svg"])
const ALLOWED_LOGO_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/svg+xml",
])

function normalizeExtension(value: unknown): string {
  const raw = typeof value === "string" ? value.trim().toLowerCase() : ""
  if (raw === "jpeg") return "jpg"
  return ALLOWED_LOGO_EXTENSIONS.has(raw) ? raw : "png"
}

function normalizeContentType(extension: string, value: unknown): string {
  const raw = typeof value === "string" ? value.trim().toLowerCase() : ""
  if (ALLOWED_LOGO_MIME_TYPES.has(raw)) {
    return raw === "image/jpg" ? "image/jpeg" : raw
  }
  if (extension === "jpg") return "image/jpeg"
  if (extension === "webp") return "image/webp"
  if (extension === "svg") return "image/svg+xml"
  return "image/png"
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const rateLimitResult = await checkRateLimit(uploadRateLimiter, `logo-upload:${session.user.id}`)
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

    const body = await req.json().catch(() => ({}))
    const extension = normalizeExtension(body?.fileExtension)
    const contentType = normalizeContentType(extension, body?.contentType)

    const timestamp = Date.now()
    const randomString = Math.random().toString(36).slice(2, 12)
    const key = `designer-logos/${session.user.id}/${timestamp}-${randomString}.${extension}`

    const { uploadUrl, objectUrl, expiresInSeconds } = await createPresignedR2Upload({
      key,
      contentType,
      expiresInSeconds: 10 * 60,
    })

    return NextResponse.json({
      success: true,
      uploadUrl,
      objectUrl,
      expiresInSeconds,
      contentType,
    })
  } catch (error) {
    console.error("Designer logo presign error:", error)
    return NextResponse.json({ error: "Failed to prepare logo upload" }, { status: 500 })
  }
}
