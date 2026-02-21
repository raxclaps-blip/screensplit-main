import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getFromR2 } from "@/lib/r2"
import { cookies } from "next/headers"

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
        isPrivate: true,
        exportFormat: true,
      },
    })

    if (!project || !project.finalImageUrl) {
      return NextResponse.json(
        { error: "Image not found" },
        { status: 404 }
      )
    }

    // Check if private and requires auth
    if (project.isPrivate) {
      const cookieStore = await cookies()
      const authCookie = cookieStore.get(`share_auth_${slug}`)
      
      if (!authCookie) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        )
      }
    }

    // Extract key from finalImageUrl (it might be a full URL or just a key)
    let key = project.finalImageUrl
    
    // If it's a full URL, extract just the key/filename
    if (key.startsWith('http')) {
      const url = new URL(key)
      const pathParts = url.pathname.split('/')
      // Remove empty strings and bucket name to get the key
      key = pathParts.slice(2).join('/') || pathParts[pathParts.length - 1]
    }
    
    // Fetch image from R2
    const response = await getFromR2(key)

    if (!response.Body) {
      return NextResponse.json(
        { error: "Image data not available" },
        { status: 404 }
      )
    }

    // Convert stream to buffer
    const chunks: Uint8Array[] = []
    for await (const chunk of response.Body as any) {
      chunks.push(chunk)
    }
    const buffer = Buffer.concat(chunks)

    // Determine content type
    const contentType = project.exportFormat === "JPEG" 
      ? "image/jpeg" 
      : "image/png"

    // Generate ETag for caching
    const crypto = await import("crypto")
    const hash = crypto.createHash("md5").update(buffer).digest("hex")
    const etag = `"${hash}"`

    // Check if client has cached version
    const ifNoneMatch = req.headers.get("if-none-match")
    if (ifNoneMatch === etag) {
      return new NextResponse(null, { status: 304 })
    }

    // Set comprehensive performance headers
    const headers = new Headers()
    headers.set("Content-Type", contentType)
    headers.set("Content-Length", buffer.length.toString())
    headers.set("ETag", etag)
    headers.set("X-Content-Type-Options", "nosniff")
    
    // Enable compression
    headers.set("Vary", "Accept-Encoding")
    
    if (project.isPrivate) {
      headers.set("Cache-Control", "private, no-cache, no-store, must-revalidate")
      headers.set("Pragma", "no-cache")
      headers.set("Expires", "0")
    } else {
      // Aggressive caching for public images
      headers.set("Cache-Control", "public, max-age=31536000, immutable, stale-while-revalidate=86400")
      const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      headers.set("Expires", expires.toUTCString())
    }

    return new NextResponse(buffer, {
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
