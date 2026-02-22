import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { unstable_cache } from "next/cache"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get('email')
    
    if (!email) {
      return NextResponse.json(
        { error: "Email parameter is required" },
        { status: 400 }
      )
    }

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Fetch public projects with shareable images (cached)
    const projects = await unstable_cache(
      async () =>
        prisma.project.findMany({
          where: {
            userId: user.id,
            shareSlug: {
              not: null
            },
            isPublic: true
          },
          select: {
            id: true,
            title: true,
            shareSlug: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 20
        }),
      ["user-images", user.id],
      { tags: [`user-images:${user.id}`] }
    )()

    return NextResponse.json(
      { projects },
      { 
        headers: { 
          'Cache-Control': 'public, max-age=300, s-maxage=600' 
        } 
      }
    )
  } catch (error) {
    console.error('Error fetching user images:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
