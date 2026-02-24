"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { ArrowLeft, Download, Loader2, Upload, AlignLeft, AlignCenter, AlignRight, Type, Palette, Image as ImageIcon, Settings2, Undo2, Redo2, RotateCcw, Share2, Copy, FileText, Printer, Code, Instagram, Twitter, Facebook, Bold, Italic, Pipette, ArrowUpLeft, ArrowUp, ArrowUpRight, ArrowLeft as ArrowLeftIcon, Dot, ArrowRight as ArrowRightIcon, ArrowDownLeft, ArrowDown, ArrowDownRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { ShareDialog } from "@/components/screensplit/share-dialog"

interface CanvasEditorProps {
  beforeImage: string
  afterImage: string
  onBack: () => void
}

// Default values for reset functionality
const DEFAULT_VALUES = {
  direction: "horizontal" as "horizontal" | "vertical",
  beforeText: "Before",
  afterText: "After",
  beforeSubtext: "",
  afterSubtext: "",
  showLabelsText: true,
  fontSize: 48,
  textColor: "#ffffff",
  bgColor: "#000000",
  textBgColor: "#000000",
  showTextBackground: true,
  textBgOpacity: 0.85,
  textPosition: "top-right" as "top-left" | "top-center" | "top-right" | "center-left" | "center" | "center-right" | "bottom-left" | "bottom-center" | "bottom-right",
  fontFamily: "Inter",
  mainTextBold: true,
  mainTextItalic: false,
  subtextBold: false,
  subtextItalic: false,
  borderWidth: 0,
  borderColor: "#ffffff",
  useGradient: false,
  gradientColor1: "#000000",
  gradientColor2: "#333333",
  gradientAngle: 45,
  blurAmount: 0,
  bgPadding: 0.4,
  bgShape: "rounded" as "rounded" | "pill" | "circle" | "hexagon",
  brightness: 100,
  contrast: 100,
  saturation: 100,
  grayscale: 0,
  sepia: 0,
  exportFormat: "png" as "png" | "jpeg" | "webp" | "bmp",
  quality: 0.95,
}

type EditorState = typeof DEFAULT_VALUES

