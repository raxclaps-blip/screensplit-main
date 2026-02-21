"use client"

import type React from "react"
import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Type, Palette, Image as ImageIcon, RotateCcw, VideoIcon, Bold, Italic, Sun, Contrast, Droplet, Timer, Volume2 } from "lucide-react"

export type TextPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "center-left"
  | "center"
  | "center-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right"

export interface VideoControlsState {
  // Layout Direction
  direction: "horizontal" | "vertical"
  
  // Labels & Text
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
  
  // Canvas Background
  bgColor: string
  
  // Typography
  fontFamily: string
  mainTextBold: boolean
  mainTextItalic: boolean
  subtextBold: boolean
  subtextItalic: boolean
  
  // Background Effects
  borderWidth: number
  borderColor: string
  useGradient: boolean
  gradientColor1: string
  gradientColor2: string
  gradientAngle: number
  blurAmount: number
  bgPadding: number
  bgShape: "rounded" | "pill" | "circle" | "hexagon"
  
  // Image Filters
  brightness: number
  contrast: number
  saturation: number
  grayscale: number
  sepia: number
  
  // Video-specific controls
  enableFade: boolean
  fadeSeconds: number
  includeAudio: boolean
}

interface Props {
  state: VideoControlsState
  onChange: (next: Partial<VideoControlsState>) => void
}

function PositionIcon({ pos }: { pos: TextPosition }) {
  const dotStyle: React.CSSProperties = { width: 6, height: 6, borderRadius: 9999, backgroundColor: 'currentColor' }
  const gridStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(3, 1fr)', width: 28, height: 28, borderRadius: 6, border: '1px solid currentColor', opacity: 0.9 }
  const map: Record<TextPosition, [number, number]> = {
    'top-left': [1,1], 'top-center': [1,2], 'top-right': [1,3],
    'center-left': [2,1], 'center': [2,2], 'center-right': [2,3],
    'bottom-left': [3,1], 'bottom-center': [3,2], 'bottom-right': [3,3],
  }
  const [r, c] = map[pos]
  const cells = Array.from({ length: 9 }, (_, i) => {
    const rr = Math.floor(i / 3) + 1
    const cc = (i % 3) + 1
    const isDot = rr === r && cc === c
    return (
      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {isDot ? <div style={dotStyle} /> : null}
      </div>
    )
  })
  return <div style={gridStyle as any}>{cells}</div>
}

