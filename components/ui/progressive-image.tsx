"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface ProgressiveImageProps {
  src: string
  alt: string
  className?: string
  blurDataURL?: string
  priority?: boolean
  onLoad?: () => void
  draggable?: boolean
  onContextMenu?: (e: React.MouseEvent) => void
}

export function ProgressiveImage({
  src,
  alt,
  className,
  blurDataURL,
  priority = false,
  onLoad,
  draggable = false,
  onContextMenu,
}: ProgressiveImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    if (!src) return

    setIsLoading(true)
    setHasError(false)
    setDimensions(null)

    // Preload the image
    const img = new window.Image()
    
    // Use higher priority for critical images
    if (priority) {
      img.loading = "eager"
      img.fetchPriority = "high"
    } else {
      img.loading = "lazy"
    }

    img.onload = () => {
      const width = Math.max(img.naturalWidth || 0, 1)
      const height = Math.max(img.naturalHeight || 0, 1)
      setDimensions({ width, height })
      setImageSrc(src)
      setIsLoading(false)
      onLoad?.()
    }

    img.onerror = () => {
      setHasError(true)
      setIsLoading(false)
    }

    img.src = src

    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [src, priority, onLoad])

  if (hasError) {
    return (
      <div className={cn("flex items-center justify-center bg-muted", className)}>
        <div className="text-center p-8">
          <p className="text-sm text-muted-foreground">Failed to load image</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Blur placeholder */}
      {isLoading && (
        <div
          className="absolute inset-0 animate-pulse bg-gradient-to-br from-muted via-muted/80 to-muted"
          style={{
            backgroundImage: blurDataURL ? `url(${blurDataURL})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(20px)",
            transform: "scale(1.1)",
          }}
        />
      )}

      {/* Actual image */}
      {imageSrc && dimensions && (
        <Image
          src={imageSrc}
          alt={alt}
          width={dimensions.width}
          height={dimensions.height}
          className={cn(
            "w-full h-auto object-contain transition-opacity duration-500",
            isLoading ? "opacity-0" : "opacity-100",
            className
          )}
          draggable={draggable}
          onContextMenu={onContextMenu}
          style={{
            contentVisibility: "auto",
          }}
        />
      )}

      {/* Loading spinner overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-xs text-muted-foreground">Loading image...</p>
          </div>
        </div>
      )}
    </div>
  )
}
