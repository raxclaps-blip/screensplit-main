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
  onVideoChange: (src: string) => void
  onRemove: () => void
}

export function VideoUploader({ label, video, onVideoChange, onRemove }: VideoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    const url = URL.createObjectURL(file)
    const v = document.createElement("video")
    v.preload = "metadata"
    v.src = url
    v.onloadedmetadata = () => {
      const isPortrait = v.videoHeight > v.videoWidth
      if (!isPortrait) {
        URL.revokeObjectURL(url)
        toast.error("Only portrait videos are accepted", { description: "Please upload a vertical video (e.g., 1080x1920)" })
        return
      }
      onVideoChange(url)
    }
    v.onerror = () => {
      URL.revokeObjectURL(url)
      toast.error("Invalid video file")
    }
  }

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith("video/")) {
      handleFile(file)
    }
  }

  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith("video/")) {
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
            <p className="text-xs text-muted-foreground">MP4, WebM, MOV up to ~200MB</p>
          </div>
          <Input
            ref={inputRef}
            type="file"
            accept="video/*"
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
