"use client"

import type React from "react"
import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Loader2, Play } from "lucide-react"
import { toast } from "sonner"
import { VideoControls, type VideoControlsState, type TextPosition } from "@/components/videosplit/video-controls"
import { FFmpeg } from "@ffmpeg/ffmpeg"
import { fetchFile } from "@ffmpeg/util"

// FFmpeg singleton to avoid reloading core every download
let __ffmpeg__: FFmpeg | null = null
let __ffmpegLoaded__: Promise<void> | null = null
const FFMPEG_CORE = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js"
const FFMPEG_WASM = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm"

function mediaRecorderMp4Mime(): string | null {
  const candidates = [
    'video/mp4;codecs="avc1.42E01E,mp4a.40.2"',
    'video/mp4;codecs=h264,aac',
    'video/mp4'
  ]
  for (const m of candidates) {
    try { if ((window as any).MediaRecorder?.isTypeSupported?.(m)) return m } catch {}
  }
  return null
}

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

async function getFFmpeg(): Promise<FFmpeg> {
  if (!__ffmpeg__) {
    __ffmpeg__ = new FFmpeg()
  }
  if (!__ffmpegLoaded__) {
    __ffmpegLoaded__ = (__ffmpeg__.load({ coreURL: FFMPEG_CORE, wasmURL: FFMPEG_WASM }) as unknown as Promise<void>)
  }
  await __ffmpegLoaded__
  return __ffmpeg__
}

interface VideoComposerProps {
  beforeSrc: string
  afterSrc: string
  onBack: () => void
  controls: VideoControlsState
  onControlsChange: (patch: Partial<VideoControlsState>) => void
}

