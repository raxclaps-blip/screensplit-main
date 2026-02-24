import { randomUUID } from "node:crypto"
import { spawn } from "node:child_process"
import { promises as fs } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg"
import { isRedisRequired, redis } from "@/lib/redis"

const TARGET_WIDTH = 1080
const TARGET_HEIGHT = 1920
const TARGET_FPS = 30
const MAX_UPLOAD_BYTES = 200 * 1024 * 1024
const MAX_UPLOAD_DURATION_SECONDS = 121
const MAX_PENDING_JOBS = 20
const JOB_TTL_MS = 60 * 60 * 1000
const JOB_TTL_SECONDS = 60 * 60
const REDIS_JOB_PREFIX = "videosplit:job:"
const REDIS_PENDING_KEY = "videosplit:queue:pending"
const REDIS_LOCK_KEY = "videosplit:queue:lock:v2"
const REDIS_LOCK_TTL_SECONDS = 90

export type VideoSplitJobStatus = "queued" | "processing" | "completed" | "failed"

export type VideoSplitJob = {
  id: string
  status: VideoSplitJobStatus
  progress: number
  message: string
  warnings: string[]
  error: string | null
  createdAt: string
  updatedAt: string
}

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

type CompositionMode = "sequential" | "side-by-side-sequential"

type ComposeControls = {
  compositionMode: CompositionMode
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
  width: number | null
  height: number | null
}

type FfmpegCapabilities = {
  versionRaw: string | null
  hasVideoFade: boolean
  hasAudioFade: boolean
  versionAtLeast43: boolean
}

type VideoSplitJobInternal = {
  id: string
  status: VideoSplitJobStatus
  progress: number
  message: string
  warnings: string[]
  error: string | null
  createdAtMs: number
  updatedAtMs: number
  workDir: string
  beforePath: string
  afterPath: string
  outputPath: string
  controls: ComposeControls
  beforeProbe?: ProbeInfo | null
  afterProbe?: ProbeInfo | null
}

type QueueState = {
  jobs: Map<string, VideoSplitJobInternal>
  pending: string[]
  running: boolean
  capabilitiesPromise: Promise<FfmpegCapabilities> | null
  workerToken: string
}

class JobApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __VIDEOSPLIT_QUEUE_STATE__: QueueState | undefined
}

function getState(): QueueState {
  if (!globalThis.__VIDEOSPLIT_QUEUE_STATE__) {
    globalThis.__VIDEOSPLIT_QUEUE_STATE__ = {
      jobs: new Map<string, VideoSplitJobInternal>(),
      pending: [],
      running: false,
      capabilitiesPromise: null,
      workerToken: randomUUID(),
    }
  }
  return globalThis.__VIDEOSPLIT_QUEUE_STATE__
}

function nowMs(): number {
  return Date.now()
}

function redisEnabled(): boolean {
  return Boolean(redis)
}

function getRedisOrThrow() {
  if (!redis) {
    if (isRedisRequired()) {
      throw new JobApiError(503, "Redis is required but unavailable.")
    }
    return null
  }
  return redis
}

function redisJobKey(id: string): string {
  return `${REDIS_JOB_PREFIX}${id}`
}

async function redisSaveJob(job: VideoSplitJobInternal): Promise<void> {
  const client = getRedisOrThrow()
  if (!client) return
  await (client as any).set(redisJobKey(job.id), JSON.stringify(job), { ex: JOB_TTL_SECONDS })
}

async function redisLoadJob(id: string): Promise<VideoSplitJobInternal | null> {
  const client = getRedisOrThrow()
  if (!client) return null
  const raw = (await (client as any).get(redisJobKey(id))) as unknown
  if (typeof raw !== "string" || raw.length === 0) return null
  try {
    const parsed = JSON.parse(raw) as VideoSplitJobInternal
    if (!parsed || typeof parsed !== "object" || typeof parsed.id !== "string") return null
    return parsed
  } catch {
    return null
  }
}

async function redisPendingLength(): Promise<number> {
  const client = getRedisOrThrow()
  if (!client) return 0
  const len = (await (client as any).llen(REDIS_PENDING_KEY)) as unknown
  return typeof len === "number" && Number.isFinite(len) ? len : 0
}

async function redisEnqueue(id: string): Promise<void> {
  const client = getRedisOrThrow()
  if (!client) return
  await (client as any).rpush(REDIS_PENDING_KEY, id)
}

async function redisQueueContains(id: string): Promise<boolean> {
  const client = getRedisOrThrow()
  if (!client) return false
  const values = (await (client as any).lrange(REDIS_PENDING_KEY, 0, -1)) as unknown
  if (!Array.isArray(values)) return false
  return values.includes(id)
}

async function redisPeekQueueHead(): Promise<string | null> {
  const client = getRedisOrThrow()
  if (!client) return null
  const value = (await (client as any).lindex(REDIS_PENDING_KEY, 0)) as unknown
  return typeof value === "string" && value.length > 0 ? value : null
}

async function redisPopQueueHead(): Promise<string | null> {
  const client = getRedisOrThrow()
  if (!client) return null
  const value = (await (client as any).lpop(REDIS_PENDING_KEY)) as unknown
  return typeof value === "string" && value.length > 0 ? value : null
}

