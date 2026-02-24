"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ImageUploader } from "@/components/screensplit/image-uploader"
import { CanvasEditor } from "@/components/screensplit/canvas-editor"
import { ArrowRight } from "lucide-react"
import { toast } from "sonner"

export default function ScreensplitPage() {
  const [beforeImage, setBeforeImage] = useState<string | null>(null)
  const [afterImage, setAfterImage] = useState<string | null>(null)
  const [showEditor, setShowEditor] = useState(false)

  const handleContinue = () => {
    if (beforeImage && afterImage) {
      toast("Opening editor...", { description: "You can customize and export your comparison" })
      setShowEditor(true)
    }
  }

  const handleBack = () => {
    toast("Back to upload", { description: "You can change your images and try again" })
    setShowEditor(false)
  }

  return (
    <>
      {!showEditor ? (
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

          <div className="grid gap-6 md:grid-cols-2">
            <ImageUploader
              label="Before"
              image={beforeImage}
              onImageChange={(img) => {
                setBeforeImage(img)
                toast.success("Before image added")
              }}
              onRemove={() => {
                setBeforeImage(null)
                toast("Removed", { description: "Before image removed" })
              }}
            />
            <ImageUploader
              label="After"
              image={afterImage}
              onImageChange={(img) => {
                setAfterImage(img)
                toast.success("After image added")
              }}
              onRemove={() => {
                setAfterImage(null)
                toast("Removed", { description: "After image removed" })
              }}
            />
          </div>

          {beforeImage && afterImage && (
            <div className="mt-8 flex justify-center">
              <Button size="lg" className="gap-2 rounded-full" onClick={handleContinue}>
                Continue to Editor
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      ) : (
        <CanvasEditor beforeImage={beforeImage!} afterImage={afterImage!} onBack={handleBack} />
      )}
    </>
  )
}
