"use client";

import React from "react";
import {
  Layout,
  Palette,
  Share2,
  Zap,
  Download,
  Sparkles,
  ImageIcon,
  Users,
  LucideIcon,
} from "lucide-react";

type CardProps = {
  title: string;
  description?: string;
  children?: React.ReactNode;
  variant?: "default" | "large" | "stat";
  icon?: LucideIcon;
  iconColor?: string;
};

const Card: React.FC<CardProps> = ({
  title,
  description,
  children,
  variant = "default",
  icon: Icon,
  iconColor = "text-primary",
}) => {
  const base =
    "relative overflow-hidden rounded-xl md:rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm transition-colors";

  return (
    <article className={`${base} h-full`}>
      <div className="relative flex flex-col justify-between h-full min-h-full">
        <div className="flex items-start gap-4 md:gap-5">
          {Icon && (
            <div className={`flex-shrink-0 ${iconColor}`}>
              <Icon className="w-6 h-6 md:w-7 md:h-7" strokeWidth={1.5} />
            </div>
          )}
          <div className="flex-1">
            <h4 className="text-sm md:text-base font-semibold text-foreground mb-2 md:mb-2.5">
              {title}
            </h4>
            {description && (
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed max-w-[42ch]">
                {description}
              </p>
            )}
          </div>
        </div>

        {children && <div className="mt-6 md:mt-8">{children}</div>}
      </div>
    </article>
  );
};

