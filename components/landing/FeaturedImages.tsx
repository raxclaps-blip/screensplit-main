"use client";

import React, { useState } from "react";
import { ImageIcon, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { ImageViewDialog } from "./ImageViewDialog";

interface FeaturedImage {
  id: string;
  title: string;
  views: number;
  accent: string;
}

const featuredImages: FeaturedImage[] = [
  {
    id: "1",
    title: "Product Showcase",
    views: 2450,
    accent: "#3b82f6",
  },
  {
    id: "2",
    title: "Before & After",
    views: 3890,
    accent: "#a855f7",
  },
  {
    id: "3",
    title: "Design Comparison",
    views: 1670,
    accent: "#f97316",
  },
  {
    id: "4",
    title: "Photo Edit",
    views: 4230,
    accent: "#22c55e",
  },
  {
    id: "5",
    title: "UI Evolution",
    views: 2890,
    accent: "#6366f1",
  },
  {
    id: "6",
    title: "Brand Refresh",
    views: 3120,
    accent: "#ec4899",
  },
];

const FeatureBadge = ({ children }: { children: string }) => (
  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
    <Sparkles className="w-3 h-3" />
    {children}
  </span>
);

export function FeaturedImages() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<FeaturedImage | null>(null);

  const handleImageClick = (image: FeaturedImage) => {
    setSelectedImage(image);
    setDialogOpen(true);
  };

  return (
    <section className="border-b border-border bg-background border-t">
      <div className="relative mx-auto max-w-7xl px-6 py-32 border-x border-border">
        {/* Section Header */}
        <div className="mb-20 text-center max-w-2xl mx-auto">
          <h2 className="mt-4 mb-6 text-5xl font-bold tracking-tight text-foreground">
            Featured Comparisons
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Discover stunning before & after transformations created by our community.
            Get inspired and start creating your own.
          </p>
        </div>

        {/* Featured Images Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredImages.map((image, index) => (
            <div
              key={image.id}
              onClick={() => handleImageClick(image)}
              className="group relative overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:shadow-lg cursor-pointer"
            >
              {/* Image Container */}
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                {/* Split Effect Overlay */}
                <div className="absolute inset-0 flex">
                  <div className="flex-1 relative overflow-hidden bg-muted/50">
                    <div className="absolute top-4 left-4 px-3 py-1 rounded-md bg-background border border-border">
                      <span className="text-xs font-medium text-foreground">Before</span>
                    </div>
                  </div>
                  <div className="w-px bg-border" />
                  <div className="flex-1 relative overflow-hidden bg-muted/30">
                    <div className="absolute top-4 right-4 px-3 py-1 rounded-md bg-background border border-border">
                      <span className="text-xs font-medium text-foreground">After</span>
                    </div>
                  </div>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-background/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Floating Icon */}
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110"
                >
                  <ImageIcon className="w-8 h-8 text-primary" />
                </div>
              </div>

              {/* Card Content */}
              <div className="relative p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {image.title}
                  </h3>
                  <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="mt-16 text-center">
          <Link href="/apps/gallery">
            <button className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold transition-all duration-300 hover:shadow-lg hover:scale-105">
              View Gallery
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </Link>
        </div>
      </div>

      {/* Image View Dialog */}
      <ImageViewDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        image={selectedImage}
      />
    </section>
  );
}
