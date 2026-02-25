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
import { Download, ImageUp, Loader2, Type, Upload } from "lucide-react"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import { ShareDialog } from "@/components/screensplit/share-dialog"

const DESIGNER_PLACEHOLDER_LIGHT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" fill="none"><rect width="1200" height="1200" fill="#EAEAEA" rx="3"/><g opacity=".5"><g opacity=".5"><path fill="#FAFAFA" d="M600.709 736.5c-75.454 0-136.621-61.167-136.621-136.62 0-75.454 61.167-136.621 136.621-136.621 75.453 0 136.62 61.167 136.62 136.621 0 75.453-61.167 136.62-136.62 136.62Z"/><path stroke="#C9C9C9" stroke-width="2.418" d="M600.709 736.5c-75.454 0-136.621-61.167-136.621-136.62 0-75.454 61.167-136.621 136.621-136.621 75.453 0 136.62 61.167 136.62 136.621 0 75.453-61.167 136.62-136.62 136.62Z"/></g><path stroke="url(#a)" stroke-width="2.418" d="M0-1.209h553.581" transform="scale(1 -1) rotate(45 1163.11 91.165)"/><path stroke="url(#b)" stroke-width="2.418" d="M404.846 598.671h391.726"/><path stroke="url(#c)" stroke-width="2.418" d="M599.5 795.742V404.017"/><path stroke="url(#d)" stroke-width="2.418" d="m795.717 796.597-391.441-391.44"/><path fill="#fff" d="M600.709 656.704c-31.384 0-56.825-25.441-56.825-56.824 0-31.384 25.441-56.825 56.825-56.825 31.383 0 56.824 25.441 56.824 56.825 0 31.383-25.441 56.824-56.824 56.824Z"/><g clip-path="url(#e)"><path fill="#666" fill-rule="evenodd" d="M616.426 586.58h-31.434v16.176l3.553-3.554.531-.531h9.068l.074-.074 8.463-8.463h2.565l7.18 7.181V586.58Zm-15.715 14.654 3.698 3.699 1.283 1.282-2.565 2.565-1.282-1.283-5.2-5.199h-6.066l-5.514 5.514-.073.073v2.876a2.418 2.418 0 0 0 2.418 2.418h26.598a2.418 2.418 0 0 0 2.418-2.418v-8.317l-8.463-8.463-7.181 7.181-.071.072Zm-19.347 5.442v4.085a6.045 6.045 0 0 0 6.046 6.045h26.598a6.044 6.044 0 0 0 6.045-6.045v-7.108l1.356-1.355-1.282-1.283-.074-.073v-17.989h-38.689v23.43l-.146.146.146.147Z" clip-rule="evenodd"/></g><path stroke="#C9C9C9" stroke-width="2.418" d="M600.709 656.704c-31.384 0-56.825-25.441-56.825-56.824 0-31.384 25.441-56.825 56.825-56.825 31.383 0 56.824 25.441 56.824 56.825 0 31.383-25.441 56.824-56.824 56.824Z"/></g><defs><linearGradient id="a" x1="554.061" x2="-.48" y1=".083" y2=".087" gradientUnits="userSpaceOnUse"><stop stop-color="#C9C9C9" stop-opacity="0"/><stop offset=".208" stop-color="#C9C9C9"/><stop offset=".792" stop-color="#C9C9C9"/><stop offset="1" stop-color="#C9C9C9" stop-opacity="0"/></linearGradient><linearGradient id="b" x1="796.912" x2="404.507" y1="599.963" y2="599.965" gradientUnits="userSpaceOnUse"><stop stop-color="#C9C9C9" stop-opacity="0"/><stop offset=".208" stop-color="#C9C9C9"/><stop offset=".792" stop-color="#C9C9C9"/><stop offset="1" stop-color="#C9C9C9" stop-opacity="0"/></linearGradient><linearGradient id="c" x1="600.792" x2="600.794" y1="403.677" y2="796.082" gradientUnits="userSpaceOnUse"><stop stop-color="#C9C9C9" stop-opacity="0"/><stop offset=".208" stop-color="#C9C9C9"/><stop offset=".792" stop-color="#C9C9C9"/><stop offset="1" stop-color="#C9C9C9" stop-opacity="0"/></linearGradient><linearGradient id="d" x1="404.85" x2="796.972" y1="403.903" y2="796.02" gradientUnits="userSpaceOnUse"><stop stop-color="#C9C9C9" stop-opacity="0"/><stop offset=".208" stop-color="#C9C9C9"/><stop offset=".792" stop-color="#C9C9C9"/><stop offset="1" stop-color="#C9C9C9" stop-opacity="0"/></linearGradient><clipPath id="e"><path fill="#fff" d="M581.364 580.535h38.689v38.689h-38.689z"/></clipPath></defs></svg>`
const DESIGNER_PLACEHOLDER_DARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1200" width="1200" height="1200" fill="none"><rect width="1200" height="1200" fill="#0D0D0D" rx="3"/><g opacity=".5"><g opacity=".5"><path fill="#1E1E1E" d="M600.709 736.5c-75.454 0-136.621-61.167-136.621-136.62 0-75.454 61.167-136.621 136.621-136.621 75.453 0 136.62 61.167 136.62 136.621 0 75.453-61.167 136.62-136.62 136.62Z"/><path stroke="#333333" stroke-width="2.418" d="M600.709 736.5c-75.454 0-136.621-61.167-136.621-136.62 0-75.454 61.167-136.621 136.621-136.621 75.453 0 136.62 61.167 136.62 136.621 0 75.453-61.167 136.62-136.62 136.62Z"/></g><path stroke="url(#a)" stroke-width="2.418" d="M0-1.209h553.581" transform="scale(1 -1) rotate(45 1163.11 91.165)"/><path stroke="url(#b)" stroke-width="2.418" d="M404.846 598.671h391.726"/><path stroke="url(#c)" stroke-width="2.418" d="M599.5 795.742V404.017"/><path stroke="url(#d)" stroke-width="2.418" d="m795.717 796.597-391.441-391.44"/><path fill="#2C2C2C" d="M600.709 656.704c-31.384 0-56.825-25.441-56.825-56.824 0-31.384 25.441-56.825 56.825-56.825 31.383 0 56.824 25.441 56.824 56.825 0 31.383-25.441 56.824-56.824 56.824Z"/><g clip-path="url(#e)"><path fill="#FFFFFF" fill-rule="evenodd" d="M616.426 586.58h-31.434v16.176l3.553-3.554.531-.531h9.068l.074-.074 8.463-8.463h2.565l7.18 7.181V586.58Zm-15.715 14.654 3.698 3.699 1.283 1.282-2.565 2.565-1.282-1.283-5.2-5.199h-6.066l-5.514 5.514-.073.073v2.876a2.418 2.418 0 0 0 2.418 2.418h26.598a2.418 2.418 0 0 0 2.418-2.418v-8.317l-8.463-8.463-7.181 7.181-.071.072Zm-19.347 5.442v4.085a6.045 6.045 0 0 0 6.046 6.045h26.598a6.044 6.044 0 0 0 6.045-6.045v-7.108l1.356-1.355-1.282-1.283-.074-.073v-17.989h-38.689v23.43l-.146.146.146.147Z" clip-rule="evenodd"/></g><path stroke="#333333" stroke-width="2.418" d="M600.709 656.704c-31.384 0-56.825-25.441-56.825-56.824 0-31.384 25.441-56.825 56.825-56.825 31.383 0 56.824 25.441 56.824 56.825 0 31.383-25.441 56.824-56.824 56.824Z"/></g><defs><linearGradient id="a" x1="554.061" x2="-.48" y1=".083" y2=".087" gradientUnits="userSpaceOnUse"><stop stop-color="#333333" stop-opacity="0"/><stop offset=".208" stop-color="#333333"/><stop offset=".792" stop-color="#333333"/><stop offset="1" stop-color="#333333" stop-opacity="0"/></linearGradient><linearGradient id="b" x1="796.912" x2="404.507" y1="599.963" y2="599.965" gradientUnits="userSpaceOnUse"><stop stop-color="#333333" stop-opacity="0"/><stop offset=".208" stop-color="#333333"/><stop offset=".792" stop-color="#333333"/><stop offset="1" stop-color="#333333" stop-opacity="0"/></linearGradient><linearGradient id="c" x1="600.792" x2="600.794" y1="403.677" y2="796.082" gradientUnits="userSpaceOnUse"><stop stop-color="#333333" stop-opacity="0"/><stop offset=".208" stop-color="#333333"/><stop offset=".792" stop-color="#333333"/><stop offset="1" stop-color="#333333" stop-opacity="0"/></linearGradient><linearGradient id="d" x1="404.85" x2="796.972" y1="403.903" y2="796.02" gradientUnits="userSpaceOnUse"><stop stop-color="#333333" stop-opacity="0"/><stop offset=".208" stop-color="#333333"/><stop offset=".792" stop-color="#333333"/><stop offset="1" stop-color="#333333" stop-opacity="0"/></linearGradient><clipPath id="e"><path fill="#2C2C2C" d="M581.364 580.535h38.689v38.689h-38.689z"/></clipPath></defs></svg>`
const DESIGNER_PLACEHOLDER_LIGHT_SRC = `data:image/svg+xml;utf8,${encodeURIComponent(DESIGNER_PLACEHOLDER_LIGHT_SVG)}`
const DESIGNER_PLACEHOLDER_DARK_SRC = `data:image/svg+xml;utf8,${encodeURIComponent(DESIGNER_PLACEHOLDER_DARK_SVG)}`

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