export default function BentoInfo(): React.ReactElement {
  return (
    <section id="features">
    <div className="mx-auto max-w-7xl flex justify-center py-12 md:py-20 px-4 md:px-6 overflow-hidden border-x border-border">
      <div className="w-full max-w-[1280px] relative z-10">
        {/* Section Header */}
        <div className="mb-10 md:mb-16 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3 md:mb-4 text-foreground">
            Everything you need
          </h2>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed px-4">
            Professional tools designed to create stunning visual comparisons
          </p>
        </div>

        {/* Grid layout - Mobile: single column, Tablet: 2 columns, Desktop: 6 columns */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 md:gap-6"
          style={{
            gridAutoRows: "minmax(180px, auto)",
          }}
        >
          {/* Flexible Layouts */}
          <div className="h-full md:col-span-1 lg:col-span-2 lg:row-span-2">
            <Card
              icon={Layout}
              iconColor="text-blue-500"
              title="Flexible Layouts"
              description="Choose from multiple layout options to showcase your comparisons perfectly."
            >
              <div className="space-y-4">
                {/* Side by Side Layout */}
                <div className="rounded-lg border border-border bg-muted/50 p-4">
                  <div className="mb-3 text-xs font-semibold text-foreground flex items-center justify-between">
                    <span>Side by Side</span>
                    <span className="text-[10px] text-muted-foreground bg-accent/50 px-2 py-0.5 rounded-full">
                      Horizontal
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-14 md:h-16 flex-1 rounded-md bg-accent/60 border border-border flex items-center justify-center">
                      <span className="text-[10px] text-foreground font-medium">
                        Before
                      </span>
                    </div>
                    <div className="h-14 md:h-16 flex-1 rounded-md bg-accent/40 border border-border flex items-center justify-center">
                      <span className="text-[10px] text-foreground font-medium">
                        After
                      </span>
                    </div>
                  </div>
                </div>

                {/* Top to Bottom Layout */}
                <div className="rounded-lg border border-border bg-muted/50 p-4">
                  <div className="mb-3 text-xs font-semibold text-foreground flex items-center justify-between">
                    <span>Top to Bottom</span>
                    <span className="text-[10px] text-muted-foreground bg-accent/50 px-2 py-0.5 rounded-full">
                      Vertical
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="h-7 md:h-8 rounded-md bg-accent/60 border border-border flex items-center justify-center">
                      <span className="text-[10px] text-foreground font-medium">
                        Before
                      </span>
                    </div>
                    <div className="h-7 md:h-8 rounded-md bg-accent/40 border border-border flex items-center justify-center">
                      <span className="text-[10px] text-foreground font-medium">
                        After
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Custom Styling */}
          <div className="h-full md:col-span-1 lg:col-span-2 lg:row-span-2">
            <Card
              icon={Palette}
              iconColor="text-purple-500"
              title="Custom Styling"
              description="Full control over fonts, colors, labels, and animations to match your brand."
            >
              <div className="space-y-4">
                {/* Color Palette */}
                <div className="space-y-3">
                  <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                    Brand Colors
                  </div>
                  <div className="flex gap-3 items-center">
                    <div className="rounded-lg p-3 md:p-4 bg-muted border border-border">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-md bg-primary" />
                    </div>
                    <div className="rounded-lg p-3 md:p-4 bg-yellow border border-border">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-md bg-secondary" />
                    </div>
                    <div className="rounded-lg p-3 md:p-4 bg-blue border border-border">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-md bg-accent" />
                    </div>
                  </div>
                </div>

                {/* Typography Preview */}
                <div className="rounded-lg border border-border bg-muted/50 p-3">
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-foreground">Aa</div>
                    <div className="text-[10px] text-muted-foreground">
                      Custom fonts & labels
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Share Everywhere */}
          <div className="h-full md:col-span-2 lg:col-span-2 lg:row-span-2">
            <Card
              icon={Share2}
              iconColor="text-green-500"
              title="Share Everywhere"
              description="Export and share to all your favorite platforms with one click."
            >
              <div className="space-y-4">
                {/* Platform Badges */}
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {[
                    { name: "Twitter" },
                    { name: "Instagram" },
                    { name: "LinkedIn" },
                    { name: "TikTok" },
                    { name: "YouTube" },
                  ].map((platform) => (
                    <div
                      key={platform.name}
                      className="px-3 md:px-4 py-1.5 md:py-2 rounded-md bg-muted border border-border text-xs font-medium"
                    >
                      {platform.name}
                    </div>
                  ))}
                </div>

                {/* Export Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-border bg-muted/50 p-3">
                    <div className="text-xs text-muted-foreground mb-1">
                      Direct Links
                    </div>
                    <div className="text-sm font-semibold text-foreground">
                      Shareable URLs
                    </div>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/50 p-3">
                    <div className="text-xs text-muted-foreground mb-1">
                      Gallery
                    </div>
                    <div className="text-sm font-semibold text-foreground">
                      Public Showcase
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Feature - Multiple Formats */}
          <div className="h-full md:col-span-2 lg:col-span-4 lg:row-span-3">
            <Card
              variant="large"
              icon={ImageIcon}
              iconColor="text-orange-500"
              title="Multiple Export Formats"
              description="Export as MP4 videos with audio or high-quality PNG/JPEG images. Optimized for social media, presentations, and portfolios."
            >
              <div className="relative mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {/* MP4 Export */}
                  <div className="rounded-lg bg-card p-5 md:p-6 border border-border">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-blue-500 flex items-center justify-center mb-3 md:mb-4">
                      <Download className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <div className="text-sm font-semibold mb-1.5 md:mb-2 text-foreground">
                      MP4 Video
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">
                      H.264 with audio support
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-muted-foreground">Codec</span>
                        <span className="text-foreground font-medium">
                          H.264/AAC
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-muted-foreground">
                          Frame Rate
                        </span>
                        <span className="text-foreground font-medium">
                          24-60 FPS
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 md:mt-4 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full w-3/4 rounded-full bg-primary" />
                    </div>
                  </div>

                  {/* PNG Export */}
                  <div className="rounded-lg bg-card p-5 md:p-6 border border-border">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-orange-500 flex items-center justify-center mb-3 md:mb-4">
                      <ImageIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <div className="text-sm font-semibold mb-1.5 md:mb-2 text-foreground">
                      PNG Image
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">
                      Lossless quality
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-muted-foreground">Quality</span>
                        <span className="text-foreground font-medium">
                          Lossless
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-muted-foreground">
                          Transparency
                        </span>
                        <span className="text-foreground font-medium">
                          Supported
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 md:mt-4 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full w-full rounded-full bg-secondary" />
                    </div>
                  </div>

                  {/* JPEG Export */}
                  <div className="rounded-lg bg-card p-5 md:p-6 border border-border sm:col-span-2 lg:col-span-1">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-yellow-500 flex items-center justify-center mb-3 md:mb-4">
                      <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <div className="text-sm font-semibold mb-1.5 md:mb-2 text-foreground">
                      JPEG Image
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">
                      Optimized size
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-muted-foreground">
                          Compression
                        </span>
                        <span className="text-foreground font-medium">
                          Optimized
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-muted-foreground">File Size</span>
                        <span className="text-foreground font-medium">
                          Smaller
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 md:mt-4 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full w-5/6 rounded-full bg-accent" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-6">
                  {/* WebP Export */}
                  <div className="rounded-lg bg-card p-5 md:p-6 border border-border">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-purple-500 flex items-center justify-center mb-3 md:mb-4">
                      <Palette className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <div className="text-sm font-semibold mb-1.5 md:mb-2 text-foreground">
                      WebP Image
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">
                      Modern web format
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-muted-foreground">Quality</span>
                        <span className="text-foreground font-medium">
                          Superior
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-muted-foreground">
                          File Size
                        </span>
                        <span className="text-foreground font-medium">
                          30% Smaller
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 md:mt-4 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full w-4/5 rounded-full bg-primary" />
                    </div>
                  </div>

                  {/* AVIF Export */}
                  <div className="rounded-lg bg-card p-5 md:p-6 border border-border">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-amber-500 flex items-center justify-center mb-3 md:mb-4">
                      <Zap className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <div className="text-sm font-semibold mb-1.5 md:mb-2 text-foreground">
                      AVIF Image
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">
                      Next-gen compression
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-muted-foreground">Quality</span>
                        <span className="text-foreground font-medium">
                          Superior
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-muted-foreground">
                          File Size
                        </span>
                        <span className="text-foreground font-medium">
                          50% Smaller
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 md:mt-4 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full w-full rounded-full bg-secondary" />
                    </div>
                  </div>

                  {/* GIF & TIFF Export */}
                  <div className="rounded-lg bg-card p-5 md:p-6 border border-border sm:col-span-2 lg:col-span-1">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-pink-500 flex items-center justify-center mb-3 md:mb-4">
                      <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <div className="text-sm font-semibold mb-1.5 md:mb-2 text-foreground">
                      GIF & TIFF Image
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">
                      Optimized size
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-muted-foreground">
                          Compression
                        </span>
                        <span className="text-foreground font-medium">
                          Optimized
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-muted-foreground">File Size</span>
                        <span className="text-foreground font-medium">
                          Smaller
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 md:mt-4 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full w-5/6 rounded-full bg-accent" />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Lightning Fast */}
          <div className="h-full md:col-span-2 lg:col-span-2 lg:row-span-2">
            <Card
              icon={Zap}
              iconColor="text-yellow-500"
              title="Lightning Fast"
              description="Native recording at 60fps with optimized WebAssembly fallback for maximum performance."
            >
              <div className="space-y-4">
                {/* Performance Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-border bg-muted/50 p-4">
                    <div className="text-2xl font-bold text-yellow mb-1">
                      60fps
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Native Recording
                    </div>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/50 p-4">
                    <div className="text-2xl font-bold text-secondary mb-1">
                      24fps
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      WASM Fallback
                    </div>
                  </div>
                </div>

                {/* Technology Stack */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span className="text-muted-foreground">WebCodecs API</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full bg-secondary"></div>
                    <span className="text-muted-foreground">FFmpeg WASM</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full bg-accent"></div>
                    <span className="text-muted-foreground">
                      Hardware Acceleration
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Privacy Focused */}
          <div className="h-full md:col-span-2 lg:col-span-2">
            <Card
              variant="stat"
              icon={Users}
              iconColor="text-indigo-500"
              title="100% Private"
              description="All processing happens in your browser"
            >
              <div className="space-y-3 mt-4">
                {/* Privacy Features */}
                <div className="rounded-lg border border-border bg-accent/30 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span className="text-xs font-medium text-foreground">
                      No Server Upload
                    </span>
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    Your files never leave your device
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-md border border-border bg-muted/50 p-2 text-center">
                    <div className="text-xs font-semibold text-foreground">
                      Local
                    </div>
                    <div className="text-[9px] text-muted-foreground mt-0.5">
                      Processing
                    </div>
                  </div>
                  <div className="rounded-md border border-border bg-muted/50 p-2 text-center">
                    <div className="text-xs font-semibold text-foreground">
                      Secure
                    </div>
                    <div className="text-[9px] text-muted-foreground mt-0.5">
                      Browser Only
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
    </section>
  );
}
