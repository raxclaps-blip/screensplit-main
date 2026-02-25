import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidateTag } from "next/cache"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const projectId = typeof body?.projectId === "string" ? body.projectId : ""

    if (!projectId) {
      return NextResponse.json({ error: "Project id required" }, { status: 400 })
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        userId: true,
        shareSlug: true,
        beforeImage: true,
        finalImageUrl: true,
      },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    if (project.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (!project.finalImageUrl) {
      await prisma.project.update({
        where: { id: project.id },
        data: {
          finalImageUrl: project.beforeImage,
        },
      })
    }

    revalidateTag(`user-images:${session.user.id}`, { expire: 0 })
    if (project.shareSlug) {
      revalidateTag(`share:${project.shareSlug}`, { expire: 0 })
    }

    return NextResponse.json({ success: true, shareSlug: project.shareSlug })
  } catch (error) {
    console.error("Complete upload error:", error)
    return NextResponse.json({ error: "Failed to finalize upload" }, { status: 500 })
  }
}
