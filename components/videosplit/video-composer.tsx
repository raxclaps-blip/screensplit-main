"use client"

import type React from "react"
import { useCallback, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Loader2, Play } from "lucide-react"
import { toast } from "sonner"
import { VideoControls, type VideoControlsState, type TextPosition } from "@/components/videosplit/video-controls"

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 200)
}

interface VideoComposerProps {
  beforeSrc: string
  afterSrc: string
  beforeFile: File
  afterFile: File
  onBack: () => void
  controls: VideoControlsState
  onControlsChange: (patch: Partial<VideoControlsState>) => void
}

export function VideoComposer({
  beforeSrc,
  afterSrc,
  beforeFile,
  afterFile,
  onBack,
  controls,
  onControlsChange,
}: VideoComposerProps) {
  const previewRef = useRef<HTMLVideoElement>(null)
  const [isComposing, setIsComposing] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [previewClip, setPreviewClip] = useState<"before" | "after">("before")
  const [fadeVisible, setFadeVisible] = useState(false)

  // Play comparison with fade-through-black between clips
  const handlePlayComparison = useCallback(async () => {
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
    const waitLoaded = (el: HTMLVideoElement) =>
      new Promise<void>((resolve) => {
        if (el.readyState >= 2) return resolve()
        const on = () => {
          el.removeEventListener("loadeddata", on)
          resolve()
        }
        el.addEventListener("loadeddata", on, { once: true })
      })
    const waitEnded = (el: HTMLVideoElement) =>
      new Promise<void>((resolve) => {
        const on = () => {
          el.removeEventListener("ended", on)
          resolve()
        }
        el.addEventListener("ended", on)
      })

    setIsPlaying(true)
    try {
      const order: ("before" | "after")[] = controls.direction === "vertical" ? ["after", "before"] : ["before", "after"]
      setPreviewClip(order[0])
      await Promise.resolve()
      let v = previewRef.current
      if (!v) return
      await waitLoaded(v)
      v.currentTime = 0
      try {
        await v.play()
      } catch {}
      await waitEnded(v)

      const doFade = controls.enableFade && controls.fadeSeconds > 0
      const fadeMs = Math.max(50, Math.round(controls.fadeSeconds * 1000))
      if (doFade) {
        setFadeVisible(true)
        await sleep(fadeMs)
      }

      setPreviewClip(order[1])
      await Promise.resolve()
      v = previewRef.current
      if (!v) return
      await waitLoaded(v)
      v.currentTime = 0
      try {
        await v.play()
      } catch {}

      if (doFade) {
        setFadeVisible(false)
        await sleep(fadeMs)
      }
      await waitEnded(v)
    } finally {
      setFadeVisible(false)
      setIsPlaying(false)
    }
  }, [controls.enableFade, controls.fadeSeconds, controls.direction])

  const composeAndDownload = useCallback(async () => {
    if (!beforeFile || !afterFile) {
      toast.error("Setup error", { description: "Videos are not ready for upload." })
      return
    }

    setIsComposing(true)
    const toastId = toast.loading("Uploading videos for server render...")

    try {
      const formData = new FormData()
      formData.append("before", beforeFile)
      formData.append("after", afterFile)
      formData.append("controls", JSON.stringify(controls))

      const response = await fetch("/api/videosplit/compose", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const err = await response.json().catch(() => null)
        const detail = typeof err?.error === "string" ? err.error : `Request failed (${response.status})`
        throw new Error(detail)
      }

      toast.loading("Downloading final MP4...", { id: toastId })

      const blob = await response.blob()
      if (blob.size === 0) {
        throw new Error("Server returned an empty file")
      }

      downloadBlob(blob, `videosplit-portrait-${Date.now()}.mp4`)

      const warning = response.headers.get("x-videosplit-warning")
      if (warning) {
        toast.warning("Export completed with fallback", {
          description: warning,
          id: toastId,
        })
      } else {
        toast.success("MP4 download started!", { id: toastId })
      }
    } catch (e: any) {
      console.error(e)
      toast.error("Composition failed", {
        description: e?.message ?? "Unable to compose video",
        id: toastId,
      })
    } finally {
      setIsComposing(false)
    }
  }, [beforeFile, afterFile, controls])

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6">
      <Button variant="ghost" onClick={onBack} className="mb-6 gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Upload
      </Button>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1fr_380px] lg:gap-8">
        <div className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-bold sm:text-xl">Preview</h2>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <Button
                size="sm"
                onClick={handlePlayComparison}
                disabled={isPlaying || isComposing}
                className="w-full gap-2 rounded-full sm:w-auto"
                variant="outline"
              >
                <Play className="h-4 w-4" />
                Play Comparison
              </Button>
              <Button size="sm" onClick={composeAndDownload} disabled={isComposing} className="w-full gap-2 rounded-full sm:w-auto">
                {isComposing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                {isComposing ? "Processing..." : "Download MP4"}
              </Button>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-secondary/50 p-2 sm:p-3 lg:sticky lg:top-2">
            <div
              className="relative mx-auto aspect-[9/16] h-[45vh] max-h-[50vh] w-auto max-w-full sm:h-[50vh] lg:h-[calc(100dvh-360px)] lg:max-h-[calc(100dvh-360px)]"
              style={{ backgroundColor: controls.bgColor }}
            >
              <video
                key={previewClip}
                ref={previewRef}
                src={previewClip === "before" ? beforeSrc : afterSrc}
                controls
                playsInline
                className="h-full w-full rounded-lg object-contain"
                style={
                  {
                    filter: `brightness(${controls.brightness}%) contrast(${controls.contrast}%) saturate(${controls.saturation}%) grayscale(${controls.grayscale}%) sepia(${controls.sepia}%)`,
                  } as React.CSSProperties
                }
              />
              <div className="pointer-events-none absolute inset-0">
                <OverlayLabel which={previewClip} controls={controls} />
              </div>
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  backgroundColor: "black",
                  opacity: fadeVisible ? 1 : 0,
                  transition: `opacity ${Math.max(controls.fadeSeconds, 0.05) * 1000}ms linear`,
                }}
              />
            </div>
          </div>
        </div>

        <VideoControls state={controls} onChange={onControlsChange} />
      </div>
    </div>
  )
}

