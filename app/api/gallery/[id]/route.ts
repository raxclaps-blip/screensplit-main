import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidateTag } from "next/cache"

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    let session: Awaited<ReturnType<typeof auth>> | null = null
    try {
      session = await auth(req)
    } catch (authError) {
      console.error("Gallery delete auth error:", authError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params

    const project = await prisma.project.findUnique({
      where: { id },
      select: { userId: true }
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    if (project.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    await prisma.project.delete({
      where: { id }
    })

    // Invalidate cached user images listing
    revalidateTag(`user-images:${project.userId}`, { expire: 0 })
    revalidateTag("community-featured", { expire: 0 })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
