import {
  Layout,
  Palette,
  ImageIcon,
  Clock,
  Zap,
  Download,
  Share2,
  Sparkles,
} from "lucide-react";
import IntegrationsElement from "@/components/IntegrationsElement";
import { ReactNode } from "react";

const BackgroundGrid = () => (
  <div
    aria-hidden
    className="pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]"
  >
    <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(99,102,241,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.15)_1px,transparent_1px)] bg-[size:40px_40px]" />
    <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(236,72,153,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(236,72,153,0.1)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_at_center,transparent_40%,black_80%)]" />
  </div>
);

const CardDecorator = ({ children, accent = "blue" }: { children: ReactNode; accent?: "blue" | "pink" | "purple" }) => (
  <div className={`relative size-32 duration-300 transition-all group-hover:scale-105 
    ${accent === "blue" ? "text-blue-500" : ""}
    ${accent === "pink" ? "text-pink-500" : ""}
    ${accent === "purple" ? "text-purple-500" : ""}
  `}>
    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-background to-muted/50 border border-border/50" />
    <div className="absolute -inset-2 bg-gradient-to-br from-current/10 to-transparent rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
    <div className="relative flex size-full items-center justify-center">
      {children}
    </div>
  </div>
);

const FeatureBadge = ({ children }: { children: string }) => (
  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
    {children}
  </span>
);

export function BentoFeatures() {
  return (
    <section id="features" className="border-b border-border/60 bg-gradient-to-b from-background to-muted/20">
      <div className="relative mx-auto max-w-7xl px-6 py-32">
        {/* Enhanced Background */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 left-1/4 size-96 bg-blue-500/5 rounded-full blur-3xl" />
          <div className="absolute top-60 right-1/4 size-80 bg-pink-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-1/3 size-64 bg-purple-500/5 rounded-full blur-3xl" />
        </div>

        {/* Section Header */}
        <div className="mb-20 text-center max-w-2xl mx-auto">
          <FeatureBadge>Powerful Features</FeatureBadge>
          <h2 className="mt-4 mb-6 text-5xl font-bold tracking-tight bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
            Create stunning comparisons
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Professional before & after tools that make your work stand out. 
            Simple interface, powerful results.
          </p>
        </div>

        {/* Enhanced Bento Grid */}
        <div className="grid gap-6 md:grid-cols-6 md:grid-rows-5">
          {/* Hero Feature - Layouts */}
          <div className="group relative overflow-hidden rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm p-10 md:col-span-4 md:row-span-2">
            <BackgroundGrid />
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <FeatureBadge>Flexible Layouts</FeatureBadge>
                  <h3 className="mt-4 mb-4 text-3xl font-bold tracking-tight">
                    Multiple display options
                  </h3>
                </div>
                <CardDecorator accent="blue">
                  <Layout className="h-8 w-8" />
                </CardDecorator>
              </div>
              
              <p className="mb-10 text-muted-foreground text-lg leading-relaxed max-w-2xl">
                Choose from side-by-side, top-to-bottom, or fade transitions. 
                Perfect for showcasing transformations across different mediums.
              </p>
              
              <div className="grid grid-cols-2 gap-6 max-w-2xl mt-auto">
                <div className="rounded-2xl border border-border/50 bg-secondary/20 backdrop-blur-sm p-6 transition-all duration-300 hover:bg-secondary/30 hover:border-border">
                  <div className="mb-4 text-sm font-semibold text-foreground">Side by Side</div>
                  <div className="flex gap-3">
                    <div className="h-16 flex-1 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/20" />
                    <div className="h-16 flex-1 rounded-xl bg-gradient-to-br from-pink-500/20 to-pink-600/10 border border-pink-500/20" />
                  </div>
                </div>
                <div className="rounded-2xl border border-border/50 bg-secondary/20 backdrop-blur-sm p-6 transition-all duration-300 hover:bg-secondary/30 hover:border-border">
                  <div className="mb-4 text-sm font-semibold text-foreground">Fade Transition</div>
                  <div className="relative h-16 rounded-xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 border border-border/50 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Integrations Card */}
          <div className="group relative overflow-hidden rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm p-8 md:col-span-2 md:row-span-2 flex flex-col">
            <BackgroundGrid />
            <div className="relative z-10 w-full text-center flex flex-col h-full">
              <div className="mb-6">
                <CardDecorator accent="pink">
                  <Share2 className="h-7 w-7" />
                </CardDecorator>
              </div>
              <h3 className="mb-4 text-2xl font-bold tracking-tight">
                Share everywhere
              </h3>
              <p className="mb-8 text-muted-foreground leading-relaxed flex-grow">
                Export and share directly to your favorite platforms. 
                All processing happens locally for maximum privacy.
              </p>
              <div className="mt-auto">
                <IntegrationsElement />
              </div>
            </div>
          </div>

          {/* Style & Customization */}
          <div className="group relative overflow-hidden rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm p-8 md:col-span-2 md:row-span-1">
            <BackgroundGrid />
            <div className="relative z-10 flex flex-col h-full">
              <div className="mb-6">
                <CardDecorator accent="purple">
                  <Palette className="h-6 w-6" />
                </CardDecorator>
              </div>
              <h3 className="mb-3 text-xl font-bold tracking-tight">
                Custom Styling
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Complete control over fonts, colors, labels, and animations
              </p>
            </div>
          </div>

          {/* Export Options */}
          <div className="group relative overflow-hidden rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm p-8 md:col-span-2 md:row-span-1">
            <BackgroundGrid />
            <div className="relative z-10 flex flex-col h-full">
              <div className="mb-6">
                <CardDecorator accent="blue">
                  <ImageIcon className="h-6 w-6" />
                </CardDecorator>
              </div>
              <h3 className="mb-3 text-xl font-bold tracking-tight">
                Multiple Formats
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                MP4, PNG, JPEG exports with optimized quality and size
              </p>
            </div>
          </div>

          {/* Animation Features */}
          <div className="group relative overflow-hidden rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm p-8 md:col-span-2 md:row-span-1">
            <BackgroundGrid />
            <div className="relative z-10 flex flex-col h-full">
              <div className="mb-6">
                <CardDecorator accent="pink">
                  <Sparkles className="h-6 w-6" />
                </CardDecorator>
              </div>
              <h3 className="mb-3 text-xl font-bold tracking-tight">
                Smooth Animations
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Auto-play with elegant fade transitions and timing controls
              </p>
            </div>
          </div>

          {/* Performance */}
          <div className="group relative overflow-hidden rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm p-8 md:col-span-3 md:row-span-1">
            <BackgroundGrid />
            <div className="relative z-10 flex items-center gap-6 h-full">
              <div className="flex-shrink-0">
                <CardDecorator accent="blue">
                  <Zap className="h-7 w-7" />
                </CardDecorator>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="mb-3 text-xl font-bold tracking-tight">
                  Optimized Performance
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Native recording at 60fps with WebAssembly fallback for maximum compatibility
                </p>
              </div>
            </div>
          </div>

          {/* Quick Export */}
          <div className="group relative overflow-hidden rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm p-8 md:col-span-3 md:row-span-1">
            <BackgroundGrid />
            <div className="relative z-10 flex items-center gap-6 h-full">
              <div className="flex-shrink-0">
                <CardDecorator accent="purple">
                  <Download className="h-7 w-7" />
                </CardDecorator>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="mb-3 text-xl font-bold tracking-tight">
                  Instant Export
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  One-click exports optimized for social media and professional portfolios
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}