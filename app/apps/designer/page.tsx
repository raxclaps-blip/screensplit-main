"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Download, ImageUp, Loader2, Type } from "lucide-react"
import { toast } from "sonner"

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.trim().split(/\s+/)
  if (!words[0]) return []

  const lines: string[] = []
  let currentLine = words[0]

  for (let i = 1; i < words.length; i += 1) {
    const candidate = `${currentLine} ${words[i]}`
    if (ctx.measureText(candidate).width <= maxWidth) {
      currentLine = candidate
    } else {
      lines.push(currentLine)
      currentLine = words[i]
    }
  }

  lines.push(currentLine)
  return lines
}

function normalizeHexColor(value: string, fallback = "#ffffff") {
  const candidate = value.trim()
  const isHexColor = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(candidate)
  if (!isHexColor) return fallback

  if (candidate.length === 4) {
    const [r, g, b] = candidate.slice(1)
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase()
  }

  return candidate.toLowerCase()
}

function hexToRgba(value: string, alpha = 1, fallback = "#ffffff") {
  const hex = normalizeHexColor(value, fallback).slice(1)
  const r = Number.parseInt(hex.slice(0, 2), 16)
  const g = Number.parseInt(hex.slice(2, 4), 16)
  const b = Number.parseInt(hex.slice(4, 6), 16)
  const safeAlpha = Math.max(0, Math.min(1, alpha))
  return `rgba(${r},${g},${b},${safeAlpha})`
}