type BrandColorPreset = {
  id: string
  name: string
  allTextColor: string
  headlineTextColor: string
  sublineTextColor: string
  linkTextColor: string
  bottomRightTextColor: string
}

type LogoPosition = "top-right" | "top-left" | "bottom-center"
type DesignerExportFormat = "png" | "jpg" | "webp" | "avif"

type DesignerExportOption = {
  id: DesignerExportFormat
  label: string
  description: string
  mimeType: string
  extension: string
  quality?: number
}

const DESIGNER_EXPORT_OPTIONS: DesignerExportOption[] = [
  {
    id: "png",
    label: "PNG",
    description: "Lossless, best for crisp graphics and text",
    mimeType: "image/png",
    extension: "png",
  },
  {
    id: "jpg",
    label: "JPG",
    description: "Smaller files, ideal for photo-heavy content",
    mimeType: "image/jpeg",
    extension: "jpg",
    quality: 0.92,
  },
  {
    id: "webp",
    label: "WEBP",
    description: "Modern compression with strong quality-to-size balance",
    mimeType: "image/webp",
    extension: "webp",
    quality: 0.92,
  },
  {
    id: "avif",
    label: "AVIF",
    description: "Next-gen high compression for smallest web payloads",
    mimeType: "image/avif",
    extension: "avif",
    quality: 0.9,
  },
]

const DEFAULT_DESIGNER_EXPORT_FORMAT: DesignerExportFormat = "png"

const BRAND_COLOR_PRESETS: BrandColorPreset[] = [
  {
    id: "clean-white",
    name: "Clean White",
    allTextColor: "#ffffff",
    headlineTextColor: "#ffffff",
    sublineTextColor: "#f3f4f6",
    linkTextColor: "#e5e7eb",
    bottomRightTextColor: "#ffffff",
  },
  {
    id: "ocean-brand",
    name: "Ocean Brand",
    allTextColor: "#38bdf8",
    headlineTextColor: "#38bdf8",
    sublineTextColor: "#0ea5e9",
    linkTextColor: "#22d3ee",
    bottomRightTextColor: "#7dd3fc",
  },
  {
    id: "sunset-brand",
    name: "Sunset Brand",
    allTextColor: "#fb7185",
    headlineTextColor: "#fb7185",
    sublineTextColor: "#f97316",
    linkTextColor: "#fbbf24",
    bottomRightTextColor: "#fdba74",
  },
  {
    id: "mint-brand",
    name: "Mint Brand",
    allTextColor: "#34d399",
    headlineTextColor: "#34d399",
    sublineTextColor: "#10b981",
    linkTextColor: "#2dd4bf",
    bottomRightTextColor: "#6ee7b7",
  },
  {
    id: "coral-brand",
    name: "Coral Brand",
    allTextColor: "#f43f5e",
    headlineTextColor: "#fb7185",
    sublineTextColor: "#f43f5e",
    linkTextColor: "#f472b6",
    bottomRightTextColor: "#fda4af",
  },
  {
    id: "gold-luxe",
    name: "Gold Luxe",
    allTextColor: "#f59e0b",
    headlineTextColor: "#f59e0b",
    sublineTextColor: "#eab308",
    linkTextColor: "#facc15",
    bottomRightTextColor: "#fcd34d",
  },
]

