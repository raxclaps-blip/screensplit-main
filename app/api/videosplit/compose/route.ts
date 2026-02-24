import { randomUUID } from "node:crypto"
import { spawn } from "node:child_process"
import { promises as fs } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { NextResponse } from "next/server"
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg"

export const maxDuration = 300

const TARGET_WIDTH = 1080
const TARGET_HEIGHT = 1920
const TARGET_FPS = 30
const MAX_UPLOAD_BYTES = 200 * 1024 * 1024
const MAX_UPLOAD_DURATION_SECONDS = 121

type TextPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "center-left"
  | "center"
  | "center-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right"

type ComposeControls = {
  direction: "horizontal" | "vertical"
  beforeText: string
  afterText: string
  beforeSubtext: string
  afterSubtext: string
  fontSize: number
  textColor: string
  textBgColor: string
  showTextBackground: boolean
  textBgOpacity: number
  textPosition: TextPosition
  bgColor: string
  bgPadding: number
  brightness: number
  contrast: number
  saturation: number
  enableFade: boolean
  fadeSeconds: number
  includeAudio: boolean
}

type ProbeInfo = {
  durationSeconds: number | null
  hasAudio: boolean
}

type FfmpegCapabilities = {
  versionRaw: string | null
  hasVideoFade: boolean
  hasAudioFade: boolean
  versionAtLeast43: boolean
}

let ffmpegCapabilitiesPromise: Promise<FfmpegCapabilities> | null = null

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function isDurationOverLimit(durationSeconds: number | null | undefined): boolean {
  return typeof durationSeconds === "number" && Number.isFinite(durationSeconds) && durationSeconds > MAX_UPLOAD_DURATION_SECONDS
}

function pickString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback
}

function pickNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback
}

function pickBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback
}

function normalizeControls(raw: unknown): ComposeControls {
  const source = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {}
  const position = source.textPosition
  const safePosition: TextPosition =
    position === "top-left" ||
    position === "top-center" ||
    position === "top-right" ||
    position === "center-left" ||
    position === "center" ||
    position === "center-right" ||
    position === "bottom-left" ||
    position === "bottom-center" ||
    position === "bottom-right"
      ? position
      : "top-right"

  return {
    direction: source.direction === "vertical" ? "vertical" : "horizontal",
    beforeText: pickString(source.beforeText, "Before"),
    afterText: pickString(source.afterText, "After"),
    beforeSubtext: pickString(source.beforeSubtext, ""),
    afterSubtext: pickString(source.afterSubtext, ""),
    fontSize: clamp(Math.round(pickNumber(source.fontSize, 18)), 12, 120),
    textColor: pickString(source.textColor, "#ffffff"),
    textBgColor: pickString(source.textBgColor, "#000000"),
    showTextBackground: pickBoolean(source.showTextBackground, true),
    textBgOpacity: clamp(pickNumber(source.textBgOpacity, 0.85), 0, 1),
    textPosition: safePosition,
    bgColor: pickString(source.bgColor, "#000000"),
    bgPadding: clamp(pickNumber(source.bgPadding, 0.4), 0, 2),
    brightness: clamp(pickNumber(source.brightness, 100), 0, 200),
    contrast: clamp(pickNumber(source.contrast, 100), 0, 200),
    saturation: clamp(pickNumber(source.saturation, 100), 0, 300),
    enableFade: pickBoolean(source.enableFade, true),
    fadeSeconds: clamp(pickNumber(source.fadeSeconds, 0.5), 0, 2),
    includeAudio: pickBoolean(source.includeAudio, true),
  }
}

function toFfmpegColor(input: string, fallback = "0x000000"): string {
  const match = /^#?([0-9a-fA-F]{6})$/.exec(input.trim())
  return match ? `0x${match[1].toUpperCase()}` : fallback
}