export default function DesignerPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const objectUrlRef = useRef<string | null>(null)
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null)
  const [showHeadline, setShowHeadline] = useState(true)
  const [headline, setHeadline] = useState("Write your message here")
  const [subline, setSubline] = useState("Your image stays clean on top while text remains readable below.")
  const [bottomMode, setBottomMode] = useState<"fade" | "blackout">("fade")
  const [bottomFadeHeight, setBottomFadeHeight] = useState([36])
  const [bottomFadeVisibility, setBottomFadeVisibility] = useState([90])
  const [bottomFadeBlur, setBottomFadeBlur] = useState([14])
  const [belowImageBlackout, setBelowImageBlackout] = useState([0])
  const [bottomRightText, setBottomRightText] = useState("")
  const [savedBottomRightText, setSavedBottomRightText] = useState("")
  const [bottomRightHistory, setBottomRightHistory] = useState<string[]>([])
  const [isDesignerTextLoading, setIsDesignerTextLoading] = useState(true)
  const [isDesignerTextSaving, setIsDesignerTextSaving] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [headlineScale, setHeadlineScale] = useState([7])
  const [bottomOffset, setBottomOffset] = useState([6])
  const [useUnifiedTextColor, setUseUnifiedTextColor] = useState(true)
  const [allTextColor, setAllTextColor] = useState("#ffffff")
  const [headlineTextColor, setHeadlineTextColor] = useState("#ffffff")
  const [sublineTextColor, setSublineTextColor] = useState("#ffffff")
  const [linkTextColor, setLinkTextColor] = useState("#ffffff")
  const [bottomRightTextColor, setBottomRightTextColor] = useState("#ffffff")
  const isBottomFadeMode = bottomMode === "fade"
  const isBelowImageBlackoutMode = bottomMode === "blackout"

  const clearImage = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    setImageElement(null)
  }, [])

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = imageElement ? Math.max(1, imageElement.naturalWidth || 1) : 1400
    const imageHeight = imageElement ? Math.max(1, imageElement.naturalHeight || 1) : 1800
    const safePaddingX = Math.round(width * 0.07)
    const textMaxWidth = width - safePaddingX * 2
    const titleSizePx = Math.max(30, Math.round(width * (headlineScale[0] / 100)))
    const subtitleSizePx = Math.max(18, Math.round(titleSizePx * 0.46))
    const titleLineHeight = Math.round(titleSizePx * 1.14)
    const subtitleLineHeight = Math.round(subtitleSizePx * 1.35)
    const commentFontSize = Math.min(34, Math.max(18, Math.round(width * 0.024)))
    const commentBottomInset = Math.max(10, Math.round(commentFontSize * 0.7))
    const pillPaddingX = Math.max(10, Math.round(commentFontSize * 0.5))
    const pillPaddingY = Math.max(5, Math.round(commentFontSize * 0.32))
    const pillHeight = commentFontSize + pillPaddingY * 2
    const footerReserve = pillHeight + commentBottomInset + Math.max(8, Math.round(commentFontSize * 0.25))
    const bottomRightTextTrimmed = bottomRightText.trim()
    const sharedTextColor = normalizeHexColor(allTextColor, "#ffffff")
    const resolvedHeadlineTextColor = useUnifiedTextColor
      ? sharedTextColor
      : normalizeHexColor(headlineTextColor, sharedTextColor)
    const resolvedSublineTextColor = useUnifiedTextColor
      ? sharedTextColor
      : normalizeHexColor(sublineTextColor, sharedTextColor)
    const resolvedLinkTextColor = useUnifiedTextColor
      ? sharedTextColor
      : normalizeHexColor(linkTextColor, sharedTextColor)
    const resolvedBottomRightTextColor = useUnifiedTextColor
      ? sharedTextColor
      : normalizeHexColor(bottomRightTextColor, sharedTextColor)

    ctx.font = `500 ${subtitleSizePx}px ui-sans-serif, system-ui, -apple-system`
    const subtitleLines = subline.trim() ? wrapLines(ctx, subline, textMaxWidth) : []
    const subtitleBlockHeight = subtitleLines.length * subtitleLineHeight

    ctx.font = `700 ${titleSizePx}px ui-sans-serif, system-ui, -apple-system`
    const headlineLines = showHeadline && headline.trim() ? wrapLines(ctx, headline, textMaxWidth) : []
    const headlineBlockHeight = headlineLines.length * titleLineHeight

    const interTextGap = subtitleBlockHeight > 0 && headlineBlockHeight > 0 ? Math.round(subtitleSizePx * 0.9) : 0
    const textContentHeight = subtitleBlockHeight + interTextGap + headlineBlockHeight
    const configuredBelowBlackoutPx = Math.round(imageHeight * (belowImageBlackout[0] / 100))

    let belowBlackoutPx = 0
    if (isBelowImageBlackoutMode) {
      const topPadding = 12
      const baseBottomGap = 12
      let candidate = Math.max(configuredBelowBlackoutPx, textContentHeight + topPadding + baseBottomGap + footerReserve)

      // Fit blackout height to text content + dynamic bottom offset without clipping.
      for (let i = 0; i < 3; i += 1) {
        const dynamicBottomGap = Math.max(baseBottomGap, Math.round(candidate * (bottomOffset[0] / 100)))
        candidate = Math.max(candidate, textContentHeight + topPadding + dynamicBottomGap + footerReserve)
      }

      belowBlackoutPx = candidate
    }

    const blackoutModeActive = isBelowImageBlackoutMode && belowBlackoutPx > 0
    const height = imageHeight + belowBlackoutPx

    canvas.width = width
    canvas.height = height
    ctx.clearRect(0, 0, width, height)

    if (imageElement) {
      ctx.drawImage(imageElement, 0, 0, width, imageHeight)
    } else {
      const placeholderGradient = ctx.createLinearGradient(0, 0, width, imageHeight)
      placeholderGradient.addColorStop(0, "#1f2937")
      placeholderGradient.addColorStop(1, "#0b1220")
      ctx.fillStyle = placeholderGradient
      ctx.fillRect(0, 0, width, imageHeight)
    }

    if (belowBlackoutPx > 0) {
      ctx.fillStyle = "rgba(0,0,0,1)"
      ctx.fillRect(0, imageHeight, width, belowBlackoutPx)
    }

    if (!blackoutModeActive && isBottomFadeMode && bottomFadeVisibility[0] > 0) {
      const opacity = bottomFadeVisibility[0] / 100
      const fadePx = Math.max(180, Math.round(imageHeight * (bottomFadeHeight[0] / 100)))
      const blurPx = Math.max(0, bottomFadeBlur[0])
      const fadeTop = Math.max(0, imageHeight - fadePx)

      // True blur pass: blur underlying pixels in the fade area and mask by the same fade gradient.
      if (imageElement && blurPx > 0) {
        const blurPad = Math.max(8, Math.round(blurPx * 2))
        const sampleTop = Math.max(0, fadeTop - blurPad)
        const sampleHeight = imageHeight - sampleTop

        if (sampleHeight > 0) {
          const sourceCanvas = document.createElement("canvas")
          sourceCanvas.width = width
          sourceCanvas.height = sampleHeight
          const sourceCtx = sourceCanvas.getContext("2d")

          const blurredCanvas = document.createElement("canvas")
          blurredCanvas.width = width
          blurredCanvas.height = sampleHeight
          const blurredCtx = blurredCanvas.getContext("2d")

          const effectCanvas = document.createElement("canvas")
          effectCanvas.width = width
          effectCanvas.height = imageHeight
          const effectCtx = effectCanvas.getContext("2d")

          if (sourceCtx && blurredCtx && effectCtx) {
            sourceCtx.drawImage(imageElement, 0, sampleTop, width, sampleHeight, 0, 0, width, sampleHeight)
            blurredCtx.filter = `blur(${blurPx}px)`
            blurredCtx.drawImage(sourceCanvas, 0, 0)
            blurredCtx.filter = "none"

            effectCtx.drawImage(blurredCanvas, 0, sampleTop)
            effectCtx.globalCompositeOperation = "destination-in"

            const blurMask = effectCtx.createLinearGradient(0, imageHeight, 0, fadeTop)
            blurMask.addColorStop(0, `rgba(0,0,0,${Math.min(1, opacity * 0.95).toFixed(3)})`)
            blurMask.addColorStop(0.5, `rgba(0,0,0,${Math.min(1, opacity * 0.65).toFixed(3)})`)
            blurMask.addColorStop(1, "rgba(0,0,0,0)")
            effectCtx.fillStyle = blurMask
            effectCtx.fillRect(0, fadeTop, width, fadePx)

            effectCtx.globalCompositeOperation = "source-over"
            ctx.drawImage(effectCanvas, 0, 0)
          }
        }
      }

      const bottomFadeGradient = ctx.createLinearGradient(0, imageHeight, 0, imageHeight - fadePx)
      bottomFadeGradient.addColorStop(0, `rgba(0,0,0,${(1 * opacity).toFixed(3)})`)
      bottomFadeGradient.addColorStop(0.5, `rgba(0,0,0,${(0.72 * opacity).toFixed(3)})`)
      bottomFadeGradient.addColorStop(1, "rgba(0,0,0,0)")
      ctx.fillStyle = bottomFadeGradient
      ctx.fillRect(0, fadeTop, width, fadePx)
    }

    const textAreaHeight = blackoutModeActive ? belowBlackoutPx : imageHeight
    const textAreaTop = blackoutModeActive ? imageHeight : 0
    const bottomGap = blackoutModeActive
      ? Math.max(12, Math.round(textAreaHeight * (bottomOffset[0] / 100)))
      : Math.max(30, Math.round(textAreaHeight * (bottomOffset[0] / 100)))

    let cursorBottom = (blackoutModeActive ? height : imageHeight) - bottomGap - footerReserve

    if (blackoutModeActive) {
      // Enforce text containment: never allow text pixels to render into the image area.
      ctx.save()
      ctx.beginPath()
      ctx.rect(0, textAreaTop, width, textAreaHeight)
      ctx.clip()
    }

    if (subtitleLines.length > 0) {
      ctx.font = `500 ${subtitleSizePx}px ui-sans-serif, system-ui, -apple-system`
      let y = cursorBottom - subtitleBlockHeight + subtitleLineHeight
      if (blackoutModeActive) {
        y = Math.max(y, textAreaTop + subtitleLineHeight)
      }

      ctx.fillStyle = hexToRgba(resolvedSublineTextColor, 0.9, sharedTextColor)
      ctx.shadowColor = "rgba(0,0,0,0.6)"
      ctx.shadowBlur = Math.round(subtitleSizePx * 0.4)
      ctx.shadowOffsetY = 2
      for (const line of subtitleLines) {
        ctx.fillText(line, safePaddingX, y, textMaxWidth)
        y += subtitleLineHeight
      }

      cursorBottom -= subtitleBlockHeight + interTextGap
    }

    if (headlineLines.length > 0) {
      ctx.font = `700 ${titleSizePx}px ui-sans-serif, system-ui, -apple-system`
      let y = cursorBottom - headlineBlockHeight + titleLineHeight
      if (blackoutModeActive) {
        y = Math.max(y, textAreaTop + titleLineHeight)
      }

      ctx.fillStyle = hexToRgba(resolvedHeadlineTextColor, 0.98, sharedTextColor)
      ctx.shadowColor = "rgba(0,0,0,0.65)"
      ctx.shadowBlur = Math.round(titleSizePx * 0.45)
      ctx.shadowOffsetY = 3
      for (const line of headlineLines) {
        ctx.fillText(line, safePaddingX, y, textMaxWidth)
        y += titleLineHeight
      }
    }

    if (blackoutModeActive) {
      ctx.restore()
    }

    const footerBottom = (blackoutModeActive ? height : imageHeight) - commentBottomInset
    const footerTop = footerBottom - pillHeight
    const footerCenterY = footerTop + pillHeight / 2
    const pillRadius = Math.round(pillHeight / 2)
    const pillsGap = Math.max(10, Math.round(commentFontSize * 0.5))

    const drawPill = (x: number, y: number, w: number, h: number, r: number) => {
      const radius = Math.min(r, h / 2, w / 2)
      ctx.beginPath()
      ctx.moveTo(x + radius, y)
      ctx.lineTo(x + w - radius, y)
      ctx.quadraticCurveTo(x + w, y, x + w, y + radius)
      ctx.lineTo(x + w, y + h - radius)
      ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h)
      ctx.lineTo(x + radius, y + h)
      ctx.quadraticCurveTo(x, y + h, x, y + h - radius)
      ctx.lineTo(x, y + radius)
      ctx.quadraticCurveTo(x, y, x + radius, y)
      ctx.closePath()
    }

    ctx.shadowBlur = 0
    ctx.shadowOffsetY = 0
    ctx.textAlign = "left"
    ctx.textBaseline = "middle"

    const linkIcon = "\u{1F517}"
    const linkLabel = "Link In comments"
    const labelGap = Math.max(6, Math.round(commentFontSize * 0.32))
    ctx.font = `${commentFontSize}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", ui-sans-serif, system-ui`
    const iconWidth = ctx.measureText(linkIcon).width
    ctx.font = `600 ${commentFontSize}px ui-sans-serif, system-ui, -apple-system`
    const linkLabelWidth = ctx.measureText(linkLabel).width
    const leftPillWidth = Math.round(pillPaddingX * 2 + iconWidth + labelGap + linkLabelWidth)
    const leftPillX = safePaddingX

    drawPill(leftPillX, footerTop, leftPillWidth, pillHeight, pillRadius)
    ctx.fillStyle = "rgba(10,10,10,0.68)"
    ctx.fill()
    ctx.strokeStyle = "rgba(255,255,255,0.18)"
    ctx.lineWidth = 1
    ctx.stroke()

    ctx.fillStyle = hexToRgba(resolvedLinkTextColor, 0.98, sharedTextColor)
    const iconX = leftPillX + pillPaddingX
    ctx.font = `${commentFontSize}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", ui-sans-serif, system-ui`
    ctx.fillText(linkIcon, iconX, footerCenterY)
    const linkTextX = iconX + iconWidth + labelGap
    ctx.font = `600 ${commentFontSize}px ui-sans-serif, system-ui, -apple-system`
    ctx.fillText(linkLabel, linkTextX, footerCenterY)

    if (bottomRightTextTrimmed) {
      const rightTextFont = `600 ${commentFontSize}px ui-sans-serif, system-ui, -apple-system`
      ctx.font = rightTextFont
      let rightText = bottomRightTextTrimmed
      const maxRightTextWidth = Math.max(
        0,
        width - safePaddingX * 2 - leftPillWidth - pillsGap - pillPaddingX * 2
      )

      if (maxRightTextWidth > 0 && ctx.measureText(rightText).width > maxRightTextWidth) {
        const ellipsis = "..."
        while (rightText.length > 0 && ctx.measureText(`${rightText}${ellipsis}`).width > maxRightTextWidth) {
          rightText = rightText.slice(0, -1)
        }
        rightText = rightText ? `${rightText}${ellipsis}` : ""
      }

      if (rightText) {
        const rightTextWidth = ctx.measureText(rightText).width
        const rightPillWidth = Math.round(pillPaddingX * 2 + rightTextWidth)
        const rightPillX = width - safePaddingX - rightPillWidth

        drawPill(rightPillX, footerTop, rightPillWidth, pillHeight, pillRadius)
        ctx.fillStyle = "rgba(10,10,10,0.68)"
        ctx.fill()
        ctx.strokeStyle = "rgba(255,255,255,0.18)"
        ctx.lineWidth = 1
        ctx.stroke()

        ctx.fillStyle = hexToRgba(resolvedBottomRightTextColor, 0.98, sharedTextColor)
        ctx.fillText(rightText, rightPillX + pillPaddingX, footerCenterY)
      }
    }

    ctx.textBaseline = "alphabetic"

    if (!imageElement) {
      ctx.shadowBlur = 0
      ctx.fillStyle = "rgba(255,255,255,0.75)"
      ctx.font = "500 30px ui-sans-serif, system-ui, -apple-system"
      ctx.fillText("Upload an image to start designing", safePaddingX, Math.round(height * 0.18), width * 0.9)
    }
  }, [
    bottomRightText,
    bottomMode,
    bottomFadeBlur,
    bottomFadeHeight,
    belowImageBlackout,
    bottomFadeVisibility,
    bottomOffset,
    headline,
    headlineScale,
    headlineTextColor,
    imageElement,
    isBelowImageBlackoutMode,
    isBottomFadeMode,
    linkTextColor,
    allTextColor,
    bottomRightTextColor,
    showHeadline,
    sublineTextColor,
    subline,
    useUnifiedTextColor,
  ])

  useEffect(() => {
    renderCanvas()
  }, [renderCanvas])

  useEffect(() => {
    let isMounted = true

    const loadDesignerText = async () => {
      setIsDesignerTextLoading(true)
      try {
        const response = await fetch("/api/user/designer-text")
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to load saved designer text")
        }

        if (!isMounted) return

        const savedText = typeof data.bottomRightText === "string" ? data.bottomRightText : ""
        const savedHistory = Array.isArray(data.bottomRightHistory)
          ? data.bottomRightHistory.filter((item: unknown): item is string => typeof item === "string")
          : []

        setBottomRightText(savedText)
        setSavedBottomRightText(savedText)
        setBottomRightHistory(savedHistory)
      } catch (error) {
        if (isMounted) {
          toast.error("Failed to load saved designer text")
        }
      } finally {
        if (isMounted) {
          setIsDesignerTextLoading(false)
        }
      }
    }

    loadDesignerText()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!isBelowImageBlackoutMode) return

    if (belowImageBlackout[0] === 0) {
      setBelowImageBlackout([18])
    }
  }, [belowImageBlackout, isBelowImageBlackoutMode])

  useEffect(() => () => clearImage(), [clearImage])

  const saveBottomRightText = useCallback(async () => {
    if (isDesignerTextSaving) return

    setIsDesignerTextSaving(true)
    try {
      const response = await fetch("/api/user/designer-text", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bottomRightText,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Failed to save text")
      }

      const savedText = typeof data.bottomRightText === "string" ? data.bottomRightText : ""
      const savedHistory = Array.isArray(data.bottomRightHistory)
        ? data.bottomRightHistory.filter((item: unknown): item is string => typeof item === "string")
        : []

      setBottomRightText(savedText)
      setSavedBottomRightText(savedText)
      setBottomRightHistory(savedHistory)
      toast.success("Bottom-right text saved")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save text")
    } finally {
      setIsDesignerTextSaving(false)
    }
  }, [bottomRightText, isDesignerTextSaving])

  const loadFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file")
      return
    }

    const objectUrl = URL.createObjectURL(file)
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
    }
    objectUrlRef.current = objectUrl

    const img = new Image()
    img.onload = () => {
      setImageElement(img)
      toast.success("Image loaded into canvas")
    }
    img.onerror = () => {
      toast.error("Unable to load this image")
    }
    img.src = objectUrl
  }, [])

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) loadFile(file)
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files?.[0]
    if (file) loadFile(file)
  }

  const downloadCanvas = useCallback(async () => {
    if (isExporting) return
    const canvas = canvasRef.current
    if (!canvas) return

    const toastId = toast.loading("Exporting and saving to cloud...")
    setIsExporting(true)

    try {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"))
      if (!blob) {
        throw new Error("Could not export the design")
      }

      const imageDataUrl = canvas.toDataURL("image/png")
      const exportTitle = (showHeadline && headline.trim() ? headline.trim() : "Designer Export").slice(0, 120)

      const response = await fetch("/api/upload-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageDataUrl,
          title: exportTitle,
          layout: "horizontal",
          beforeLabel: "Designer",
          afterLabel: "Export",
          exportFormat: "png",
          textColor: useUnifiedTextColor ? allTextColor : headlineTextColor,
          bgColor: "#000000",
          isPrivate: false,
        }),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(
          typeof data?.error === "string"
            ? data.error
            : "Failed to save this export to cloud storage"
        )
      }

      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = "designer-output.png"
      link.click()
      URL.revokeObjectURL(url)

      toast.success("Exported and saved to cloud", {
        id: toastId,
        description:
          typeof data?.shareSlug === "string" && data.shareSlug.length > 0
            ? `Saved to Gallery. Share URL: /share/${data.shareSlug}`
            : "Saved to Gallery and downloaded as PNG.",
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Export failed", { id: toastId })
    } finally {
      setIsExporting(false)
    }
  }, [allTextColor, headline, headlineTextColor, isExporting, showHeadline, useUnifiedTextColor])

  return (
    <div className="w-full px-4 pt-10 pb-28 sm:px-6 lg:px-8 xl:pb-10">
      <div className="grid gap-6">
        <Card className="order-2 h-fit space-y-2.5 p-3 xl:fixed xl:right-0 xl:top-16 xl:z-20 xl:h-[calc(100vh-4rem)] xl:w-[360px] xl:overflow-y-auto xl:rounded-none xl:border-l xl:border-r-0 xl:border-t-0 xl:border-b-0 xl:bg-background [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="rounded-xl border border-border bg-muted/20 p-3">
            <div className="mb-2">
              <p className="text-sm font-semibold">Output Mode</p>
              <p className="text-xs text-muted-foreground">Set how the lower text area is rendered.</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setBottomMode("fade")}
                className={`rounded-lg border p-2 text-left transition-colors ${
                  isBottomFadeMode
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-background hover:bg-muted"
                }`}
              >
                <p className="text-sm font-medium">Bottom Fade</p>
                <p className={`text-[11px] ${isBottomFadeMode ? "text-primary-foreground/90" : "text-muted-foreground"}`}>
                  Text overlays image
                </p>
              </button>
              <button
                type="button"
                onClick={() => setBottomMode("blackout")}
                className={`rounded-lg border p-2 text-left transition-colors ${
                  isBelowImageBlackoutMode
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-background hover:bg-muted"
                }`}
              >
                <p className="text-sm font-medium">Blackout</p>
                <p className={`text-[11px] ${isBelowImageBlackoutMode ? "text-primary-foreground/90" : "text-muted-foreground"}`}>
                  Text below image
                </p>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="headline" className="flex items-center gap-2">
                <Type className="h-4 w-4" />
                Headline
              </Label>
              <div className="flex items-center gap-2">
                <Label htmlFor="show-headline" className="cursor-pointer text-xs text-muted-foreground">
                  Show
                </Label>
                <Switch id="show-headline" checked={showHeadline} onCheckedChange={setShowHeadline} />
              </div>
            </div>
            <Textarea
              id="headline"
              value={headline}
              onChange={(event) => setHeadline(event.target.value)}
              placeholder="Write your headline"
              className="min-h-[84px]"
              disabled={!showHeadline}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subline">Subline</Label>
            <Input
              id="subline"
              value={subline}
              onChange={(event) => setSubline(event.target.value)}
              placeholder="Optional supporting text"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="bottom-right-text">Bottom Right Text</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={saveBottomRightText}
                disabled={isDesignerTextSaving || isDesignerTextLoading || bottomRightText === savedBottomRightText}
              >
                {isDesignerTextSaving ? (
                  <>
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    Saving
                  </>
                ) : (
                  "Save text"
                )}
              </Button>
            </div>
            <Input
              id="bottom-right-text"
              value={bottomRightText}
              onChange={(event) => setBottomRightText(event.target.value)}
              placeholder="Type bottom-right text"
              maxLength={120}
              list="bottom-right-text-history"
              disabled={isDesignerTextLoading}
            />
            <datalist id="bottom-right-text-history">
              {bottomRightHistory.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
            {bottomRightHistory.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {bottomRightHistory.slice(0, 5).map((item) => (
                  <Button
                    key={item}
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => setBottomRightText(item)}
                  >
                    {item}
                  </Button>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Saved per account for quick reuse on future designs.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-muted/20 p-3">
            <div className="mb-3">
              <p className="text-sm font-semibold">Text Colors</p>
              <p className="text-xs text-muted-foreground">Use one color for all text or customize each text independently.</p>
            </div>
            <div className="mb-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setUseUnifiedTextColor(true)}
                className={`rounded-lg border p-2 text-left transition-colors ${
                  useUnifiedTextColor
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-background hover:bg-muted"
                }`}
              >
                <p className="text-sm font-medium">Single Color</p>
                <p className={`text-[11px] ${useUnifiedTextColor ? "text-primary-foreground/90" : "text-muted-foreground"}`}>
                  All text elements
                </p>
              </button>
              <button
                type="button"
                onClick={() => setUseUnifiedTextColor(false)}
                className={`rounded-lg border p-2 text-left transition-colors ${
                  !useUnifiedTextColor
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-background hover:bg-muted"
                }`}
              >
                <p className="text-sm font-medium">Per Text</p>
                <p className={`text-[11px] ${!useUnifiedTextColor ? "text-primary-foreground/90" : "text-muted-foreground"}`}>
                  Control each item
                </p>
              </button>
            </div>

            {useUnifiedTextColor ? (
              <div className="space-y-1.5">
                <Label htmlFor="all-text-color">All Text Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="all-text-color"
                    type="color"
                    value={allTextColor}
                    onChange={(event) => setAllTextColor(normalizeHexColor(event.target.value, "#ffffff"))}
                    className="h-10 w-14 cursor-pointer p-1"
                  />
                  <Input
                    value={allTextColor}
                    onChange={(event) => setAllTextColor(normalizeHexColor(event.target.value, allTextColor))}
                    className="font-mono text-xs uppercase"
                    maxLength={7}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-[1fr_auto] items-center gap-2">
                  <Label htmlFor="headline-text-color" className="text-xs text-muted-foreground">Headline</Label>
                  <Input
                    id="headline-text-color"
                    type="color"
                    value={headlineTextColor}
                    onChange={(event) => setHeadlineTextColor(normalizeHexColor(event.target.value, "#ffffff"))}
                    className="h-8 w-12 cursor-pointer p-1"
                  />
                </div>
                <div className="grid grid-cols-[1fr_auto] items-center gap-2">
                  <Label htmlFor="subline-text-color" className="text-xs text-muted-foreground">Subline</Label>
                  <Input
                    id="subline-text-color"
                    type="color"
                    value={sublineTextColor}
                    onChange={(event) => setSublineTextColor(normalizeHexColor(event.target.value, "#ffffff"))}
                    className="h-8 w-12 cursor-pointer p-1"
                  />
                </div>
                <div className="grid grid-cols-[1fr_auto] items-center gap-2">
                  <Label htmlFor="link-text-color" className="text-xs text-muted-foreground">Link In comments</Label>
                  <Input
                    id="link-text-color"
                    type="color"
                    value={linkTextColor}
                    onChange={(event) => setLinkTextColor(normalizeHexColor(event.target.value, "#ffffff"))}
                    className="h-8 w-12 cursor-pointer p-1"
                  />
                </div>
                <div className="grid grid-cols-[1fr_auto] items-center gap-2">
                  <Label htmlFor="bottom-right-text-color" className="text-xs text-muted-foreground">Bottom Right Text</Label>
                  <Input
                    id="bottom-right-text-color"
                    type="color"
                    value={bottomRightTextColor}
                    onChange={(event) => setBottomRightTextColor(normalizeHexColor(event.target.value, "#ffffff"))}
                    className="h-8 w-12 cursor-pointer p-1"
                  />
                </div>
              </div>
            )}
          </div>

          <Tabs defaultValue="text" className="w-full">
            <TabsList className="grid h-10 w-full grid-cols-2">
              <TabsTrigger value="text">Text</TabsTrigger>
              <TabsTrigger value="effects">Effects</TabsTrigger>
            </TabsList>
            <TabsContent value="text" className="mt-2 rounded-xl border border-border bg-muted/20 p-3">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <Label>Headline Size</Label>
                  <span className="text-muted-foreground">{headlineScale[0]}%</span>
                </div>
                <Slider value={headlineScale} onValueChange={setHeadlineScale} min={3} max={12} step={0.5} />
                <div className="flex items-center justify-between text-sm">
                  <Label>Text Bottom Offset</Label>
                  <span className="text-muted-foreground">{bottomOffset[0]}%</span>
                </div>
                <Slider value={bottomOffset} onValueChange={setBottomOffset} min={2} max={18} step={1} />
              </div>
            </TabsContent>
            <TabsContent value="effects" className="mt-2 rounded-xl border border-border bg-muted/20 p-3">
              <div className="space-y-3">
                {isBottomFadeMode ? (
                  <>
                    <p className="text-xs text-muted-foreground">Fine-tune the fade overlay strength and spread.</p>
                    <div className="flex items-center justify-between text-sm">
                      <Label>Fade Height</Label>
                      <span className="text-muted-foreground">{bottomFadeHeight[0]}%</span>
                    </div>
                    <Slider
                      value={bottomFadeHeight}
                      onValueChange={setBottomFadeHeight}
                      min={18}
                      max={60}
                      step={1}
                    />
                    <div className="flex items-center justify-between text-sm">
                      <Label>Fade Visibility</Label>
                      <span className="text-muted-foreground">{bottomFadeVisibility[0]}%</span>
                    </div>
                    <Slider
                      value={bottomFadeVisibility}
                      onValueChange={setBottomFadeVisibility}
                      min={0}
                      max={100}
                      step={1}
                    />
                    <div className="flex items-center justify-between text-sm">
                      <Label>Fade Blur</Label>
                      <span className="text-muted-foreground">{bottomFadeBlur[0]}px</span>
                    </div>
                    <Slider
                      value={bottomFadeBlur}
                      onValueChange={setBottomFadeBlur}
                      min={0}
                      max={40}
                      step={1}
                    />
                  </>
                ) : (
                  <>
                    <p className="text-xs text-muted-foreground">Set the dedicated blackout area below the image.</p>
                    <div className="flex items-center justify-between text-sm">
                      <Label>Below Image Blackout</Label>
                      <span className="text-muted-foreground">{belowImageBlackout[0]}%</span>
                    </div>
                    <Slider
                      value={belowImageBlackout}
                      onValueChange={setBelowImageBlackout}
                      min={0}
                      max={40}
                      step={1}
                    />
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <Button type="button" onClick={downloadCanvas} disabled={isExporting} className="hidden xl:flex">
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export PNG
              </>
            )}
          </Button>
        </Card>

        <div
          className="group relative order-1 overflow-auto cursor-pointer xl:mr-[384px]"
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(event) => event.preventDefault()}
          role="button"
          aria-label={imageElement ? "Click preview to replace image" : "Click preview to upload image"}
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault()
              fileInputRef.current?.click()
            }
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileInput}
          />
          <div className="pointer-events-none absolute left-3 top-3 z-20 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-medium text-foreground shadow-sm backdrop-blur-sm">
            {imageElement ? "Click to replace image" : "Click to upload image"}
          </div>
          {!imageElement && (
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center p-4">
              <div className="rounded-xl border border-dashed border-border/80 bg-background/70 px-5 py-4 text-center shadow-sm backdrop-blur-sm">
                <div className="mb-2 flex items-center justify-center">
                  <ImageUp className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">Click anywhere to upload</p>
                <p className="text-xs text-muted-foreground">or drag and drop an image</p>
              </div>
            </div>
          )}
          <canvas
            ref={canvasRef}
            className="mx-auto h-auto w-full rounded-xl border border-border bg-black/70 p-3 shadow-2xl"
          />
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 pt-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] backdrop-blur xl:hidden">
        <Button type="button" onClick={downloadCanvas} disabled={isExporting} className="w-full">
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export PNG
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
