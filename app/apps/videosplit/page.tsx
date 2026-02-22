"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { VideoUploader } from "@/components/videosplit/video-uploader"
import { VideoComposer } from "@/components/videosplit/video-composer"
import { VideoControlsState } from "@/components/videosplit/video-controls"

export default function VideosplitPage() {
  const [beforeVideo, setBeforeVideo] = useState<string | null>(null)
  const [afterVideo, setAfterVideo] = useState<string | null>(null)
  const [beforeFile, setBeforeFile] = useState<File | null>(null)
  const [afterFile, setAfterFile] = useState<File | null>(null)
  const [showComposer, setShowComposer] = useState(false)
  const beforeVideoRef = useRef<string | null>(null)
  const afterVideoRef = useRef<string | null>(null)
  const [controls, setControls] = useState<VideoControlsState>({
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
    
    // Video-specific controls
    enableFade: true,
    fadeSeconds: 0.5,
    includeAudio: true,
  })

  const setBeforeVideoUrl = (next: string | null) => {
    const prev = beforeVideoRef.current
    if (prev?.startsWith("blob:")) {
      URL.revokeObjectURL(prev)
    }
    beforeVideoRef.current = next
    setBeforeVideo(next)
  }

  const setAfterVideoUrl = (next: string | null) => {
    const prev = afterVideoRef.current
    if (prev?.startsWith("blob:")) {
      URL.revokeObjectURL(prev)
    }
    afterVideoRef.current = next
    setAfterVideo(next)
  }

  useEffect(() => {
    return () => {
      if (beforeVideoRef.current?.startsWith("blob:")) {
        URL.revokeObjectURL(beforeVideoRef.current)
      }
      if (afterVideoRef.current?.startsWith("blob:")) {
        URL.revokeObjectURL(afterVideoRef.current)
      }
    }
  }, [])

  const handleContinue = () => {
    if (beforeVideo && afterVideo && beforeFile && afterFile) {
      toast("Opening composer...", { description: "Combine and export your comparison video" })
      setShowComposer(true)
    }
  }

  const handleBack = () => {
    toast("Back to upload", { description: "You can change your videos and try again" })
    setShowComposer(false)
  }

  return (
    <>
      {!showComposer ? (
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-2xl sm:text-3xl font-bold">Create Your Video Comparison</h1>
            <p className="text-muted-foreground">Upload your before and after videos to get started</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <VideoUploader
              label="Before"
              video={beforeVideo}
              onVideoChange={(file, src) => {
                setBeforeFile(file)
                setBeforeVideoUrl(src)
                toast.success("Before video added")
              }}
              onRemove={() => {
                setBeforeFile(null)
                setBeforeVideoUrl(null)
                toast("Removed", { description: "Before video removed" })
              }}
            />
            <VideoUploader
              label="After"
              video={afterVideo}
              onVideoChange={(file, src) => {
                setAfterFile(file)
                setAfterVideoUrl(src)
                toast.success("After video added")
              }}
              onRemove={() => {
                setAfterFile(null)
                setAfterVideoUrl(null)
                toast("Removed", { description: "After video removed" })
              }}
            />
          </div>

          {beforeVideo && afterVideo && beforeFile && afterFile && (
            <div className="mt-8 flex justify-center">
              <Button size="lg" className="gap-2 rounded-full" onClick={handleContinue}>
                Continue to Composer
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      ) : (
        <VideoComposer
          beforeSrc={beforeVideo!}
          afterSrc={afterVideo!}
          beforeFile={beforeFile!}
          afterFile={afterFile!}
          onBack={handleBack}
          controls={controls}
          onControlsChange={(patch) => setControls((prev) => ({ ...prev, ...patch }))}
        />
      )}
    </>
  )
}
