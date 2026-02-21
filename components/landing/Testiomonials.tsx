"use client";

import { Star } from "lucide-react"

export function TestimonialsSection() {
  return (
    <section className="mx-auto max-w-7xl flex justify-center py-12 md:py-20 px-4 md:px-6 overflow-hidden border-x border-border">
      <div className="w-full max-w-[1280px] relative z-10">
        {/* Section Header */}
        <div className="mb-10 md:mb-16 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3 md:mb-4 text-foreground">
            Loved by creators
          </h2>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed px-4">
            See what people are saying about Screensplit
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Testimonial 1 */}
          <article className="relative overflow-hidden rounded-xl md:rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm h-full">
            <div className="relative flex flex-col h-full">
              {/* Star Rating */}
              <div className="mb-4 flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              
              {/* Quote */}
              <p className="mb-6 text-sm md:text-base text-muted-foreground leading-relaxed flex-1">
                "Finally, a tool that makes showcasing UI redesigns effortless. I used to spend 30+ minutes in Figma creating comparison layouts. Now I just upload two screenshots and export in under 2 minutes. Game changer for client presentations."
              </p>
              
              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-muted border border-border flex items-center justify-center">
                  <span className="text-sm font-semibold text-foreground">SC</span>
                </div>
                <div>
                  <div className="font-medium text-sm md:text-base text-foreground">Sarah Chen</div>
                  <div className="text-xs md:text-sm text-muted-foreground">Product Designer at Stripe</div>
                </div>
              </div>
            </div>
          </article>

          {/* Testimonial 2 */}
          <article className="relative overflow-hidden rounded-xl md:rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm h-full">
            <div className="relative flex flex-col h-full">
              {/* Star Rating */}
              <div className="mb-4 flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              
              {/* Quote */}
              <p className="mb-6 text-sm md:text-base text-muted-foreground leading-relaxed flex-1">
                "The fact that everything processes locally in my browser is huge for NDAs. I can show clients their website updates without uploading sensitive content anywhere. Plus the MP4 exports look amazing on LinkedIn."
              </p>
              
              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-muted border border-border flex items-center justify-center">
                  <span className="text-sm font-semibold text-foreground">MR</span>
                </div>
                <div>
                  <div className="font-medium text-sm md:text-base text-foreground">Marcus Rodriguez</div>
                  <div className="text-xs md:text-sm text-muted-foreground">Freelance Web Developer</div>
                </div>
              </div>
            </div>
          </article>

          {/* Testimonial 3 */}
          <article className="relative overflow-hidden rounded-xl md:rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm h-full">
            <div className="relative flex flex-col h-full">
              {/* Star Rating */}
              <div className="mb-4 flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              
              {/* Quote */}
              <p className="mb-6 text-sm md:text-base text-muted-foreground leading-relaxed flex-1">
                "I create fitness transformation content and this tool is perfect. The side-by-side video exports with custom fonts and colors match my brand exactly. My engagement went up 40% after switching to these polished before/afters."
              </p>
              
              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-muted border border-border flex items-center justify-center">
                  <span className="text-sm font-semibold text-foreground">ET</span>
                </div>
                <div>
                  <div className="font-medium text-sm md:text-base text-foreground">Emily Thompson</div>
                  <div className="text-xs md:text-sm text-muted-foreground">Fitness Content Creator</div>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