async function redisAcquireWorkerLock(workerToken: string): Promise<boolean> {
  const client = getRedisOrThrow()
  if (!client) return false

  const current = (await (client as any).get(REDIS_LOCK_KEY)) as unknown
  if (current === workerToken) {
    await (client as any).expire(REDIS_LOCK_KEY, REDIS_LOCK_TTL_SECONDS)
    return true
  }

  const result = (await (client as any).set(REDIS_LOCK_KEY, workerToken, {
    nx: true,
    ex: REDIS_LOCK_TTL_SECONDS,
  })) as unknown
  return result === "OK" || result === true
}

async function redisReleaseWorkerLock(workerToken: string): Promise<void> {
  const client = getRedisOrThrow()
  if (!client) return
  const current = (await (client as any).get(REDIS_LOCK_KEY)) as unknown
  if (current === workerToken) {
    await (client as any).del(REDIS_LOCK_KEY)
  }
}

function toPublicJob(job: VideoSplitJobInternal): VideoSplitJob {
  return {
    id: job.id,
    status: job.status,
    progress: job.progress,
    message: job.message,
    warnings: [...job.warnings],
    error: job.error,
    createdAt: new Date(job.createdAtMs).toISOString(),
    updatedAt: new Date(job.updatedAtMs).toISOString(),
  }
}

