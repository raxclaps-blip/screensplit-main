import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Eye, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getFeaturedCommunityComparisons } from "@/lib/community-gallery"
import { toImageKitUrl } from "@/lib/imagekit"

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export async function CommunityFeatured() {
  const items = await getFeaturedCommunityComparisons(6)

  return (
    <section id="community" className="relative overflow-hidden bg-background py-24 md:py-28">
      <div className="pointer-events-none absolute inset-0 dark:hidden">
        <div className="absolute left-1/2 top-24 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]" />
      </div>

      <div className="container relative z-10 mx-auto px-4 md:px-6">
        <div className="mb-12 flex flex-col gap-4 text-center md:mb-14">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Community Featured
          </div>
          <h2 className="mx-auto max-w-3xl text-3xl font-bold tracking-tight md:text-5xl">
            Featured comparisons from the Screensplit community.
          </h2>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground md:text-lg">
            Creators can opt in from the share dialog to be showcased on this page.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="mx-auto max-w-3xl rounded-3xl border border-border/60 bg-card/70 p-8 text-center shadow-xl backdrop-blur-sm md:p-10">
            <p className="text-lg font-semibold">No featured comparisons yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Publish your next before/after and opt in from the share popup to appear here.
            </p>
            <div className="mt-6">
              <Button asChild size="lg" className="rounded-full px-7">
                <Link href="/apps/screensplit">Create a Comparison</Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {items.map((item) => {
                const title = item.title || `${item.beforeLabel} vs ${item.afterLabel}`
                const creator = item.user?.name?.trim() || "Community creator"
                const imageSrc = toImageKitUrl(item.finalImageUrl || `/api/i/${item.shareSlug}`)

                return (
                  <Link
                    key={item.id}
                    href={`/share/${item.shareSlug}`}
                    className="group overflow-hidden rounded-3xl border border-border/50 bg-card/75 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-border hover:shadow-2xl"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden border-b border-border/60 bg-muted">
                      <Image
                        src={imageSrc}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
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

            <div className="mt-10 text-center">
              <Button asChild variant="outline" size="lg" className="rounded-full px-7">
                <Link href="/community">
                  Open Community Gallery
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
