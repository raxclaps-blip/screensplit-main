import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import bcrypt from "bcrypt"
import { revalidateTag } from "next/cache"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { slug, isPrivate, password, message } = body

    if (!slug) {
      return NextResponse.json(
        { error: "Slug required" },
        { status: 400 }
      )
    }

    // Find project and verify ownership
    const project = await prisma.project.findUnique({
      where: { shareSlug: slug },
      select: { userId: true },
    })

    if (!project) {
      return NextResponse.json(
        { error: "Share not found" },
        { status: 404 }
      )
    }

    if (project.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You don't own this share" },
        { status: 403 }
      )
    }

    // Hash password if provided and private mode is enabled
    let hashedPassword = null
    
    if (isPrivate) {
      if (!password) {
        return NextResponse.json(
          { error: "Password required for private shares" },
          { status: 400 }
        )
      }
      const saltRounds = Number.parseInt(process.env.BCRYPT_COST || "12")
      hashedPassword = await bcrypt.hash(password, saltRounds)
    }

    // Update project
    const updated = await prisma.project.update({
      where: { shareSlug: slug },
      data: {
        isPrivate,
        password: hashedPassword,
        shareMessage: message || null,
      },
      select: {
        isPrivate: true,
        shareSlug: true,
        shareMessage: true,
      },
    })

    // Invalidate caches
    if (updated.shareSlug) {
      revalidateTag(`share:${updated.shareSlug}`, { expire: 0 })
    }
    if (session.user.id) {
      revalidateTag(`user-images:${session.user.id}`, { expire: 0 })
    }

    return NextResponse.json({
      success: true,
      isPrivate: updated.isPrivate,
      shareMessage: updated.shareMessage,
    })
  } catch (error) {
    console.error("Error updating privacy:", error)
    return NextResponse.json(
      { error: "Failed to update privacy settings" },
      { status: 500 }
    )
  }
}
