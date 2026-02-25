import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"

export interface CommunityComparison {
  id: string
  title: string | null
  shareSlug: string
  shareMessage: string | null
  createdAt: string
  viewCount: number
  beforeLabel: string
  afterLabel: string
  finalImageUrl: string | null
  user: {
    name: string | null
    image: string | null
  } | null
}

function normalizeTake(take: number): number {
  if (!Number.isFinite(take)) return 12
  return Math.min(Math.max(Math.trunc(take), 1), 60)
}

export async function getFeaturedCommunityComparisons(take = 12): Promise<CommunityComparison[]> {
  const normalizedTake = normalizeTake(take)

  const fetcher = unstable_cache(
    async () => {
      try {
        const projects = await prisma.project.findMany({
          where: {
            shareSlug: { not: null },
            finalImageUrl: { not: null },
            isPrivate: false,
            isFeaturedInCommunity: true,
          },
          select: {
            id: true,
            title: true,
            shareSlug: true,
            shareMessage: true,
            createdAt: true,
            viewCount: true,
            beforeLabel: true,
            afterLabel: true,
            finalImageUrl: true,
            user: {
              select: {
                name: true,
                image: true,
              },
            },
          },
          orderBy: [{ createdAt: "desc" }, { id: "desc" }],
          take: normalizedTake,
        })

        return projects.map((project) => ({
          id: project.id,
          title: project.title,
          shareSlug: project.shareSlug || "",
          shareMessage: project.shareMessage,
          createdAt: project.createdAt.toISOString(),
          viewCount: project.viewCount,
          beforeLabel: project.beforeLabel,
          afterLabel: project.afterLabel,
          finalImageUrl: project.finalImageUrl,
          user: project.user,
        }))
      } catch (error) {
        console.error("Failed to load community featured comparisons:", error)
        return []
      }
    },
    ["community-featured", String(normalizedTake)],
    { tags: ["community-featured"] },
  )

  return fetcher()
}
