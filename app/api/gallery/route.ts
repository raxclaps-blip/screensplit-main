import { NextRequest, NextResponse } from "next/server"

function isPrismaMissingColumnError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2022"
  )
}

export async function GET(req: NextRequest) {
  try {
    const [{ auth }, { prisma }] = await Promise.all([
      import("@/lib/auth"),
      import("@/lib/prisma"),
    ])

    let session: { user?: { id?: string | null } } | null = null
    try {
      session = await auth(req)
    } catch (authError) {
      console.error("Gallery auth error:", authError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const searchParams = req.nextUrl.searchParams
    const takeParam = Number(searchParams.get('take'))
    const rawCursorId = searchParams.get('cursorId')
    const take = Number.isFinite(takeParam) ? Math.min(Math.max(1, takeParam), 60) : 24

    const where = {
      userId: session.user.id,
      shareSlug: { not: null },
      finalImageUrl: { not: null },
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

    let projects: Array<{
      id: string
      title: string | null
      description: string | null
      shareSlug: string | null
      shareMessage: string | null
      isPrivate: boolean
      isPublic: boolean
      isFeaturedInCommunity: boolean
      viewCount: number
      createdAt: Date
      updatedAt: Date
      beforeLabel: string
      afterLabel: string
      layout: "SIDE_BY_SIDE" | "TOP_TO_BOTTOM"
      finalImageUrl: string | null
    }>

    try {
      projects = await prisma.project.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          shareSlug: true,
          shareMessage: true,
          isPrivate: true,
          isPublic: true,
          isFeaturedInCommunity: true,
          viewCount: true,
          createdAt: true,
          updatedAt: true,
          beforeLabel: true,
          afterLabel: true,
          layout: true,
          finalImageUrl: true,
        },
        orderBy: [
          { createdAt: 'desc' },
          { id: 'desc' }
        ],
        ...(cursor ? { cursor, skip: 1 } : {}),
        take
      })
    } catch (queryError) {
      if (!isPrismaMissingColumnError(queryError)) {
        throw queryError
      }

      // Fallback for legacy databases missing newer optional columns.
      const legacyProjects = await prisma.project.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          shareSlug: true,
          isPrivate: true,
          isPublic: true,
          viewCount: true,
          createdAt: true,
          updatedAt: true,
          beforeLabel: true,
          afterLabel: true,
          layout: true,
          finalImageUrl: true,
        },
        orderBy: [
          { createdAt: 'desc' },
          { id: 'desc' }
        ],
        ...(cursor ? { cursor, skip: 1 } : {}),
        take
      })

      projects = legacyProjects.map((project) => ({
        ...project,
        shareMessage: null,
        isFeaturedInCommunity: false,
      }))
    }

    const hasMore = projects.length === take
    const nextCursorId = hasMore ? projects[projects.length - 1]?.id : null

    return NextResponse.json(
      { projects, hasMore, nextCursorId },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (error) {
    console.error('Error fetching gallery:', error)
    const devDetails =
      process.env.NODE_ENV !== "production"
        ? {
            message: error instanceof Error ? error.message : String(error),
            code:
              typeof error === "object" &&
              error !== null &&
              "code" in error
                ? String((error as { code?: string }).code)
                : undefined,
          }
        : undefined

    return NextResponse.json(
      { error: "Internal server error", details: devDetails },
      { status: 500 }
    )
  }
}
