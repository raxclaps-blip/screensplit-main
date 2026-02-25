import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"
import { SharePageClient, type ShareProjectData } from "@/components/share/share-page-client"
import { toImageKitUrl } from "@/lib/imagekit"

interface SharePageProps {
  params: Promise<{ slug: string }>
}

async function getShareProject(slug: string): Promise<ShareProjectData | null> {
  return unstable_cache(
    async () => {
      const project = await prisma.project.findUnique({
        where: { shareSlug: slug },
        select: {
          shareSlug: true,
          finalImageUrl: true,
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
      })

      if (!project) {
        return null
      }

      return {
        ...project,
        shareSlug: project.shareSlug ?? slug,
        createdAt: project.createdAt.toISOString(),
      }
    },
    ["share-page", slug],
    { tags: [`share:${slug}`] },
  )()
}

export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const { slug } = await params
  const project = await getShareProject(slug)

  if (!project) {
    return {
      title: "Share not found | Screensplit",
      description: "The requested share could not be found.",
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  const creator = project.user?.name ? ` by ${project.user.name}` : ""
  const description =
    project.shareMessage?.trim() ||
    `View this before-and-after comparison${creator} on Screensplit.`
  const previewImageUrl = project.isPrivate
    ? `/api/i/${slug}`
    : toImageKitUrl(project.finalImageUrl || `/api/i/${slug}`)

  return {
    title: `${project.beforeLabel} vs ${project.afterLabel}${creator} | Screensplit`,
    description,
    robots: {
      index: !project.isPrivate,
      follow: !project.isPrivate,
    },
    openGraph: {
      title: `${project.beforeLabel} vs ${project.afterLabel} | Screensplit`,
      description,
      type: "article",
      images: [{ url: previewImageUrl, alt: "Shared before and after comparison" }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.beforeLabel} vs ${project.afterLabel} | Screensplit`,
      description,
      images: [previewImageUrl],
    },
  }
}

export default async function SharePage({ params }: SharePageProps) {
  const { slug } = await params
  const project = await getShareProject(slug)

  if (!project) {
    notFound()
  }

  const initialAuthorized = !project.isPrivate

  return (
    <SharePageClient
      slug={slug}
      project={project}
      initialAuthorized={initialAuthorized}
    />
  )
}