function escapeDrawtext(input: string): string {
  return input
    .replace(/\\/g, "\\\\")
    .replace(/:/g, "\\:")
    .replace(/'/g, "\\'")
    .replace(/%/g, "\\%")
    .replace(/\[/g, "\\[")
    .replace(/]/g, "\\]")
    .replace(/\r?\n/g, "\\n")
}

function makeLabel(main: string, sub: string): string {
  const trimmedMain = main.trim()
  const trimmedSub = sub.trim()
  return trimmedSub ? `${trimmedMain}\\n${trimmedSub}` : trimmedMain
}

function getPositionExpr(position: TextPosition, margin: number): { x: string; y: string } {
  const x = position.includes("left")
    ? `${margin}`
    : position.includes("right")
      ? `max(${margin},w-text_w-${margin})`
      : `max(${margin},min((w-text_w)/2,w-text_w-${margin}))`
  const y = position.startsWith("top")
    ? `${margin}`
    : position.startsWith("bottom")
      ? `max(${margin},h-text_h-${margin})`
      : `max(${margin},min((h-text_h)/2,h-text_h-${margin}))`
  return { x, y }
}

function getRenderTextScale(panelWidth: number): number {
  const previewReferenceWidth = 360
  return clamp(Math.max(1, panelWidth) / previewReferenceWidth, 0.8, 8)
}

function buildDrawtext(label: string, controls: ComposeControls, panelWidth: number): string {
  const clean = label.trim()
  if (!clean) return ""

  const scale = getRenderTextScale(panelWidth)
  const renderFontSize = clamp(Math.round(controls.fontSize * scale), 16, 480)
  const margin = Math.max(8, Math.round(20 * scale))
  const { x, y } = getPositionExpr(controls.textPosition, margin)
  const lineSpacing = Math.max(2, Math.round(renderFontSize * 0.2))
  const boxBorder = Math.max(4, Math.round(renderFontSize * controls.bgPadding))

  const args = [
    "font=Sans",
    `text='${escapeDrawtext(clean)}'`,
    `fontcolor=${toFfmpegColor(controls.textColor, "0xFFFFFF")}`,
    `fontsize=${renderFontSize}`,
    `line_spacing=${lineSpacing}`,
    `x=${x}`,
    `y=${y}`,
    `box=${controls.showTextBackground ? 1 : 0}`,
    `boxcolor=${toFfmpegColor(controls.textBgColor, "0x000000")}@${controls.textBgOpacity.toFixed(3)}`,
    `boxborderw=${boxBorder}`,
  ]

  return `drawtext=${args.join(":")}`
}

function buildVideoFilter(inputIndex: number, label: string, controls: ComposeControls, outputLabel: string): string {
  const brightness = clamp((controls.brightness - 100) / 100, -1, 1).toFixed(3)
  const contrast = clamp(controls.contrast / 100, 0, 3).toFixed(3)
  const saturation = clamp(controls.saturation / 100, 0, 3).toFixed(3)

  const chain: string[] = [
    `scale=${TARGET_WIDTH}:${TARGET_HEIGHT}:force_original_aspect_ratio=decrease`,
    `pad=${TARGET_WIDTH}:${TARGET_HEIGHT}:(ow-iw)/2:(oh-ih)/2:color=${toFfmpegColor(controls.bgColor, "0x000000")}`,
    "setsar=1",
    `fps=${TARGET_FPS}`,
    `eq=brightness=${brightness}:contrast=${contrast}:saturation=${saturation}`,
    "format=yuv420p",
  ]

  const drawtext = buildDrawtext(label, controls, TARGET_WIDTH)
  if (drawtext) {
    chain.push(drawtext)
  }

  return `[${inputIndex}:v]${chain.join(",")}[${outputLabel}]`
}

function parseDuration(stderr: string): number | null {
  const match = /Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/.exec(stderr)
  if (!match) return null

  const hours = Number(match[1])
  const minutes = Number(match[2])
  const seconds = Number(match[3])
  if (!Number.isFinite(hours) || !Number.isFinite(minutes) || !Number.isFinite(seconds)) {
    return null
  }

  return hours * 3600 + minutes * 60 + seconds
}

function runProcess(binary: string, args: string[], allowNonZero = false): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(binary, args, { windowsHide: true })
    let stdout = ""
    let stderr = ""

    child.stdout.on("data", (chunk) => {
      stdout += String(chunk)
    })

    child.stderr.on("data", (chunk) => {
      stderr += String(chunk)
    })

    child.on("error", (error) => reject(error))
    child.on("close", (code) => {
      const exitCode = code ?? 1
      if (!allowNonZero && exitCode !== 0) {
        return reject(new Error(stderr || `Process failed with exit code ${exitCode}`))
      }
      resolve({ code: exitCode, stdout, stderr })
    })
  })
}

