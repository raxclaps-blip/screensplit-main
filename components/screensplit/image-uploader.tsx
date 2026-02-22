"use client"

import type React from "react"
import Image from "next/image"

import { useCallback, useState } from "react"
import { Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ImageUploaderProps {
  label: string
  image: string | null
  onImageChange: (image: string) => void
  onRemove: () => void
}

export function ImageUploader({ label, image, onImageChange, onRemove }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (event) => {
          if (event.target?.result) {
            onImageChange(event.target.result as string)
          }
        }
        reader.readAsDataURL(file)
      }
    },
    [onImageChange],
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          if (event.target?.result) {
            onImageChange(event.target.result as string)
          }
        }
        reader.readAsDataURL(file)
      }
    },
    [onImageChange],
  )

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  // Mobile touch support for file picker
  const handleTouchEnd = useCallback((e: React.TouchEvent<HTMLLabelElement>) => {
    // Allow default behavior to trigger file picker on mobile
    // The input will be triggered by the label click
  }, [])

  return (
    <div className="relative">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        {image && (
          <Button variant="ghost" size="sm" onClick={onRemove} className="h-8 gap-1 text-xs">
            <X className="h-3 w-3" />
            Remove
          </Button>
        )}
      </div>

      {!image ? (
        <label
          className={`flex aspect-video cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all ${
            isDragging
              ? "border-primary bg-primary/10 scale-105"
              : "border-border bg-secondary/50 hover:border-muted-foreground hover:bg-secondary"
          }`}
          onDrop={handleDrop as any}
          onDragOver={handleDragOver as any}
          onDragLeave={handleDragLeave as any}
          onTouchEnd={handleTouchEnd}
        >
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileInput} 
            className="hidden" 
            id={`upload-${label}`}
          />
          <div className="flex flex-col items-center gap-3 text-center px-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
              isDragging ? "bg-primary/20" : "bg-white/5"
            }`}>
              {isDragging ? (
                <Upload className="h-6 w-6 text-primary animate-bounce" />
              ) : (
                <Upload className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="mb-1 text-sm font-medium">
                {isDragging ? "Drop it here!" : "Drop your image here"}
              </p>
              <p className="text-xs text-muted-foreground">
                or click to browse
              </p>
              <div className="mt-2 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <span className="md:hidden">Tap to choose from gallery or files</span>
              </div>
            </div>
          </div>
        </label>
      ) : (
        <div className="relative aspect-video overflow-hidden rounded-2xl border border-border bg-secondary">
          <Image src={image || "/placeholder.svg"} alt={label} fill className="object-contain" />
        </div>
      )}
    </div>
  )
}