const MAX_LOGO_FILE_SIZE_BYTES = 2 * 1024 * 1024
const ALLOWED_LOGO_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/svg+xml",
])
const DIRECT_R2_UPLOAD_ENABLED = process.env.NEXT_PUBLIC_R2_DIRECT_UPLOAD !== "false"

export default function DesignerPage() {
  const { data: session } = authClient.useSession()
  const desktopExportMenuRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const headlineRef = useRef<HTMLTextAreaElement>(null)
  const sublineRef = useRef<HTMLTextAreaElement>(null)
  const objectUrlRef = useRef<string | null>(null)
  const sharePreviewObjectUrlRef = useRef<string | null>(null)
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null)
  const [logoUrl, setLogoUrl] = useState("")
  const [logoAssetVersion, setLogoAssetVersion] = useState(() => Date.now())
  const [logoImageElement, setLogoImageElement] = useState<HTMLImageElement | null>(null)
  const [showHeadline, setShowHeadline] = useState(true)
  const [showSubline, setShowSubline] = useState(true)
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
  const [isLogoLoading, setIsLogoLoading] = useState(true)
  const [isLogoUploading, setIsLogoUploading] = useState(false)
  const [isLogoRemoving, setIsLogoRemoving] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isSavingToGallery, setIsSavingToGallery] = useState(false)
  const [isSavedToGallery, setIsSavedToGallery] = useState(false)
  const [activeExportFormat, setActiveExportFormat] = useState<DesignerExportFormat | null>(null)
  const [mobileExportSheetOpen, setMobileExportSheetOpen] = useState(false)
  const [desktopExportMenuOpen, setDesktopExportMenuOpen] = useState(false)
  const [isMobileAccountMenuOpen, setIsMobileAccountMenuOpen] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [shareSlug, setShareSlug] = useState<string | null>(null)
  const [sharePreviewSrc, setSharePreviewSrc] = useState("")
  const [headlineScale, setHeadlineScale] = useState([7])
  const [showLogo, setShowLogo] = useState(true)
  const [showLogoBackground, setShowLogoBackground] = useState(true)
  const [logoSize, setLogoSize] = useState([100])
  const [logoPosition, setLogoPosition] = useState<LogoPosition>("top-right")
  const [bottomOffset, setBottomOffset] = useState([6])
  const [useUnifiedTextColor, setUseUnifiedTextColor] = useState(true)
  const [allTextColor, setAllTextColor] = useState("#ffffff")
  const [headlineTextColor, setHeadlineTextColor] = useState("#ffffff")
  const [sublineTextColor, setSublineTextColor] = useState("#ffffff")
  const [linkTextColor, setLinkTextColor] = useState("#ffffff")
  const [bottomRightTextColor, setBottomRightTextColor] = useState("#ffffff")
  const isBottomFadeMode = bottomMode === "fade"
  const isBelowImageBlackoutMode = bottomMode === "blackout"
  const userName = session?.user?.name?.trim() || ""
  const bottomRightTextPlaceholder = bottomRightText.length > 0 ? "" : userName || "Your name"
  const normalizedAllTextColor = normalizeHexColor(allTextColor, "#ffffff")
  const normalizedHeadlineTextColor = normalizeHexColor(headlineTextColor, "#ffffff")
  const normalizedSublineTextColor = normalizeHexColor(sublineTextColor, "#ffffff")
  const normalizedLinkTextColor = normalizeHexColor(linkTextColor, "#ffffff")
  const normalizedBottomRightTextColor = normalizeHexColor(bottomRightTextColor, "#ffffff")
  const activeExportOption =
    DESIGNER_EXPORT_OPTIONS.find((option) => option.id === activeExportFormat) ?? null
  const shouldShowMobileExportButton = Boolean(imageElement) && !isMobileAccountMenuOpen
  const shouldShowDesktopExportButton = Boolean(imageElement)

  const applyBrandColorPreset = useCallback((preset: BrandColorPreset) => {
    setAllTextColor(preset.allTextColor)
    setHeadlineTextColor(preset.headlineTextColor)
    setSublineTextColor(preset.sublineTextColor)
    setLinkTextColor(preset.linkTextColor)
    setBottomRightTextColor(preset.bottomRightTextColor)
  }, [])

  const autoResizeTextarea = useCallback((textarea: HTMLTextAreaElement | null) => {
    if (!textarea) return
    textarea.style.height = "0px"
    textarea.style.height = `${textarea.scrollHeight}px`
  }, [])

  useEffect(() => {
    autoResizeTextarea(headlineRef.current)
  }, [headline, showHeadline, autoResizeTextarea])

  useEffect(() => {
    autoResizeTextarea(sublineRef.current)
  }, [subline, showSubline, autoResizeTextarea])

  useEffect(() => {
    if (!logoUrl) {
      setLogoImageElement(null)
      return
    }

    let isMounted = true
    const logo = new Image()

    logo.onload = () => {
      if (isMounted) {
        setLogoImageElement(logo)
      }
    }

    logo.onerror = () => {
      if (isMounted) {
        setLogoImageElement(null)
        toast.error("Failed to load saved logo")
      }
    }

    logo.src = `/api/user/designer-logo/image?v=${logoAssetVersion}`

    return () => {
      isMounted = false
    }
  }, [logoAssetVersion, logoUrl])

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
    const bottomRightTextToRender = bottomRightTextTrimmed || userName
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
    const subtitleLines = showSubline && subline.trim() ? wrapLines(ctx, subline, textMaxWidth) : []
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

    if (showLogo && logoImageElement && logoPosition !== "bottom-center") {
      const logoSourceWidth = Math.max(1, logoImageElement.naturalWidth || logoImageElement.width || 1)
      const logoSourceHeight = Math.max(1, logoImageElement.naturalHeight || logoImageElement.height || 1)
      const defaultLogoScale = Math.min((width * 0.2) / logoSourceWidth, (imageHeight * 0.14) / logoSourceHeight, 1)
      const logoScaleFactor = logoSize[0] / 100
      const logoScale = Math.max(0.12, Math.min(4, defaultLogoScale * logoScaleFactor))
      const logoWidth = Math.max(1, Math.round(logoSourceWidth * logoScale))
      const logoHeight = Math.max(1, Math.round(logoSourceHeight * logoScale))
      const logoPadding = Math.max(6, Math.round(logoHeight * 0.12))
      const logoContainerWidth = logoWidth + logoPadding * 2
      const logoContainerHeight = logoHeight + logoPadding * 2
      const logoX = logoPosition === "top-left"
        ? safePaddingX
        : width - safePaddingX - logoContainerWidth
      const logoY = Math.max(12, Math.round(imageHeight * 0.035))

      ctx.save()
      if (showLogoBackground) {
        ctx.shadowColor = "rgba(0,0,0,0.38)"
        ctx.shadowBlur = Math.round(logoPadding * 1.8)
        ctx.shadowOffsetY = 2
        ctx.fillStyle = "rgba(8,8,8,0.44)"
        ctx.fillRect(logoX, logoY, logoContainerWidth, logoContainerHeight)
        ctx.strokeStyle = "rgba(255,255,255,0.2)"
        ctx.lineWidth = 1
        ctx.strokeRect(logoX, logoY, logoContainerWidth, logoContainerHeight)
      }
      ctx.shadowBlur = 0
      ctx.shadowOffsetY = 0
      const logoDrawX = showLogoBackground ? logoX + logoPadding : logoX
      const logoDrawY = showLogoBackground ? logoY + logoPadding : logoY
      ctx.drawImage(logoImageElement, logoDrawX, logoDrawY, logoWidth, logoHeight)
      ctx.restore()
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
    const linkLabel = "Link in comments"
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

    let rightPillX: number | null = null
    let rightPillWidth = 0

    if (bottomRightTextToRender) {
      const rightTextFont = `600 ${commentFontSize}px ui-sans-serif, system-ui, -apple-system`
      ctx.font = rightTextFont
      let rightText = bottomRightTextToRender
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
        rightPillWidth = Math.round(pillPaddingX * 2 + rightTextWidth)
        rightPillX = width - safePaddingX - rightPillWidth

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

    if (showLogo && logoImageElement && logoPosition === "bottom-center") {
      const logoSourceWidth = Math.max(1, logoImageElement.naturalWidth || logoImageElement.width || 1)
      const logoSourceHeight = Math.max(1, logoImageElement.naturalHeight || logoImageElement.height || 1)
      const gapLeft = leftPillX + leftPillWidth + pillsGap
      const gapRight = rightPillX !== null ? rightPillX - pillsGap : width - safePaddingX
      const availableWidth = Math.max(0, gapRight - gapLeft)
      const availableHeight = Math.max(0, pillHeight)

      if (availableWidth > 16 && availableHeight > 8) {
        const fitWidth = Math.max(1, availableWidth - 8)
        const fitHeight = Math.max(1, availableHeight - 4)
        const baseFitScale = Math.min(fitWidth / logoSourceWidth, fitHeight / logoSourceHeight, 1)
        const requestedScale = baseFitScale * (logoSize[0] / 100)
        const logoScale = Math.max(
          0.02,
          Math.min(requestedScale, fitWidth / logoSourceWidth, fitHeight / logoSourceHeight)
        )

        const logoWidth = Math.max(1, Math.round(logoSourceWidth * logoScale))
        const logoHeight = Math.max(1, Math.round(logoSourceHeight * logoScale))
        const logoPadding = Math.max(2, Math.round(Math.min(logoWidth, logoHeight) * 0.08))
        const containerWidth = logoWidth + logoPadding * 2
        const containerHeight = logoHeight + logoPadding * 2
        const logoX = gapLeft + Math.round((availableWidth - containerWidth) / 2)
        const logoY = footerTop + Math.round((pillHeight - containerHeight) / 2)

        ctx.save()
        if (showLogoBackground) {
          ctx.fillStyle = "rgba(8,8,8,0.44)"
          ctx.fillRect(logoX, logoY, containerWidth, containerHeight)
          ctx.strokeStyle = "rgba(255,255,255,0.2)"
          ctx.lineWidth = 1
          ctx.strokeRect(logoX, logoY, containerWidth, containerHeight)
        }
        const logoDrawX = showLogoBackground ? logoX + logoPadding : logoX
        const logoDrawY = showLogoBackground ? logoY + logoPadding : logoY
        ctx.drawImage(logoImageElement, logoDrawX, logoDrawY, logoWidth, logoHeight)
        ctx.restore()
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
    logoImageElement,
    showLogo,
    showLogoBackground,
    logoSize,
    logoPosition,
    isBelowImageBlackoutMode,
    isBottomFadeMode,
    linkTextColor,
    allTextColor,
    bottomRightTextColor,
    userName,
    showSubline,
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
    let isMounted = true

    const loadDesignerLogo = async () => {
      setIsLogoLoading(true)
      try {
        const response = await fetch("/api/user/designer-logo")
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to load saved logo")
        }

        if (!isMounted) return
        const savedLogoUrl = typeof data.logoUrl === "string" ? data.logoUrl : ""
        setLogoUrl(savedLogoUrl)
        setLogoAssetVersion(Date.now())
        setShowLogo(Boolean(savedLogoUrl))
      } catch (error) {
        if (isMounted) {
          toast.error("Failed to load saved logo")
        }
      } finally {
        if (isMounted) {
          setIsLogoLoading(false)
        }
      }
    }

    loadDesignerLogo()

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

  useEffect(
    () => () => {
      if (sharePreviewObjectUrlRef.current) {
        URL.revokeObjectURL(sharePreviewObjectUrlRef.current)
        sharePreviewObjectUrlRef.current = null
      }
    },
    [],
  )

  useEffect(() => {
    if (!mobileExportSheetOpen && !desktopExportMenuOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileExportSheetOpen(false)
        setDesktopExportMenuOpen(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [mobileExportSheetOpen, desktopExportMenuOpen])

  useEffect(() => {
    if (!desktopExportMenuOpen) return

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null
      if (target && desktopExportMenuRef.current?.contains(target)) return
      setDesktopExportMenuOpen(false)
    }

    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("touchstart", handlePointerDown)
    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("touchstart", handlePointerDown)
    }
  }, [desktopExportMenuOpen])

  useEffect(() => {
    const syncAccountMenuState = () => {
      setIsMobileAccountMenuOpen(document.documentElement.dataset.mobileAccountOpen === "true")
    }

    syncAccountMenuState()
    window.addEventListener("mobile-account-menu-change", syncAccountMenuState as EventListener)
    return () => {
      window.removeEventListener("mobile-account-menu-change", syncAccountMenuState as EventListener)
    }
  }, [])

  useEffect(() => {
    if (!imageElement || isMobileAccountMenuOpen) {
      setMobileExportSheetOpen(false)
    }
    if (!imageElement) {
      setDesktopExportMenuOpen(false)
    }
  }, [imageElement, isMobileAccountMenuOpen])

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

  const handleLogoFileInput = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""

    if (!file) return
    if (!ALLOWED_LOGO_MIME_TYPES.has(file.type.toLowerCase())) {
      toast.error("Please upload PNG, JPG, WEBP, or SVG")
      return
    }
    if (file.size > MAX_LOGO_FILE_SIZE_BYTES) {
      toast.error("Logo file must be 2MB or smaller")
      return
    }

    setIsLogoUploading(true)
    try {
      const fileNameParts = file.name.split(".")
      const rawExtension = fileNameParts[fileNameParts.length - 1]?.trim().toLowerCase() || "png"
      const fileExtension = rawExtension === "jpeg" ? "jpg" : rawExtension
      const contentType = file.type?.toLowerCase() || "image/png"

      let savedLogoUrl = ""
      let pendingObjectUrl = ""

      try {
        if (!DIRECT_R2_UPLOAD_ENABLED) {
          throw new Error("Direct upload disabled")
        }

        const presignResponse = await fetch("/api/user/designer-logo/presign", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileExtension,
            contentType,
          }),
        })

        const presignData = await presignResponse.json().catch(() => ({}))
        if (!presignResponse.ok) {
          throw new Error(
            typeof presignData?.error === "string"
              ? presignData.error
              : "Failed to initialize logo upload"
          )
        }

        const uploadUrl = typeof presignData?.uploadUrl === "string" ? presignData.uploadUrl : ""
        pendingObjectUrl = typeof presignData?.objectUrl === "string" ? presignData.objectUrl : ""
        if (!uploadUrl || !pendingObjectUrl) {
          throw new Error("Invalid logo upload response")
        }

        const directUploadResponse = await fetch(uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": contentType,
          },
          body: file,
        })

        if (!directUploadResponse.ok) {
          throw new Error(`Direct logo upload failed (${directUploadResponse.status})`)
        }

        const finalizeResponse = await fetch("/api/user/designer-logo", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            logoUrl: pendingObjectUrl,
          }),
        })

        const finalizedData = await finalizeResponse.json().catch(() => ({}))
        if (!finalizeResponse.ok) {
          throw new Error(
            typeof finalizedData?.error === "string"
              ? finalizedData.error
              : "Failed to finalize logo save"
          )
        }

        savedLogoUrl = typeof finalizedData.logoUrl === "string" ? finalizedData.logoUrl : ""
      } catch (fastUploadError) {
        const fallbackFormData = new FormData()
        fallbackFormData.append("logo", file, `designer-logo-${Date.now()}.${fileExtension}`)

        const fallbackResponse = await fetch("/api/user/designer-logo", {
          method: "PATCH",
          body: fallbackFormData,
        })
        const fallbackData = await fallbackResponse.json().catch(() => ({}))
        if (!fallbackResponse.ok) {
          const fastErrorMessage =
            fastUploadError instanceof Error ? fastUploadError.message : "Fast logo upload failed"
          const fallbackErrorMessage =
            typeof fallbackData?.error === "string"
              ? fallbackData.error
              : "Fallback logo upload failed"
          throw new Error(`${fastErrorMessage}. ${fallbackErrorMessage}`)
        }

        savedLogoUrl = typeof fallbackData.logoUrl === "string" ? fallbackData.logoUrl : ""
      }

      setLogoUrl(savedLogoUrl)
      setLogoAssetVersion(Date.now())
      setShowLogo(Boolean(savedLogoUrl))
      toast.success("Logo saved for future designs")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save logo")
    } finally {
      setIsLogoUploading(false)
    }
  }, [])

  const removeSavedLogo = useCallback(async () => {
    if (isLogoRemoving) return

    setIsLogoRemoving(true)
    try {
      const response = await fetch("/api/user/designer-logo", {
        method: "DELETE",
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(typeof data?.error === "string" ? data.error : "Failed to remove logo")
      }

      setLogoUrl("")
      setLogoImageElement(null)
      setShowLogo(false)
      if (logoInputRef.current) {
        logoInputRef.current.value = ""
      }
      toast.success("Logo removed")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove logo")
    } finally {
      setIsLogoRemoving(false)
    }
  }, [isLogoRemoving])

  const loadFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file")
      return
    }

    setShareDialogOpen(false)
    setShareSlug(null)
    setSharePreviewSrc("")
    setIsSavedToGallery(false)
    if (sharePreviewObjectUrlRef.current) {
      URL.revokeObjectURL(sharePreviewObjectUrlRef.current)
      sharePreviewObjectUrlRef.current = null
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

  const createExportBlob = useCallback(async (format: DesignerExportFormat = DEFAULT_DESIGNER_EXPORT_FORMAT) => {
    const canvas = canvasRef.current
    if (!canvas) {
      throw new Error("Please upload an image before exporting")
    }

    const formatOption =
      DESIGNER_EXPORT_OPTIONS.find((option) => option.id === format) ??
      DESIGNER_EXPORT_OPTIONS[0]

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, formatOption.mimeType, formatOption.quality)
    )
    if (!blob) {
      throw new Error(`Could not export the design as ${formatOption.label}`)
    }

    const normalizedMimeType = formatOption.mimeType.toLowerCase()
    const normalizedBlobType = blob.type.toLowerCase()
    const requestedNonPngFormat = formatOption.id !== "png"
    const blobMatchesFormat =
      normalizedBlobType.length === 0 || normalizedBlobType === normalizedMimeType

    if (requestedNonPngFormat && !blobMatchesFormat) {
      throw new Error(`${formatOption.label} export is not supported by this browser`)
    }

    const contentType =
      normalizedBlobType.startsWith("image/")
        ? normalizedBlobType
        : normalizedMimeType

    return { blob, formatOption, contentType }
  }, [])

  const saveBlobToGallery = useCallback(
    async ({
      blob,
      formatOption,
      contentType,
    }: {
      blob: Blob
      formatOption: DesignerExportOption
      contentType: string
    }) => {
      const exportTitle = (showHeadline && headline.trim() ? headline.trim() : "Designer Export").slice(0, 120)
      const metadataPayload = {
        title: exportTitle,
        layout: "horizontal",
        beforeLabel: "Designer",
        afterLabel: "Export",
        exportFormat: formatOption.extension,
        textColor: useUnifiedTextColor ? allTextColor : headlineTextColor,
        bgColor: "#000000",
        isPrivate: false,
      }

      let shareSlug: string | null = null
      let pendingProjectId: string | null = null

      try {
        if (!DIRECT_R2_UPLOAD_ENABLED) {
          throw new Error("Direct upload disabled")
        }

        const presignResponse = await fetch("/api/upload-image/presign", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...metadataPayload,
            fileExtension: formatOption.extension,
            contentType,
          }),
        })

        const presignData = await presignResponse.json().catch(() => ({}))
        if (!presignResponse.ok) {
          throw new Error(
            typeof presignData?.error === "string"
              ? presignData.error
              : "Failed to initialize fast upload"
          )
        }

        const projectId = typeof presignData?.projectId === "string" ? presignData.projectId : ""
        const uploadUrl = typeof presignData?.uploadUrl === "string" ? presignData.uploadUrl : ""
        const createdShareSlug =
          typeof presignData?.shareSlug === "string" && presignData.shareSlug.length > 0
            ? presignData.shareSlug
            : null

        if (!projectId || !uploadUrl) {
          throw new Error("Invalid fast upload response")
        }

        pendingProjectId = projectId

        const directUploadResponse = await fetch(uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": contentType,
          },
          body: blob,
        })

        if (!directUploadResponse.ok) {
          throw new Error(`Direct upload failed (${directUploadResponse.status})`)
        }

        const completeResponse = await fetch("/api/upload-image/complete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ projectId }),
        })

        const completeData = await completeResponse.json().catch(() => ({}))
        if (!completeResponse.ok) {
          throw new Error(
            typeof completeData?.error === "string"
              ? completeData.error
              : "Failed to finalize fast upload"
          )
        }

        pendingProjectId = null
        shareSlug =
          typeof completeData?.shareSlug === "string" && completeData.shareSlug.length > 0
            ? completeData.shareSlug
            : createdShareSlug
      } catch (fastUploadError) {
        if (pendingProjectId) {
          await fetch("/api/upload-image/cancel", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ projectId: pendingProjectId }),
          }).catch(() => null)
        }

        const formData = new FormData()
        formData.append("image", blob, `designer-output-${Date.now()}.${formatOption.extension}`)
        formData.append("title", metadataPayload.title)
        formData.append("layout", metadataPayload.layout)
        formData.append("beforeLabel", metadataPayload.beforeLabel)
        formData.append("afterLabel", metadataPayload.afterLabel)
        formData.append("exportFormat", metadataPayload.exportFormat)
        formData.append("textColor", metadataPayload.textColor)
        formData.append("bgColor", metadataPayload.bgColor)
        formData.append("isPrivate", "false")

        const fallbackResponse = await fetch("/api/upload-image", {
          method: "POST",
          body: formData,
        })

        const fallbackData = await fallbackResponse.json().catch(() => ({}))
        if (!fallbackResponse.ok) {
          const fastMessage =
            fastUploadError instanceof Error ? fastUploadError.message : "Fast upload failed"
          const fallbackMessage =
            typeof fallbackData?.error === "string"
              ? fallbackData.error
              : "Fallback upload failed"
          throw new Error(`${fastMessage}. ${fallbackMessage}`)
        }

        shareSlug =
          typeof fallbackData?.shareSlug === "string" && fallbackData.shareSlug.length > 0
            ? fallbackData.shareSlug
            : null
      }

      if (!shareSlug) {
        throw new Error("Image saved, but no share link was returned")
      }

      return shareSlug
    },
    [allTextColor, headline, headlineTextColor, showHeadline, useUnifiedTextColor],
  )

  const exportCanvas = useCallback(
    async (format: DesignerExportFormat = DEFAULT_DESIGNER_EXPORT_FORMAT) => {
      if (isExporting || isSavingToGallery) return

      const formatOption =
        DESIGNER_EXPORT_OPTIONS.find((option) => option.id === format) ??
        DESIGNER_EXPORT_OPTIONS[0]

      const toastId = toast.loading(`Exporting ${formatOption.label}...`)
      setIsExporting(true)
      setActiveExportFormat(formatOption.id)
      setMobileExportSheetOpen(false)
      setDesktopExportMenuOpen(false)

      try {
        const { blob, formatOption: resolvedOption } = await createExportBlob(format)
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `designer-output.${resolvedOption.extension}`
        link.click()
        URL.revokeObjectURL(url)

        toast.success(`Exported as ${resolvedOption.label}`, {
          id: toastId,
          description: "Downloaded to your device.",
        })
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Export failed", { id: toastId })
      } finally {
        setIsExporting(false)
        setActiveExportFormat(null)
      }
    },
    [createExportBlob, isExporting, isSavingToGallery],
  )

  const saveToGallery = useCallback(async () => {
    if (isSavingToGallery || isExporting) return

    setIsSavingToGallery(true)
    setIsSavedToGallery(false)
    setMobileExportSheetOpen(false)
    setDesktopExportMenuOpen(false)
    const toastId = toast.loading("Saving to Gallery...")

    try {
      const exportResult = await createExportBlob(DEFAULT_DESIGNER_EXPORT_FORMAT)
      const savedShareSlug = await saveBlobToGallery(exportResult)

      if (sharePreviewObjectUrlRef.current) {
        URL.revokeObjectURL(sharePreviewObjectUrlRef.current)
        sharePreviewObjectUrlRef.current = null
      }

      const previewUrl = URL.createObjectURL(exportResult.blob)
      sharePreviewObjectUrlRef.current = previewUrl
      setSharePreviewSrc(previewUrl)
      setShareSlug(savedShareSlug)
      setShareDialogOpen(true)
      setIsSavedToGallery(true)

      toast.success("Saved to Gallery", {
        id: toastId,
        description: "Share link is ready. Configure privacy and community settings in the popup.",
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed", { id: toastId })
    } finally {
      setIsSavingToGallery(false)
    }
  }, [createExportBlob, isExporting, isSavingToGallery, saveBlobToGallery])

  return (
    <div className="w-full px-4 pt-10 pb-28 sm:px-6 lg:px-8 xl:h-[calc(100vh-4rem)] xl:overflow-hidden xl:pb-6 xl:pt-6">
      <div className="grid gap-6 xl:h-full">
        <Card className="order-2 h-fit space-y-2.5 p-3 xl:fixed xl:right-0 xl:top-16 xl:z-20 xl:h-[calc(100vh-4rem)] xl:w-[360px] xl:overflow-y-auto xl:rounded-none xl:border-l xl:border-r-0 xl:border-t-0 xl:border-b-0 xl:bg-card [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="rounded-xl border border-border bg-muted/20 p-3">
            <div className="mb-2">
              <p className="text-sm font-semibold">Output Mode</p>
              <p className="text-xs text-muted-foreground">Set how the lower text area is rendered.</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setBottomMode("fade")}
                className={`rounded-lg border p-2 text-left transition-colors ${isBottomFadeMode
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
                className={`rounded-lg border p-2 text-left transition-colors ${isBelowImageBlackoutMode
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
              ref={headlineRef}
              rows={1}
              value={headline}
              onChange={(event) => {
                setHeadline(event.target.value)
              }}
              placeholder="Write your headline"
              className="min-h-0 resize-none overflow-hidden"
              disabled={!showHeadline}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="subline">Subline</Label>
              <div className="flex items-center gap-2">
                <Label htmlFor="show-subline" className="cursor-pointer text-xs text-muted-foreground">
                  Show
                </Label>
                <Switch id="show-subline" checked={showSubline} onCheckedChange={setShowSubline} />
              </div>
            </div>
            <Textarea
              id="subline"
              ref={sublineRef}
              rows={1}
              value={subline}
              onChange={(event) => {
                setSubline(event.target.value)
              }}
              placeholder="Optional supporting text"
              className="min-h-0 resize-none overflow-hidden"
              disabled={!showSubline}
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
              placeholder={bottomRightTextPlaceholder}
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
            <div className="mb-2 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">Brand Logo</p>
                <p className="text-xs text-muted-foreground">Upload once and reuse it on future designs.</p>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="show-logo" className="cursor-pointer text-xs text-muted-foreground">
                  Show
                </Label>
                <Switch
                  id="show-logo"
                  checked={showLogo}
                  onCheckedChange={setShowLogo}
                  disabled={!logoUrl}
                />
              </div>
            </div>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="hidden"
              onChange={handleLogoFileInput}
            />
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => logoInputRef.current?.click()}
                disabled={isLogoLoading || isLogoUploading || isLogoRemoving}
              >
                {isLogoUploading ? (
                  <>
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    Uploading
                  </>
                ) : logoUrl ? (
                  "Replace logo"
                ) : (
                  "Upload logo"
                )}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={removeSavedLogo}
                disabled={!logoUrl || isLogoLoading || isLogoUploading || isLogoRemoving}
              >
                {isLogoRemoving ? (
                  <>
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    Removing
                  </>
                ) : (
                  "Remove"
                )}
              </Button>
            </div>
            {logoUrl ? (
              <div className="mt-2 rounded-lg border border-border/60 bg-background/70 p-2">
                <img
                  src={`/api/user/designer-logo/image?v=${logoAssetVersion}`}
                  alt="Saved logo preview"
                  className="h-12 w-auto max-w-full object-contain"
                />
              </div>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground">No saved logo yet.</p>
            )}
            <div className="mt-2 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <Label htmlFor="show-logo-background">Logo Background</Label>
                <Switch
                  id="show-logo-background"
                  checked={showLogoBackground}
                  onCheckedChange={setShowLogoBackground}
                  disabled={!logoUrl || !showLogo}
                />
              </div>
            </div>
            <div className="mt-2 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <Label>Logo Size</Label>
                <span className="text-muted-foreground">{logoSize[0]}%</span>
              </div>
              <Slider
                value={logoSize}
                onValueChange={setLogoSize}
                min={40}
                max={240}
                step={5}
                disabled={!logoUrl}
              />
            </div>
            <div className="mt-2 space-y-1.5">
              <Label className="text-xs">Logo Position</Label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setLogoPosition("top-left")}
                  disabled={!logoUrl}
                  className={`rounded-md border px-2 py-1 text-[11px] transition-colors ${
                    logoPosition === "top-left"
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border bg-background hover:bg-muted disabled:opacity-50"
                  }`}
                >
                  Top Left
                </button>
                <button
                  type="button"
                  onClick={() => setLogoPosition("top-right")}
                  disabled={!logoUrl}
                  className={`rounded-md border px-2 py-1 text-[11px] transition-colors ${
                    logoPosition === "top-right"
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border bg-background hover:bg-muted disabled:opacity-50"
                  }`}
                >
                  Top Right
                </button>
                <button
                  type="button"
                  onClick={() => setLogoPosition("bottom-center")}
                  disabled={!logoUrl}
                  className={`rounded-md border px-2 py-1 text-[11px] transition-colors ${
                    logoPosition === "bottom-center"
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border bg-background hover:bg-muted disabled:opacity-50"
                  }`}
                >
                  Bottom Center
                </button>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">PNG, JPG, WEBP, or SVG up to 2MB.</p>
          </div>

          <div className="rounded-xl border border-border bg-muted/20 p-3">
            <div className="mb-3">
              <p className="text-sm font-semibold">Text Colors</p>
            </div>
            <div className="mb-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">Brand Presets</p>
                <p className="text-[11px] text-muted-foreground">One-click palettes</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {BRAND_COLOR_PRESETS.map((preset) => {
                  const isPresetActive = useUnifiedTextColor
                    ? normalizedAllTextColor === preset.allTextColor
                    : normalizedHeadlineTextColor === preset.headlineTextColor &&
                    normalizedSublineTextColor === preset.sublineTextColor &&
                    normalizedLinkTextColor === preset.linkTextColor &&
                    normalizedBottomRightTextColor === preset.bottomRightTextColor

                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => applyBrandColorPreset(preset)}
                      className={`rounded-lg border px-2 py-2 text-left transition-colors ${isPresetActive
                        ? "border-primary bg-primary/10 shadow-sm"
                        : "border-border bg-background hover:bg-muted"
                        }`}
                    >
                      <div className="mb-1.5 flex items-center gap-1">
                        {[preset.headlineTextColor, preset.sublineTextColor, preset.linkTextColor, preset.bottomRightTextColor].map((color, index) => (
                          <span
                            key={`${preset.id}-${index}`}
                            className="h-3 w-3 rounded-full border border-white/30"
                            style={{ backgroundColor: color }}
                            aria-hidden="true"
                          />
                        ))}
                      </div>
                      <p className="text-xs font-medium leading-none">{preset.name}</p>
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="mb-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setUseUnifiedTextColor(true)}
                className={`rounded-lg border p-2 text-left transition-colors ${useUnifiedTextColor
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
                className={`rounded-lg border p-2 text-left transition-colors ${!useUnifiedTextColor
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
                  <Label htmlFor="link-text-color" className="text-xs text-muted-foreground">Link in comments</Label>
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

        </Card>

        <div
          className="group relative order-1 overflow-auto cursor-pointer xl:mr-[384px] xl:h-full xl:min-h-0 xl:overflow-hidden"
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
              <div className="relative h-full w-full overflow-hidden rounded-xl border border-dashed border-border/80 bg-card/70 shadow-sm backdrop-blur-sm">
                <img
                  src={DESIGNER_PLACEHOLDER_LIGHT_SRC}
                  alt=""
                  aria-hidden
                  className="absolute inset-0 h-full w-full object-cover dark:hidden"
                />
                <img
                  src={DESIGNER_PLACEHOLDER_DARK_SRC}
                  alt=""
                  aria-hidden
                  className="absolute inset-0 hidden h-full w-full object-cover dark:block"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/35 to-background/20" />
                <div className="relative z-10 flex h-full items-center justify-center px-5 py-4 text-center">
                  <div>
                    <div className="mb-2 flex items-center justify-center">
                      <ImageUp className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium">Click anywhere to upload</p>
                    <p className="text-xs text-muted-foreground">or drag and drop an image</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <canvas
            ref={canvasRef}
            className="mx-auto h-auto w-full max-w-full rounded-xl border border-border bg-card p-3 shadow-2xl xl:h-auto xl:w-auto xl:max-h-full xl:max-w-full"
          />
        </div>
      </div>

      {shouldShowMobileExportButton && mobileExportSheetOpen && (
        <button
          type="button"
          aria-label="Close export menu"
          className="fixed inset-0 z-[58] bg-transparent xl:hidden"
          onClick={() => setMobileExportSheetOpen(false)}
        />
      )}

      {shouldShowMobileExportButton && (
        <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+6.15rem)] right-4 z-[60] xl:hidden">
          <div className="relative flex items-end gap-2">
            <Button
              type="button"
              onClick={() => void saveToGallery()}
              disabled={isSavingToGallery || isExporting}
              size="icon"
              aria-label={isSavingToGallery ? "Saving to gallery" : "Save to gallery"}
              className={`h-12 w-12 rounded-full p-0 shadow-xl ${
                isSavedToGallery ? "bg-emerald-600 hover:bg-emerald-600/90" : ""
              }`}
            >
              {isSavingToGallery ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              <span className="sr-only">
                {isSavingToGallery ? "Saving to gallery" : isSavedToGallery ? "Saved to gallery" : "Save to gallery"}
              </span>
            </Button>

            <div className="relative flex flex-col items-end">
              <div
                id="designer-export-sheet"
                className={`absolute bottom-[calc(100%+0.65rem)] right-0 origin-bottom-right transition-all duration-200 ${
                  mobileExportSheetOpen
                    ? "translate-y-0 opacity-100 pointer-events-auto"
                    : "translate-y-3 opacity-0 pointer-events-none"
                }`}
              >
                <div className="w-12 rounded-2xl border border-primary/80 bg-primary p-1.5 shadow-2xl backdrop-blur">
                  <div className="grid gap-1.5">
                    {DESIGNER_EXPORT_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => exportCanvas(option.id)}
                        disabled={isExporting || isSavingToGallery}
                        className="rounded-md border border-border bg-background px-0 py-1.5 text-center text-[10px] font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-70"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <Button
                type="button"
                onClick={() => setMobileExportSheetOpen((previous) => !previous)}
                disabled={isExporting || isSavingToGallery}
                size="icon"
                aria-expanded={mobileExportSheetOpen}
                aria-controls="designer-export-sheet"
                aria-label={isExporting ? "Exporting design" : "Open export options"}
                className="h-12 w-12 rounded-full p-0 shadow-xl"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="sr-only">Exporting design</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    <span className="sr-only">Open export options</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {shouldShowDesktopExportButton && (
        <div className="fixed bottom-8 right-[calc(360px+1rem)] z-[60] hidden xl:block">
          <div ref={desktopExportMenuRef} className="relative flex items-end gap-2">
            <Button
              type="button"
              onClick={() => void saveToGallery()}
              disabled={isSavingToGallery || isExporting}
              className={`h-12 rounded-full px-4 text-sm font-semibold shadow-xl ${
                isSavedToGallery ? "bg-emerald-600 text-white hover:bg-emerald-600/90" : ""
              }`}
            >
              {isSavingToGallery ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  {isSavedToGallery ? "Saved" : "Save to Gallery"}
                </>
              )}
            </Button>

            <div className="relative flex flex-col items-end">
              <div
                id="designer-desktop-export-menu"
                className={`absolute bottom-[calc(100%+0.65rem)] right-0 origin-bottom-right transition-all duration-200 ${
                  desktopExportMenuOpen
                    ? "translate-y-0 opacity-100 pointer-events-auto"
                    : "translate-y-3 opacity-0 pointer-events-none"
                }`}
              >
                <div className="w-12 rounded-2xl border border-primary/80 bg-primary p-1.5 shadow-2xl backdrop-blur">
                  <div className="grid gap-1.5">
                    {DESIGNER_EXPORT_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => exportCanvas(option.id)}
                        disabled={isExporting || isSavingToGallery}
                        className="rounded-md border border-border bg-background px-0 py-1.5 text-center text-[10px] font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-70"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <Button
                type="button"
                onClick={() => setDesktopExportMenuOpen((previous) => !previous)}
                disabled={isExporting || isSavingToGallery}
                size="icon"
                aria-expanded={desktopExportMenuOpen}
                aria-controls="designer-desktop-export-menu"
                aria-label={isExporting ? "Exporting design" : "Open export options"}
                className="h-12 w-12 rounded-full p-0 shadow-xl"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="sr-only">{`Exporting ${activeExportOption?.label || "..."}`}</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    <span className="sr-only">Open export options</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {shareSlug && sharePreviewSrc ? (
        <ShareDialog
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
          imagePreviewSrc={sharePreviewSrc}
          slug={shareSlug}
          initialIsPrivate={false}
        />
      ) : null}
    </div>
  )
}
