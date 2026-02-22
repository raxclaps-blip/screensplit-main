import { NextRequest, NextResponse } from "next/server"
import { nanoid } from "nanoid"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const MAX_TEXT_LENGTH = 120
const MAX_HISTORY_ITEMS = 12

function normalizeText(value: unknown): string {
  if (typeof value !== "string") return ""
  return value.trim().slice(0, MAX_TEXT_LENGTH)
}

function parseHistory(history: unknown): string[] {
  if (!Array.isArray(history)) return []
  return history
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, MAX_HISTORY_ITEMS)
}

type DesignerTextRow = {
  bottomRightText: string
  bottomRightHistory: unknown
}

async function getPreferenceByUserId(userId: string) {
  const rows = await prisma.$queryRaw<DesignerTextRow[]>`
    SELECT
      "bottomRightText" AS "bottomRightText",
      "bottom_right_history" AS "bottomRightHistory"
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

    const preference = await getPreferenceByUserId(session.user.id)

    return NextResponse.json({
      bottomRightText: preference?.bottomRightText ?? "",
      bottomRightHistory: parseHistory(preference?.bottomRightHistory),
    })
  } catch (error) {
    console.error("Error fetching designer text settings:", error)
    return NextResponse.json(
      { error: "Failed to fetch designer text settings" },
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
    const bottomRightText = normalizeText(body?.bottomRightText)

    const existing = await getPreferenceByUserId(session.user.id)

    const currentHistory = parseHistory(existing?.bottomRightHistory)
    const nextHistory = bottomRightText
      ? [bottomRightText, ...currentHistory.filter((item) => item !== bottomRightText)].slice(0, MAX_HISTORY_ITEMS)
      : currentHistory

    await prisma.$executeRaw`
      INSERT INTO "designer_preferences" (
        "id",
        "user_id",
        "bottomRightText",
        "bottom_right_history",
        "createdAt",
        "updatedAt"
      )
      VALUES (
        ${nanoid()},
        ${session.user.id},
        ${bottomRightText},
        ${JSON.stringify(nextHistory)}::jsonb,
        NOW(),
        NOW()
      )
      ON CONFLICT ("user_id")
      DO UPDATE SET
        "bottomRightText" = EXCLUDED."bottomRightText",
        "bottom_right_history" = EXCLUDED."bottom_right_history",
        "updatedAt" = NOW()
    `

    const updated = await getPreferenceByUserId(session.user.id)

    return NextResponse.json({
      bottomRightText: updated?.bottomRightText ?? "",
      bottomRightHistory: parseHistory(updated?.bottomRightHistory),
    })
  } catch (error) {
    console.error("Error updating designer text settings:", error)
    return NextResponse.json(
      { error: "Failed to update designer text settings" },
      { status: 500 }
    )
  }
}
