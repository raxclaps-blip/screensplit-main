import { NextRequest, NextResponse } from "next/server"
import { nanoid } from "nanoid"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { uploadToR2 } from "@/lib/r2"

const MAX_LOGO_DATA_URL_LENGTH = 2_800_000
const MAX_LOGO_FILE_SIZE_BYTES = 2 * 1024 * 1024
const ALLOWED_LOGO_PREFIXES = [
  "data:image/png;base64,",
  "data:image/jpeg;base64,",
  "data:image/jpg;base64,",
  "data:image/webp;base64,",
  "data:image/svg+xml;base64,",
]
const ALLOWED_LOGO_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/svg+xml",
])

type DesignerLogoRow = {
  logoUrl: string | null
}

function normalizeLogoDataUrl(value: unknown): string {
  if (typeof value !== "string") return ""
  const trimmed = value.trim()
  if (!trimmed) return ""
  if (trimmed.length > MAX_LOGO_DATA_URL_LENGTH) return ""

  const lower = trimmed.toLowerCase()
  const hasAllowedPrefix = ALLOWED_LOGO_PREFIXES.some((prefix) => lower.startsWith(prefix))
  if (!hasAllowedPrefix) return ""

  return trimmed
}

function normalizeLogoUrl(value: unknown): string {
  if (typeof value !== "string") return ""
  const trimmed = value.trim()
  if (!trimmed || trimmed.length > 2048) return ""
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) return ""

  const endpoint = (process.env.R2_S3_ENDPOINT || "").trim().replace(/\/+$/, "")
  const bucket = (process.env.R2_BUCKET || "").trim()
  if (!endpoint || !bucket) return ""

  const expectedPrefix = `${endpoint}/${bucket}/`
  return trimmed.startsWith(expectedPrefix) ? trimmed : ""
}

function extensionFromMime(contentType: string): string {
  const normalized = contentType.toLowerCase()
  if (normalized === "image/jpeg" || normalized === "image/jpg") return "jpg"
  if (normalized === "image/webp") return "webp"
  if (normalized === "image/svg+xml") return "svg"
  return "png"
}

function toSafeMime(contentType: string): string {
  const normalized = contentType.toLowerCase()
  if (normalized === "image/jpg") return "image/jpeg"
  return normalized
}

async function upsertLogoByUserId(userId: string, logoUrl: string) {
  await prisma.$executeRaw`
    INSERT INTO "designer_preferences" (
      "id",
      "user_id",
      "bottomRightText",
      "bottom_right_history",
      "logo_url",
      "createdAt",
      "updatedAt"
    )
    VALUES (
      ${nanoid()},
      ${userId},
      '',
      ${JSON.stringify([])}::jsonb,
      ${logoUrl},
      NOW(),
      NOW()
    )
    ON CONFLICT ("user_id")
    DO UPDATE SET
      "logo_url" = EXCLUDED."logo_url",
      "updatedAt" = NOW()
  `
}

async function getLogoByUserId(userId: string) {
  const rows = await prisma.$queryRaw<DesignerLogoRow[]>`
    SELECT
      "logo_url" AS "logoUrl"
    FROM "designer_preferences"
    WHERE "user_id" = ${userId}
    LIMIT 1
  `

  return rows[0] ?? null
}

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const preference = await getLogoByUserId(session.user.id)

    return NextResponse.json({
      logoUrl: preference?.logoUrl ?? "",
    })
  } catch (error) {
    console.error("Error fetching designer logo:", error)
    return NextResponse.json(
      { error: "Failed to fetch designer logo" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const contentType = request.headers.get("content-type") || ""
    let logoUrl = ""

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData()
      const logoFile = formData.get("logo")

      if (!(logoFile instanceof File)) {
        return NextResponse.json(
          { error: "Logo file is required." },
          { status: 400 }
        )
      }

      if (logoFile.size <= 0 || logoFile.size > MAX_LOGO_FILE_SIZE_BYTES) {
        return NextResponse.json(
          { error: "Logo file must be between 1 byte and 2MB." },
          { status: 400 }
        )
      }

      const fileMime = toSafeMime((logoFile.type || "").toLowerCase())
      if (!ALLOWED_LOGO_MIME_TYPES.has(fileMime)) {
        return NextResponse.json(
          { error: "Invalid logo image. Please upload PNG, JPG, WEBP, or SVG up to 2MB." },
          { status: 400 }
        )
      }

      const timestamp = Date.now()
      const randomString = Math.random().toString(36).slice(2, 12)
      const extension = extensionFromMime(fileMime)
      const key = `designer-logos/${session.user.id}/${timestamp}-${randomString}.${extension}`
      const buffer = Buffer.from(await logoFile.arrayBuffer())

      logoUrl = await uploadToR2(buffer, key, fileMime)
    } else {
      const body = await request.json().catch(() => ({}))
      const nextLogoUrl = normalizeLogoUrl(body?.logoUrl)
      const nextDataLogoUrl = normalizeLogoDataUrl(body?.logoDataUrl)
      logoUrl = nextLogoUrl || nextDataLogoUrl

      if (!logoUrl) {
        return NextResponse.json(
          { error: "Invalid logo image. Please upload PNG, JPG, WEBP, or SVG up to 2MB." },
          { status: 400 }
        )
      }
    }

    await upsertLogoByUserId(session.user.id, logoUrl)

    const updated = await getLogoByUserId(session.user.id)

    return NextResponse.json({
      logoUrl: updated?.logoUrl ?? "",
    })
  } catch (error) {
    console.error("Error updating designer logo:", error)
    return NextResponse.json(
      { error: "Failed to save designer logo" },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.$executeRaw`
      UPDATE "designer_preferences"
      SET
        "logo_url" = NULL,
        "updatedAt" = NOW()
      WHERE "user_id" = ${session.user.id}
    `

    return NextResponse.json({
      logoUrl: "",
    })
  } catch (error) {
    console.error("Error deleting designer logo:", error)
    return NextResponse.json(
      { error: "Failed to remove designer logo" },
      { status: 500 }
    )
  }
}
