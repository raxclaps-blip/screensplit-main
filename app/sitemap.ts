import { MetadataRoute } from "next"
import { prisma } from "@/lib/prisma"
import { absoluteUrl } from "@/lib/seo/site"

export const revalidate = 3600

type SitemapEntry = MetadataRoute.Sitemap[number]

const staticRouteEntries: Array<{
  path: string
  changeFrequency: SitemapEntry["changeFrequency"]
  priority: number
}> = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/about", changeFrequency: "monthly", priority: 0.8 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.8 },
  { path: "/community", changeFrequency: "daily", priority: 0.85 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.5 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.5 },
]

function getStaticEntries(lastModified: Date): MetadataRoute.Sitemap {
  return staticRouteEntries.map((entry) => ({
    url: absoluteUrl(entry.path),
    lastModified,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }))
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const generatedAt = new Date()
  const staticEntries = getStaticEntries(generatedAt)

  try {
    const publicShares = await prisma.project.findMany({
      where: {
        shareSlug: { not: null },
        isPrivate: false,
      },
      select: {
        shareSlug: true,
        createdAt: true,
        updatedAt: true,
        isFeaturedInCommunity: true,
      },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      take: 5000,
    })

    const shareEntries: MetadataRoute.Sitemap = publicShares
      .filter((project): project is typeof project & { shareSlug: string } => Boolean(project.shareSlug))
      .map((project) => ({
        url: absoluteUrl(`/share/${project.shareSlug}`),
        lastModified: project.updatedAt ?? project.createdAt,
        changeFrequency: "weekly",
        priority: project.isFeaturedInCommunity ? 0.8 : 0.7,
      }))

    return [...staticEntries, ...shareEntries]
  } catch (error) {
    console.error("Failed to build dynamic sitemap entries:", error)
    return staticEntries
  }
}

