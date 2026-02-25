import type { Metadata } from "next"
import type { CollectionPage, ItemList, WithContext } from "schema-dts"
import Link from "next/link"
import { ArrowRight, Eye, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/landing/Header"
import { Footer } from "@/components/landing/Footer"
import { getFeaturedCommunityComparisons } from "@/lib/community-gallery"
import { toImageKitUrl } from "@/lib/imagekit"
import { serializeJsonLd } from "@/lib/seo/json-ld"
import { SITE_NAME, absoluteUrl } from "@/lib/seo/site"

export const metadata: Metadata = {
  title: "Community Gallery | Screensplit",
  description:
    "Explore featured before/after comparisons shared by the Screensplit community.",
  alternates: {
    canonical: "/community",
  },
  openGraph: {
    title: "Community Gallery | Screensplit",
    description:
      "Explore featured before/after comparisons shared by the Screensplit community.",
    url: absoluteUrl("/community"),
    type: "website",
    images: [
      {
        url: absoluteUrl("/opengraph-image"),
        width: 1200,
        height: 630,
        alt: "Screensplit community gallery preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Community Gallery | Screensplit",
    description:
      "Explore featured before/after comparisons shared by the Screensplit community.",
    images: [absoluteUrl("/twitter-image")],
  },
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export default async function CommunityPage() {
  const items = await getFeaturedCommunityComparisons(60)
  const collectionPageJsonLd: WithContext<CollectionPage> = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Community Gallery | ${SITE_NAME}`,
    description:
      "Featured public before-and-after comparisons shared by creators on Screensplit.",
    url: absoluteUrl("/community"),
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: absoluteUrl("/"),
    },
  }
  const itemListJsonLd: WithContext<ItemList> = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    numberOfItems: items.length,
    itemListElement: items.slice(0, 20).map((item, index) => {
      const title = item.title || `${item.beforeLabel} vs ${item.afterLabel}`
      const imageSrc = toImageKitUrl(item.finalImageUrl || `/api/i/${item.shareSlug}`)
      const shareUrl = absoluteUrl(`/share/${item.shareSlug}`)
      const imageUrl = absoluteUrl(imageSrc)

      return {
        "@type": "ListItem",
        position: index + 1,
        url: shareUrl,
        item: {
          "@type": "ImageObject",
          name: title,
          url: shareUrl,
          contentUrl: imageUrl,
          thumbnailUrl: imageUrl,
        },
      }
    }),
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(collectionPageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(itemListJsonLd) }}
      />
      <Header />

      <main className="mx-auto mt-16 w-full max-w-7xl border-x border-border">
        <section className="relative overflow-hidden border-b border-border px-4 py-16 sm:px-6 md:py-20">
          <div className="pointer-events-none absolute inset-0 dark:hidden">
            <div className="absolute left-1/2 top-10 h-[340px] w-[340px] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]" />
          </div>

          <div className="relative z-10 mx-auto max-w-4xl text-center">
            <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Community Gallery
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
              Public comparisons featured by creators.
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
              Every comparison here was explicitly opted-in from the share popup by its creator.
            </p>
          </div>
        </section>

        <section className="px-4 py-10 sm:px-6 md:py-12">
          {items.length === 0 ? (
            <div className="mx-auto max-w-3xl rounded-3xl border border-border/60 bg-card/75 p-8 text-center shadow-lg">
              <h2 className="text-xl font-semibold">No featured comparisons yet</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Create and share a comparison, then enable "Feature in Community Gallery" from the
                share dialog.
              </p>
              <div className="mt-6">
                <Button asChild size="lg" className="rounded-full px-7">
                  <Link href="/apps/screensplit">Create a Comparison</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {items.map((item) => {
                const title = item.title || `${item.beforeLabel} vs ${item.afterLabel}`
                const creator = item.user?.name?.trim() || "Community creator"
                const imageSrc = toImageKitUrl(item.finalImageUrl || `/api/i/${item.shareSlug}`)

                return (
                  <Link
                    key={item.id}
                    href={`/share/${item.shareSlug}`}
                    className="group self-start overflow-hidden rounded-3xl border border-border/50 bg-card/75 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-border hover:shadow-2xl"
                  >
                    <div className="overflow-hidden border-b border-border/60 bg-muted">
                      <img
                        src={imageSrc}
                        alt={title}
                        loading="lazy"
                        className="block h-auto w-full transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    </div>

                    <div className="space-y-3 p-5">
                      <div className="space-y-1">
                        <p className="line-clamp-1 text-base font-semibold tracking-tight">{title}</p>
                        <p className="text-sm text-muted-foreground">
                          by <span className="font-medium text-foreground">{creator}</span>
                        </p>
                      </div>

                      {item.shareMessage ? (
                        <p className="line-clamp-2 text-sm text-muted-foreground">{item.shareMessage}</p>
                      ) : null}

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{formatDate(item.createdAt)}</span>
                        <span className="inline-flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5" />
                          {item.viewCount}
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          <div className="mt-10 text-center">
            <Button asChild variant="outline" size="lg" className="rounded-full px-7">
              <Link href="/apps/screensplit">
                Create and Feature Yours
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <div className="mx-auto w-full max-w-7xl border-x border-border">
        <Footer />
      </div>
    </div>
  )
}

