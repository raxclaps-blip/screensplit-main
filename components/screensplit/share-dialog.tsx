"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Copy, Check, Lock, Unlock, RefreshCw, ExternalLink, MessageSquare } from "lucide-react"
import { toast } from "sonner"
import { customAlphabet } from "nanoid"
import { toImageKitUrl } from "@/lib/imagekit"

const nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*", 16)

interface ShareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  imagePreviewSrc: string
  slug: string
  initialIsPrivate?: boolean
  initialMessage?: string
}

export function ShareDialog({
  open,
  onOpenChange,
  imagePreviewSrc,
  slug,
  initialIsPrivate = false,
  initialMessage = "",
}: ShareDialogProps) {
  const [isPrivate, setIsPrivate] = useState(initialIsPrivate)
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState(initialMessage)
  const [isSaving, setIsSaving] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/share/${slug}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setIsCopied(true)
      toast.success("Link copied!", { description: "Share link copied to clipboard" })
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      toast.error("Copy failed", { description: "Failed to copy link to clipboard" })
    }
  }

  const handleGeneratePassword = () => {
    const newPassword = nanoid()
    setPassword(newPassword)
    navigator.clipboard.writeText(newPassword)
    toast.success("Password generated!", { description: "Password copied to clipboard" })
  }

  const handleSaveSettings = async () => {
    if (isPrivate && password.length < 8) {
      toast.error("Invalid password", { description: "Password must be at least 8 characters" })
      return
    }

    setIsSaving(true)
    try {
      const toastId = toast.loading("Saving settings...")
      const response = await fetch("/api/update-share-privacy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          isPrivate,
          password: isPrivate ? password : null,
          message: message.trim() || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update settings")
      }

      toast.success("Settings updated!", { description: "Your share settings have been saved", id: toastId })
    } catch (error) {
      toast.error("Update failed", {
        description: error instanceof Error ? error.message : "Failed to update settings",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Share Your Comparison</DialogTitle>
          <DialogDescription>
            Copy the share link, add an optional message, and configure privacy settings for your comparison.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image Preview */}
          <div className="relative aspect-video overflow-hidden rounded-lg border border-border bg-muted">
            <img src={toImageKitUrl(imagePreviewSrc)} alt="Preview" className="h-full w-full object-contain" />
          </div>

          {/* Share Link */}
          <div className="space-y-2">
            <Label>Share Link</Label>
            <div className="flex gap-2">
              <Input 
                value={shareUrl} 
                readOnly 
                className="flex-1 font-mono text-sm"
              />
              <Button 
                onClick={handleCopyLink} 
                variant="outline" 
                size="icon"
                className="shrink-0"
              >
                {isCopied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <Button 
                onClick={() => window.open(shareUrl, "_blank")}
                variant="outline"
                size="icon"
                className="shrink-0"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Share Message */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <Label>Share Message (Optional)</Label>
            </div>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a message to display with your shared image..."
              className="min-h-[80px] resize-none"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {message.length}/500 characters
            </p>
          </div>

          {/* Privacy Settings */}
          <div className="space-y-4 rounded-lg border border-border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isPrivate ? (
                  <Lock className="h-4 w-4 text-amber-500" />
                ) : (
                  <Unlock className="h-4 w-4 text-green-500" />
                )}
                <Label htmlFor="privacy-toggle" className="cursor-pointer">
                  Private Share (Password Protected)
                </Label>
              </div>
              <Switch
                id="privacy-toggle"
                checked={isPrivate}
                onCheckedChange={setIsPrivate}
              />
            </div>

            {isPrivate && (
              <div className="space-y-3 border-t border-border pt-4">
                <Label>Password</Label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password (min 8 characters)"
                    className="flex-1"
                  />
                  <Button
                    onClick={handleGeneratePassword}
                    variant="outline"
                    size="icon"
                    title="Generate secure password"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Visitors will need this password to view your comparison
                </p>
              </div>
            )}

            <Button
              onClick={handleSaveSettings}
              disabled={isSaving || (isPrivate && password.length < 8)}
              className="w-full"
            >
              {isSaving ? "Saving..." : "Save Settings"}
            </Button>
          </div>

          {/* Info */}
          <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
            <p>
              {isPrivate 
                ? "🔒 This link is private. Share it along with the password to allow others to view."
                : "🌐 This link is public. Anyone with the link can view your comparison."
              }
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
