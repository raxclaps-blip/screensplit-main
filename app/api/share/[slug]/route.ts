import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { unstable_cache } from "next/cache"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const project = await unstable_cache(
      async () =>
        prisma.project.findUnique({
          where: { shareSlug: slug },
          select: {
            shareSlug: true,
            isPrivate: true,
            shareMessage: true,
            createdAt: true,
            viewCount: true,
            beforeLabel: true,
            afterLabel: true,
            user: {
              select: {
                name: true,
                image: true,
              },
            },
          },
        }),
      ["share", slug],
      { tags: [`share:${slug}`] }
    )()

    if (!project) {
      return NextResponse.json(
        { error: "Share not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error("Error fetching share:", error)
    return NextResponse.json(
      { error: "Failed to fetch share" },
      { status: 500 }
    )
  }
}
