"use client"

import type React from "react"
import { useCallback, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Loader2, Play, RotateCcw } from "lucide-react"
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

function clampAspect(value: number, min = 0.3, max = 3): number {
  if (!Number.isFinite(value) || value <= 0) return 9 / 16
  return Math.min(Math.max(value, min), max)
}

function readAspect(video: HTMLVideoElement): number {
  if (video.videoWidth <= 0 || video.videoHeight <= 0) return 9 / 16
  return clampAspect(video.videoWidth / video.videoHeight)
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
  const beforePanelRef = useRef<HTMLVideoElement>(null)
  const beforePanelBgRef = useRef<HTMLVideoElement>(null)
  const afterPanelRef = useRef<HTMLVideoElement>(null)
  const afterPanelBgRef = useRef<HTMLVideoElement>(null)
  const [isComposing, setIsComposing] = useState(false)
  const [composeProgress, setComposeProgress] = useState(0)
  const [composeMessage, setComposeMessage] = useState("")
  const [failedJobId, setFailedJobId] = useState<string | null>(null)
  const [failedJobError, setFailedJobError] = useState("")
  const [isPlaying, setIsPlaying] = useState(false)
  const [previewClip, setPreviewClip] = useState<"before" | "after">("before")
  const [sideBySideActiveClip, setSideBySideActiveClip] = useState<"before" | "after">("before")
  const [beforeAspect, setBeforeAspect] = useState(9 / 16)
  const [afterAspect, setAfterAspect] = useState(9 / 16)
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
      if (controls.compositionMode === "side-by-side-sequential") {
        const beforeEl = beforePanelRef.current
        const beforeBgEl = beforePanelBgRef.current
        const afterEl = afterPanelRef.current
        const afterBgEl = afterPanelBgRef.current
        if (!beforeEl || !beforeBgEl || !afterEl || !afterBgEl) return

        await Promise.all([waitLoaded(beforeEl), waitLoaded(beforeBgEl), waitLoaded(afterEl), waitLoaded(afterBgEl)])

        beforeEl.pause()
        beforeBgEl.pause()
        afterEl.pause()
        afterBgEl.pause()
        beforeEl.currentTime = 0
        beforeBgEl.currentTime = 0
        afterEl.currentTime = 0
        afterBgEl.currentTime = 0

        setSideBySideActiveClip("before")
        beforeEl.muted = false
        afterEl.muted = true
        try {
          await Promise.all([beforeEl.play(), beforeBgEl.play()])
        } catch { }
        await waitEnded(beforeEl)

        beforeEl.pause()
        beforeBgEl.pause()
        setSideBySideActiveClip("after")
        beforeEl.muted = true
        afterEl.currentTime = 0
        afterBgEl.currentTime = 0
        afterEl.muted = false
        try {
          await Promise.all([afterEl.play(), afterBgEl.play()])
        } catch { }
        await waitEnded(afterEl)
        afterEl.pause()
        afterBgEl.pause()
        return
      }

      const order: ("before" | "after")[] = controls.direction === "vertical" ? ["after", "before"] : ["before", "after"]
      setPreviewClip(order[0])
      await Promise.resolve()
      let v = previewRef.current
      if (!v) return
      await waitLoaded(v)
      v.currentTime = 0
      try {
        await v.play()
      } catch { }
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
      } catch { }

      if (doFade) {
        setFadeVisible(false)
        await sleep(fadeMs)
      }
      await waitEnded(v)
    } finally {
      setFadeVisible(false)
      setIsPlaying(false)
    }
  }, [controls.compositionMode, controls.enableFade, controls.fadeSeconds, controls.direction])

  const pollJobAndDownload = useCallback(async (jobId: string, toastId: string | number) => {
    const pollDelayMs = 1000
    for (; ;) {
      const statusRes = await fetch(`/api/videosplit/jobs/${jobId}`, { cache: "no-store" })
      if (!statusRes.ok) {
        const err = await statusRes.json().catch(() => null)
        const detail = typeof err?.error === "string" ? err.error : `Status check failed (${statusRes.status})`
        throw new Error(detail)
      }

      const payload = await statusRes.json().catch(() => null)
      const job = payload?.job
      if (!job) {
        throw new Error("Invalid status payload from server")
      }

      const pct = typeof job.progress === "number" ? Math.round(job.progress) : 0
      const msg = typeof job.message === "string" ? job.message : "Processing..."
      setComposeProgress(pct)
      setComposeMessage(msg)
      toast.loading(`${msg} (${pct}%)`, { id: toastId })

      if (job.status === "queued" || job.status === "processing") {
        await new Promise((resolve) => setTimeout(resolve, pollDelayMs))
        continue
      }

      if (job.status === "failed") {
        const errorText = typeof job.error === "string" && job.error.trim().length > 0 ? job.error : "Video render failed."
        setFailedJobId(jobId)
        setFailedJobError(errorText)
        throw new Error(errorText)
      }

      if (job.status !== "completed") {
        throw new Error(`Unexpected job status: ${String(job.status)}`)
      }

      toast.loading("Downloading final MP4...", { id: toastId })
      const downloadRes = await fetch(`/api/videosplit/jobs/${jobId}/download`, { cache: "no-store" })
      if (!downloadRes.ok) {
        const err = await downloadRes.json().catch(() => null)
        const detail = typeof err?.error === "string" ? err.error : `Download failed (${downloadRes.status})`
        throw new Error(detail)
      }

      const blob = await downloadRes.blob()
      if (blob.size === 0) {
        throw new Error("Server returned an empty file")
      }

      downloadBlob(blob, `videosplit-portrait-${Date.now()}.mp4`)

      const warningHeader = downloadRes.headers.get("x-videosplit-warning")
      const warningFromStatus = Array.isArray(job.warnings) ? (job.warnings as unknown[]).filter((w) => typeof w === "string").join(" ") : ""
      const warning = warningHeader || warningFromStatus
      if (warning) {
        toast.warning("Export completed with fallback", {
          description: warning,
          id: toastId,
        })
      } else {
        toast.success("MP4 download started!", { id: toastId })
      }

      setFailedJobId(null)
      setFailedJobError("")
      break
    }
  }, [])

  const composeAndDownload = useCallback(async () => {
    if (!beforeFile || !afterFile) {
      toast.error("Setup error", { description: "Videos are not ready for upload." })
      return
    }

    setIsComposing(true)
    setComposeProgress(0)
    setComposeMessage("Uploading videos...")
    setFailedJobId(null)
    setFailedJobError("")
    const toastId = toast.loading("Uploading videos...")

    try {
      const formData = new FormData()
      formData.append("before", beforeFile)
      formData.append("after", afterFile)
      formData.append("controls", JSON.stringify(controls))

      const response = await fetch("/api/videosplit/jobs", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const err = await response.json().catch(() => null)
        const detail = typeof err?.error === "string" ? err.error : `Request failed (${response.status})`
        throw new Error(detail)
      }

      const created = await response.json().catch(() => null)
      const jobId = created?.job?.id as string | undefined
      if (!jobId) {
        throw new Error("Server did not return a job id")
      }

      await pollJobAndDownload(jobId, toastId)
    } catch (e: any) {
      console.error(e)
      toast.error("Composition failed", {
        description: e?.message ?? "Unable to compose video",
        id: toastId,
      })
    } finally {
      setIsComposing(false)
      setComposeMessage("")
    }
  }, [beforeFile, afterFile, controls, pollJobAndDownload])

  const retryFailedJob = useCallback(async () => {
    if (!failedJobId) return

    setIsComposing(true)
    setComposeProgress(0)
    setComposeMessage("Retrying failed job...")
    const toastId = toast.loading("Retrying failed job...")

    try {
      const response = await fetch(`/api/videosplit/jobs/${failedJobId}/retry`, { method: "POST" })
      if (!response.ok) {
        const err = await response.json().catch(() => null)
        const detail = typeof err?.error === "string" ? err.error : `Retry failed (${response.status})`
        throw new Error(detail)
      }

      const payload = await response.json().catch(() => null)
      const jobId = (payload?.job?.id as string | undefined) ?? failedJobId
      setFailedJobId(null)
      setFailedJobError("")

      await pollJobAndDownload(jobId, toastId)
    } catch (e: any) {
      console.error(e)
      setFailedJobId(failedJobId)
      setFailedJobError(e?.message ?? "Retry failed")
      toast.error("Retry failed", {
        description: e?.message ?? "Unable to retry failed job",
        id: toastId,
      })
    } finally {
      setIsComposing(false)
      setComposeMessage("")
    }
  }, [failedJobId, pollJobAndDownload])

  const safeBeforeAspect = clampAspect(beforeAspect)
  const safeAfterAspect = clampAspect(afterAspect)
  const sideBySideAspectRatio =
    controls.direction === "vertical"
      ? 1 / (1 / safeBeforeAspect + 1 / safeAfterAspect)
      : safeBeforeAspect + safeAfterAspect
  const previewAspectRatio =
    controls.compositionMode === "side-by-side-sequential"
      ? sideBySideAspectRatio
      : previewClip === "before"
        ? safeBeforeAspect
        : safeAfterAspect
  const previewMaxWidth =
    previewAspectRatio >= 1 ? 760 : controls.compositionMode === "side-by-side-sequential" ? 320 : 360

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6">
      <Button variant="ghost" onClick={onBack} disabled={isComposing} className="mb-6 gap-2">
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
                {isComposing ? `Processing ${Math.round(composeProgress)}%` : "Download MP4"}
              </Button>
              {failedJobId ? (
                <Button size="sm" onClick={retryFailedJob} disabled={isComposing} className="w-full gap-2 rounded-full sm:w-auto" variant="outline">
                  <RotateCcw className="h-4 w-4" />
                  Retry Failed Job
                </Button>
              ) : null}
            </div>
          </div>
          {isComposing ? <p className="text-xs text-muted-foreground">{composeMessage || "Processing..."}</p> : null}
          {!isComposing && failedJobId ? <p className="text-xs text-destructive">Last render failed: {failedJobError || "Unknown error"}</p> : null}

          <div className="overflow-hidden rounded-2xl border border-border bg-secondary/50 p-2 sm:p-3 lg:sticky lg:top-2">
            <div
              className="relative mx-auto max-w-full"
              style={{
                backgroundColor: controls.bgColor,
                aspectRatio: previewAspectRatio,
                width: `min(100%, ${previewMaxWidth}px)`,
              }}
            >
              {controls.compositionMode === "side-by-side-sequential" ? (
                <div
                  className="grid h-full w-full overflow-hidden rounded-lg"
                  style={
                    controls.direction === "vertical"
                      ? { gridTemplateRows: `${1 / safeBeforeAspect}fr ${1 / safeAfterAspect}fr` }
                      : { gridTemplateColumns: `${safeBeforeAspect}fr ${safeAfterAspect}fr` }
                  }
                >
                  <PreviewPanel
                    src={beforeSrc}
                    which="before"
                    active={sideBySideActiveClip === "before"}
                    controls={controls}
                    videoRef={beforePanelRef}
                    bgVideoRef={beforePanelBgRef}
                    onLoadedMetadata={setBeforeAspect}
                  />
                  <PreviewPanel
                    src={afterSrc}
                    which="after"
                    active={sideBySideActiveClip === "after"}
                    controls={controls}
                    videoRef={afterPanelRef}
                    bgVideoRef={afterPanelBgRef}
                    onLoadedMetadata={setAfterAspect}
                  />
                </div>
              ) : (
                <>
                  <video
                    key={previewClip}
                    ref={previewRef}
                    src={previewClip === "before" ? beforeSrc : afterSrc}
                    controls
                    playsInline
                    onLoadedMetadata={(event) => {
                      const aspect = readAspect(event.currentTarget)
                      if (previewClip === "before") {
                        setBeforeAspect(aspect)
                      } else {
                        setAfterAspect(aspect)
                      }
                    }}
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
                </>
              )}
            </div>
          </div>
        </div>

        <VideoControls state={controls} onChange={onControlsChange} />
      </div>
    </div>
  )
}