async function probeVideo(ffmpegPath: string, inputPath: string): Promise<ProbeInfo> {
  const result = await runProcess(ffmpegPath, ["-hide_banner", "-i", inputPath, "-f", "null", "-"], true)
  return {
    durationSeconds: parseDuration(result.stderr),
    hasAudio: /Audio:\s/.test(result.stderr),
  }
}

function getFileExtension(name: string, fallback: string): string {
  const ext = path.extname(name || "").toLowerCase()
  if (!ext || ext.length > 8) return fallback
  return ext
}

function parseFfmpegVersion(versionText: string): { major: number; minor: number; patch: number } | null {
  const firstLine = versionText.split(/\r?\n/, 1)[0] ?? ""
  const match = /ffmpeg version\s+n?(\d+)\.(\d+)(?:\.(\d+))?/i.exec(firstLine)
  if (!match) return null

  const major = Number(match[1])
  const minor = Number(match[2])
  const patch = Number(match[3] ?? "0")
  if (!Number.isFinite(major) || !Number.isFinite(minor) || !Number.isFinite(patch)) {
    return null
  }
  return { major, minor, patch }
}

function isVersionAtLeast(version: { major: number; minor: number; patch: number } | null, major: number, minor: number): boolean {
  if (!version) return false
  if (version.major > major) return true
  if (version.major < major) return false
  return version.minor >= minor
}

async function getFfmpegCapabilities(ffmpegPath: string): Promise<FfmpegCapabilities> {
  if (!ffmpegCapabilitiesPromise) {
    ffmpegCapabilitiesPromise = (async () => {
      const [versionResult, filtersResult] = await Promise.all([
        runProcess(ffmpegPath, ["-hide_banner", "-version"], true),
        runProcess(ffmpegPath, ["-hide_banner", "-filters"], true),
      ])

      const versionText = `${versionResult.stdout}\n${versionResult.stderr}`
      const parsedVersion = parseFfmpegVersion(versionText)
      const versionAtLeast43 = isVersionAtLeast(parsedVersion, 4, 3)
      const filterText = `${filtersResult.stdout}\n${filtersResult.stderr}`

      // Match complete filter names to avoid partial word collisions.
      const hasVideoFade = /(^|\s)xfade(\s|$)/m.test(filterText)
      const hasAudioFade = /(^|\s)acrossfade(\s|$)/m.test(filterText)

      return {
        versionRaw: versionText.split(/\r?\n/, 1)[0] ?? null,
        hasVideoFade,
        hasAudioFade,
        versionAtLeast43,
      }
    })().catch((error) => {
      console.warn("Failed to detect FFmpeg capabilities:", error)
      return {
        versionRaw: null,
        hasVideoFade: false,
        hasAudioFade: false,
        versionAtLeast43: false,
      }
    })
  }

  return ffmpegCapabilitiesPromise
}

