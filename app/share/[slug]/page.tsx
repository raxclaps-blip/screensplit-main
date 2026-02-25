import type { Metadata } from "next"
import type { ImageObject, WebPage, WithContext } from "schema-dts"
import { notFound } from "next/navigation"
import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"
import { SharePageClient, type ShareProjectData } from "@/components/share/share-page-client"
import { Header } from "@/components/landing/Header"
import { Footer } from "@/components/landing/Footer"
import { toImageKitUrl } from "@/lib/imagekit"
import { serializeJsonLd } from "@/lib/seo/json-ld"
import { SITE_NAME, absoluteUrl } from "@/lib/seo/site"

interface SharePageProps {
  params: Promise<{ slug: string }>
}

function getSharePreviewImageUrl(slug: string, project: ShareProjectData): string {
  const previewImagePath = project.isPrivate
    ? `/api/i/${slug}`
    : toImageKitUrl(project.finalImageUrl || `/api/i/${slug}`)

  return absoluteUrl(previewImagePath)
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
  const previewImageUrl = getSharePreviewImageUrl(slug, project)

  return {
    title: `${project.beforeLabel} vs ${project.afterLabel}${creator} | Screensplit`,
    description,
    alternates: project.isPrivate
      ? undefined
      : {
          canonical: `/share/${slug}`,
        },
    robots: {
      index: !project.isPrivate,
      follow: !project.isPrivate,
    },
    openGraph: {
      title: `${project.beforeLabel} vs ${project.afterLabel} | Screensplit`,
      description,
      type: "article",
      url: absoluteUrl(`/share/${slug}`),
      publishedTime: project.createdAt,
      authors: project.user?.name ? [project.user.name] : undefined,
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
  const shareTitle = `${project.beforeLabel} vs ${project.afterLabel}`
  const shareDescription =
    project.shareMessage?.trim() ||
    "View this shared before-and-after comparison on Screensplit."
  const shareUrl = absoluteUrl(`/share/${slug}`)
  const previewImageUrl = getSharePreviewImageUrl(slug, project)
  const isIndexable = !project.isPrivate
  const shareImageJsonLd: WithContext<ImageObject> | null = isIndexable
    ? {
        "@context": "https://schema.org",
        "@type": "ImageObject",
        name: shareTitle,
        description: shareDescription,
        url: shareUrl,
        contentUrl: previewImageUrl,
        thumbnailUrl: previewImageUrl,
        datePublished: project.createdAt,
        creator: project.user?.name
          ? {
              "@type": "Person",
              name: project.user.name,
            }
          : {
              "@type": "Organization",
              name: SITE_NAME,
              url: absoluteUrl("/"),
            },
      }
    : null
  const shareWebPageJsonLd: WithContext<WebPage> | null = isIndexable
    ? {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: `${shareTitle} | Screensplit`,
        description: shareDescription,
        url: shareUrl,
        primaryImageOfPage: {
          "@type": "ImageObject",
          contentUrl: previewImageUrl,
        },
      }
    : null

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/30">
      {shareImageJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(shareImageJsonLd) }}
        />
      ) : null}
      {shareWebPageJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(shareWebPageJsonLd) }}
        />
      ) : null}
      <Header />
      <main className="flex-1 flex flex-col">
        <div className="mx-auto w-full max-w-7xl border-x border-border">
          <SharePageClient
            slug={slug}
            project={project}
            initialAuthorized={initialAuthorized}
          />
        </div>
      </main>
      <div className="mx-auto w-full max-w-7xl border-x border-border">
        <Footer />
      </div>
    </div>
  )
}
