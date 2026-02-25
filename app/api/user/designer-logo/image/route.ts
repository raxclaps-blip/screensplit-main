import { NextResponse } from "next/server"
import { Readable } from "node:stream"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getFromR2 } from "@/lib/r2"

type DesignerLogoRow = {
  logoUrl: string | null
}

function resolveObjectKey(logoUrl: string): string {
  if (!logoUrl.startsWith("http")) {
    return logoUrl
  }

  const url = new URL(logoUrl)
  const segments = url.pathname.split("/").filter(Boolean)
  if (segments.length <= 1) {
    return segments[0] ?? logoUrl
  }

  const bucket = process.env.R2_BUCKET
  if (bucket && segments[0] === bucket) {
    return segments.slice(1).join("/")
  }

  return segments.slice(1).join("/")
}

function inferContentTypeFromKey(key: string): string {
  const extension = key.split(".").pop()?.toLowerCase()
  if (extension === "jpg" || extension === "jpeg") return "image/jpeg"
  if (extension === "webp") return "image/webp"
  if (extension === "svg") return "image/svg+xml"
  return "image/png"
}

function decodeDataUrl(dataUrl: string): { contentType: string; bytes: Uint8Array } | null {
  const match = dataUrl.match(/^data:(image\/[a-z0-9.+-]+);base64,(.+)$/i)
  if (!match) return null

  const contentType = match[1].toLowerCase() === "image/jpg" ? "image/jpeg" : match[1].toLowerCase()
  const bytes = Buffer.from(match[2], "base64")
  return { contentType, bytes }
}

function toWebStream(body: unknown): ReadableStream<Uint8Array> | null {
  if (!body || typeof body !== "object") return null

  const candidate = body as {
    transformToWebStream?: () => ReadableStream<Uint8Array>
    getReader?: () => ReadableStreamDefaultReader<Uint8Array>
    pipe?: (...args: unknown[]) => unknown
  }

  if (typeof candidate.transformToWebStream === "function") {
    return candidate.transformToWebStream()
  }

  if (typeof candidate.getReader === "function") {
    return body as ReadableStream<Uint8Array>
  }

  if (typeof candidate.pipe === "function") {
    return Readable.toWeb(body as Readable) as ReadableStream<Uint8Array>
  }

  return null
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
    const logoUrl = typeof preference?.logoUrl === "string" ? preference.logoUrl : ""
    if (!logoUrl) {
      return NextResponse.json({ error: "Logo not found" }, { status: 404 })
    }

    const dataUrlPayload = logoUrl.startsWith("data:") ? decodeDataUrl(logoUrl) : null
    if (dataUrlPayload) {
      const normalizedBytes = Uint8Array.from(dataUrlPayload.bytes)
      const blob = new Blob([normalizedBytes], { type: dataUrlPayload.contentType })

      return new NextResponse(blob, {
        status: 200,
        headers: {
          "Content-Type": dataUrlPayload.contentType,
          "Cache-Control": "private, max-age=900, stale-while-revalidate=60",
          "X-Content-Type-Options": "nosniff",
        },
      })
    }

    const key = resolveObjectKey(logoUrl)
    const response = await getFromR2(key)
    if (!response.Body) {
      return NextResponse.json({ error: "Logo not found" }, { status: 404 })
    }

    const stream = toWebStream(response.Body)
    if (!stream) {
      return NextResponse.json({ error: "Logo stream unavailable" }, { status: 500 })
    }

    return new NextResponse(stream, {
      status: 200,
      headers: {
        "Content-Type": response.ContentType || inferContentTypeFromKey(key),
        "Cache-Control": "private, max-age=900, stale-while-revalidate=60",
        "X-Content-Type-Options": "nosniff",
      },
    })
  } catch (error) {
    console.error("Error serving designer logo:", error)
    return NextResponse.json({ error: "Failed to load logo" }, { status: 500 })
  }
}
