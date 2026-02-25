import type { ImageLoaderProps } from "next/image"
import { isVideoSource, toImageKitUrl } from "./imagekit"

function appendResizeQuery(src: string, width: number, quality?: number): string {
  const querySeparator = src.includes("?") ? "&" : "?"
  const qualityPart = typeof quality === "number" ? `&q=${quality}` : ""
  return `${src}${querySeparator}w=${width}${qualityPart}`
}

export default function imageKitLoader({ src, width, quality }: ImageLoaderProps): string {
  const source = src.trim()
  if (!source) return src

  if (source.startsWith("data:") || source.startsWith("blob:") || isVideoSource(source)) {
    return source
  }

  if (source.startsWith("/")) {
    return appendResizeQuery(source, width, quality)
  }

  return toImageKitUrl(source, {
    width,
    quality,
  })
}
