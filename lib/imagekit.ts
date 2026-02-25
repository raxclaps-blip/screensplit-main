const DEFAULT_IMAGEKIT_URL_ENDPOINT = "https://ik.imagekit.io/x48flax96"
const DEFAULT_IMAGEKIT_BASE_PATH = "/screensplit"

const VIDEO_SOURCE_PATTERN =
  /\.(mp4|webm|mov|m4v|avi|mkv|wmv|flv|mpeg|mpg|3gp|m3u8)(?=$|[?#])/i

export type ImageKitTransformOptions = {
  width?: number
  quality?: number
  autoFormat?: boolean
  autoQuality?: boolean
}

function normalizeEndpoint(value: string): string {
  return value.trim().replace(/\/+$/, "")
}

function normalizeBasePath(value: string): string {
  const trimmed = value.trim().replace(/\/+$/, "")
  if (!trimmed || trimmed === "/") return ""
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`
}

function toPositiveInt(value: number | undefined): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined
  const rounded = Math.round(value)
  return rounded > 0 ? rounded : undefined
}

function hasHttpProtocol(value: string): boolean {
  return /^https?:\/\//i.test(value)
}

function encodePathSegments(pathname: string): string {
  return pathname
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/")
}

function buildTransformString(options: ImageKitTransformOptions): string {
  const width = toPositiveInt(options.width)
  const quality = toPositiveInt(options.quality)

  const transforms: string[] = []
  if (width) transforms.push(`w-${width}`)

  if (quality) transforms.push(`q-${quality}`)
  else if (options.autoQuality !== false) transforms.push("q-auto")

  if (options.autoFormat !== false) transforms.push("f-auto")

  return transforms.join(",")
}

function applyTransforms(url: URL, options: ImageKitTransformOptions): string {
  const transformString = buildTransformString(options)
  if (transformString) {
    url.searchParams.set("tr", transformString)
  }
  return url.toString()
}

function extractStorageKeyFromUrl(url: URL, bucketName: string): string | null {
  const segments = url.pathname.split("/").filter(Boolean)
  if (segments.length === 0) return null

  if (bucketName && segments[0] === bucketName) {
    return segments.slice(1).join("/")
  }

  if (segments.length > 1) {
    return segments.slice(1).join("/")
  }

  return segments[0]
}

export function isVideoSource(src: string): boolean {
  const candidate = src.trim().toLowerCase()
  if (!candidate) return false
  if (candidate.startsWith("data:video/")) return true
  return VIDEO_SOURCE_PATTERN.test(candidate)
}

export function getImageKitConfig() {
  const urlEndpoint = normalizeEndpoint(
    process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ||
      process.env.IMAGEKIT_URL_ENDPOINT ||
      DEFAULT_IMAGEKIT_URL_ENDPOINT,
  )

  const basePath = normalizeBasePath(
    process.env.NEXT_PUBLIC_IMAGEKIT_BASE_PATH ||
      process.env.IMAGEKIT_BASE_PATH ||
      DEFAULT_IMAGEKIT_BASE_PATH,
  )

  const bucketName = (process.env.R2_BUCKET || "").trim()

  return { urlEndpoint, basePath, bucketName }
}

export function toImageKitUrl(
  src: string,
  options: ImageKitTransformOptions = {},
): string {
  const source = src.trim()
  if (!source) return source

  if (source.startsWith("data:") || source.startsWith("blob:") || isVideoSource(source)) {
    return source
  }

  const { urlEndpoint, basePath, bucketName } = getImageKitConfig()
  let endpoint: URL
  try {
    endpoint = new URL(urlEndpoint)
  } catch {
    return source
  }

  if (source.startsWith("/api/i/")) {
    return source
  }

  if (!hasHttpProtocol(source)) {
    if (source.startsWith("/")) {
      return source
    }

    const key = encodePathSegments(source.replace(/^\/+/, ""))
    if (!key) return source

    const imageKitUrl = new URL(`${urlEndpoint}${basePath}/${key}`)
    return applyTransforms(imageKitUrl, options)
  }

  let parsed: URL
  try {
    parsed = new URL(source)
  } catch {
    return source
  }

  if (parsed.origin === endpoint.origin) {
    return applyTransforms(parsed, options)
  }

  if (parsed.hostname.endsWith(".r2.cloudflarestorage.com")) {
    const key = extractStorageKeyFromUrl(parsed, bucketName)
    if (!key) return source
    const encodedKey = encodePathSegments(key)
    const imageKitUrl = new URL(`${urlEndpoint}${basePath}/${encodedKey}`)
    return applyTransforms(imageKitUrl, options)
  }

  return source
}
