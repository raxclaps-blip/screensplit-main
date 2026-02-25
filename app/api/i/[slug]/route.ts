import { NextRequest, NextResponse } from "next/server"
import { Readable } from "node:stream"
import { prisma } from "@/lib/prisma"
import { getFromR2 } from "@/lib/r2"
import { cookies } from "next/headers"
import { auth } from "@/lib/auth"
import { toImageKitUrl } from "@/lib/imagekit"

function resolveObjectKey(finalImageUrl: string): string {
  if (!finalImageUrl.startsWith("http")) {
    return finalImageUrl
  }

  const url = new URL(finalImageUrl)
  const segments = url.pathname.split("/").filter(Boolean)
  if (segments.length <= 1) {
    return segments[0] ?? finalImageUrl
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
  if (extension === "avif") return "image/avif"
  if (extension === "bmp") return "image/bmp"
  return "image/png"
}

function parsePositiveInt(value: string | null): number | undefined {
  if (!value) return undefined
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed) || parsed <= 0) return undefined
  return parsed
}

function matchesEtag(ifNoneMatch: string | null, etag: string | undefined): boolean {
  if (!ifNoneMatch || !etag) return false
  const candidates = ifNoneMatch.split(",").map((value) => value.trim())
  if (candidates.includes("*")) return true
  return candidates.includes(etag) || candidates.includes(etag.replace(/^W\//, ""))
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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // Find project by shareSlug
    const project = await prisma.project.findUnique({
      where: { shareSlug: slug },
      select: {
        finalImageUrl: true,
        beforeImage: true,
        afterImage: true,
        isPrivate: true,
        isPublic: true,
        exportFormat: true,
        userId: true,
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: "Image not found" },
        { status: 404 }
      )
    }

    // Check if private and requires auth
    let ownerAccess = false
    if (project.isPrivate) {
      const cookieStore = await cookies()
      const authCookie = cookieStore.get(`share_auth_${slug}`)
      
      if (!authCookie) {
        const session = await auth()
        ownerAccess = Boolean(session?.user?.id && session.user.id === project.userId)
        if (!ownerAccess) {
          return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
          )
        }
      }
    }

    const storageUrl = project.finalImageUrl || project.beforeImage || project.afterImage
    if (!storageUrl) {
      return NextResponse.json(
        { error: "Image data not available" },
        { status: 404 }
      )
    }

    if (!project.isPrivate) {
      const width = parsePositiveInt(req.nextUrl.searchParams.get("w"))
      const quality = parsePositiveInt(req.nextUrl.searchParams.get("q"))
      const imageKitUrl = toImageKitUrl(storageUrl, { width, quality })

      if (
        imageKitUrl !== storageUrl &&
        imageKitUrl.startsWith("https://")
      ) {
        return NextResponse.redirect(imageKitUrl, { status: 307 })
      }
    }

    const key = resolveObjectKey(storageUrl)
    
    // Fetch image from cloud storage
    const response = await getFromR2(key)

    if (!response.Body) {
      return NextResponse.json(
        { error: "Image data not available" },
        { status: 404 }
      )
    }

    // Determine content type
    const contentType =
      response.ContentType ||
      inferContentTypeFromKey(key) ||
      (project.exportFormat === "JPEG" ? "image/jpeg" : "image/png")
    const etag = typeof response.ETag === "string" ? response.ETag : undefined

    // Check if client has cached version
    const ifNoneMatch = req.headers.get("if-none-match")
    if (matchesEtag(ifNoneMatch, etag)) {
      const notModifiedHeaders = new Headers()
      if (etag) {
        notModifiedHeaders.set("ETag", etag)
      }
      notModifiedHeaders.set(
        "Cache-Control",
        project.isPrivate
          ? ownerAccess
            ? "private, max-age=900, stale-while-revalidate=60"
            : "private, no-cache, no-store, must-revalidate"
          : "public, max-age=31536000, immutable"
      )
      return new NextResponse(null, { status: 304, headers: notModifiedHeaders })
    }

    // Set comprehensive performance headers
    const headers = new Headers()
    headers.set("Content-Type", contentType)
    if (typeof response.ContentLength === "number") {
      headers.set("Content-Length", String(response.ContentLength))
    }
    if (etag) {
      headers.set("ETag", etag)
    }
    headers.set("X-Content-Type-Options", "nosniff")
    
    // Enable compression
    headers.set("Vary", "Accept-Encoding")
    if (response.LastModified instanceof Date) {
      headers.set("Last-Modified", response.LastModified.toUTCString())
    }
    
    if (project.isPrivate) {
      if (ownerAccess) {
        headers.set("Cache-Control", "private, max-age=900, stale-while-revalidate=60")
      } else {
        headers.set("Cache-Control", "private, no-cache, no-store, must-revalidate")
        headers.set("Pragma", "no-cache")
        headers.set("Expires", "0")
      }
    } else {
      // Aggressive caching for public images
      headers.set("Cache-Control", "public, max-age=31536000, immutable, stale-while-revalidate=86400")
      const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      headers.set("Expires", expires.toUTCString())
    }

    const stream = toWebStream(response.Body)
    if (!stream) {
      return NextResponse.json(
        { error: "Image stream unavailable" },
        { status: 500 }
      )
    }

    return new NextResponse(stream, {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error("Error serving image:", error)
    return NextResponse.json(
      { error: "Failed to load image" },
      { status: 500 }
    )
  }
}
