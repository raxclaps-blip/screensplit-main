import Image from "next/image"
import { Separator } from "@/components/ui/separator"

export function LandingProof() {
  return (
    <section id="proof" className="border-b border-border scroll-mt-24">
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-8 max-w-2xl">
          <p className="mb-3 text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            Product proof
          </p>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Show exactly what changed, clearly.
          </h2>
        </div>

        <div className="rounded-2xl border border-border bg-card p-3 sm:p-5">
          <div className="grid gap-3 lg:grid-cols-[1fr_auto_1fr]">
            <figure className="overflow-hidden rounded-xl border border-border">
              <Image
                src="/app-preview-lightmode.png"
                alt="Before state preview"
                width={1024}
                height={600}
                className="aspect-[16/10] w-full object-cover"
              />
            </figure>

            <div className="hidden items-center justify-center lg:flex">
              <Separator orientation="vertical" className="h-24" />
            </div>

            <figure className="overflow-hidden rounded-xl border border-border">
              <Image
                src="/app-preview-darkmode.png"
                alt="After state preview"
                width={1024}
                height={600}
                className="aspect-[16/10] w-full object-cover"
              />
            </figure>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 px-1 text-sm">
            <p className="text-muted-foreground">Before and after, aligned and export-ready.</p>
            <p className="font-medium">Average setup time: under 2 minutes</p>
          </div>
        </div>
      </div>
    </section>
  )
}