export function VideoComposer({ beforeSrc, afterSrc, onBack, controls, onControlsChange }: VideoComposerProps) {
  const beforeRef = useRef<HTMLVideoElement>(null)
  const afterRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const previewRef = useRef<HTMLVideoElement>(null)
  const [isComposing, setIsComposing] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [previewClip, setPreviewClip] = useState<"before" | "after">("before")
  const [fadeVisible, setFadeVisible] = useState(false)
  const targetW = 1080
  const targetH = 1920

  const applyShapePath = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, shape: VideoControlsState['bgShape']) => {
    ctx.beginPath()
    if (shape === 'rounded' || shape === 'pill') {
      const r = shape === 'pill' ? Math.min(w, h) / 2 : 10
      // roundRect polyfill
      const x = 0, y = 0
      ctx.moveTo(x + r, y)
      ctx.arcTo(x + w, y, x + w, y + r, r)
      ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
      ctx.arcTo(x, y + h, x, y + h - r, r)
      ctx.arcTo(x, y, x + r, y, r)
      ctx.closePath()
    } else if (shape === 'circle') {
      const r = Math.min(w, h) / 2
      ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2)
    } else {
      // hexagon
      const cx = w / 2, cy = h / 2
      const r = Math.min(w, h) / 2
      for (let i = 0; i < 6; i++) {
        const ang = (Math.PI / 3) * i - Math.PI / 6
        const px = cx + r * Math.cos(ang)
        const py = cy + r * Math.sin(ang)
        if (i === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.closePath()
    }
  }, [])

  const drawFit = useCallback((ctx: CanvasRenderingContext2D, video: HTMLVideoElement) => {
    const scale = Math.min(targetW / video.videoWidth, targetH / video.videoHeight)
    const w = video.videoWidth * scale
    const h = video.videoHeight * scale
    const x = (targetW - w) / 2
    const y = (targetH - h) / 2
    // background
    ctx.fillStyle = controls.bgColor
    ctx.fillRect(0, 0, targetW, targetH)
    // apply video filters
    const filter = `brightness(${controls.brightness}%) contrast(${controls.contrast}%) saturate(${controls.saturation}%) grayscale(${controls.grayscale}%) sepia(${controls.sepia}%)`
    const prevFilter = (ctx as any).filter
    ;(ctx as any).filter = filter
    ctx.drawImage(video, x, y, w, h)
    ;(ctx as any).filter = prevFilter || 'none'
  }, [targetW, targetH, controls.bgColor, controls.brightness, controls.contrast, controls.saturation, controls.grayscale, controls.sepia])

  // Play comparison with fade-through-black between clips
  const handlePlayComparison = useCallback(async () => {
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
    const waitLoaded = (el: HTMLVideoElement) => new Promise<void>((resolve) => {
      if (el.readyState >= 2) return resolve()
      const on = () => { el.removeEventListener("loadeddata", on); resolve() }
      el.addEventListener("loadeddata", on, { once: true })
    })
    const waitEnded = (el: HTMLVideoElement) => new Promise<void>((resolve) => {
      const on = () => { el.removeEventListener("ended", on); resolve() }
      el.addEventListener("ended", on)
    })

    setIsPlaying(true)
    try {
      // Determine order by direction
      const order: ("before" | "after")[] = controls.direction === "vertical" ? ["after", "before"] : ["before", "after"]
      // initial clip
      setPreviewClip(order[0])
      await Promise.resolve()
      let v = previewRef.current
      if (!v) return
      await waitLoaded(v)
      v.currentTime = 0
      try { await v.play() } catch {}
      await waitEnded(v)

      // Fade through black (if enabled)
      const doFade = controls.enableFade && controls.fadeSeconds > 0
      const fadeMs = Math.max(50, Math.round(controls.fadeSeconds * 1000))
      if (doFade) {
        setFadeVisible(true)
        await sleep(fadeMs)
      }

      // Switch to second clip behind black
      setPreviewClip(order[1])
      await Promise.resolve()
      v = previewRef.current
      if (!v) return
      await waitLoaded(v)
      v.currentTime = 0
      try { await v.play() } catch {}

      // Fade out to reveal AFTER
      if (doFade) {
        setFadeVisible(false)
        await sleep(fadeMs)
      }
      await waitEnded(v)
    } finally {
      setFadeVisible(false)
      setIsPlaying(false)
    }
  }, [beforeSrc, afterSrc, controls.enableFade, controls.fadeSeconds, controls.direction])

  const composeAndDownload = useCallback(async () => {
    const before = beforeRef.current
    const after = afterRef.current
    const canvas = canvasRef.current
    if (!before || !after || !canvas) {
      toast.error("Setup error", { description: "Video sources not ready" })
      return
    }

    // Ensure metadata is loaded
    const waitLoaded = (v: HTMLVideoElement) =>
      new Promise<void>((resolve) => {
        if (v.readyState >= 1) return resolve()
        v.addEventListener("loadedmetadata", () => resolve(), { once: true })
      })

    setIsComposing(true)
    const toastId = toast.loading("Composing vertical video...")
    let ac: AudioContext | null = null
    let stream: MediaStream | null = null

    try {
      await Promise.all([waitLoaded(before), waitLoaded(after)])

      // Portrait output 1080x1920
      canvas.width = targetW
      canvas.height = targetH
      const ctx = canvas.getContext("2d")

      if (!ctx) {
        throw new Error("Failed to get canvas context")
      }

      // Seek to start
      before.currentTime = 0
      after.currentTime = 0
      
      // Wait a bit for seek to complete
      await new Promise(r => setTimeout(r, 100))

      // Capture stream from canvas and optionally include audio
      const REC_FPS = 24
      const canvasStream = canvas.captureStream(REC_FPS)
      if (!canvasStream || canvasStream.getVideoTracks().length === 0) {
        throw new Error("Failed to capture canvas stream")
      }
      
      let audioCtl:
        | {
            enableAfterAudio: () => void
            disableBeforeAudio: () => void
            beforeGain: GainNode
            afterGain: GainNode
            context: AudioContext
          }
        | null = null

      if (controls.includeAudio) {
        try {
          before.muted = false
          after.muted = false
          ac = new (window.AudioContext || (window as any).webkitAudioContext)()
          const dest = ac.createMediaStreamDestination()
          const beforeSource = ac.createMediaElementSource(before)
          const afterSource = ac.createMediaElementSource(after)
          const beforeGain = ac.createGain()
          const afterGain = ac.createGain()
          beforeGain.gain.value = 1
          afterGain.gain.value = 0
          beforeSource.connect(beforeGain).connect(dest)
          afterSource.connect(afterGain).connect(dest)

          audioCtl = {
            enableAfterAudio: () => {
              afterGain.gain.setValueAtTime(1, ac!.currentTime)
            },
            disableBeforeAudio: () => {
              beforeGain.gain.setValueAtTime(0, ac!.currentTime)
            },
            beforeGain,
            afterGain,
            context: ac,
          }

          const audioTracks = dest.stream.getAudioTracks()
          stream = new MediaStream([canvasStream.getVideoTracks()[0], ...(audioTracks.length > 0 ? audioTracks : [])])
        } catch (audioError) {
          console.warn("Audio setup failed, exporting without audio:", audioError)
          before.muted = true
          after.muted = true
          stream = canvasStream
          toast.warning("Audio disabled", {
            description: "Could not attach audio in this browser session. Exporting video-only.",
            id: toastId,
          })
        }
      } else {
        before.muted = true
        after.muted = true
        stream = canvasStream
      }

      // Prefer native MP4 recording when supported (fastest, no transcode)
      const mp4Mime = mediaRecorderMp4Mime()
      let usedMp4 = false
      let mimeType = "video/webm"
      let recorder: MediaRecorder
      try {
        if (mp4Mime) {
          mimeType = mp4Mime
          usedMp4 = true
          recorder = new MediaRecorder(stream, { mimeType })
        } else {
          throw new Error("mp4 not supported")
        }
      } catch {
        usedMp4 = false
        mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
          ? "video/webm;codecs=vp9,opus"
          : MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")
          ? "video/webm;codecs=vp8,opus"
          : "video/webm"
        recorder = new MediaRecorder(stream, { mimeType })
      }

      const chunks: BlobPart[] = []
      recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data)

      // Pre-render overlay text (transparent background). Background is painted each frame.
      const makeOverlay = (label: string, subtext: string) => {
        const tmp = document.createElement('canvas')
        const tctx = tmp.getContext('2d')!
        const fontSize = controls.fontSize
        const subSize = Math.round(fontSize * 0.5)
        const lineSpacing = Math.round(fontSize * 0.3)
        const mainStyle = `${controls.mainTextItalic ? 'italic ' : ''}${controls.mainTextBold ? 'bold ' : ''}${fontSize}px ${controls.fontFamily}, sans-serif`
        tctx.font = mainStyle
        const mainW = tctx.measureText(label).width
        let subW = 0
        if (subtext.trim()) {
          const subStyle = `${controls.subtextItalic ? 'italic ' : ''}${controls.subtextBold ? 'bold ' : ''}${subSize}px ${controls.fontFamily}, sans-serif`
          tctx.font = subStyle
          subW = tctx.measureText(subtext).width
        }
        const maxW = Math.max(mainW, subW)
        const padding = Math.round(fontSize * controls.bgPadding)
        const bgW = Math.ceil(maxW + padding * 2)
        const totalH = subtext.trim() ? fontSize + lineSpacing + subSize : fontSize
        const bgH = Math.ceil(totalH + padding * 1.5)
        tmp.width = bgW
        tmp.height = bgH
        const ctx2 = tmp.getContext('2d')!
        // text only (centered)
        ctx2.textAlign = 'center'
        ctx2.textBaseline = 'middle'
        ctx2.fillStyle = controls.textColor
        const cx = bgW / 2
        const cy = bgH / 2
        const mainY = subtext.trim() ? cy - (lineSpacing + subSize) / 2 : cy
        ctx2.font = mainStyle
        ctx2.fillText(label, cx, mainY)
        if (subtext.trim()) {
          const subStyle = `${controls.subtextItalic ? 'italic ' : ''}${controls.subtextBold ? 'bold ' : ''}${subSize}px ${controls.fontFamily}, sans-serif`
          ctx2.font = subStyle
          ctx2.globalAlpha = 0.9
          const subY = mainY + fontSize / 2 + lineSpacing + subSize / 2
          ctx2.fillText(subtext, cx, subY)
          ctx2.globalAlpha = 1
        }
        // compute position
        let x = 0, y = 0
        const pos = controls.textPosition
        if (pos.includes('left')) x = 20
        else if (pos.includes('right')) x = targetW - bgW - 20
        else x = (targetW - bgW) / 2
        if (pos.startsWith('top')) y = 20
        else if (pos.startsWith('bottom')) y = targetH - bgH - 20
        else y = (targetH - bgH) / 2
        return { image: tmp, x, y, w: bgW, h: bgH }
      }
      const overlayBefore = makeOverlay(controls.beforeText, controls.beforeSubtext)
      const overlayAfter = makeOverlay(controls.afterText, controls.afterSubtext)

      // Helper: draw overlay background shape (solid or gradient) with opacity and border
      const drawOverlayBG = (ctx: CanvasRenderingContext2D, ov: { x: number; y: number; w: number; h: number }) => {
        ctx.save()
        ctx.translate(ov.x, ov.y)
        // shape path
        applyShapePath(ctx, ov.w, ov.h, controls.bgShape)
        // fill style
        ctx.globalAlpha = Math.max(0, Math.min(1, controls.textBgOpacity))
        if (controls.useGradient) {
          const ang = (controls.gradientAngle * Math.PI) / 180
          const cx = ov.w / 2
          const cy = ov.h / 2
          const r = Math.max(ov.w, ov.h) / 2
          const x0 = cx + Math.cos(ang) * -r
          const y0 = cy + Math.sin(ang) * -r
          const x1 = cx + Math.cos(ang) * r
          const y1 = cy + Math.sin(ang) * r
          const grad = ctx.createLinearGradient(x0, y0, x1, y1)
          grad.addColorStop(0, controls.gradientColor1)
          grad.addColorStop(1, controls.gradientColor2)
          ctx.fillStyle = grad
        } else {
          ctx.fillStyle = controls.textBgColor
        }
        ctx.fill()
        ctx.globalAlpha = 1
        if (controls.borderWidth > 0) {
          ctx.lineWidth = controls.borderWidth
          ctx.strokeStyle = controls.borderColor
          applyShapePath(ctx, ov.w, ov.h, controls.bgShape)
          ctx.stroke()
        }
        ctx.restore()
      }

      let anim = 0
      const frameInterval = 1000 / REC_FPS
      let lastTs = 0
      const loop = (
        video: HTMLVideoElement,
        overlay: { image: HTMLCanvasElement; x: number; y: number; w: number; h: number },
        onStart?: () => void
      ): Promise<void> =>
        new Promise((resolve, reject) => {
          const cleanup = () => {
            cancelAnimationFrame(anim)
            video.removeEventListener("ended", onEnded)
          }

          const onEnded = () => {
            cleanup()
            resolve()
          }

          const step = (ts?: number) => {
            try {
              const now = ts ?? performance.now()
              if (now - lastTs >= frameInterval) {
                lastTs = now
                ctx.clearRect(0, 0, targetW, targetH)
                drawFit(ctx, video)
                drawOverlayBG(ctx, overlay)
                ctx.drawImage(overlay.image, overlay.x, overlay.y)
              }
              anim = requestAnimationFrame(step)
            } catch (err) {
              cleanup()
              reject(err instanceof Error ? err : new Error("Rendering failed"))
            }
          }

          video.addEventListener("ended", onEnded, { once: true })
          try {
            onStart?.()
            const playPromise = video.play()
            if (playPromise && typeof playPromise.then === "function") {
              playPromise
                .then(() => {
                  anim = requestAnimationFrame(step)
                })
                .catch((err) => {
                  cleanup()
                  reject(err instanceof Error ? err : new Error("Playback failed"))
                })
              return
            }
            anim = requestAnimationFrame(step)
          } catch (err) {
            cleanup()
            reject(err instanceof Error ? err : new Error("Playback failed"))
          }
        })

      recorder.start()
      toast("Recording started...", { id: toastId })
      
      const firstIsBefore = controls.direction !== 'vertical'
      const firstV = firstIsBefore ? before : after
      const secondV = firstIsBefore ? after : before
      const firstOverlay = firstIsBefore ? overlayBefore : overlayAfter
      const secondOverlay = firstIsBefore ? overlayAfter : overlayBefore

      await loop(firstV, firstOverlay)
      // Optional fade-through-black and audio crossfade
      if (controls.enableFade && controls.fadeSeconds > 0) {
        const frames = Math.max(1, Math.round(controls.fadeSeconds * 30))
        for (let i = 0; i < frames; i++) {
          const t = i / frames
          // fade out current (first) clip
          drawFit(ctx, firstV)
          const currentOv = firstOverlay
          drawOverlayBG(ctx, currentOv)
          ctx.drawImage(currentOv.image, currentOv.x, currentOv.y)
          ctx.fillStyle = `rgba(0,0,0,${t})`
          ctx.fillRect(0, 0, targetW, targetH)
          await new Promise((r) => requestAnimationFrame(() => r(null)))
        }
        if (audioCtl) {
          const now = audioCtl.context?.currentTime || 0
          const fade = controls.fadeSeconds
          try {
            audioCtl.beforeGain.gain.cancelScheduledValues(now)
            audioCtl.afterGain.gain.cancelScheduledValues(now)
            audioCtl.beforeGain.gain.setValueAtTime(audioCtl.beforeGain.gain.value, now)
            audioCtl.afterGain.gain.setValueAtTime(audioCtl.afterGain.gain.value, now)
            audioCtl.beforeGain.gain.linearRampToValueAtTime(0, now + fade)
            audioCtl.afterGain.gain.linearRampToValueAtTime(1, now + fade)
          } catch {
            audioCtl.disableBeforeAudio()
          }
        }
      } else if (audioCtl) {
        audioCtl.disableBeforeAudio()
      }
      await loop(secondV, secondOverlay, () => {
        if (audioCtl) {
          audioCtl.enableAfterAudio()
        }
      })

      const stoppedBlob = new Promise<Blob>((resolve) => {
        recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }))
      })

      // Give a moment for last frames
      await new Promise(r => setTimeout(r, 200))
      recorder.stop()

      const blob = await stoppedBlob
      
      if (!blob || blob.size === 0) {
        throw new Error("Recording failed: empty video")
      }
      
      // If we recorded MP4 natively, skip transcode
      if (usedMp4) {
        downloadBlob(blob, `videosplit-portrait-${Date.now()}.mp4`)
        toast.success("MP4 download started!", { id: toastId })
        return
      }

      toast.loading("Transcoding to MP4...", { id: toastId })
      
      try {
        const ffmpeg = await getFFmpeg()
        toast.loading("Processing video...", { id: toastId })
        await ffmpeg.writeFile("input.webm", await fetchFile(blob))
        
        await ffmpeg.exec([
          "-i", "input.webm",
          "-c:v", "libx264",
          "-preset", "veryfast",
          "-pix_fmt", "yuv420p",
          "-crf", "24",
          "-c:a", "aac",
          "-b:a", "128k",
          "-movflags", "+faststart",
          "output.mp4"
        ])
        
        const data = await ffmpeg.readFile("output.mp4") as Uint8Array
        const mp4Blob = new Blob([data.slice().buffer], { type: "video/mp4" })
        
        downloadBlob(mp4Blob, `videosplit-portrait-${Date.now()}.mp4`)
        
        toast.success("MP4 download started!", { id: toastId })
      } catch (err: any) {
        console.error("Transcode error:", err)
        downloadBlob(blob, `videosplit-portrait-${Date.now()}.webm`)
        toast.warning("Downloaded WebM fallback", {
          description: "MP4 transcode failed in this browser session.",
          id: toastId,
        })
      }
    } catch (e: any) {
      console.error(e)
      toast.error("Composition failed", { 
        description: e?.message ?? "Unable to compose video",
        id: toastId 
      })
    } finally {
      if (stream) {
        for (const track of stream.getTracks()) {
          track.stop()
        }
      }
      if (ac) {
        try {
          await ac.close()
        } catch {}
      }
      before.muted = true
      after.muted = true
      setIsComposing(false)
    }
  }, [controls, targetW, targetH, drawFit, applyShapePath])

  // Preload ffmpeg (once) in the background if native MP4 is not supported
  useEffect(() => {
    const mp4 = mediaRecorderMp4Mime()
    if (!mp4) {
      const t = setTimeout(() => { getFFmpeg().catch(() => {}) }, 500)
      return () => clearTimeout(t)
    }
  }, [])

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 sm:py-6">
      <Button variant="ghost" onClick={onBack} className="mb-6 gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Upload
      </Button>

      <div className="grid gap-4 sm:gap-6 lg:gap-8 lg:grid-cols-[1fr_380px]">
        {/* Preview */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h2 className="text-lg sm:text-xl font-bold">Preview</h2>
            <div className="flex gap-2 flex-col sm:flex-row w-full sm:w-auto">
              <Button size="sm" onClick={handlePlayComparison} disabled={isPlaying || isComposing} className="gap-2 rounded-full w-full sm:w-auto" variant="outline">
                <Play className="h-4 w-4" />
                Play Comparison
              </Button>
              <Button size="sm" onClick={composeAndDownload} disabled={isComposing} className="gap-2 rounded-full w-full sm:w-auto">
                {isComposing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                {isComposing ? "Processing..." : "Download MP4"}
              </Button>
            </div>
          </div>

          <div className="lg:sticky lg:top-2 overflow-hidden rounded-2xl border border-border bg-secondary/50 p-2 sm:p-3">
            {/* Hidden sources and canvas used for export */}
            <video ref={beforeRef} src={beforeSrc} className="hidden" muted playsInline />
            <video ref={afterRef} src={afterSrc} className="hidden" muted playsInline />
            <canvas 
              ref={canvasRef} 
              className="hidden" 
              width={targetW} 
              height={targetH}
              style={{ width: `${targetW}px`, height: `${targetH}px` }}
            />
            {/* Visible video preview with native controls and live overlays */}
            <div
              className="relative mx-auto h-[45vh] sm:h-[50vh] lg:h-[calc(100dvh-360px)] max-h-[50vh] lg:max-h-[calc(100dvh-360px)] aspect-[9/16] max-w-full w-auto"
              style={{ backgroundColor: controls.bgColor }}
            >
              <video
                key={previewClip}
                ref={previewRef}
                src={previewClip === "before" ? beforeSrc : afterSrc}
                controls
                playsInline
                className="h-full w-full rounded-lg object-contain"
                style={{ filter: `brightness(${controls.brightness}%) contrast(${controls.contrast}%) saturate(${controls.saturation}%) grayscale(${controls.grayscale}%) sepia(${controls.sepia}%)` } as React.CSSProperties}
              />
              <div className="pointer-events-none absolute inset-0">
                <OverlayLabel
                  which={previewClip}
                  controls={controls}
                />
              </div>
              {/* Fade overlay for Play Comparison transition */}
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

          <p className="hidden text-xs text-muted-foreground">Export produces a single vertical video: Before segment then After segment with labels. Audio can be included with optional crossfade.</p>
        </div>

        {/* Controls */}
        <VideoControls state={controls} onChange={onControlsChange} />
      </div>
    </div>
  )
}