export function CanvasEditor({ beforeImage, afterImage, onBack }: CanvasEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const previewObjectUrlRef = useRef<string | null>(null)
  const [direction, setDirection] = useState<"horizontal" | "vertical">(DEFAULT_VALUES.direction)
  const [beforeText, setBeforeText] = useState(DEFAULT_VALUES.beforeText)
  const [afterText, setAfterText] = useState(DEFAULT_VALUES.afterText)
  const [beforeSubtext, setBeforeSubtext] = useState(DEFAULT_VALUES.beforeSubtext)
  const [afterSubtext, setAfterSubtext] = useState(DEFAULT_VALUES.afterSubtext)
  const [showLabelsText, setShowLabelsText] = useState(DEFAULT_VALUES.showLabelsText)
  const [fontSize, setFontSize] = useState(DEFAULT_VALUES.fontSize)
  const [textColor, setTextColor] = useState(DEFAULT_VALUES.textColor)
  const [bgColor, setBgColor] = useState(DEFAULT_VALUES.bgColor)
  const [textBgColor, setTextBgColor] = useState(DEFAULT_VALUES.textBgColor)
  const [showTextBackground, setShowTextBackground] = useState(DEFAULT_VALUES.showTextBackground)
  const [textBgOpacity, setTextBgOpacity] = useState(DEFAULT_VALUES.textBgOpacity)
  const [textPosition, setTextPosition] = useState<"top-left" | "top-center" | "top-right" | "center-left" | "center" | "center-right" | "bottom-left" | "bottom-center" | "bottom-right">(DEFAULT_VALUES.textPosition)
  
  // Typography
  const [fontFamily, setFontFamily] = useState(DEFAULT_VALUES.fontFamily)
  const [mainTextBold, setMainTextBold] = useState(DEFAULT_VALUES.mainTextBold)
  const [mainTextItalic, setMainTextItalic] = useState(DEFAULT_VALUES.mainTextItalic)
  const [subtextBold, setSubtextBold] = useState(DEFAULT_VALUES.subtextBold)
  const [subtextItalic, setSubtextItalic] = useState(DEFAULT_VALUES.subtextItalic)
  
  // Background effects
  const [borderWidth, setBorderWidth] = useState(DEFAULT_VALUES.borderWidth)
  const [borderColor, setBorderColor] = useState(DEFAULT_VALUES.borderColor)
  const [useGradient, setUseGradient] = useState(DEFAULT_VALUES.useGradient)
  const [gradientColor1, setGradientColor1] = useState(DEFAULT_VALUES.gradientColor1)
  const [gradientColor2, setGradientColor2] = useState(DEFAULT_VALUES.gradientColor2)
  const [gradientAngle, setGradientAngle] = useState(DEFAULT_VALUES.gradientAngle)
  const [blurAmount, setBlurAmount] = useState(DEFAULT_VALUES.blurAmount)
  const [bgPadding, setBgPadding] = useState(DEFAULT_VALUES.bgPadding)
  const [bgShape, setBgShape] = useState<"rounded" | "pill" | "circle" | "hexagon">(DEFAULT_VALUES.bgShape)
  
  // Image filters
  const [brightness, setBrightness] = useState(DEFAULT_VALUES.brightness)
  const [contrast, setContrast] = useState(DEFAULT_VALUES.contrast)
  const [saturation, setSaturation] = useState(DEFAULT_VALUES.saturation)
  const [grayscale, setGrayscale] = useState(DEFAULT_VALUES.grayscale)
  const [sepia, setSepia] = useState(DEFAULT_VALUES.sepia)
  const [exportFormat, setExportFormat] = useState<"png" | "jpeg" | "webp" | "bmp">(DEFAULT_VALUES.exportFormat)
  const [quality, setQuality] = useState(DEFAULT_VALUES.quality)
  const [isUploading, setIsUploading] = useState(false)
  const [isCloudSaved, setIsCloudSaved] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [shareSlug, setShareSlug] = useState<string | null>(null)
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null)

  // Export & Sharing state
  const [socialPresetDialogOpen, setSocialPresetDialogOpen] = useState(false)
  const [embedDialogOpen, setEmbedDialogOpen] = useState(false)
  const [embedCode, setEmbedCode] = useState("")

  // Undo/Redo state management
  const [history, setHistory] = useState<EditorState[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const isRestoringRef = useRef(false)
  
  // Sticky canvas state
  const [stickyCanvas, setStickyCanvas] = useState(false)

  useEffect(() => {
    return () => {
      if (previewObjectUrlRef.current) {
        URL.revokeObjectURL(previewObjectUrlRef.current)
        previewObjectUrlRef.current = null
      }
    }
  }, [])

  // Get current editor state
  const getCurrentState = useCallback((): EditorState => ({
    direction,
    beforeText,
    afterText,
    beforeSubtext,
    afterSubtext,
    showLabelsText,
    fontSize,
    textColor,
    bgColor,
    textBgColor,
    showTextBackground,
    textBgOpacity,
    textPosition,
    fontFamily,
    mainTextBold,
    mainTextItalic,
    subtextBold,
    subtextItalic,
    borderWidth,
    borderColor,
    useGradient,
    gradientColor1,
    gradientColor2,
    gradientAngle,
    blurAmount,
    bgPadding,
    bgShape,
    brightness,
    contrast,
    saturation,
    grayscale,
    sepia,
    exportFormat,
    quality,
  }), [direction, beforeText, afterText, beforeSubtext, afterSubtext, showLabelsText, fontSize, textColor, bgColor, textBgColor, showTextBackground, textBgOpacity, textPosition, fontFamily, mainTextBold, mainTextItalic, subtextBold, subtextItalic, borderWidth, borderColor, useGradient, gradientColor1, gradientColor2, gradientAngle, blurAmount, bgPadding, bgShape, brightness, contrast, saturation, grayscale, sepia, exportFormat, quality])

  // Save state to history
  const saveToHistory = useCallback(() => {
    if (isRestoringRef.current) return
    
    const currentState = getCurrentState()
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1)
      newHistory.push(currentState)
      // Keep only last 50 states
      if (newHistory.length > 50) {
        newHistory.shift()
        return newHistory
      }
      return newHistory
    })
    setHistoryIndex(prev => Math.min(prev + 1, 49))
  }, [getCurrentState, historyIndex])

  // Restore state from history
  const restoreState = useCallback((state: EditorState) => {
    isRestoringRef.current = true
    setDirection(state.direction)
    setBeforeText(state.beforeText)
    setAfterText(state.afterText)
    setBeforeSubtext(state.beforeSubtext)
    setAfterSubtext(state.afterSubtext)
    setShowLabelsText(state.showLabelsText)
    setFontSize(state.fontSize)
    setTextColor(state.textColor)
    setBgColor(state.bgColor)
    setTextBgColor(state.textBgColor)
    setShowTextBackground(state.showTextBackground)
    setTextBgOpacity(state.textBgOpacity)
    setTextPosition(state.textPosition)
    setFontFamily(state.fontFamily)
    setMainTextBold(state.mainTextBold)
    setMainTextItalic(state.mainTextItalic)
    setSubtextBold(state.subtextBold)
    setSubtextItalic(state.subtextItalic)
    setBorderWidth(state.borderWidth)
    setBorderColor(state.borderColor)
    setUseGradient(state.useGradient)
    setGradientColor1(state.gradientColor1)
    setGradientColor2(state.gradientColor2)
    setGradientAngle(state.gradientAngle)
    setBlurAmount(state.blurAmount)
    setBgPadding(state.bgPadding)
    setBgShape(state.bgShape)
    setBrightness(state.brightness)
    setContrast(state.contrast)
    setSaturation(state.saturation)
    setGrayscale(state.grayscale)
    setSepia(state.sepia)
    setExportFormat(state.exportFormat)
    setQuality(state.quality)
    setTimeout(() => {
      isRestoringRef.current = false
    }, 0)
  }, [])

  // Undo function
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      restoreState(history[newIndex])
      toast.success("Undo applied")
    }
  }, [historyIndex, history, restoreState])

  // Redo function
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      restoreState(history[newIndex])
      toast.success("Redo applied")
    }
  }, [historyIndex, history, restoreState])

  // Reset to defaults
  const handleResetToDefaults = useCallback(() => {
    restoreState(DEFAULT_VALUES)
    toast.success("All settings reset to defaults")
  }, [restoreState])

  // Track state changes for undo/redo
  useEffect(() => {
    saveToHistory()
    setIsCloudSaved(false)
  }, [direction, beforeText, afterText, beforeSubtext, afterSubtext, showLabelsText, fontSize, textColor, bgColor, textBgColor, showTextBackground, textBgOpacity, textPosition, fontFamily, mainTextBold, mainTextItalic, subtextBold, subtextItalic, borderWidth, borderColor, useGradient, gradientColor1, gradientColor2, gradientAngle, blurAmount, bgPadding, bgShape, brightness, contrast, saturation, grayscale, sepia])

  // Social media preset dimensions
  const socialPresets = {
    instagram_square: { width: 1080, height: 1080, name: "Instagram Square" },
    instagram_portrait: { width: 1080, height: 1350, name: "Instagram Portrait" },
    instagram_story: { width: 1080, height: 1920, name: "Instagram Story" },
    twitter_post: { width: 1200, height: 675, name: "Twitter Post" },
    facebook_post: { width: 1200, height: 630, name: "Facebook Post" },
    linkedin_post: { width: 1200, height: 627, name: "LinkedIn Post" },
    pinterest_pin: { width: 1000, height: 1500, name: "Pinterest Pin" },
    youtube_thumbnail: { width: 1280, height: 720, name: "YouTube Thumbnail" },
  }

  // Export to social media preset
  const handleSocialPreset = useCallback((preset: keyof typeof socialPresets) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const { width, height, name } = socialPresets[preset]
    
    // Create temporary canvas with preset dimensions
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = width
    tempCanvas.height = height
    const tempCtx = tempCanvas.getContext('2d')
    if (!tempCtx) return

    // Calculate scaling to fit while maintaining aspect ratio
    const scale = Math.min(width / canvas.width, height / canvas.height)
    const scaledWidth = canvas.width * scale
    const scaledHeight = canvas.height * scale
    const x = (width - scaledWidth) / 2
    const y = (height - scaledHeight) / 2

    // Draw background
    tempCtx.fillStyle = bgColor
    tempCtx.fillRect(0, 0, width, height)

    // Draw scaled canvas content
    tempCtx.drawImage(canvas, x, y, scaledWidth, scaledHeight)

    // Download
    const dataUrl = tempCanvas.toDataURL('image/png', 1.0)
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `screensplit-${preset}-${Date.now()}.png`
    a.click()

    setSocialPresetDialogOpen(false)
    toast.success(`Exported for ${name}`, {
      description: `${width}x${height} optimized image downloaded`
    })
  }, [bgColor])

  // Copy to clipboard
  const handleCopyToClipboard = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          toast.error("Failed to create image")
          return
        }

        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': blob
          })
        ])

        toast.success("Copied to clipboard!", {
          description: "You can now paste the image anywhere"
        })
      }, 'image/png')
    } catch (error) {
      console.error('Copy to clipboard failed:', error)
      toast.error("Copy failed", {
        description: "Your browser may not support clipboard API"
      })
    }
  }, [])

  // Export as PDF
  const handleExportPDF = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    try {
      // Use jsPDF library (we'll need to install this)
      // For now, we'll create a workaround using canvas in a new window
      const dataUrl = canvas.toDataURL('image/png', 1.0)
      
      // Create a printable version
      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        toast.error("Popup blocked", {
          description: "Please allow popups to export PDF"
        })
        return
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>ScreenSplit Export</title>
            <style>
              body { margin: 0; padding: 20px; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
              img { max-width: 100%; height: auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
              @media print {
                body { padding: 0; }
                img { box-shadow: none; }
              }
            </style>
          </head>
          <body>
            <Image src="${dataUrl}" alt="ScreenSplit Comparison" />
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                }, 500);
              }
            </script>
          </body>
        </html>
      `)
      printWindow.document.close()

      toast.success("PDF export opened", {
        description: "Use Print > Save as PDF in the dialog"
      })
    } catch (error) {
      console.error('PDF export failed:', error)
      toast.error("PDF export failed")
    }
  }, [])

  // Generate embed code
  const handleGenerateEmbed = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Get the data URL
    const dataUrl = canvas.toDataURL('image/png', 1.0)
    
    // For a real implementation, you'd upload this to your server
    // For now, we'll create an embed code with a placeholder
    const width = canvas.width
    const height = canvas.height
    
    const code = `<!-- ScreenSplit Comparison Embed -->