export async function POST(request: Request) {
  const ffmpegPath = ffmpegInstaller.path
  const workDir = path.join(tmpdir(), `videosplit-${randomUUID()}`)

  try {
    const formData = await request.formData()
    const before = formData.get("before")
    const after = formData.get("after")
    const controlsRaw = formData.get("controls")

    if (!(before instanceof File) || !(after instanceof File)) {
      return NextResponse.json({ error: "Both before and after video files are required." }, { status: 400 })
    }

    if (before.size <= 0 || after.size <= 0) {
      return NextResponse.json({ error: "Uploaded files are empty." }, { status: 400 })
    }

    if (before.size > MAX_UPLOAD_BYTES || after.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: "Each uploaded file must be 200MB or smaller." }, { status: 413 })
    }

    let parsedControls: unknown = {}
    if (typeof controlsRaw === "string") {
      try {
        parsedControls = JSON.parse(controlsRaw)
      } catch {
        return NextResponse.json({ error: "Invalid controls payload." }, { status: 400 })
      }
    }
    const controls = normalizeControls(parsedControls)

    await fs.mkdir(workDir, { recursive: true })

    const beforePath = path.join(workDir, `before${getFileExtension(before.name, ".mp4")}`)
    const afterPath = path.join(workDir, `after${getFileExtension(after.name, ".mp4")}`)
    const outputPath = path.join(workDir, "output.mp4")

    await fs.writeFile(beforePath, Buffer.from(await before.arrayBuffer()))
    await fs.writeFile(afterPath, Buffer.from(await after.arrayBuffer()))

    const [beforeProbe, afterProbe] = await Promise.all([probeVideo(ffmpegPath, beforePath), probeVideo(ffmpegPath, afterPath)])
    if (isDurationOverLimit(beforeProbe.durationSeconds) || isDurationOverLimit(afterProbe.durationSeconds)) {
      return NextResponse.json(
        { error: `Each uploaded video must be ${MAX_UPLOAD_DURATION_SECONDS} seconds or shorter.` },
        { status: 413 }
      )
    }

    const firstIsBefore = controls.direction !== "vertical"
    const firstInput = firstIsBefore ? 0 : 1
    const secondInput = firstIsBefore ? 1 : 0
    const firstLabel = firstIsBefore
      ? makeLabel(controls.beforeText, controls.beforeSubtext)
      : makeLabel(controls.afterText, controls.afterSubtext)
    const secondLabel = firstIsBefore
      ? makeLabel(controls.afterText, controls.afterSubtext)
      : makeLabel(controls.beforeText, controls.beforeSubtext)

    const includeAudio = controls.includeAudio && beforeProbe.hasAudio && afterProbe.hasAudio
    const firstProbe = firstIsBefore ? beforeProbe : afterProbe
    const fadeRequested = controls.enableFade && controls.fadeSeconds > 0
    let fadeGateReason: string | null = null
    let fadeCapabilities: FfmpegCapabilities | null = null

    if (fadeRequested) {
      fadeCapabilities = await getFfmpegCapabilities(ffmpegPath)

      if (firstProbe.durationSeconds === null) {
        fadeGateReason = "Fade was skipped because the first clip duration could not be determined."
      } else if (firstProbe.durationSeconds <= controls.fadeSeconds + 0.05) {
        fadeGateReason = "Fade was skipped because the first clip is too short for the selected fade duration."
      } else if (!fadeCapabilities.versionAtLeast43) {
        const versionLabel = fadeCapabilities.versionRaw ?? "unknown version"
        fadeGateReason = `Fade was skipped because FFmpeg is not new enough (${versionLabel}).`
      } else if (!fadeCapabilities.hasVideoFade) {
        fadeGateReason = "Fade was skipped because the FFmpeg build does not include the xfade filter."
      } else if (includeAudio && !fadeCapabilities.hasAudioFade) {
        fadeGateReason = "Fade was skipped because the FFmpeg build does not include the acrossfade filter."
      }
    }

    const canApplyFade = fadeRequested && !fadeGateReason
    const fadeDuration = canApplyFade ? controls.fadeSeconds.toFixed(3) : "0.000"
    const fadeOffset =
      canApplyFade && firstProbe.durationSeconds !== null ? Math.max(0, firstProbe.durationSeconds - controls.fadeSeconds).toFixed(3) : "0.000"

    const buildFilterGraph = (withText: boolean, withFade: boolean): string => {
      const filters: string[] = [
        buildVideoFilter(firstInput, withText ? firstLabel : "", controls, "v0"),
        buildVideoFilter(secondInput, withText ? secondLabel : "", controls, "v1"),
      ]

      if (withFade) {
        filters.push(`[v0][v1]xfade=transition=fadeblack:duration=${fadeDuration}:offset=${fadeOffset}[vout]`)
      } else {
        filters.push("[v0][v1]concat=n=2:v=1:a=0[vout]")
      }

      if (includeAudio) {
        filters.push(`[${firstInput}:a]aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo[a0]`)
        filters.push(`[${secondInput}:a]aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo[a1]`)
        if (withFade) {
          filters.push(`[a0][a1]acrossfade=d=${fadeDuration}[aout]`)
        } else {
          filters.push("[a0][a1]concat=n=2:v=0:a=1[aout]")
        }
      }

      return filters.join(";")
    }

    const runCompose = async (withText: boolean, withFade: boolean) => {
      const args: string[] = [
        "-y",
        "-i",
        beforePath,
        "-i",
        afterPath,
        "-filter_complex",
        buildFilterGraph(withText, withFade),
        "-map",
        "[vout]",
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-crf",
        "22",
        "-pix_fmt",
        "yuv420p",
        "-movflags",
        "+faststart",
      ]

      if (includeAudio) {
        args.push("-map", "[aout]", "-c:a", "aac", "-b:a", "192k")
      } else {
        args.push("-an")
      }

      args.push(outputPath)
      await runProcess(ffmpegPath, args)
    }

    const attempts: Array<{ withText: boolean; withFade: boolean }> = [
      { withText: true, withFade: canApplyFade },
    ]
    if (canApplyFade) {
      attempts.push({ withText: true, withFade: false })
    }
    attempts.push({ withText: false, withFade: false })

    let chosenAttempt: { withText: boolean; withFade: boolean } | null = null
    let lastError: unknown = null

    for (const attempt of attempts) {
      try {
        await runCompose(attempt.withText, attempt.withFade)
        chosenAttempt = attempt
        break
      } catch (error) {
        lastError = error
        console.warn(`Composition attempt failed (text=${attempt.withText}, fade=${attempt.withFade}):`, error)
      }
    }

    if (!chosenAttempt) {
      throw lastError instanceof Error ? lastError : new Error("All composition attempts failed.")
    }

    const textOverlayFallbackUsed = !chosenAttempt.withText
    const runtimeFadeFallbackUsed = canApplyFade && !chosenAttempt.withFade
    const usedFade = chosenAttempt.withFade

    const outputBuffer = await fs.readFile(outputPath)
    const headers = new Headers({
      "Content-Type": "video/mp4",
      "Content-Disposition": `attachment; filename="videosplit-portrait-${Date.now()}.mp4"`,
      "Cache-Control": "no-store",
    })

    const warnings: string[] = []
    if (controls.includeAudio && !includeAudio) {
      warnings.push("One or both uploads had no audio track. Exported video without audio.")
    }
    if (fadeRequested && !usedFade) {
      if (runtimeFadeFallbackUsed) {
        warnings.push("Fade failed in this FFmpeg runtime and was automatically disabled for this export.")
      } else if (fadeGateReason) {
        warnings.push(fadeGateReason)
      } else if (fadeCapabilities?.versionRaw) {
        warnings.push(`Fade was skipped by capability gate (${fadeCapabilities.versionRaw}).`)
      } else {
        warnings.push("Fade was skipped by FFmpeg capability gate.")
      }
    }
    if (textOverlayFallbackUsed) {
      warnings.push("Text overlay fallback was applied because drawtext failed in this FFmpeg build.")
    }
    if (warnings.length > 0) {
      headers.set("x-videosplit-warning", warnings.join(" "))
    }

    return new NextResponse(new Uint8Array(outputBuffer), { status: 200, headers })
  } catch (error) {
    console.error("Video composition failed:", error)
    return NextResponse.json({ error: "Failed to compose video." }, { status: 500 })
  } finally {
    await fs.rm(workDir, { recursive: true, force: true }).catch(() => {})
  }
}