function OverlayLabel({ which, controls }: { which: "before" | "after"; controls: VideoControlsState }) {
  const label = which === "before" ? controls.beforeText : controls.afterText
  const subtext = which === "before" ? controls.beforeSubtext : controls.afterSubtext
  const style = getPositionStyle(controls.textPosition)
  const bg = controls.useGradient
    ? `linear-gradient(${controls.gradientAngle}deg, ${controls.gradientColor1}, ${controls.gradientColor2})`
    : undefined
  const bgColor = !controls.useGradient ? (controls.textBgColor) : undefined
  const radius = controls.bgShape === 'pill' ? 9999 : controls.bgShape === 'rounded' ? 10 : controls.bgShape === 'circle' ? 9999 : 0
  const clipPath = controls.bgShape === 'hexagon' ? 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' : undefined
  return (
    <div
      style={style}
      className="flex flex-col items-center"
    >
      <div
        style={{
          background: bg,
          backgroundColor: !bg ? (controls.textBgColor) : undefined,
          opacity: controls.textBgOpacity,
          color: controls.textColor,
          padding: `${Math.round(controls.fontSize * controls.bgPadding)}px ${Math.round(controls.fontSize * controls.bgPadding + controls.fontSize * 0.1)}px`,
          borderRadius: radius,
          clipPath,
          border: controls.borderWidth > 0 ? `${controls.borderWidth}px solid ${controls.borderColor}` : undefined,
          backdropFilter: controls.blurAmount > 0 ? `blur(${controls.blurAmount}px)` : undefined,
        }}
      >
        <div style={{
          fontSize: controls.fontSize,
          fontWeight: controls.mainTextBold ? 700 : 400,
          fontStyle: controls.mainTextItalic ? 'italic' : 'normal',
          fontFamily: `${controls.fontFamily}, sans-serif`,
          lineHeight: 1,
        }}>{label}</div>
        {subtext?.trim() ? (
          <div style={{
            fontSize: Math.round(controls.fontSize * 0.5),
            opacity: 0.9,
            lineHeight: 1.2,
            fontWeight: controls.subtextBold ? 700 : 400,
            fontStyle: controls.subtextItalic ? 'italic' : 'normal',
            fontFamily: `${controls.fontFamily}, sans-serif`,
          }}>{subtext}</div>
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