function updateJob(job: VideoSplitJobInternal, patch: Partial<Pick<VideoSplitJobInternal, "status" | "progress" | "message" | "warnings" | "error">>) {
  if (patch.status) job.status = patch.status
  if (typeof patch.progress === "number") job.progress = clamp(patch.progress, 0, 100)
  if (typeof patch.message === "string") job.message = patch.message
  if (patch.warnings) job.warnings = [...patch.warnings]
  if (patch.error !== undefined) job.error = patch.error
  job.updatedAtMs = nowMs()
  void redisSaveJob(job).catch((error) => {
    console.error("Failed to persist VideoSplit job update:", error)
  })
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function isDurationOverLimit(durationSeconds: number | null | undefined): boolean {
  return typeof durationSeconds === "number" && Number.isFinite(durationSeconds) && durationSeconds > MAX_UPLOAD_DURATION_SECONDS
}

function getDurationLimitError(beforeDuration: number | null, afterDuration: number | null): string | null {
  const beforeTooLong = isDurationOverLimit(beforeDuration)
  const afterTooLong = isDurationOverLimit(afterDuration)
  if (!beforeTooLong && !afterTooLong) return null
  if (beforeTooLong && afterTooLong) {
    return `Before and after videos must each be ${MAX_UPLOAD_DURATION_SECONDS} seconds or shorter.`
  }
  return beforeTooLong
    ? `The before video must be ${MAX_UPLOAD_DURATION_SECONDS} seconds or shorter.`
    : `The after video must be ${MAX_UPLOAD_DURATION_SECONDS} seconds or shorter.`
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
  const compositionMode = source.compositionMode
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
    compositionMode: compositionMode === "side-by-side-sequential" ? "side-by-side-sequential" : "sequential",
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

function getPreviewPanelReferenceWidth(controls: ComposeControls): number {
  if (controls.compositionMode === "side-by-side-sequential") {
    return controls.direction === "horizontal" ? 160 : 320
  }
  return 360
}

function getRenderTextScale(controls: ComposeControls, panelWidth: number): number {
  const safePanelWidth = Math.max(1, panelWidth)
  const previewReferenceWidth = getPreviewPanelReferenceWidth(controls)
  return clamp(safePanelWidth / previewReferenceWidth, 0.8, 8)
}

function buildDrawtext(label: string, controls: ComposeControls, panelWidth: number): string {
  const clean = label.trim()
  if (!clean) return ""

  const scale = getRenderTextScale(controls, panelWidth)
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
    "fix_bounds=1",
  ]

  return `drawtext=${args.join(":")}`
}

function buildVideoFilter(inputIndex: number, label: string, controls: ComposeControls, outputLabel: string): string {
  return buildVideoFilterForSize(inputIndex, label, controls, outputLabel, TARGET_WIDTH, TARGET_HEIGHT)
}

function buildVideoFilterForSize(
  inputIndex: number,
  label: string,
  controls: ComposeControls,
  outputLabel: string,
  width: number,
  height: number,
  fitMode: "contain" | "cover" | "contain-blur-bg" = "contain"
): string {
  const brightness = clamp((controls.brightness - 100) / 100, -1, 1).toFixed(3)
  const contrast = clamp(controls.contrast / 100, 0, 3).toFixed(3)
  const saturation = clamp(controls.saturation / 100, 0, 3).toFixed(3)

  const drawtext = buildDrawtext(label, controls, width)

  if (fitMode === "contain-blur-bg") {
    const srcBase = `${outputLabel}_src`
    const bgSrc = `${srcBase}bg`
    const fgSrc = `${srcBase}fg`
    const bgProcessed = `${outputLabel}_bg`
    const fgProcessed = `${outputLabel}_fg`
    const baseOut = drawtext ? `${outputLabel}_base` : outputLabel

    const parts: string[] = [
      `[${inputIndex}:v]split=2[${bgSrc}][${fgSrc}]`,
      `[${bgSrc}]scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height},setsar=1,fps=${TARGET_FPS},eq=brightness=${brightness}:contrast=${contrast}:saturation=${saturation},gblur=sigma=16:steps=2,format=yuv420p[${bgProcessed}]`,
      `[${fgSrc}]scale=${width}:${height}:force_original_aspect_ratio=decrease,setsar=1,fps=${TARGET_FPS},eq=brightness=${brightness}:contrast=${contrast}:saturation=${saturation},format=yuv420p[${fgProcessed}]`,
      `[${bgProcessed}][${fgProcessed}]overlay=(W-w)/2:(H-h)/2[${baseOut}]`,
    ]

    if (!drawtext) {
      return parts.join(";")
    }
    return `${parts.join(";")};[${baseOut}]${drawtext}[${outputLabel}]`
  }

  const chain: string[] =
    fitMode === "cover"
      ? [
          `scale=${width}:${height}:force_original_aspect_ratio=increase`,
          `crop=${width}:${height}`,
          "setsar=1",
          `fps=${TARGET_FPS}`,
          `eq=brightness=${brightness}:contrast=${contrast}:saturation=${saturation}`,
          "format=yuv420p",
        ]
      : [
          `scale=${width}:${height}:force_original_aspect_ratio=decrease`,
          `pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:color=${toFfmpegColor(controls.bgColor, "0x000000")}`,
          "setsar=1",
          `fps=${TARGET_FPS}`,
          `eq=brightness=${brightness}:contrast=${contrast}:saturation=${saturation}`,
          "format=yuv420p",
        ]

  if (drawtext) chain.push(drawtext)
  return `[${inputIndex}:v]${chain.join(",")}[${outputLabel}]`
}

function parseDuration(stderr: string): number | null {
  const match = /Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/.exec(stderr)
  if (!match) return null
  const hours = Number(match[1])
  const minutes = Number(match[2])
  const seconds = Number(match[3])
  if (!Number.isFinite(hours) || !Number.isFinite(minutes) || !Number.isFinite(seconds)) return null
  return hours * 3600 + minutes * 60 + seconds
}

function parseVideoDimensions(stderr: string): { width: number; height: number } | null {
  const match = /Video:\s.*?,\s(\d+)x(\d+)(?:[,\s]|$)/.exec(stderr)
  if (!match) return null
  const width = Number(match[1])
  const height = Number(match[2])
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return null
  return { width, height }
}

function getAspectFromProbe(probe: ProbeInfo): number {
  if (
    typeof probe.width === "number" &&
    Number.isFinite(probe.width) &&
    probe.width > 0 &&
    typeof probe.height === "number" &&
    Number.isFinite(probe.height) &&
    probe.height > 0
  ) {
    return clamp(probe.width / probe.height, 0.2, 5)
  }
  return TARGET_WIDTH / TARGET_HEIGHT
}

function parseFfmpegVersion(versionText: string): { major: number; minor: number; patch: number } | null {
  const firstLine = versionText.split(/\r?\n/, 1)[0] ?? ""
  const match = /ffmpeg version\s+n?(\d+)\.(\d+)(?:\.(\d+))?/i.exec(firstLine)
  if (!match) return null
  const major = Number(match[1])
  const minor = Number(match[2])
  const patch = Number(match[3] ?? "0")
  if (!Number.isFinite(major) || !Number.isFinite(minor) || !Number.isFinite(patch)) return null
  return { major, minor, patch }
}

function isVersionAtLeast(version: { major: number; minor: number; patch: number } | null, major: number, minor: number): boolean {
  if (!version) return false
  if (version.major > major) return true
  if (version.major < major) return false
  return version.minor >= minor
}

async function runProcess(binary: string, args: string[], allowNonZero = false): Promise<{ code: number; stdout: string; stderr: string }> {
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

async function runProcessWithProgress(
  binary: string,
  args: string[],
  durationSeconds: number | null,
  onProgress: (progress: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(binary, args, { windowsHide: true })
    let stderr = ""
    let parseBuffer = ""

    const flushLine = (line: string) => {
      if (!line) return
      if (!durationSeconds || durationSeconds <= 0) return

      if (line.startsWith("out_time_ms=")) {
        const value = Number(line.slice("out_time_ms=".length))
        if (Number.isFinite(value) && value >= 0) {
          const seconds = value / 1_000_000
          const pct = clamp((seconds / durationSeconds) * 100, 0, 99.5)
          onProgress(pct)
        }
      }
      if (line === "progress=end") {
        onProgress(100)
      }
    }

    child.stdout.on("data", () => {})

    child.stderr.on("data", (chunk) => {
      const text = String(chunk)
      stderr += text
      parseBuffer += text
      const lines = parseBuffer.split(/\r?\n/)
      parseBuffer = lines.pop() ?? ""
      for (const line of lines) {
        flushLine(line.trim())
      }
    })

    child.on("error", (error) => reject(error))
    child.on("close", (code) => {
      if (parseBuffer.trim().length > 0) {
        flushLine(parseBuffer.trim())
      }
      const exitCode = code ?? 1
      if (exitCode !== 0) {
        return reject(new Error(stderr || `Process failed with exit code ${exitCode}`))
      }
      onProgress(100)
      resolve()
    })
  })
}

async function probeVideo(ffmpegPath: string, inputPath: string): Promise<ProbeInfo> {
  const result = await runProcess(ffmpegPath, ["-hide_banner", "-i", inputPath, "-f", "null", "-"], true)
  const dimensions = parseVideoDimensions(result.stderr)
  return {
    durationSeconds: parseDuration(result.stderr),
    hasAudio: /Audio:\s/.test(result.stderr),
    width: dimensions?.width ?? null,
    height: dimensions?.height ?? null,
  }
}

async function getCapabilities(ffmpegPath: string): Promise<FfmpegCapabilities> {
  const state = getState()
  if (!state.capabilitiesPromise) {
    state.capabilitiesPromise = (async () => {
      const [versionResult, filtersResult] = await Promise.all([
        runProcess(ffmpegPath, ["-hide_banner", "-version"], true),
        runProcess(ffmpegPath, ["-hide_banner", "-filters"], true),
      ])
      const versionText = `${versionResult.stdout}\n${versionResult.stderr}`
      const parsedVersion = parseFfmpegVersion(versionText)
      const filterText = `${filtersResult.stdout}\n${filtersResult.stderr}`
      return {
        versionRaw: versionText.split(/\r?\n/, 1)[0] ?? null,
        hasVideoFade: /(^|\s)xfade(\s|$)/m.test(filterText),
        hasAudioFade: /(^|\s)acrossfade(\s|$)/m.test(filterText),
        versionAtLeast43: isVersionAtLeast(parsedVersion, 4, 3),
      }
    })().catch((error) => {
      console.warn("FFmpeg capability detection failed:", error)
      return {
        versionRaw: null,
        hasVideoFade: false,
        hasAudioFade: false,
        versionAtLeast43: false,
      }
    })
  }
  return state.capabilitiesPromise
}

function getFileExtension(name: string, fallback: string): string {
  const ext = path.extname(name || "").toLowerCase()
  if (!ext || ext.length > 8) return fallback
  return ext
}

async function removeJob(state: QueueState, job: VideoSplitJobInternal) {
  state.jobs.delete(job.id)
  state.pending = state.pending.filter((id) => id !== job.id)
  if (redisEnabled()) {
    const client = getRedisOrThrow()
    await (client as any).del(redisJobKey(job.id)).catch(() => {})
  }
  await fs.rm(job.workDir, { recursive: true, force: true }).catch(() => {})
}

async function cleanupJobs() {
  const state = getState()
  const now = nowMs()
  const removable: VideoSplitJobInternal[] = []

  for (const job of state.jobs.values()) {
    const done = job.status === "completed" || job.status === "failed"
    if (done && now - job.updatedAtMs > JOB_TTL_MS) {
      removable.push(job)
    }
  }

  for (const job of removable) {
    await removeJob(state, job)
  }

  if (state.jobs.size <= MAX_PENDING_JOBS + 10) return

  const oldDone = [...state.jobs.values()]
    .filter((job) => job.status === "completed" || job.status === "failed")
    .sort((a, b) => a.updatedAtMs - b.updatedAtMs)

  for (const job of oldDone) {
    if (state.jobs.size <= MAX_PENDING_JOBS + 10) break
    await removeJob(state, job)
  }
}

async function runComposeAttempt(
  ffmpegPath: string,
  job: VideoSplitJobInternal,
  options: {
    withText: boolean
    withFade: boolean
    includeAudio: boolean
    firstInput: 0 | 1
    secondInput: 0 | 1
    firstLabel: string
    secondLabel: string
    fadeDuration: string
    fadeOffset: string
    durationSeconds: number | null
  }
) {
  const filters: string[] = [
    buildVideoFilter(options.firstInput, options.withText ? options.firstLabel : "", job.controls, "v0"),
    buildVideoFilter(options.secondInput, options.withText ? options.secondLabel : "", job.controls, "v1"),
  ]

  if (options.withFade) {
    filters.push(`[v0][v1]xfade=transition=fadeblack:duration=${options.fadeDuration}:offset=${options.fadeOffset}[vout]`)
  } else {
    filters.push("[v0][v1]concat=n=2:v=1:a=0[vout]")
  }

  if (options.includeAudio) {
    filters.push(`[${options.firstInput}:a]aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo[a0]`)
    filters.push(`[${options.secondInput}:a]aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo[a1]`)
    if (options.withFade) {
      filters.push(`[a0][a1]acrossfade=d=${options.fadeDuration}[aout]`)
    } else {
      filters.push("[a0][a1]concat=n=2:v=0:a=1[aout]")
    }
  }

  const args: string[] = [
    "-y",
    "-i",
    job.beforePath,
    "-i",
    job.afterPath,
    "-filter_complex",
    filters.join(";"),
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

  if (options.includeAudio) {
    args.push("-map", "[aout]", "-c:a", "aac", "-b:a", "192k")
  } else {
    args.push("-an")
  }

  args.push("-progress", "pipe:2", "-nostats", job.outputPath)

  await runProcessWithProgress(ffmpegPath, args, options.durationSeconds, (pct) => {
    // Map render progress to 12..96 so we still have room for setup/finalization.
    const mapped = 12 + (pct / 100) * 84
    updateJob(job, { progress: mapped })
  })
}

async function runSideBySideSequentialAttempt(
  ffmpegPath: string,
  job: VideoSplitJobInternal,
  options: {
    withText: boolean
    includeAudio: boolean
    beforeLabel: string
    afterLabel: string
    beforeAspect: number
    afterAspect: number
    beforeDurationSeconds: number
    afterDurationSeconds: number
    durationSeconds: number | null
  }
) {
  const beforeDuration = Math.max(0.1, options.beforeDurationSeconds)
  const afterDuration = Math.max(0.1, options.afterDurationSeconds)
  const beforeDurationArg = beforeDuration.toFixed(3)
  const afterDurationArg = afterDuration.toFixed(3)
  const beforeAspect = clamp(options.beforeAspect, 0.2, 5)
  const afterAspect = clamp(options.afterAspect, 0.2, 5)

  const isVerticalStack = job.controls.direction === "vertical"
  const maxLongSide = TARGET_HEIGHT

  let beforePanelWidth = TARGET_WIDTH
  let beforePanelHeight = TARGET_HEIGHT
  let afterPanelWidth = TARGET_WIDTH
  let afterPanelHeight = TARGET_HEIGHT
  let stackFilter = "hstack=inputs=2"

  if (isVerticalStack) {
    let outputWidth = TARGET_WIDTH
    beforePanelHeight = Math.max(2, Math.round(outputWidth / beforeAspect))
    afterPanelHeight = Math.max(2, Math.round(outputWidth / afterAspect))
    let outputHeight = beforePanelHeight + afterPanelHeight

    if (outputHeight > maxLongSide) {
      const scale = maxLongSide / outputHeight
      outputWidth = Math.max(2, Math.round(outputWidth * scale))
      beforePanelHeight = Math.max(2, Math.round(outputWidth / beforeAspect))
      afterPanelHeight = Math.max(2, Math.round(outputWidth / afterAspect))
      outputHeight = beforePanelHeight + afterPanelHeight
    }

    beforePanelWidth = outputWidth
    afterPanelWidth = outputWidth
    stackFilter = "vstack=inputs=2"
  } else {
    let outputHeight = TARGET_WIDTH
    beforePanelWidth = Math.max(2, Math.round(outputHeight * beforeAspect))
    afterPanelWidth = Math.max(2, Math.round(outputHeight * afterAspect))
    let outputWidth = beforePanelWidth + afterPanelWidth

    if (outputWidth > maxLongSide) {
      const scale = maxLongSide / outputWidth
      outputHeight = Math.max(2, Math.round(outputHeight * scale))
      beforePanelWidth = Math.max(2, Math.round(outputHeight * beforeAspect))
      afterPanelWidth = Math.max(2, Math.round(outputHeight * afterAspect))
      outputWidth = beforePanelWidth + afterPanelWidth
    }

    beforePanelHeight = outputHeight
    afterPanelHeight = outputHeight
    stackFilter = "hstack=inputs=2"
  }

  const filters: string[] = [
    buildVideoFilterForSize(0, options.withText ? options.beforeLabel : "", job.controls, "beforePanel", beforePanelWidth, beforePanelHeight, "contain-blur-bg"),
    buildVideoFilterForSize(1, options.withText ? options.afterLabel : "", job.controls, "afterPanel", afterPanelWidth, afterPanelHeight, "contain-blur-bg"),
    "[beforePanel]split=2[beforePanelA][beforePanelB]",
    "[afterPanel]split=2[afterPanelA][afterPanelB]",
    `[beforePanelA]trim=duration=${beforeDurationArg},setpts=PTS-STARTPTS[beforePlay]`,
    `[afterPanelA]trim=end_frame=1,tpad=stop_mode=clone:stop_duration=${beforeDurationArg},setpts=PTS-STARTPTS[afterStillStart]`,
    `[beforePlay][afterStillStart]${stackFilter}[vseg0]`,
    `[beforePanelB]tpad=stop_mode=clone:stop_duration=${afterDurationArg},trim=start=${beforeDurationArg}:duration=${afterDurationArg},setpts=PTS-STARTPTS[beforeStillEnd]`,
    `[afterPanelB]trim=duration=${afterDurationArg},setpts=PTS-STARTPTS[afterPlay]`,
    `[beforeStillEnd][afterPlay]${stackFilter}[vseg1]`,
    "[vseg0][vseg1]concat=n=2:v=1:a=0[vout]",
  ]

  if (options.includeAudio) {
    filters.push(`[0:a]aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo,atrim=duration=${beforeDurationArg},asetpts=PTS-STARTPTS[a0]`)
    filters.push(`[1:a]aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo,atrim=duration=${afterDurationArg},asetpts=PTS-STARTPTS[a1]`)
    filters.push("[a0][a1]concat=n=2:v=0:a=1[aout]")
  }

  const args: string[] = [
    "-y",
    "-i",
    job.beforePath,
    "-i",
    job.afterPath,
    "-filter_complex",
    filters.join(";"),
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

  if (options.includeAudio) {
    args.push("-map", "[aout]", "-c:a", "aac", "-b:a", "192k")
  } else {
    args.push("-an")
  }

  args.push("-progress", "pipe:2", "-nostats", job.outputPath)

  await runProcessWithProgress(ffmpegPath, args, options.durationSeconds, (pct) => {
    const mapped = 12 + (pct / 100) * 84
    updateJob(job, { progress: mapped })
  })
}

async function processJob(job: VideoSplitJobInternal) {
  const ffmpegPath = ffmpegInstaller.path
  updateJob(job, { status: "processing", progress: 2, message: "Probing inputs...", error: null, warnings: [] })

  const beforeProbe = job.beforeProbe ?? (await probeVideo(ffmpegPath, job.beforePath))
  const afterProbe = job.afterProbe ?? (await probeVideo(ffmpegPath, job.afterPath))
  job.beforeProbe = beforeProbe
  job.afterProbe = afterProbe

  const durationLimitError = getDurationLimitError(beforeProbe.durationSeconds, afterProbe.durationSeconds)
  if (durationLimitError) {
    throw new Error(durationLimitError)
  }

  updateJob(job, { progress: 8, message: "Starting render..." })

  const beforeLabel = makeLabel(job.controls.beforeText, job.controls.beforeSubtext)
  const afterLabel = makeLabel(job.controls.afterText, job.controls.afterSubtext)
  const firstIsBefore = job.controls.direction !== "vertical"
  const firstInput: 0 | 1 = firstIsBefore ? 0 : 1
  const secondInput: 0 | 1 = firstIsBefore ? 1 : 0
  const firstProbe = firstIsBefore ? beforeProbe : afterProbe

  const firstLabel = firstIsBefore ? beforeLabel : afterLabel
  const secondLabel = firstIsBefore ? afterLabel : beforeLabel

  const includeAudio = job.controls.includeAudio && beforeProbe.hasAudio && afterProbe.hasAudio

  if (job.controls.compositionMode === "side-by-side-sequential") {
    const beforeDuration = beforeProbe.durationSeconds
    const afterDuration = afterProbe.durationSeconds
    const beforeAspect = getAspectFromProbe(beforeProbe)
    const afterAspect = getAspectFromProbe(afterProbe)
    if (
      typeof beforeDuration !== "number" ||
      !Number.isFinite(beforeDuration) ||
      beforeDuration <= 0 ||
      typeof afterDuration !== "number" ||
      !Number.isFinite(afterDuration) ||
      afterDuration <= 0
    ) {
      throw new Error("Unable to determine video durations for side-by-side sequential mode.")
    }

    const attempts: Array<{ withText: boolean; message: string }> = [
      { withText: true, message: "Rendering side-by-side sequence..." },
      { withText: false, message: "Retrying without text overlays..." },
    ]

    let chosenAttempt: { withText: boolean; message: string } | null = null
    let lastError: unknown = null

    for (const attempt of attempts) {
      updateJob(job, { message: attempt.message })
      try {
        await runSideBySideSequentialAttempt(ffmpegPath, job, {
          withText: attempt.withText,
          includeAudio,
          beforeLabel,
          afterLabel,
          beforeAspect,
          afterAspect,
          beforeDurationSeconds: beforeDuration,
          afterDurationSeconds: afterDuration,
          durationSeconds: beforeDuration + afterDuration,
        })
        chosenAttempt = attempt
        break
      } catch (error) {
        lastError = error
        console.warn(`VideoSplit side-by-side attempt failed (job=${job.id}, text=${attempt.withText}):`, error)
      }
    }

    if (!chosenAttempt) {
      throw lastError instanceof Error ? lastError : new Error("All render attempts failed.")
    }

    const warnings: string[] = []
    if (job.controls.includeAudio && !includeAudio) {
      warnings.push("One or both uploads had no audio track. Exported video without audio.")
    }
    if (job.controls.enableFade && job.controls.fadeSeconds > 0) {
      warnings.push("Fade is not supported in side-by-side sequential mode and was ignored.")
    }
    if (!chosenAttempt.withText) {
      warnings.push("Text overlay fallback was applied because drawtext failed in this FFmpeg build.")
    }

    updateJob(job, {
      status: "completed",
      progress: 100,
      message: "Render complete. Ready to download.",
      warnings,
      error: null,
    })
    return
  }

  const fadeRequested = job.controls.enableFade && job.controls.fadeSeconds > 0
  let fadeGateReason: string | null = null
  let capabilities: FfmpegCapabilities | null = null

  if (fadeRequested) {
    capabilities = await getCapabilities(ffmpegPath)
    if (firstProbe.durationSeconds === null) {
      fadeGateReason = "Fade was skipped because the first clip duration could not be determined."
    } else if (firstProbe.durationSeconds <= job.controls.fadeSeconds + 0.05) {
      fadeGateReason = "Fade was skipped because the first clip is too short for the selected fade duration."
    } else if (!capabilities.versionAtLeast43) {
      const label = capabilities.versionRaw ?? "unknown version"
      fadeGateReason = `Fade was skipped because FFmpeg is not new enough (${label}).`
    } else if (!capabilities.hasVideoFade) {
      fadeGateReason = "Fade was skipped because this FFmpeg build does not support xfade."
    } else if (includeAudio && !capabilities.hasAudioFade) {
      fadeGateReason = "Fade was skipped because this FFmpeg build does not support acrossfade."
    }
  }

  const canApplyFade = fadeRequested && !fadeGateReason
  const fadeDuration = canApplyFade ? job.controls.fadeSeconds.toFixed(3) : "0.000"
  const fadeOffset =
    canApplyFade && firstProbe.durationSeconds !== null ? Math.max(0, firstProbe.durationSeconds - job.controls.fadeSeconds).toFixed(3) : "0.000"

  const baseDuration =
    beforeProbe.durationSeconds !== null && afterProbe.durationSeconds !== null ? beforeProbe.durationSeconds + afterProbe.durationSeconds : null

  const attempts: Array<{ withText: boolean; withFade: boolean; message: string }> = [
    { withText: true, withFade: canApplyFade, message: "Rendering output..." },
  ]
  if (canApplyFade) attempts.push({ withText: true, withFade: false, message: "Retrying without fade..." })
  attempts.push({ withText: false, withFade: false, message: "Retrying without text overlays..." })

  let chosenAttempt: { withText: boolean; withFade: boolean; message: string } | null = null
  let lastError: unknown = null

  for (const attempt of attempts) {
    updateJob(job, { message: attempt.message })
    const attemptDuration = baseDuration !== null ? Math.max(0.1, baseDuration - (attempt.withFade ? job.controls.fadeSeconds : 0)) : null
    try {
      await runComposeAttempt(ffmpegPath, job, {
        withText: attempt.withText,
        withFade: attempt.withFade,
        includeAudio,
        firstInput,
        secondInput,
        firstLabel,
        secondLabel,
        fadeDuration,
        fadeOffset,
        durationSeconds: attemptDuration,
      })
      chosenAttempt = attempt
      break
    } catch (error) {
      lastError = error
      console.warn(`VideoSplit job attempt failed (job=${job.id}, text=${attempt.withText}, fade=${attempt.withFade}):`, error)
    }
  }

  if (!chosenAttempt) {
    throw lastError instanceof Error ? lastError : new Error("All render attempts failed.")
  }

  const warnings: string[] = []
  if (job.controls.includeAudio && !includeAudio) {
    warnings.push("One or both uploads had no audio track. Exported video without audio.")
  }
  if (fadeRequested && !chosenAttempt.withFade) {
    if (canApplyFade) warnings.push("Fade failed during rendering and was automatically disabled.")
    else if (fadeGateReason) warnings.push(fadeGateReason)
    else warnings.push("Fade was skipped by FFmpeg capability gate.")
  }
  if (!chosenAttempt.withText) {
    warnings.push("Text overlay fallback was applied because drawtext failed in this FFmpeg build.")
  }

  updateJob(job, {
    status: "completed",
    progress: 100,
    message: "Render complete. Ready to download.",
    warnings,
    error: null,
  })
}

async function drainQueue() {
  const state = getState()
  if (state.running) return
  state.running = true
  const useRedis = redisEnabled()
  let lockAcquired = false

  try {
    if (useRedis) {
      lockAcquired = await redisAcquireWorkerLock(state.workerToken)
      if (!lockAcquired) return
    }

    for (;;) {
      const id = useRedis
        ? await redisPeekQueueHead()
        : (() => {
            const first = state.pending[0]
            return typeof first === "string" ? first : null
          })()

      if (!id) break

      let job = state.jobs.get(id) ?? null
      if (!job && useRedis) {
        job = await redisLoadJob(id)
        if (job) {
          state.jobs.set(job.id, job)
        }
      }

      if (!job) {
        if (useRedis) await redisPopQueueHead()
        else state.pending.shift()
        continue
      }

      if (job.status === "completed" || job.status === "failed") {
        if (useRedis) await redisPopQueueHead()
        else state.pending.shift()
        continue
      }

      if (job.status === "processing") {
        updateJob(job, {
          status: "queued",
          message: "Recovered queued job after worker restart.",
        })
      }

      try {
        await processJob(job)
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown render error"
        updateJob(job, { status: "failed", progress: 100, message: "Render failed.", error: message })
      } finally {
        if (useRedis) await redisPopQueueHead()
        else state.pending.shift()
        await cleanupJobs()
      }
    }
  } finally {
    if (useRedis && lockAcquired) {
      await redisReleaseWorkerLock(state.workerToken).catch((error) => {
        console.error("Failed to release VideoSplit worker lock:", error)
      })
    }
    state.running = false
  }
}

export async function createVideoSplitJob(input: {
  before: File
  after: File
  controlsRaw: unknown
}): Promise<VideoSplitJob> {
  const state = getState()
  await cleanupJobs()

  const useRedis = redisEnabled()
  if (!useRedis && isRedisRequired()) {
    throw new JobApiError(503, "Redis is required but unavailable.")
  }

  const pendingLength = useRedis ? await redisPendingLength() : state.pending.length
  if (pendingLength >= MAX_PENDING_JOBS) {
    throw new JobApiError(429, "Render queue is full. Please try again shortly.")
  }

  const before = input.before
  const after = input.after
  if (before.size <= 0 || after.size <= 0) {
    throw new JobApiError(400, "Uploaded files are empty.")
  }
  if (before.size > MAX_UPLOAD_BYTES || after.size > MAX_UPLOAD_BYTES) {
    throw new JobApiError(413, "Each uploaded file must be 200MB or smaller.")
  }

  const controls = normalizeControls(input.controlsRaw)
  const jobId = randomUUID()
  const workDir = path.join(tmpdir(), `videosplit-job-${jobId}`)
  await fs.mkdir(workDir, { recursive: true })

  const beforePath = path.join(workDir, `before${getFileExtension(before.name, ".mp4")}`)
  const afterPath = path.join(workDir, `after${getFileExtension(after.name, ".mp4")}`)
  const outputPath = path.join(workDir, "output.mp4")

  await fs.writeFile(beforePath, Buffer.from(await before.arrayBuffer()))
  await fs.writeFile(afterPath, Buffer.from(await after.arrayBuffer()))

  const [beforeProbe, afterProbe] = await Promise.all([
    probeVideo(ffmpegInstaller.path, beforePath),
    probeVideo(ffmpegInstaller.path, afterPath),
  ])

  const durationLimitError = getDurationLimitError(beforeProbe.durationSeconds, afterProbe.durationSeconds)
  if (durationLimitError) {
    await fs.rm(workDir, { recursive: true, force: true }).catch(() => {})
    throw new JobApiError(413, durationLimitError)
  }

  const now = nowMs()
  const job: VideoSplitJobInternal = {
    id: jobId,
    status: "queued",
    progress: 0,
    message: "Queued for processing...",
    warnings: [],
    error: null,
    createdAtMs: now,
    updatedAtMs: now,
    workDir,
    beforePath,
    afterPath,
    outputPath,
    controls,
    beforeProbe,
    afterProbe,
  }

  state.jobs.set(job.id, job)
  if (useRedis) {
    await redisSaveJob(job)
    await redisEnqueue(job.id)
  } else {
    state.pending.push(job.id)
  }
  void drainQueue()

  return toPublicJob(job)
}

export function getVideoSplitJob(id: string): VideoSplitJob | null {
  void cleanupJobs()
  const state = getState()
  const inMemory = state.jobs.get(id)
  if (inMemory) {
    if (inMemory.status === "queued" || inMemory.status === "processing") {
      void drainQueue()
    }
    return toPublicJob(inMemory)
  }
  if (!redisEnabled()) return null

  // Avoid making this API async; callers can tolerate a brief "not found" while cache hydrates.
  void redisLoadJob(id).then((loaded) => {
    if (loaded) {
      state.jobs.set(loaded.id, loaded)
      if (loaded.status === "queued" || loaded.status === "processing") {
        void drainQueue()
      }
    }
  }).catch((error) => {
    console.error("Failed to hydrate VideoSplit job from Redis:", error)
  })
  return null
}

export async function getVideoSplitJobAsync(id: string): Promise<VideoSplitJob | null> {
  await cleanupJobs()
  const state = getState()
  const inMemory = state.jobs.get(id)
  if (inMemory) {
    if (inMemory.status === "queued" || inMemory.status === "processing") {
      void drainQueue()
    }
    return toPublicJob(inMemory)
  }
  if (!redisEnabled()) return null
  const loaded = await redisLoadJob(id)
  if (!loaded) return null
  state.jobs.set(loaded.id, loaded)
  if (loaded.status === "queued" || loaded.status === "processing") {
    void drainQueue()
  }
  return toPublicJob(loaded)
}

export async function getVideoSplitJobDownload(id: string): Promise<{
  bytes: ArrayBuffer
  warnings: string[]
}> {
  await cleanupJobs()
  const state = getState()
  let job = state.jobs.get(id) ?? null
  if (!job && redisEnabled()) {
    job = await redisLoadJob(id)
    if (job) state.jobs.set(job.id, job)
  }
  if (!job) throw new JobApiError(404, "Job not found.")
  if (job.status !== "completed") throw new JobApiError(409, "Job is not complete yet.")

  const file = await fs.readFile(job.outputPath).catch(() => null)
  if (!file || file.length === 0) {
    throw new JobApiError(410, "Rendered file is no longer available.")
  }

  const copy = new Uint8Array(file.byteLength)
  copy.set(file)

  return { bytes: copy.buffer, warnings: [...job.warnings] }
}

export async function retryVideoSplitJob(id: string): Promise<VideoSplitJob> {
  await cleanupJobs()
  const state = getState()
  let job = state.jobs.get(id) ?? null
  if (!job && redisEnabled()) {
    job = await redisLoadJob(id)
    if (job) state.jobs.set(job.id, job)
  }

  if (!job) {
    throw new JobApiError(404, "Job not found.")
  }
  if (job.status !== "failed") {
    throw new JobApiError(409, "Only failed jobs can be retried.")
  }

  const hasInputs = await Promise.all([
    fs.access(job.beforePath).then(() => true).catch(() => false),
    fs.access(job.afterPath).then(() => true).catch(() => false),
  ])
  if (!hasInputs[0] || !hasInputs[1]) {
    throw new JobApiError(410, "Retry is unavailable because original uploaded files are no longer present.")
  }

  updateJob(job, {
    status: "queued",
    progress: 0,
    message: "Queued for retry...",
    warnings: [],
    error: null,
  })

  if (redisEnabled()) {
    await redisSaveJob(job)
    const alreadyQueued = await redisQueueContains(job.id)
    if (!alreadyQueued) {
      await redisEnqueue(job.id)
    }
  } else {
    if (!state.pending.includes(job.id)) {
      state.pending.push(job.id)
    }
  }

  void drainQueue()
  return toPublicJob(job)
}

export function isJobApiError(error: unknown): error is JobApiError {
  return error instanceof JobApiError
}
