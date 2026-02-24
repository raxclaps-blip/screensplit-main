"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Upload, X } from "lucide-react"
import { toast } from "sonner"

interface VideoUploaderProps {
  label: string
  video: string | null
  onVideoChange: (file: File, src: string) => void
  onRemove: () => void
}

const MAX_VIDEO_UPLOAD_BYTES = 200 * 1024 * 1024
const MAX_VIDEO_UPLOAD_SECONDS = 121

export function VideoUploader({ label, video, onVideoChange, onRemove }: VideoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    if (!file.type.startsWith("video/")) {
      toast.error("Unsupported file", { description: "Please upload a valid video file." })
      return
    }

    if (file.size > MAX_VIDEO_UPLOAD_BYTES) {
      toast.error("File too large", { description: "Each video must be 200MB or smaller." })
      return
    }

    const url = URL.createObjectURL(file)
    const v = document.createElement("video")
    v.preload = "metadata"
    v.src = url
    v.onloadedmetadata = () => {
      if (Number.isFinite(v.duration) && v.duration > MAX_VIDEO_UPLOAD_SECONDS) {
        URL.revokeObjectURL(url)
        toast.error("Video too long", { description: `Each video must be ${MAX_VIDEO_UPLOAD_SECONDS} seconds or shorter.` })
        return
      }

      const isPortrait = v.videoHeight > v.videoWidth
      onVideoChange(file, url)
      if (!isPortrait) {
        toast("Landscape video detected", {
          description: "It will still work, but portrait clips are recommended for best results.",
        })
      }
    }
    v.onerror = () => {
      URL.revokeObjectURL(url)
      toast.error("Invalid video file")
    }
  }

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
    e.currentTarget.value = ""
  }

  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  return (
    <div className="space-y-2">
      <Label>{label} Video</Label>
      {!video ? (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-secondary/50 p-6 sm:p-10 text-center"
        >
          <Upload className="h-6 w-6" />
          <div>
            <p className="font-medium">Click to upload or drag & drop</p>
            <p className="text-xs text-muted-foreground">MP4, WebM, MOV up to 200MB and 121 seconds</p>
          </div>
          <Input
            ref={inputRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime,video/*"
            onChange={onChange}
            className="hidden"
          />
        </div>
      ) : (
        <div className="space-y-3 rounded-2xl border border-border bg-secondary/50 p-3 sm:p-4">
          <video src={video} controls className="aspect-video w-full rounded-lg bg-black" />
          <div className="flex justify-end">
            <Button variant="outline" size="sm" className="gap-2" onClick={onRemove}>
              <X className="h-4 w-4" />
              Remove
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
