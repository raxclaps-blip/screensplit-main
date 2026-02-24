import { NextRequest, NextResponse } from "next/server"
import { nanoid } from "nanoid"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const MAX_LOGO_DATA_URL_LENGTH = 2_800_000
const ALLOWED_LOGO_PREFIXES = [
  "data:image/png;base64,",
  "data:image/jpeg;base64,",
  "data:image/jpg;base64,",
  "data:image/webp;base64,",
  "data:image/svg+xml;base64,",
]

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

    const body = await request.json()
    const logoDataUrl = normalizeLogoDataUrl(body?.logoDataUrl)
    if (!logoDataUrl) {
      return NextResponse.json(
        { error: "Invalid logo image. Please upload PNG, JPG, WEBP, or SVG up to 2MB." },
        { status: 400 }
      )
    }

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
        ${session.user.id},
        '',
        ${JSON.stringify([])}::jsonb,
        ${logoDataUrl},
        NOW(),
        NOW()
      )
      ON CONFLICT ("user_id")
      DO UPDATE SET
        "logo_url" = EXCLUDED."logo_url",
        "updatedAt" = NOW()
    `

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
