import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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
        finalImageUrl: true,
      },
    })

    if (!project) {
      return NextResponse.json({ success: true })
    }

    if (project.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (project.finalImageUrl) {
      return NextResponse.json({ success: true })
    }

    await prisma.project.delete({ where: { id: project.id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Cancel upload error:", error)
    return NextResponse.json({ error: "Failed to cancel upload" }, { status: 500 })
  }
}