function OverlayLabel({ which, controls }: { which: "before" | "after"; controls: VideoControlsState }) {
  const label = which === "before" ? controls.beforeText : controls.afterText
  const subtext = which === "before" ? controls.beforeSubtext : controls.afterSubtext
  const style = getPositionStyle(controls.textPosition)
  const bg = controls.useGradient ? `linear-gradient(${controls.gradientAngle}deg, ${controls.gradientColor1}, ${controls.gradientColor2})` : undefined
  const radius = controls.bgShape === "pill" ? 9999 : controls.bgShape === "rounded" ? 10 : controls.bgShape === "circle" ? 9999 : 0
  const clipPath = controls.bgShape === "hexagon" ? "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)" : undefined

  return (
    <div style={style} className="flex flex-col items-center">
      <div
        style={{
          background: bg,
          backgroundColor: !bg ? controls.textBgColor : undefined,
          opacity: controls.textBgOpacity,
          color: controls.textColor,
          padding: `${Math.round(controls.fontSize * controls.bgPadding)}px ${Math.round(controls.fontSize * controls.bgPadding + controls.fontSize * 0.1)}px`,
          borderRadius: radius,
          clipPath,
          border: controls.borderWidth > 0 ? `${controls.borderWidth}px solid ${controls.borderColor}` : undefined,
          backdropFilter: controls.blurAmount > 0 ? `blur(${controls.blurAmount}px)` : undefined,
        }}
      >
        <div
          style={{
            fontSize: controls.fontSize,
            fontWeight: controls.mainTextBold ? 700 : 400,
            fontStyle: controls.mainTextItalic ? "italic" : "normal",
            fontFamily: `${controls.fontFamily}, sans-serif`,
            lineHeight: 1,
          }}
        >
          {label}
        </div>
        {subtext?.trim() ? (
          <div
            style={{
              fontSize: Math.round(controls.fontSize * 0.5),
              opacity: 0.9,
              lineHeight: 1.2,
              fontWeight: controls.subtextBold ? 700 : 400,
              fontStyle: controls.subtextItalic ? "italic" : "normal",
              fontFamily: `${controls.fontFamily}, sans-serif`,
            }}
          >
            {subtext}
          </div>
        ) : null}
      </div>
    </div>
  )
}

function getPositionStyle(pos: TextPosition): React.CSSProperties {
  const base: React.CSSProperties = { position: "absolute" }
  const margin = 20

  switch (pos) {
    case "top-left":
      return { ...base, top: margin, left: margin }
    case "top-center":
      return { ...base, top: margin, left: "50%", transform: "translateX(-50%)" }
    case "top-right":
      return { ...base, top: margin, right: margin }
    case "center-left":
      return { ...base, top: "50%", left: margin, transform: "translateY(-50%)" }
    case "center":
      return { ...base, top: "50%", left: "50%", transform: "translate(-50%, -50%)" }
    case "center-right":
      return { ...base, top: "50%", right: margin, transform: "translateY(-50%)" }
    case "bottom-left":
      return { ...base, bottom: margin, left: margin }
    case "bottom-center":
      return { ...base, bottom: margin, left: "50%", transform: "translateX(-50%)" }
    case "bottom-right":
      return { ...base, bottom: margin, right: margin }
  }
}