<div class="screensplit-embed" style="max-width: ${width}px; margin: 0 auto;">
  <Image 
    src="${dataUrl.substring(0, 50)}..." 
    alt="Before and After Comparison"
    style="width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"
  />
  <p style="text-align: center; margin-top: 10px; font-size: 14px; color: #666;">
    Created with <a href="https://screensplit.com" target="_blank">ScreenSplit</a>
  </p>
</div>`

    setEmbedCode(code)
    setEmbedDialogOpen(true)
  }, [])

  // Copy embed code to clipboard
  const handleCopyEmbedCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(embedCode)
      toast.success("Embed code copied!", {
        description: "Paste it into your website's HTML"
      })
    } catch (error) {
      toast.error("Failed to copy embed code")
    }
  }, [embedCode])

  // Print optimized version
  const handlePrint = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dataUrl = canvas.toDataURL('image/png', 1.0)
    
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toast.error("Popup blocked", {
        description: "Please allow popups to print"
      })
      return
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print - ScreenSplit Comparison</title>
          <style>
            @page {
              size: auto;
              margin: 20mm;
            }
            body {
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            img {
              max-width: 100%;
              max-height: 100vh;
              object-fit: contain;
            }
            @media print {
              body {
                display: block;
              }
              img {
                display: block;
                margin: 0 auto;
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <Image src="${dataUrl}" alt="Before and After Comparison" />
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                setTimeout(function() { window.close(); }, 100);
              }, 250);
            }
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()

    toast.success("Print dialog opened", {
      description: "Print-optimized version ready"
    })
  }, [])

  // Share to social media
  const handleSocialShare = useCallback(async (platform: 'twitter' | 'facebook' | 'linkedin') => {
    const canvas = canvasRef.current
    if (!canvas) return

    // In a real implementation, you'd upload the image first and get a URL
    // For now, we'll use the share URL if available, or show instructions
    
    const text = encodeURIComponent(`Check out this before/after comparison created with ScreenSplit!`)
    const url = encodeURIComponent(shareSlug ? `${window.location.origin}/share/${shareSlug}` : window.location.origin)

    let shareUrl = ''
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`
        break
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`
        break
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`
        break
    }

    if (!shareSlug) {
      toast.info("Save first to share", {
        description: "Click 'Save to Cloud' to upload your image, then you can share it on social media"
      })
      return
    }

    window.open(shareUrl, '_blank', 'width=600,height=400')
    toast.success(`Opening ${platform}`, {
      description: "Share your comparison!"
    })
  }, [shareSlug])

  useEffect(() => {
    drawCanvas()
  }, [beforeImage, afterImage, direction, beforeText, afterText, beforeSubtext, afterSubtext, showLabelsText, fontSize, textColor, bgColor, textBgColor, showTextBackground, textBgOpacity, textPosition, fontFamily, mainTextBold, mainTextItalic, subtextBold, subtextItalic, borderWidth, borderColor, useGradient, gradientColor1, gradientColor2, gradientAngle, blurAmount, bgPadding, bgShape, brightness, contrast, saturation, grayscale, sepia])

  const drawCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const beforeImg = new Image()
    const afterImg = new Image()
    beforeImg.crossOrigin = "anonymous"
    afterImg.crossOrigin = "anonymous"

    let loadedCount = 0

    const drawTextWithBackground = (
      text: string,
      subtext: string,
      x: number,
      y: number,
      width: number,
      height: number
    ) => {
      const hasSubtext = subtext.trim().length > 0
      const subtextFontSize = fontSize * 0.5
      const lineSpacing = fontSize * 0.3
      
      // Build font strings with family and style
      const mainFontWeight = mainTextBold ? 'bold' : 'normal'
      const mainFontStyle = mainTextItalic ? 'italic' : 'normal'
      const subtextFontWeight = subtextBold ? 'bold' : 'normal'
      const subtextFontStyle = subtextItalic ? 'italic' : 'normal'
      
      // Measure main text
      ctx.font = `${mainFontStyle} ${mainFontWeight} ${fontSize}px ${fontFamily}, sans-serif`
      const mainMetrics = ctx.measureText(text)
      const mainTextWidth = mainMetrics.width
      
      // Measure subtext if exists
      let subtextWidth = 0
      if (hasSubtext) {
        ctx.font = `${subtextFontStyle} ${subtextFontWeight} ${subtextFontSize}px ${fontFamily}, sans-serif`
        const subtextMetrics = ctx.measureText(subtext)
        subtextWidth = subtextMetrics.width
      }
      
      // Calculate dimensions with custom padding
      const maxTextWidth = Math.max(mainTextWidth, subtextWidth)
      const padding = fontSize * bgPadding
      const bgWidth = maxTextWidth + padding * 2
      const totalTextHeight = hasSubtext ? fontSize + lineSpacing + subtextFontSize : fontSize
      const bgHeight = totalTextHeight + padding * 1.5
      
      // Calculate position based on textPosition
      let bgX = x
      let bgY = y
      
      // Horizontal alignment
      if (textPosition.includes("left")) {
        bgX = x + padding
      } else if (textPosition.includes("right")) {
        bgX = x + width - bgWidth - padding
      } else {
        bgX = x + (width - bgWidth) / 2
      }
      
      // Vertical alignment
      if (textPosition.startsWith("top")) {
        bgY = y + padding
      } else if (textPosition.startsWith("bottom")) {
        bgY = y + height - bgHeight - padding
      } else {
        bgY = y + (height - bgHeight) / 2
      }
      
      // Calculate text center positions relative to background
      const centerX = bgX + bgWidth / 2
      const centerY = bgY + bgHeight / 2
      
      // Draw background (if enabled)
      if (showTextBackground) {
        ctx.save()
        
        // Apply blur effect if enabled
        if (blurAmount > 0) {
          ctx.filter = `blur(${blurAmount}px)`
        }
        
        // Set opacity
        ctx.globalAlpha = textBgOpacity
        
        // Create path based on shape
        ctx.beginPath()
        
        switch (bgShape) {
          case 'pill':
            ctx.roundRect(bgX, bgY, bgWidth, bgHeight, bgHeight / 2)
            break
          case 'circle':
            const circleSize = Math.max(bgWidth, bgHeight)
            const circleX = bgX + (bgWidth - circleSize) / 2
            const circleY = bgY + (bgHeight - circleSize) / 2
            ctx.arc(centerX, centerY, circleSize / 2, 0, Math.PI * 2)
            break
          case 'hexagon':
            const hexWidth = bgWidth
            const hexHeight = bgHeight
            const hexCenterX = bgX + hexWidth / 2
            const hexCenterY = bgY + hexHeight / 2
            const hexRadius = Math.min(hexWidth, hexHeight) / 2
            for (let i = 0; i < 6; i++) {
              const angle = (Math.PI / 3) * i
              const hx = hexCenterX + hexRadius * Math.cos(angle)
              const hy = hexCenterY + hexRadius * Math.sin(angle)
              if (i === 0) ctx.moveTo(hx, hy)
              else ctx.lineTo(hx, hy)
            }
            ctx.closePath()
            break
          default: // rounded
            ctx.roundRect(bgX, bgY, bgWidth, bgHeight, 20)
        }
        
        // Fill with gradient or solid color
        if (useGradient) {
          const angleRad = (gradientAngle * Math.PI) / 180
          const gradientLength = Math.sqrt(bgWidth ** 2 + bgHeight ** 2)
          const x1 = centerX - (Math.cos(angleRad) * gradientLength) / 2
          const y1 = centerY - (Math.sin(angleRad) * gradientLength) / 2
          const x2 = centerX + (Math.cos(angleRad) * gradientLength) / 2
          const y2 = centerY + (Math.sin(angleRad) * gradientLength) / 2
          
          const gradient = ctx.createLinearGradient(x1, y1, x2, y2)
          gradient.addColorStop(0, gradientColor1)
          gradient.addColorStop(1, gradientColor2)
          ctx.fillStyle = gradient
        } else {
          ctx.fillStyle = textBgColor
        }
        
        ctx.fill()
        
        // Draw border if enabled
        if (borderWidth > 0) {
          ctx.globalAlpha = 1.0
          ctx.strokeStyle = borderColor
          ctx.lineWidth = borderWidth
          ctx.stroke()
        }
        
        ctx.restore()
      }
      
      // Draw main text
      ctx.font = `${mainFontStyle} ${mainFontWeight} ${fontSize}px ${fontFamily}, sans-serif`
      ctx.fillStyle = textColor
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.globalAlpha = 1.0
      
      const mainTextY = hasSubtext ? centerY - (lineSpacing + subtextFontSize) / 2 : centerY
      ctx.fillText(text, centerX, mainTextY)
      
      // Draw subtext if exists
      if (hasSubtext) {
        ctx.font = `${subtextFontStyle} ${subtextFontWeight} ${subtextFontSize}px ${fontFamily}, sans-serif`
        ctx.globalAlpha = 0.8
        const subtextY = mainTextY + fontSize / 2 + lineSpacing + subtextFontSize / 2
        ctx.fillText(subtext, centerX, subtextY)
        ctx.globalAlpha = 1.0
      }
    }

    const onImageLoad = () => {
      loadedCount++
      if (loadedCount === 2) {
        const maxWidth = 1920
        const maxHeight = 1080

        // Build filter string
        const filterString = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) grayscale(${grayscale}%) sepia(${sepia}%)`
        
        if (direction === "horizontal") {
          const targetHeight = Math.min(maxHeight, Math.max(beforeImg.height, afterImg.height))
          const beforeWidth = (beforeImg.width * targetHeight) / beforeImg.height
          const afterWidth = (afterImg.width * targetHeight) / afterImg.height

          canvas.width = beforeWidth + afterWidth
          canvas.height = targetHeight

          ctx.fillStyle = bgColor
          ctx.fillRect(0, 0, canvas.width, canvas.height)

          // Apply filters to images
          ctx.filter = filterString
          ctx.drawImage(beforeImg, 0, 0, beforeWidth, targetHeight)
          ctx.drawImage(afterImg, beforeWidth, 0, afterWidth, targetHeight)
          ctx.filter = 'none'

          if (showLabelsText) {
            // Draw labels and text overlays
            drawTextWithBackground(beforeText, beforeSubtext, 0, 0, beforeWidth, targetHeight)
            drawTextWithBackground(afterText, afterSubtext, beforeWidth, 0, afterWidth, targetHeight)
          }
        } else {
          const targetWidth = Math.min(maxWidth, Math.max(beforeImg.width, afterImg.width))
          const beforeHeight = (beforeImg.height * targetWidth) / beforeImg.width
          const afterHeight = (afterImg.height * targetWidth) / afterImg.width

          canvas.width = targetWidth
          canvas.height = beforeHeight + afterHeight

          ctx.fillStyle = bgColor
          ctx.fillRect(0, 0, canvas.width, canvas.height)

          // Apply filters to images
          ctx.filter = filterString
          ctx.drawImage(beforeImg, 0, 0, targetWidth, beforeHeight)
          ctx.drawImage(afterImg, 0, beforeHeight, targetWidth, afterHeight)
          ctx.filter = 'none'

          if (showLabelsText) {
            // Draw labels and text overlays
            drawTextWithBackground(beforeText, beforeSubtext, 0, 0, targetWidth, beforeHeight)
            drawTextWithBackground(afterText, afterSubtext, 0, beforeHeight, targetWidth, afterHeight)
          }
        }
      }
    }

    beforeImg.onload = onImageLoad
    afterImg.onload = onImageLoad
    beforeImg.src = beforeImage
    afterImg.src = afterImage
  }

  const createExportBlob = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) {
      throw new Error("Canvas not ready")
    }

    // Determine MIME type and quality
    let mimeType = "image/png"
    let fileExtension = "png"
    let useQuality = quality

    switch (exportFormat) {
      case "jpeg":
        mimeType = "image/jpeg"
        fileExtension = "jpg"
        break
      case "webp":
        mimeType = "image/webp"
        fileExtension = "webp"
        break
      case "bmp":
        mimeType = "image/bmp"
        fileExtension = "bmp"
        useQuality = 1
        break
      default:
        mimeType = "image/png"
        fileExtension = "png"
        useQuality = 1
    }

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), mimeType, useQuality)
    })

    if (!blob) {
      throw new Error("Unable to generate image file.")
    }

    return { blob, fileExtension }
  }, [exportFormat, quality])

  const handleDownloadNow = useCallback(async () => {
    try {
      const { blob, fileExtension } = await createExportBlob()
      const downloadUrl = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = downloadUrl
      a.download = `screensplit-${Date.now()}.${fileExtension}`
      a.click()
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 2000)
      toast.success("Download started")
    } catch (error) {
      toast.error("Download failed", {
        description: error instanceof Error ? error.message : "Unable to export image.",
      })
    }
  }, [createExportBlob])

  const handleSaveToCloud = useCallback(async () => {
    setShareSlug(null)
    setShareDialogOpen(false)
    setIsCloudSaved(false)

    let blob: Blob
    let fileExtension: string
    try {
      const exported = await createExportBlob()
      blob = exported.blob
      fileExtension = exported.fileExtension
    } catch (error) {
      toast.error("Save failed", {
        description: error instanceof Error ? error.message : "Unable to export image.",
      })
      return
    }

    // Keep a preview URL for the share dialog.
    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(previewObjectUrlRef.current)
      previewObjectUrlRef.current = null
    }
    const objectUrl = URL.createObjectURL(blob)
    previewObjectUrlRef.current = objectUrl
    setImageDataUrl(objectUrl)

    const toastId = toast.loading("Saving to cloud...")
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("image", blob, `screensplit-${Date.now()}.${fileExtension}`)
      formData.append("layout", direction)
      formData.append("beforeLabel", beforeText)
      formData.append("afterLabel", afterText)
      formData.append("beforeSubtext", beforeSubtext)
      formData.append("afterSubtext", afterSubtext)
      formData.append("fontSize", String(fontSize))
      formData.append("textColor", textColor)
      formData.append("bgColor", bgColor)
      formData.append("textBgColor", textBgColor)
      formData.append("textPosition", textPosition)
      formData.append("exportFormat", exportFormat)

      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json().catch(() => null)
        throw new Error(error?.error || "Failed to upload image")
      }

      const data = await response.json()
      setShareSlug(data.shareSlug)
      setShareDialogOpen(true)
      setIsCloudSaved(true)
      toast.success("Saved to cloud!", { description: "Share link is ready.", id: toastId })
    } catch (error) {
      console.error("Error saving image:", error)
      toast.error("Cloud save failed", {
        description: error instanceof Error ? error.message : "Failed to save image to cloud",
        id: toastId,
      })
      setIsCloudSaved(false)
    } finally {
      setIsUploading(false)
    }
  }, [
    afterSubtext,
    afterText,
    beforeSubtext,
    beforeText,
    bgColor,
    createExportBlob,
    direction,
    exportFormat,
    fontSize,
    setIsCloudSaved,
    textBgColor,
    textColor,
    textPosition,
  ])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Check if user is typing in an input
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return
      }

      // Ctrl/Cmd + Z for undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        handleUndo()
      }
      // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y for redo
      else if ((e.ctrlKey || e.metaKey) && (e.shiftKey && e.key === 'z' || e.key === 'y')) {
        e.preventDefault()
        handleRedo()
      }
      // D for download
      else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault()
        void handleDownloadNow()
      }
      // S for save to cloud
      else if (e.key === 's' || e.key === 'S') {
        e.preventDefault()
        if (!isUploading) {
          void handleSaveToCloud()
        }
      }
      // R for reset
      else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault()
        handleResetToDefaults()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handleUndo, handleRedo, handleDownloadNow, handleSaveToCloud, handleResetToDefaults, isUploading])

  return (
    <TooltipProvider>
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" onClick={onBack} className="mb-6 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Upload
            </Button>
          </TooltipTrigger>
          <TooltipContent>Return to upload screen</TooltipContent>
        </Tooltip>

        <div className="grid gap-6 lg:gap-8 lg:grid-cols-[1fr_400px]">
          {/* Preview */}
          <div className={`w-full space-y-4 lg:self-start ${
            stickyCanvas ? 'sticky top-20 z-40 bg-background pb-4 pt-2' : 'lg:sticky lg:top-8'
          }`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      onClick={handleUndo} 
                      disabled={historyIndex <= 0}
                      variant="outline"
                      size="icon"
                      className="rounded-full shrink-0"
                    >
                      <Undo2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      onClick={handleRedo} 
                      disabled={historyIndex >= history.length - 1}
                      variant="outline"
                      size="icon"
                      className="rounded-full shrink-0"
                    >
                      <Redo2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Redo (Ctrl+Shift+Z)</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      onClick={handleResetToDefaults} 
                      variant="outline"
                      size="icon"
                      className="rounded-full shrink-0"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Reset to Defaults (R)</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                      <Button 
                        onClick={() => void handleDownloadNow()} 
                        className="gap-2 bg-primary rounded-full shrink-0"
                      >
                      <Download className="h-4 w-4" />
                      <span className="hidden sm:inline">Download Now</span>
                      <span className="sm:hidden">Download</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Instant local download (D)</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      onClick={() => void handleSaveToCloud()} 
                      disabled={isUploading} 
                      variant="outline"
                      className="gap-2 rounded-full shrink-0"
                    >
                      {isUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      <span className="hidden sm:inline">{isUploading ? "Saving..." : isCloudSaved ? "Saved" : "Save to Cloud"}</span>
                      <span className="sm:hidden">{isUploading ? "..." : "Save"}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Upload to cloud and generate share link (S)</TooltipContent>
                </Tooltip>
              </div>
            </div>
            <div className="overflow-auto rounded-2xl border border-border bg-secondary/50 p-4 lg:max-h-[calc(100vh-12rem)]">
              <canvas ref={canvasRef} className="mx-auto max-w-full" />
            </div>
          </div>

          {/* Export & Sharing Actions - Outside sticky container */}
          <div className="w-full space-y-3 lg:hidden">
            <h3 className="text-sm font-semibold text-muted-foreground">Export & Share</h3>
            <div className="grid grid-cols-2 gap-2 w-full">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={() => setSocialPresetDialogOpen(true)}
                    variant="outline"
                    size="sm"
                    className="gap-1.5 w-full justify-start text-xs sm:text-sm"
                  >
                    <Share2 className="h-4 w-4 shrink-0" />
                    <span className="truncate">Social Presets</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Export for Instagram, Twitter, Facebook, etc.</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={handleCopyToClipboard}
                    variant="outline"
                    size="sm"
                    className="gap-1.5 w-full justify-start text-xs sm:text-sm"
                  >
                    <Copy className="h-4 w-4 shrink-0" />
                    <span className="truncate">Copy Image</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copy image to clipboard (Ctrl+C)</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={handleExportPDF}
                    variant="outline"
                    size="sm"
                    className="gap-1.5 w-full justify-start text-xs sm:text-sm"
                  >
                    <FileText className="h-4 w-4 shrink-0" />
                    <span className="truncate">Export PDF</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Export as PDF for presentations</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={handlePrint}
                    variant="outline"
                    size="sm"
                    className="gap-1.5 w-full justify-start text-xs sm:text-sm"
                  >
                    <Printer className="h-4 w-4 shrink-0" />
                    <span className="truncate">Print</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Print-optimized version</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={handleGenerateEmbed}
                    variant="outline"
                    size="sm"
                    className="gap-1.5 w-full justify-start text-xs sm:text-sm"
                  >
                    <Code className="h-4 w-4 shrink-0" />
                    <span className="truncate">Embed Code</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Generate embed code for websites</TooltipContent>
              </Tooltip>

              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="outline"
                        size="sm"
                        className="gap-1.5 w-full justify-start text-xs sm:text-sm"
                        disabled={!shareSlug}
                      >
                        <Share2 className="h-4 w-4 shrink-0" />
                        <span className="truncate">Share</span>
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    {shareSlug ? "Share on social media" : "Save first to enable social sharing"}
                  </TooltipContent>
                </Tooltip>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleSocialShare('twitter')} className="gap-2">
                    <Twitter className="h-4 w-4 text-blue-500" />
                    Share on Twitter
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSocialShare('facebook')} className="gap-2">
                    <Facebook className="h-4 w-4 text-blue-600" />
                    Share on Facebook
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSocialShare('linkedin')} className="gap-2">
                    <Share2 className="h-4 w-4 text-blue-700" />
                    Share on LinkedIn
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Controls */}
          <div className="w-full space-y-6 rounded-2xl border border-border bg-card p-4 sm:p-6 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold">Customize</h2>
                <Separator orientation="vertical" className="h-5 lg:hidden" />
                {/* Sticky Canvas Toggle - Mobile Only */}
                <div className="flex items-center gap-2 lg:hidden">
                  <Switch
                    id="sticky-canvas"
                    checked={stickyCanvas}
                    onCheckedChange={setStickyCanvas}
                  />
                  <Label htmlFor="sticky-canvas" className="text-xs cursor-pointer whitespace-nowrap">
                    Sticky Image
                  </Label>
                </div>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={handleResetToDefaults}
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 shrink-0"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span className="hidden sm:inline">Reset All</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reset all settings to defaults (R)</TooltipContent>
              </Tooltip>
            </div>

          {/* Direction */}
          <div className="flex items-end gap-3">
            <div className="flex-1 space-y-2">
              <Label>Layout Direction</Label>
              <Select value={direction} onValueChange={(value: "horizontal" | "vertical") => setDirection(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="horizontal">Side by Side</SelectItem>
                  <SelectItem value="vertical">Top and Bottom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="mb-1 flex items-center gap-2">
              <Label htmlFor="show-labels-text" className="cursor-pointer whitespace-nowrap text-xs text-muted-foreground">
                Show Before/After Texts
              </Label>
              <Switch
                id="show-labels-text"
                checked={showLabelsText}
                onCheckedChange={setShowLabelsText}
              />
            </div>
          </div>

          <Separator className="my-6" />

          <Accordion type="single" defaultValue="typography" collapsible className="w-full">
            
            {/* Labels Section */}
            <AccordionItem value="labels">
              <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Type className="h-4 w-4 text-primary" />
                  </div>
                  <span>Labels & Text</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                {/* Before Text */}
                <div className="space-y-2">
                  <Label>Before Label</Label>
                  <Input value={beforeText} onChange={(e) => setBeforeText(e.target.value)} placeholder="Before" />
                  <Input 
                    value={beforeSubtext} 
                    onChange={(e) => setBeforeSubtext(e.target.value)} 
                    placeholder="Subheading (optional - e.g., date/time)" 
                    className="text-sm"
                  />
                  <div className="flex justify-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setBeforeSubtext(new Date().toLocaleDateString())}
                      className="text-xs flex-1 rounded-full opacity-90 hover:opacity-100"
                    >
                      Add Date
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setBeforeSubtext(new Date().toLocaleTimeString())}
                      className="text-xs flex-1 rounded-full opacity-90 hover:opacity-100"
                    >
                      Add Time
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setBeforeSubtext(new Date().toLocaleString())}
                      className="text-xs flex-1 rounded-full opacity-90 hover:opacity-100"
                    >
                      Both
                    </Button>
                  </div>
                </div>

                {/* After Text */}
                <div className="space-y-2">
                  <Label>After Label</Label>
                  <Input value={afterText} onChange={(e) => setAfterText(e.target.value)} placeholder="After" />
                  <Input 
                    value={afterSubtext} 
                    onChange={(e) => setAfterSubtext(e.target.value)} 
                    placeholder="Subheading (optional - e.g., date/time)" 
                    className="text-sm"
                  />
                  <div className="flex justify-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setAfterSubtext(new Date().toLocaleDateString())}
                      className="text-xs flex-1 rounded-full opacity-90 hover:opacity-100"
                    >
                      Add Date
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setAfterSubtext(new Date().toLocaleTimeString())}
                      className="text-xs flex-1 rounded-full opacity-90 hover:opacity-100"
                    >
                      Add Time
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setAfterSubtext(new Date().toLocaleString())}
                      className="text-xs flex-1 rounded-full opacity-90 hover:opacity-100"
                    >
                      Both
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Typography Section */}
            <AccordionItem value="typography">
              <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Type className="h-4 w-4 text-primary" />
                  </div>
                  <span>Typography</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-6 pt-4">
                {/* Font Family */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Font Family</Label>
                    <span className="text-xs text-muted-foreground">{fontFamily}</span>
                  </div>
                  <Select value={fontFamily} onValueChange={setFontFamily}>
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inter">Inter</SelectItem>
                      <SelectItem value="Roboto">Roboto</SelectItem>
                      <SelectItem value="Montserrat">Montserrat</SelectItem>
                      <SelectItem value="Poppins">Poppins</SelectItem>
                      <SelectItem value="Open Sans">Open Sans</SelectItem>
                      <SelectItem value="Lato">Lato</SelectItem>
                      <SelectItem value="Playfair Display">Playfair Display</SelectItem>
                      <SelectItem value="Oswald">Oswald</SelectItem>
                      <SelectItem value="Raleway">Raleway</SelectItem>
                      <SelectItem value="Arial">Arial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Font Size */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Font Size</Label>
                    <span className="text-sm font-semibold tabular-nums">{fontSize}px</span>
                  </div>
                  <Slider 
                    value={[fontSize]} 
                    onValueChange={(value) => setFontSize(value[0])} 
                    min={24} 
                    max={120} 
                    step={4}
                    className="py-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>24px</span>
                    <span>120px</span>
                  </div>
                </div>

                <Separator />

                {/* Text Styling */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Text Style</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Main Text */}
                    <div className="space-y-2">
                      <span className="text-xs text-muted-foreground">Main Text</span>
                      <div className="flex gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant={mainTextBold ? "default" : "outline"}
                              size="sm"
                              onClick={() => setMainTextBold(!mainTextBold)}
                              className="flex-1 h-9"
                            >
                              <Bold className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Bold</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant={mainTextItalic ? "default" : "outline"}
                              size="sm"
                              onClick={() => setMainTextItalic(!mainTextItalic)}
                              className="flex-1 h-9"
                            >
                              <Italic className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Italic</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                    {/* Subtext */}
                    <div className="space-y-2">
                      <span className="text-xs text-muted-foreground">Subtext</span>
                      <div className="flex gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant={subtextBold ? "default" : "outline"}
                              size="sm"
                              onClick={() => setSubtextBold(!subtextBold)}
                              className="flex-1 h-9"
                            >
                              <Bold className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Bold</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant={subtextItalic ? "default" : "outline"}
                              size="sm"
                              onClick={() => setSubtextItalic(!subtextItalic)}
                              className="flex-1 h-9"
                            >
                              <Italic className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Italic</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Text Color */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Text Color</Label>
                    <span className="text-xs font-mono text-muted-foreground uppercase">{textColor}</span>
                  </div>
                  <div className="flex gap-3">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="relative">
                          <Input
                            type="color"
                            value={textColor}
                            onChange={(e) => setTextColor(e.target.value)}
                            className="h-11 w-14 cursor-pointer border-2 p-1"
                          />
                          <Pipette className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Pick a color</p>
                      </TooltipContent>
                    </Tooltip>
                    <Input 
                      value={textColor} 
                      onChange={(e) => setTextColor(e.target.value)} 
                      className="flex-1 h-11 font-mono text-sm" 
                      placeholder="#000000"
                    />
                  </div>
                  {/* Color Presets */}
                  <div className="grid grid-cols-6 gap-2">
                    {['#ffffff', '#000000', '#ef4444', '#3b82f6', '#10b981', '#f59e0b'].map((color) => (
                      <Tooltip key={color}>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => setTextColor(color)}
                            className="h-9 rounded-lg border-2 transition-all hover:scale-110 hover:border-primary"
                            style={{ backgroundColor: color }}
                            aria-label={`Set color to ${color}`}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="font-mono text-xs">{color}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Text Position */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Text Position</Label>
                  <div className="grid grid-cols-3 gap-2 rounded-lg bg-secondary/50 p-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant={textPosition === "top-left" ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setTextPosition("top-left")}
                          className="h-12"
                        >
                          <ArrowUpLeft className="h-5 w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Top Left</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant={textPosition === "top-center" ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setTextPosition("top-center")}
                          className="h-12"
                        >
                          <ArrowUp className="h-5 w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Top Center</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant={textPosition === "top-right" ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setTextPosition("top-right")}
                          className="h-12"
                        >
                          <ArrowUpRight className="h-5 w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Top Right</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant={textPosition === "center-left" ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setTextPosition("center-left")}
                          className="h-12"
                        >
                          <ArrowLeftIcon className="h-5 w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Center Left</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant={textPosition === "center" ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setTextPosition("center")}
                          className="h-12"
                        >
                          <Dot className="h-6 w-6" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Center</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant={textPosition === "center-right" ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setTextPosition("center-right")}
                          className="h-12"
                        >
                          <ArrowRightIcon className="h-5 w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Center Right</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant={textPosition === "bottom-left" ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setTextPosition("bottom-left")}
                          className="h-12"
                        >
                          <ArrowDownLeft className="h-5 w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Bottom Left</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant={textPosition === "bottom-center" ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setTextPosition("bottom-center")}
                          className="h-12"
                        >
                          <ArrowDown className="h-5 w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Bottom Center</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant={textPosition === "bottom-right" ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setTextPosition("bottom-right")}
                          className="h-12"
                        >
                          <ArrowDownRight className="h-5 w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Bottom Right</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Background Effects Section */}
            <AccordionItem value="background">
              <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Palette className="h-4 w-4 text-primary" />
                  </div>
                  <span>Background Effects</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                {/* Show Background Toggle */}
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="show-background" className="cursor-pointer">Show Text Background</Label>
                  <Switch 
                    id="show-background"
                    checked={showTextBackground} 
                    onCheckedChange={setShowTextBackground}
                  />
                </div>

                {showTextBackground && (
                  <>
                    {/* Background Shape */}
                    <div className="space-y-2">
                      <Label>Background Shape</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant={bgShape === "rounded" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setBgShape("rounded")}
                        >
                          Rounded
                        </Button>
                        <Button
                          type="button"
                          variant={bgShape === "pill" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setBgShape("pill")}
                        >
                          Pill
                        </Button>
                        <Button
                          type="button"
                          variant={bgShape === "circle" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setBgShape("circle")}
                        >
                          Circle
                        </Button>
                        <Button
                          type="button"
                          variant={bgShape === "hexagon" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setBgShape("hexagon")}
                        >
                          Hexagon
                        </Button>
                      </div>
                    </div>

                    {/* Gradient Toggle */}
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="use-gradient" className="cursor-pointer">Use Gradient</Label>
                      <Switch 
                        id="use-gradient"
                        checked={useGradient} 
                        onCheckedChange={setUseGradient}
                      />
                    </div>

                    {useGradient ? (
                      <>
                        {/* Gradient Colors */}
                        <div className="space-y-2">
                          <Label>Gradient Color 1</Label>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              value={gradientColor1}
                              onChange={(e) => setGradientColor1(e.target.value)}
                              className="h-10 w-20 cursor-pointer"
                            />
                            <Input value={gradientColor1} onChange={(e) => setGradientColor1(e.target.value)} className="flex-1" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Gradient Color 2</Label>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              value={gradientColor2}
                              onChange={(e) => setGradientColor2(e.target.value)}
                              className="h-10 w-20 cursor-pointer"
                            />
                            <Input value={gradientColor2} onChange={(e) => setGradientColor2(e.target.value)} className="flex-1" />
                          </div>
                        </div>
                        {/* Gradient Angle */}
                        <div className="space-y-2">
                          <Label>Gradient Angle: {gradientAngle}°</Label>
                          <Slider
                            value={[gradientAngle]}
                            onValueChange={(value) => setGradientAngle(value[0])}
                            min={0}
                            max={360}
                            step={15}
                          />
                        </div>
                      </>
                    ) : (
                      /* Solid Background Color */
                      <div className="space-y-2">
                        <Label>Background Color</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={textBgColor}
                            onChange={(e) => setTextBgColor(e.target.value)}
                            className="h-10 w-20 cursor-pointer"
                          />
                          <Input value={textBgColor} onChange={(e) => setTextBgColor(e.target.value)} className="flex-1" />
                        </div>
                      </div>
                    )}

                    {/* Background Opacity */}
                    <div className="space-y-2">
                      <Label>Opacity: {Math.round(textBgOpacity * 100)}%</Label>
                      <Slider
                        value={[textBgOpacity]}
                        onValueChange={(value) => setTextBgOpacity(value[0])}
                        min={0}
                        max={1}
                        step={0.05}
                      />
                    </div>

                    {/* Blur Effect */}
                    <div className="space-y-2">
                      <Label>Blur Amount: {blurAmount}px</Label>
                      <Slider
                        value={[blurAmount]}
                        onValueChange={(value) => setBlurAmount(value[0])}
                        min={0}
                        max={20}
                        step={1}
                      />
                      <p className="text-xs text-muted-foreground">
                        Glass-morphism blur effect
                      </p>
                    </div>

                    {/* Padding Control */}
                    <div className="space-y-2">
                      <Label>Padding: {bgPadding.toFixed(1)}x</Label>
                      <Slider
                        value={[bgPadding]}
                        onValueChange={(value) => setBgPadding(value[0])}
                        min={0.1}
                        max={1}
                        step={0.1}
                      />
                      <p className="text-xs text-muted-foreground">
                        Space between text and background edge
                      </p>
                    </div>

                    {/* Border */}
                    <div className="space-y-2">
                      <Label>Border Width: {borderWidth}px</Label>
                      <Slider
                        value={[borderWidth]}
                        onValueChange={(value) => setBorderWidth(value[0])}
                        min={0}
                        max={10}
                        step={1}
                      />
                    </div>

                    {borderWidth > 0 && (
                      <div className="space-y-2">
                        <Label>Border Color</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={borderColor}
                            onChange={(e) => setBorderColor(e.target.value)}
                            className="h-10 w-20 cursor-pointer"
                          />
                          <Input value={borderColor} onChange={(e) => setBorderColor(e.target.value)} className="flex-1" />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Image Filters Section */}
            <AccordionItem value="filters">
              <AccordionTrigger className="text-sm font-semibold">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Image Filters
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                {/* Brightness */}
                <div className="space-y-2">
                  <Label>Brightness: {brightness}%</Label>
                  <Slider
                    value={[brightness]}
                    onValueChange={(value) => setBrightness(value[0])}
                    min={0}
                    max={200}
                    step={5}
                  />
                </div>

                {/* Contrast */}
                <div className="space-y-2">
                  <Label>Contrast: {contrast}%</Label>
                  <Slider
                    value={[contrast]}
                    onValueChange={(value) => setContrast(value[0])}
                    min={0}
                    max={200}
                    step={5}
                  />
                </div>

                {/* Saturation */}
                <div className="space-y-2">
                  <Label>Saturation: {saturation}%</Label>
                  <Slider
                    value={[saturation]}
                    onValueChange={(value) => setSaturation(value[0])}
                    min={0}
                    max={200}
                    step={5}
                  />
                </div>

                {/* Grayscale */}
                <div className="space-y-2">
                  <Label>Grayscale: {grayscale}%</Label>
                  <Slider
                    value={[grayscale]}
                    onValueChange={(value) => setGrayscale(value[0])}
                    min={0}
                    max={100}
                    step={5}
                  />
                </div>

                {/* Sepia */}
                <div className="space-y-2">
                  <Label>Sepia: {sepia}%</Label>
                  <Slider
                    value={[sepia]}
                    onValueChange={(value) => setSepia(value[0])}
                    min={0}
                    max={100}
                    step={5}
                  />
                </div>

                {/* Reset Filters */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setBrightness(100)
                    setContrast(100)
                    setSaturation(100)
                    setGrayscale(0)
                    setSepia(0)
                  }}
                  className="w-full"
                >
                  Reset All Filters
                </Button>
              </AccordionContent>
            </AccordionItem>

          </Accordion>

          <Separator className="my-6" />

          {/* Canvas Background Color */}
          <div className="space-y-2">
            <Label>Canvas Background Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="h-10 w-20 cursor-pointer"
              />
              <Input value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="flex-1" />
            </div>
          </div>

          {/* Export Settings */}
          <div className="space-y-2 border-t border-border pt-6">
            <h3 className="font-semibold">Export Settings</h3>
            <Label>Format</Label>
            <Select value={exportFormat} onValueChange={(value: "png" | "jpeg" | "webp" | "bmp") => setExportFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="png">PNG - Lossless, best quality</SelectItem>
                <SelectItem value="jpeg">JPEG - Smaller file, good for photos</SelectItem>
                <SelectItem value="webp">WebP - Modern, best compression</SelectItem>
                <SelectItem value="bmp">BMP - Uncompressed, largest file</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {exportFormat === "png" && "PNG provides lossless compression with transparency support"}
              {exportFormat === "jpeg" && "JPEG is ideal for photographs with adjustable quality"}
              {exportFormat === "webp" && "WebP offers superior compression with quality control"}
              {exportFormat === "bmp" && "BMP is uncompressed and produces large files"}
            </p>
          </div>

          {/* Quality Slider for lossy formats */}
          {(exportFormat === "jpeg" || exportFormat === "webp") && (
            <div className="space-y-2">
              <Label>Quality: {Math.round(quality * 100)}%</Label>
              <Slider
                value={[quality]}
                onValueChange={(value) => setQuality(value[0])}
                min={0.1}
                max={1}
                step={0.05}
              />
              <p className="text-xs text-muted-foreground">
                Higher quality = larger file size, better image clarity
              </p>
            </div>
          )}
        </div>
      </div>

        {/* Share Dialog */}
        {shareSlug && imageDataUrl && (
          <ShareDialog
            open={shareDialogOpen}
            onOpenChange={setShareDialogOpen}
            imagePreviewSrc={imageDataUrl}
            slug={shareSlug}
            initialIsPrivate={false}
          />
        )}

        {/* Social Media Presets Dialog */}
        <Dialog open={socialPresetDialogOpen} onOpenChange={setSocialPresetDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Export for Social Media</DialogTitle>
              <DialogDescription>
                Choose a platform-optimized size for your comparison image
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-4">
              <Button
                onClick={() => handleSocialPreset('instagram_square')}
                variant="outline"
                className="justify-start gap-3 h-auto py-3"
              >
                <Instagram className="h-5 w-5 text-pink-600" />
                <div className="text-left">
                  <div className="font-semibold">Instagram Square</div>
                  <div className="text-xs text-muted-foreground">1080 × 1080 px - Feed posts</div>
                </div>
              </Button>

              <Button
                onClick={() => handleSocialPreset('instagram_portrait')}
                variant="outline"
                className="justify-start gap-3 h-auto py-3"
              >
                <Instagram className="h-5 w-5 text-pink-600" />
                <div className="text-left">
                  <div className="font-semibold">Instagram Portrait</div>
                  <div className="text-xs text-muted-foreground">1080 × 1350 px - Vertical posts</div>
                </div>
              </Button>

              <Button
                onClick={() => handleSocialPreset('instagram_story')}
                variant="outline"
                className="justify-start gap-3 h-auto py-3"
              >
                <Instagram className="h-5 w-5 text-pink-600" />
                <div className="text-left">
                  <div className="font-semibold">Instagram Story</div>
                  <div className="text-xs text-muted-foreground">1080 × 1920 px - Stories & Reels</div>
                </div>
              </Button>

              <Button
                onClick={() => handleSocialPreset('twitter_post')}
                variant="outline"
                className="justify-start gap-3 h-auto py-3"
              >
                <Twitter className="h-5 w-5 text-blue-500" />
                <div className="text-left">
                  <div className="font-semibold">Twitter Post</div>
                  <div className="text-xs text-muted-foreground">1200 × 675 px - Tweet image</div>
                </div>
              </Button>

              <Button
                onClick={() => handleSocialPreset('facebook_post')}
                variant="outline"
                className="justify-start gap-3 h-auto py-3"
              >
                <Facebook className="h-5 w-5 text-blue-600" />
                <div className="text-left">
                  <div className="font-semibold">Facebook Post</div>
                  <div className="text-xs text-muted-foreground">1200 × 630 px - Link preview</div>
                </div>
              </Button>

              <Button
                onClick={() => handleSocialPreset('linkedin_post')}
                variant="outline"
                className="justify-start gap-3 h-auto py-3"
              >
                <Share2 className="h-5 w-5 text-blue-700" />
                <div className="text-left">
                  <div className="font-semibold">LinkedIn Post</div>
                  <div className="text-xs text-muted-foreground">1200 × 627 px - Professional</div>
                </div>
              </Button>

              <Button
                onClick={() => handleSocialPreset('pinterest_pin')}
                variant="outline"
                className="justify-start gap-3 h-auto py-3"
              >
                <ImageIcon className="h-5 w-5 text-red-600" />
                <div className="text-left">
                  <div className="font-semibold">Pinterest Pin</div>
                  <div className="text-xs text-muted-foreground">1000 × 1500 px - Tall format</div>
                </div>
              </Button>

              <Button
                onClick={() => handleSocialPreset('youtube_thumbnail')}
                variant="outline"
                className="justify-start gap-3 h-auto py-3"
              >
                <ImageIcon className="h-5 w-5 text-red-600" />
                <div className="text-left">
                  <div className="font-semibold">YouTube Thumbnail</div>
                  <div className="text-xs text-muted-foreground">1280 × 720 px - Video thumbnail</div>
                </div>
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Embed Code Dialog */}
        <Dialog open={embedDialogOpen} onOpenChange={setEmbedDialogOpen}>
          <DialogContent className="max-w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle className="text-base sm:text-lg">Embed Code</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                Copy this code to embed your comparison on any website
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 overflow-y-auto flex-1 px-1">
              <div className="relative">
                <pre className="bg-secondary p-3 sm:p-4 rounded-lg text-[10px] sm:text-xs overflow-x-auto overflow-y-auto max-h-[200px] sm:max-h-[300px] break-all whitespace-pre-wrap">
                  <code className="block break-all">{embedCode}</code>
                </pre>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={handleCopyEmbedCode} className="flex-1 gap-2 text-sm">
                  <Copy className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">Copy Code</span>
                </Button>
                <Button 
                  onClick={() => setEmbedDialogOpen(false)} 
                  variant="outline"
                  className="sm:w-auto text-sm"
                >
                  Close
                </Button>
              </div>
              <div className="text-[10px] sm:text-xs text-muted-foreground space-y-1.5 sm:space-y-1 break-words">
                <p className="leading-relaxed">💡 <strong className="font-semibold">Note:</strong> For best results, upload your image first using &quot;Save to Cloud&quot;.</p>
                <p className="leading-relaxed">The embed code will then use a permanent cloud URL instead of a data URL.</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}