function ShapeIcon({ shape }: { shape: "rounded" | "pill" | "circle" | "hexagon" }) {
  const base: React.CSSProperties = { width: 24, height: 16, backgroundColor: 'currentColor', opacity: 0.8 }
  if (shape === 'circle') return <div style={{ ...base, width: 18, height: 18, borderRadius: 9999 }} />
  if (shape === 'pill') return <div style={{ ...base, borderRadius: 9999 }} />
  if (shape === 'hexagon') return (
    <div style={{ width: 24, height: 20, position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)', backgroundColor: 'currentColor', opacity: 0.8 }} />
    </div>
  )
  return <div style={{ ...base, borderRadius: 6 }} />
}

// Default values to support "Reset All" action
const DEFAULTS: Partial<VideoControlsState> = {
  // Layout Direction
  direction: "horizontal",

  // Labels & Text
  beforeText: "Before",
  afterText: "After",
  beforeSubtext: "",
  afterSubtext: "",
  fontSize: 48,
  textColor: "#ffffff",
  textBgColor: "#000000",
  showTextBackground: true,
  textBgOpacity: 0.85,
  textPosition: "top-right",

  // Canvas Background
  bgColor: "#000000",

  // Typography
  fontFamily: "Inter",
  mainTextBold: true,
  mainTextItalic: false,
  subtextBold: false,
  subtextItalic: false,

  // Background Effects
  borderWidth: 0,
  borderColor: "#ffffff",
  useGradient: false,
  gradientColor1: "#000000",
  gradientColor2: "#333333",
  gradientAngle: 45,
  blurAmount: 0,
  bgPadding: 0.4,
  bgShape: "rounded",

  // Image Filters
  brightness: 100,
  contrast: 100,
  saturation: 100,
  grayscale: 0,
  sepia: 0,

  // Video-specific
  enableFade: true,
  fadeSeconds: 0.5,
  includeAudio: true,
}

export function VideoControls({ state, onChange }: Props) {
  const set = (patch: Partial<VideoControlsState>) => onChange(patch)

  return (
    <div className="w-full space-y-6 rounded-2xl border border-border bg-card p-4 sm:p-6 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xl font-bold">Customize</h2>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-1.5"
          onClick={() => set(DEFAULTS)}
        >
          <RotateCcw className="h-3 w-3" />
          <span className="hidden sm:inline">Reset All</span>
        </Button>
      </div>

      {/* Direction */}
      <div className="space-y-2">
        <Label>Layout Direction</Label>
        <Select value={state.direction} onValueChange={(v: "horizontal" | "vertical") => set({ direction: v })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="horizontal">Side by Side</SelectItem>
            <SelectItem value="vertical">Top and Bottom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator className="my-2 sm:my-4" />

      <Accordion type="multiple" defaultValue={["labels", "typography"]} className="w-full">
        {/* Labels & Text */}
        <AccordionItem value="labels">
          <AccordionTrigger className="text-sm font-semibold">
            <div className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              Labels & Text
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            {/* Before Text */}
            <div className="space-y-2">
              <Label>Before Label</Label>
              <Input value={state.beforeText} onChange={(e) => set({ beforeText: e.target.value })} placeholder="Before" />
              <Input value={state.beforeSubtext} onChange={(e) => set({ beforeSubtext: e.target.value })} placeholder="Subheading (optional - e.g., date/time)" className="text-sm" />
              <div className="grid grid-cols-3 gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => set({ beforeSubtext: new Date().toLocaleDateString() })} className="text-xs">Add Date</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => set({ beforeSubtext: new Date().toLocaleTimeString() })} className="text-xs">Add Time</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => set({ beforeSubtext: new Date().toLocaleString() })} className="text-xs">Both</Button>
              </div>
            </div>
            {/* After Text */}
            <div className="space-y-2">
              <Label>After Label</Label>
              <Input value={state.afterText} onChange={(e) => set({ afterText: e.target.value })} placeholder="After" />
              <Input value={state.afterSubtext} onChange={(e) => set({ afterSubtext: e.target.value })} placeholder="Subheading (optional - e.g., date/time)" className="text-sm" />
              <div className="grid grid-cols-3 gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => set({ afterSubtext: new Date().toLocaleDateString() })} className="text-xs">Add Date</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => set({ afterSubtext: new Date().toLocaleTimeString() })} className="text-xs">Add Time</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => set({ afterSubtext: new Date().toLocaleString() })} className="text-xs">Both</Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Typography */}
        <AccordionItem value="typography">
          <AccordionTrigger className="text-sm font-semibold">
            <div className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              Typography
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            {/* Font Family */}
            <div className="space-y-2">
              <Label>Font Family</Label>
              <Select value={state.fontFamily} onValueChange={(v) => set({ fontFamily: v })}>
                <SelectTrigger>
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
            {/* Font Size */}
            <div className="space-y-2">
              <Label>Font Size: {state.fontSize}px</Label>
              <Slider value={[state.fontSize]} onValueChange={(v) => set({ fontSize: v[0] })} min={24} max={120} step={4} />
            </div>
            {/* Main Text Styling */}
            <div className="space-y-2">
              <Label>Main Text Style</Label>
              <div className="flex gap-2">
                <Button type="button" variant={state.mainTextBold ? "default" : "outline"} size="sm" onClick={() => set({ mainTextBold: !state.mainTextBold })} className="flex-1"><Bold className="h-4 w-4" />Bold</Button>
                <Button type="button" variant={state.mainTextItalic ? "default" : "outline"} size="sm" onClick={() => set({ mainTextItalic: !state.mainTextItalic })} className="flex-1"><Italic className="h-4 w-4" />Italic</Button>
              </div>
            </div>
            {/* Subtext Styling */}
            <div className="space-y-2">
              <Label>Subtext Style</Label>
              <div className="flex gap-2">
                <Button type="button" variant={state.subtextBold ? "default" : "outline"} size="sm" onClick={() => set({ subtextBold: !state.subtextBold })} className="flex-1"><Bold className="h-4 w-4" />Bold</Button>
                <Button type="button" variant={state.subtextItalic ? "default" : "outline"} size="sm" onClick={() => set({ subtextItalic: !state.subtextItalic })} className="flex-1"><Italic className="h-4 w-4" />Italic</Button>
              </div>
            </div>
            {/* Text Color */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Palette className="h-4 w-4" />Text Color</Label>
              <div className="flex gap-2">
                <Input type="color" value={state.textColor} onChange={(e) => set({ textColor: e.target.value })} className="h-10 w-20 cursor-pointer" />
                <Input value={state.textColor} onChange={(e) => set({ textColor: e.target.value })} className="flex-1" />
              </div>
            </div>
            {/* Text Position */}
            <div className="space-y-2">
              <Label>Text Position</Label>
              <div className="grid grid-cols-3 gap-2">
                {(["top-left","top-center","top-right","center-left","center","center-right","bottom-left","bottom-center","bottom-right"] as TextPosition[]).map((pos) => (
                  <Button key={pos} type="button" variant={state.textPosition === pos ? "default" : "outline"} size="sm" onClick={() => set({ textPosition: pos })} className="h-12 flex flex-col items-center justify-center gap-1">
                    <PositionIcon pos={pos} />
                    <span className="text-[10px]">{pos.replace("-", " ")}</span>
                  </Button>
                ))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Background Effects */}
        <AccordionItem value="background">
          <AccordionTrigger className="text-sm font-semibold">
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Background Effects
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="show-background" className="cursor-pointer">Show Text Background</Label>
              <Switch id="show-background" checked={state.showTextBackground} onCheckedChange={(v) => set({ showTextBackground: v })} />
            </div>
            {state.showTextBackground && (
              <>
                {/* Background Shape */}
                <div className="space-y-2">
                  <Label>Background Shape</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["rounded","pill","circle","hexagon"] as ("rounded"|"pill"|"circle"|"hexagon")[]).map((shape) => (
                      <Button key={shape} type="button" variant={state.bgShape === shape ? "default" : "outline"} size="sm" onClick={() => set({ bgShape: shape })} className="flex items-center gap-2">
                        <ShapeIcon shape={shape} />
                        <span className="text-xs">{shape.charAt(0).toUpperCase() + shape.slice(1)}</span>
                      </Button>
                    ))}
                  </div>
                </div>
                {/* Gradient Toggle */}
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="use-gradient" className="cursor-pointer">Use Gradient</Label>
                  <Switch id="use-gradient" checked={state.useGradient} onCheckedChange={(v) => set({ useGradient: v })} />
                </div>
                {state.useGradient ? (
                  <>
                    {/* Gradient Colors */}
                    <div className="space-y-2">
                      <Label>Gradient Color 1</Label>
                      <div className="flex gap-2">
                        <Input type="color" value={state.gradientColor1} onChange={(e) => set({ gradientColor1: e.target.value })} className="h-10 w-20 cursor-pointer" />
                        <Input value={state.gradientColor1} onChange={(e) => set({ gradientColor1: e.target.value })} className="flex-1" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Gradient Color 2</Label>
                      <div className="flex gap-2">
                        <Input type="color" value={state.gradientColor2} onChange={(e) => set({ gradientColor2: e.target.value })} className="h-10 w-20 cursor-pointer" />
                        <Input value={state.gradientColor2} onChange={(e) => set({ gradientColor2: e.target.value })} className="flex-1" />
                      </div>
                    </div>
                    {/* Gradient Angle */}
                    <div className="space-y-2">
                      <Label>Gradient Angle: {state.gradientAngle}°</Label>
                      <Slider value={[state.gradientAngle]} onValueChange={(v) => set({ gradientAngle: v[0] })} min={0} max={360} step={15} />
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Palette className="h-4 w-4" />Background Color</Label>
                    <div className="flex gap-2">
                      <Input type="color" value={state.textBgColor} onChange={(e) => set({ textBgColor: e.target.value })} className="h-10 w-20 cursor-pointer" />
                      <Input value={state.textBgColor} onChange={(e) => set({ textBgColor: e.target.value })} className="flex-1" />
                    </div>
                  </div>
                )}
                {/* Background Opacity */}
                <div className="space-y-2">
                  <Label>Opacity: {Math.round(state.textBgOpacity * 100)}%</Label>
                  <Slider value={[state.textBgOpacity]} onValueChange={(v) => set({ textBgOpacity: v[0] })} min={0} max={1} step={0.05} />
                </div>
                {/* Blur Effect */}
                <div className="space-y-2">
                  <Label>Blur Amount: {state.blurAmount}px</Label>
                  <Slider value={[state.blurAmount]} onValueChange={(v) => set({ blurAmount: v[0] })} min={0} max={20} step={1} />
                </div>
                {/* Padding */}
                <div className="space-y-2">
                  <Label>Padding: {state.bgPadding.toFixed(1)}x</Label>
                  <Slider value={[state.bgPadding]} onValueChange={(v) => set({ bgPadding: v[0] })} min={0.1} max={1} step={0.1} />
                </div>
                {/* Border */}
                <div className="space-y-2">
                  <Label>Border Width: {state.borderWidth}px</Label>
                  <Slider value={[state.borderWidth]} onValueChange={(v) => set({ borderWidth: v[0] })} min={0} max={10} step={1} />
                </div>
                {state.borderWidth > 0 && (
                  <div className="space-y-2">
                    <Label>Border Color</Label>
                    <div className="flex gap-2">
                      <Input type="color" value={state.borderColor} onChange={(e) => set({ borderColor: e.target.value })} className="h-10 w-20 cursor-pointer" />
                      <Input value={state.borderColor} onChange={(e) => set({ borderColor: e.target.value })} className="flex-1" />
                    </div>
                  </div>
                )}
              </>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Image Filters */}
        <AccordionItem value="filters">
          <AccordionTrigger className="text-sm font-semibold">
            <div className="flex items-center gap-2">
              <VideoIcon className="h-4 w-4" />
              Video Filters
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            {/* Brightness */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Sun className="h-4 w-4" />Brightness: {state.brightness}%</Label>
              <Slider value={[state.brightness]} onValueChange={(v) => set({ brightness: v[0] })} min={0} max={200} step={5} />
            </div>
            {/* Contrast */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Contrast className="h-4 w-4" />Contrast: {state.contrast}%</Label>
              <Slider value={[state.contrast]} onValueChange={(v) => set({ contrast: v[0] })} min={0} max={200} step={5} />
            </div>
            {/* Saturation */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Droplet className="h-4 w-4" />Saturation: {state.saturation}%</Label>
              <Slider value={[state.saturation]} onValueChange={(v) => set({ saturation: v[0] })} min={0} max={200} step={5} />
            </div>
            {/* Grayscale */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><ImageIcon className="h-4 w-4" />Grayscale: {state.grayscale}%</Label>
              <Slider value={[state.grayscale]} onValueChange={(v) => set({ grayscale: v[0] })} min={0} max={100} step={5} />
            </div>
            {/* Sepia */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Palette className="h-4 w-4" />Sepia: {state.sepia}%</Label>
              <Slider value={[state.sepia]} onValueChange={(v) => set({ sepia: v[0] })} min={0} max={100} step={5} />
            </div>
            {/* Reset Filters */}
            <Button type="button" variant="outline" size="sm" onClick={() => set({ brightness: 100, contrast: 100, saturation: 100, grayscale: 0, sepia: 0 })} className="w-full">
              Reset All Filters
            </Button>
          </AccordionContent>
        </AccordionItem>

        {/* Transitions & Audio */}
        <AccordionItem value="transitions">
          <AccordionTrigger className="text-sm font-semibold">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Transitions & Audio
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Timer className="h-4 w-4" />Fade Transition (seconds): {state.fadeSeconds.toFixed(1)}s</Label>
              <Slider value={[state.fadeSeconds]} onValueChange={(v) => set({ fadeSeconds: Number(v[0]) })} min={0} max={2} step={0.1} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="fade-enable" className="flex items-center gap-2"><Timer className="h-4 w-4" />Enable Fade</Label>
              <Switch id="fade-enable" checked={state.enableFade} onCheckedChange={(v) => set({ enableFade: v })} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="audio-include" className="flex items-center gap-2"><Volume2 className="h-4 w-4" />Include Audio</Label>
              <Switch id="audio-include" checked={state.includeAudio} onCheckedChange={(v) => set({ includeAudio: v })} />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Separator className="my-4" />

      {/* Canvas Background Color */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2"><Palette className="h-4 w-4" />Canvas Background Color</Label>
        <div className="flex gap-2">
          <Input type="color" value={state.bgColor} onChange={(e) => set({ bgColor: e.target.value })} className="h-10 w-20 cursor-pointer" />
          <Input value={state.bgColor} onChange={(e) => set({ bgColor: e.target.value })} className="flex-1" />
        </div>
      </div>
    </div>
  )
}
