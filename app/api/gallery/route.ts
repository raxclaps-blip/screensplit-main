import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const takeParam = Number(searchParams.get('take'))
    const rawCursorId = searchParams.get('cursorId')
    const take = Number.isFinite(takeParam) ? Math.min(Math.max(1, takeParam), 60) : 24

    const where = {
      userId: session.user.id,
      shareSlug: { not: null }
    }

    let cursor: { id: string } | undefined
    if (rawCursorId) {
      const exists = await prisma.project.findFirst({
        where: { ...where, id: rawCursorId },
        select: { id: true }
      })
      if (exists?.id) {
        cursor = { id: exists.id }
      }
    }

    const projects = await prisma.project.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        shareSlug: true,
        shareMessage: true,
        isPrivate: true,
        isPublic: true,
        viewCount: true,
        createdAt: true,
        updatedAt: true,
        beforeLabel: true,
        afterLabel: true,
        layout: true,
      },
      orderBy: [
        { createdAt: 'desc' },
        { id: 'desc' }
      ],
      ...(cursor ? { cursor, skip: 1 } : {}),
      take
    })

    const hasMore = projects.length === take
    const nextCursorId = hasMore ? projects[projects.length - 1]?.id : null

    return NextResponse.json(
      { projects, hasMore, nextCursorId },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (error) {
    console.error('Error fetching gallery:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
