"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Copy, Check, Lock, Unlock, RefreshCw, ExternalLink, MessageSquare, Star, X } from "lucide-react"
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
  initialFeaturedInCommunity?: boolean
}

export function ShareDialog({
  open,
  onOpenChange,
  imagePreviewSrc,
  slug,
  initialIsPrivate = false,
  initialMessage = "",
  initialFeaturedInCommunity = false,
}: ShareDialogProps) {
  const [isPrivate, setIsPrivate] = useState(initialIsPrivate)
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState(initialMessage)
  const [featureInCommunity, setFeatureInCommunity] = useState(initialFeaturedInCommunity)
  const [isSaving, setIsSaving] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/share/${slug}`

  useEffect(() => {
    if (!open) return
    setIsPrivate(initialIsPrivate)
    setMessage(initialMessage)
    setFeatureInCommunity(initialFeaturedInCommunity)
    setPassword("")
    setIsCopied(false)
  }, [open, slug, initialIsPrivate, initialMessage, initialFeaturedInCommunity])

  useEffect(() => {
    if (isPrivate) {
      setFeatureInCommunity(false)
    }
  }, [isPrivate])

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setIsCopied(true)
      toast.success("Link copied!", { description: "Share link copied to clipboard" })
      setTimeout(() => setIsCopied(false), 2000)
    } catch {
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
          featureInCommunity: !isPrivate && featureInCommunity,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update settings")
      }

      toast.success("Settings updated!", { description: "Your share settings have been saved", id: toastId })
      if (typeof data?.isFeaturedInCommunity === "boolean") {
        setFeatureInCommunity(data.isFeaturedInCommunity)
      }
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
      <DialogContent
        showCloseButton={false}
        className="h-full max-h-[calc(100svh-0.75rem)] w-[calc(100vw-0.75rem)] max-w-[42rem] overflow-hidden rounded-2xl border border-border/70 p-0 shadow-2xl sm:h-auto sm:w-full sm:max-h-[min(88svh,52rem)]"
      >
        <div className="flex h-full max-h-[calc(100svh-0.75rem)] flex-col sm:max-h-[min(88svh,52rem)]">
          <div className="relative border-b border-border/70 bg-background/95 px-3 py-3 backdrop-blur-sm sm:px-6 sm:py-4">
            <DialogHeader className="space-y-1 pr-10 text-left">
              <DialogTitle className="text-lg sm:text-2xl">Share Your Comparison</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                Copy the link, add an optional message, and configure privacy settings.
              </DialogDescription>
            </DialogHeader>
            <DialogClose asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 h-8 w-8 rounded-full border border-border/60 bg-background/80 sm:h-9 sm:w-9"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close share dialog</span>
              </Button>
            </DialogClose>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-3 py-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] sm:space-y-6 sm:px-6 sm:py-5">
            <div className="relative aspect-video max-h-[24svh] overflow-hidden rounded-lg border border-border bg-muted sm:max-h-[32vh]">
              <img src={toImageKitUrl(imagePreviewSrc)} alt="Preview" className="h-full w-full object-contain" />
            </div>

            <div className="space-y-2">
              <Label>Share Link</Label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input value={shareUrl} readOnly className="flex-1 font-mono text-xs sm:text-sm" />
                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-none">
                  <Button onClick={handleCopyLink} variant="outline" size="icon" className="h-10 w-full sm:w-10">
                    {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <Button
                    onClick={() => window.open(shareUrl, "_blank")}
                    variant="outline"
                    size="icon"
                    className="h-10 w-full sm:w-10"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <Label>Share Message (Optional)</Label>
              </div>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a message to display with your shared image..."
                className="min-h-[96px] resize-none"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">{message.length}/500 characters</p>
            </div>

            <div className="space-y-4 rounded-lg border border-border p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  {isPrivate ? <Lock className="h-4 w-4 text-amber-500" /> : <Unlock className="h-4 w-4 text-green-500" />}
                  <Label htmlFor="privacy-toggle" className="cursor-pointer text-sm leading-tight">
                    Private Share (Password Protected)
                  </Label>
                </div>
                <Switch id="privacy-toggle" checked={isPrivate} onCheckedChange={setIsPrivate} />
              </div>

              {isPrivate && (
                <div className="space-y-3 border-t border-border pt-4">
                  <Label>Password</Label>
                  <div className="flex flex-col gap-2 sm:flex-row">
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
                      className="h-10 w-full sm:w-10"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Visitors will need this password to view your comparison</p>
                </div>
              )}

              <div className="space-y-2 border-t border-border pt-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-start gap-2">
                    <Star className="h-4 w-4 text-primary mt-0.5" />
                    <div>
                      <Label htmlFor="community-feature-toggle" className="cursor-pointer text-sm leading-tight">
                        Feature in Community Gallery
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Show this comparison on the public community page and featured sections.
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="community-feature-toggle"
                    checked={featureInCommunity}
                    onCheckedChange={setFeatureInCommunity}
                    disabled={isPrivate}
                  />
                </div>
                {isPrivate ? (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Set this share to public to enable community featuring.
                  </p>
                ) : null}
              </div>

              <Button
                onClick={handleSaveSettings}
                disabled={isSaving || (isPrivate && password.length < 8)}
                className="w-full"
              >
                {isSaving ? "Saving..." : "Save Settings"}
              </Button>
            </div>

            <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
              <p className="font-medium">
                {isPrivate
                  ? "[Private] Share this link with the password so viewers can access the comparison."
                  : "[Public] Anyone with this link can view your comparison."}
              </p>
              <p className="mt-2 text-xs">
                {featureInCommunity && !isPrivate
                  ? "[Community] This comparison is opted-in for public featuring."
                  : "[Community] Not currently featured in public community sections."}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