function PreviewPanel({
  src,
  which,
  active,
  controls,
  videoRef,
  bgVideoRef,
  onLoadedMetadata,
}: {
  src: string
  which: "before" | "after"
  active: boolean
  controls: VideoControlsState
  videoRef: React.RefObject<HTMLVideoElement | null>
  bgVideoRef: React.RefObject<HTMLVideoElement | null>
  onLoadedMetadata: (aspect: number) => void
}) {
  return (
    <div
      className={`relative h-full w-full overflow-hidden transition-opacity ${active ? "opacity-100" : "opacity-95"}`}
    >
      <video
        ref={bgVideoRef}
        src={src}
        playsInline
        preload="auto"
        muted
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover opacity-75 blur-xl"
      />
      <video
        ref={videoRef}
        src={src}
        playsInline
        preload="auto"
        muted={!active}
        onLoadedMetadata={(event) => onLoadedMetadata(readAspect(event.currentTarget))}
        className="relative h-full w-full object-contain"
        style={
          {
            filter: `brightness(${controls.brightness}%) contrast(${controls.contrast}%) saturate(${controls.saturation}%) grayscale(${controls.grayscale}%) sepia(${controls.sepia}%)`,
          } as React.CSSProperties
        }
      />
      <div className="pointer-events-none absolute inset-0">
        <OverlayLabel which={which} controls={controls} />
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
  const basePadding = Math.max(4, Math.round(controls.fontSize * controls.bgPadding))
  const horizontalPadding =
    controls.bgShape === "hexagon"
      ? Math.round(basePadding + controls.fontSize * 0.6)
      : controls.bgShape === "circle"
        ? Math.round(basePadding + controls.fontSize * 0.45)
        : Math.round(basePadding + controls.fontSize * 0.1)

  // Replicate canvas vertical padding algorithm: total padding is 1.5x basePadding, split top and bottom (0.75x each)
  // HTML text rendering usually leaves more space at the bottom for descenders.
  // To visually center non-descender text like "BEFORE" or "AFTER" we need more top padding.
  const opticalOffset = Math.max(1, Math.round(controls.fontSize * 0.08))

  const verticalPaddingTop =
    controls.bgShape === "hexagon"
      ? Math.round(basePadding * 0.75 + controls.fontSize * 0.25) + opticalOffset
      : controls.bgShape === "circle"
        ? Math.round(basePadding * 0.75 + controls.fontSize * 0.35) + opticalOffset
        : Math.round(basePadding * 0.75) + opticalOffset

  const verticalPaddingBottom = Math.max(0, (
    controls.bgShape === "hexagon"
      ? Math.round(basePadding * 0.75 + controls.fontSize * 0.25) - opticalOffset
      : controls.bgShape === "circle"
        ? Math.round(basePadding * 0.75 + controls.fontSize * 0.35) - opticalOffset
        : Math.round(basePadding * 0.75) - opticalOffset
  ))

  const shapeMinWidth =
    controls.bgShape === "hexagon"
      ? Math.round(controls.fontSize * 4)
      : controls.bgShape === "circle"
        ? Math.round(controls.fontSize * 3)
        : undefined
  const hardClipShape = controls.bgShape === "hexagon" || controls.bgShape === "circle"
  const contentInsetX =
    controls.bgShape === "hexagon"
      ? Math.round(controls.fontSize * 0.35)
      : controls.bgShape === "circle"
        ? Math.round(controls.fontSize * 0.25)
        : 0
  const labelText = (label || "").trim()
  const subtextText = (subtext || "").trim()
  const estimatedMainWidth = Math.ceil(labelText.length * controls.fontSize * 0.62)
  const estimatedSubWidth = subtextText.length > 0 ? Math.ceil(subtextText.length * Math.round(controls.fontSize * 0.5) * 0.52) : 0
  const contentMinWidth = Math.max(estimatedMainWidth, estimatedSubWidth, 0)
  const minimumShapeWidth = Math.max(shapeMinWidth ?? 0, contentMinWidth + (horizontalPadding + contentInsetX + 2) * 2)

  return (
    <div style={style} className="flex flex-col items-center">
      <div
        style={{
          position: "relative",
          display: "inline-flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: controls.textColor,
          padding: `${verticalPaddingTop}px ${horizontalPadding}px ${verticalPaddingBottom}px`,
          width: "fit-content",
          minWidth: minimumShapeWidth,
          textAlign: "center",
          boxSizing: "border-box",
          borderRadius: controls.showTextBackground ? radius : undefined,
          clipPath: controls.showTextBackground && controls.bgShape === "hexagon" ? clipPath : undefined,
          overflow: controls.showTextBackground && hardClipShape ? "hidden" : "visible",
        }}
      >
        {controls.showTextBackground ? (
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background: bg,
              backgroundColor: !bg ? controls.textBgColor : undefined,
              opacity: controls.textBgOpacity,
              borderRadius: radius,
              clipPath,
              border: controls.borderWidth > 0 ? `${controls.borderWidth}px solid ${controls.borderColor}` : undefined,
              backdropFilter: controls.blurAmount > 0 ? `blur(${controls.blurAmount}px)` : undefined,
            }}
          />
        ) : null}
        <div
          style={{
              position: "relative",
              zIndex: 1,
              boxSizing: "border-box",
              paddingInline: contentInsetX + 2,
              display: "inline-block",
              fontSize: controls.fontSize,
              fontWeight: controls.mainTextBold ? 700 : 400,
              fontStyle: controls.mainTextItalic ? "italic" : "normal",
              fontFamily: `${controls.fontFamily}, sans-serif`,
              lineHeight: 1.1,
              whiteSpace: "nowrap",
              textWrap: "nowrap",
              wordBreak: "normal",
              overflowWrap: "normal",
          }}
        >
          {label}
        </div>
        {subtext?.trim() ? (
          <div
            style={{
              position: "relative",
              zIndex: 1,
              marginTop: Math.round(controls.fontSize * 0.3), // Spacing between label and subtext
              boxSizing: "border-box",
              paddingInline: contentInsetX + 2,
              fontSize: Math.round(controls.fontSize * 0.5),
              opacity: 0.9,
              lineHeight: 1.2,
              fontWeight: controls.subtextBold ? 700 : 400,
              fontStyle: controls.subtextItalic ? "italic" : "normal",
              fontFamily: `${controls.fontFamily}, sans-serif`,
              whiteSpace: "normal",
              wordBreak: "break-word",
              overflowWrap: "break-word",
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
