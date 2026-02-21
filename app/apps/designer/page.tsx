"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, Download, ImageUp, Loader2, Trash2, Type } from "lucide-react"
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
  const [belowImageBlackout, setBelowImageBlackout] = useState([0])
  const [bottomRightText, setBottomRightText] = useState("")
  const [savedBottomRightText, setSavedBottomRightText] = useState("")
  const [bottomRightHistory, setBottomRightHistory] = useState<string[]>([])
  const [isDesignerTextLoading, setIsDesignerTextLoading] = useState(true)
  const [isDesignerTextSaving, setIsDesignerTextSaving] = useState(false)
  const [headlineScale, setHeadlineScale] = useState([7])
  const [bottomOffset, setBottomOffset] = useState([6])
  const [openPanel, setOpenPanel] = useState<"bottom" | "sizing" | null>("bottom")
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
    const footerReserve = commentFontSize + commentBottomInset + Math.max(8, Math.round(commentFontSize * 0.25))
    const bottomRightTextTrimmed = bottomRightText.trim()

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

      const bottomFadeGradient = ctx.createLinearGradient(0, imageHeight, 0, imageHeight - fadePx)
      bottomFadeGradient.addColorStop(0, `rgba(0,0,0,${(1 * opacity).toFixed(3)})`)
      bottomFadeGradient.addColorStop(0.5, `rgba(0,0,0,${(0.72 * opacity).toFixed(3)})`)
      bottomFadeGradient.addColorStop(1, "rgba(0,0,0,0)")
      ctx.fillStyle = bottomFadeGradient
      ctx.fillRect(0, imageHeight - fadePx, width, fadePx)
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

      ctx.fillStyle = "rgba(255,255,255,0.88)"
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

      ctx.fillStyle = "rgba(255,255,255,0.98)"
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

    const footerY = (blackoutModeActive ? height : imageHeight) - commentBottomInset
    ctx.shadowColor = "rgba(0,0,0,0.65)"
    ctx.shadowBlur = Math.round(commentFontSize * 0.35)
    ctx.shadowOffsetY = 2
    ctx.fillStyle = "rgba(255,255,255,0.98)"

    ctx.font = `${commentFontSize}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", ui-sans-serif, system-ui`
    ctx.fillText("🔗", safePaddingX, footerY)

    const labelX = safePaddingX + commentFontSize + Math.max(6, Math.round(commentFontSize * 0.35))
    ctx.font = `600 ${commentFontSize}px ui-sans-serif, system-ui, -apple-system`
    ctx.fillText("Link In comments", labelX, footerY, width - labelX - safePaddingX)

    if (bottomRightTextTrimmed) {
      ctx.textAlign = "right"
      ctx.font = `600 ${commentFontSize}px ui-sans-serif, system-ui, -apple-system`
      ctx.fillText(bottomRightTextTrimmed, width - safePaddingX, footerY, Math.round(width * 0.45))
      ctx.textAlign = "left"
    }

    if (!imageElement) {
      ctx.shadowBlur = 0
      ctx.fillStyle = "rgba(255,255,255,0.75)"
      ctx.font = "500 30px ui-sans-serif, system-ui, -apple-system"
      ctx.fillText("Upload an image to start designing", safePaddingX, Math.round(height * 0.18), width * 0.9)
    }
  }, [
    bottomRightText,
    bottomMode,
    bottomFadeHeight,
    belowImageBlackout,
    bottomFadeVisibility,
    bottomOffset,
    headline,
    headlineScale,
    imageElement,
    isBelowImageBlackoutMode,
    isBottomFadeMode,
    showHeadline,
    subline,
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

  const downloadCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.toBlob((blob) => {
      if (!blob) {
        toast.error("Could not export the design")
        return
      }

      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = "designer-output.png"
      link.click()
      URL.revokeObjectURL(url)
      toast.success("Design exported as PNG")
    }, "image/png")
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Designer</h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Upload an image, apply a smooth black bottom fade, and place readable text with full layout control.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <Card className="order-2 h-fit space-y-3 p-5 xl:order-1">
          <div
            onDrop={handleDrop}
            onDragOver={(event) => event.preventDefault()}
            className="rounded-xl border border-dashed border-border bg-muted/20 p-4"
          >
            <Label className="mb-2 block text-sm font-semibold">Canvas Image</Label>
            <p className="mb-3 text-xs text-muted-foreground">Drag and drop an image or choose one from disk.</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileInput}
            />
            <div className="flex gap-2">
              <Button type="button" onClick={() => fileInputRef.current?.click()} className="flex-1">
                <ImageUp className="mr-2 h-4 w-4" />
                Upload image
              </Button>
              <Button type="button" variant="outline" onClick={clearImage}>
                <Trash2 className="h-4 w-4" />
              </Button>
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

          <Collapsible
            open={openPanel === "sizing"}
            onOpenChange={(isOpen) => {
              setOpenPanel((current) => (isOpen ? "sizing" : current === "sizing" ? null : current))
            }}
            className="rounded-xl border border-border bg-muted/20"
          >
            <CollapsibleTrigger asChild>
              <button className="group flex w-full items-center justify-between px-3 py-2.5 text-left">
                <div>
                  <p className="text-sm font-medium">Sizing</p>
                  <p className="text-xs text-muted-foreground">Headline and text positioning</p>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 border-t border-border px-3 pb-3 pt-3">
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
            </CollapsibleContent>
          </Collapsible>

          <Collapsible
            open={openPanel === "bottom"}
            onOpenChange={(isOpen) => {
              setOpenPanel((current) => (isOpen ? "bottom" : current === "bottom" ? null : current))
            }}
            className="rounded-xl border border-border bg-muted/20"
          >
            <CollapsibleTrigger asChild>
              <button className="group flex w-full items-center justify-between px-3 py-2.5 text-left">
                <div>
                  <p className="text-sm font-medium">Bottom Fade</p>
                  <p className="text-xs text-muted-foreground">
                    {isBottomFadeMode ? "Bottom Fade Mode active" : "Below Image Blackout Mode active"}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 border-t border-border px-3 pb-3 pt-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="bottom-fade-mode" className="cursor-pointer">Bottom Fade Mode</Label>
                <Switch
                  id="bottom-fade-mode"
                  checked={isBottomFadeMode}
                  onCheckedChange={(checked) => setBottomMode(checked ? "fade" : "blackout")}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="below-image-blackout-mode" className="cursor-pointer">Below Image Blackout Mode</Label>
                <Switch
                  id="below-image-blackout-mode"
                  checked={isBelowImageBlackoutMode}
                  onCheckedChange={(checked) => setBottomMode(checked ? "blackout" : "fade")}
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <Label>Height</Label>
                <span className="text-muted-foreground">{bottomFadeHeight[0]}%</span>
              </div>
              <Slider
                value={bottomFadeHeight}
                onValueChange={setBottomFadeHeight}
                min={18}
                max={60}
                step={1}
                disabled={!isBottomFadeMode}
              />
              <div className="flex items-center justify-between text-sm">
                <Label>Visibility</Label>
                <span className="text-muted-foreground">{bottomFadeVisibility[0]}%</span>
              </div>
              <Slider
                value={bottomFadeVisibility}
                onValueChange={setBottomFadeVisibility}
                min={0}
                max={100}
                step={1}
                disabled={!isBottomFadeMode}
              />
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
                disabled={!isBelowImageBlackoutMode}
              />
            </CollapsibleContent>
          </Collapsible>

          <Button type="button" onClick={downloadCanvas}>
            <Download className="mr-2 h-4 w-4" />
            Export PNG
          </Button>
        </Card>

        <Card className="order-1 overflow-hidden p-4 sm:p-6 xl:order-2">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Canvas Preview</h2>
            <p className="text-sm text-muted-foreground">
              The upper area remains visual-first while the lower fade guarantees text readability.
            </p>
          </div>
          <div className="overflow-auto">
            <canvas
              ref={canvasRef}
              className="mx-auto h-auto w-full rounded-xl border border-border bg-black/70 p-3 shadow-2xl"
            />
          </div>
        </Card>
      </div>
    </div>
  )
}
