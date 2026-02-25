"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, Eye, Loader2, MessageSquare } from "lucide-react"
import { Navbar } from "@/components/common/Navbar"
import { Footer } from "@/components/common/Footer"
import { ProgressiveImage } from "@/components/ui/progressive-image"
import { toImageKitUrl } from "@/lib/imagekit"

export interface ShareProjectData {
  shareSlug: string
  finalImageUrl?: string | null
  isPrivate: boolean
  shareMessage: string | null
  createdAt: string
  viewCount: number
  beforeLabel: string
  afterLabel: string
  user: {
    name: string | null
    image: string | null
  } | null
}

interface SharePageClientProps {
  slug: string
  project: ShareProjectData
  initialAuthorized: boolean
}

export function SharePageClient({ slug, project, initialAuthorized }: SharePageClientProps) {
  const [isAuthorized, setIsAuthorized] = useState(initialAuthorized)
  const [password, setPassword] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const hasIncrementedRef = useRef(false)

  useEffect(() => {
    if (!isAuthorized || hasIncrementedRef.current) {
      return
    }

    hasIncrementedRef.current = true

    fetch("/api/share-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    }).catch((error) => {
      console.error("Failed to increment view count:", error)
    })
  }, [isAuthorized, slug])

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPasswordError(null)
    setIsVerifying(true)

    try {
      const response = await fetch("/api/verify-share-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setPasswordError(data.error || "Invalid password")
        setIsVerifying(false)
        return
      }

      setIsAuthorized(true)
    } catch {
      setPasswordError("Failed to verify password")
    } finally {
      setIsVerifying(false)
    }
  }

  if (project.isPrivate && !isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6 rounded-2xl border border-border bg-card p-8">
          <div className="text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Lock className="h-8 w-8 text-amber-500" />
            </div>
            <h1 className="mb-2 text-2xl font-bold">Protected Share</h1>
            <p className="text-muted-foreground">
              This comparison is password protected. Enter the password to view it.
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter password"
                disabled={isVerifying}
                autoFocus
              />
              {passwordError ? <p className="text-sm text-destructive">{passwordError}</p> : null}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isVerifying || !password}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  View Comparison
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    )
  }

  const imageUrl = project.isPrivate
    ? `/api/i/${slug}`
    : toImageKitUrl(project.finalImageUrl || `/api/i/${slug}`)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto max-w-6xl px-6 py-12 mt-20">
        <div className="space-y-8">
          <div className="overflow-hidden rounded-2xl border border-border bg-muted">
            <ProgressiveImage
              src={imageUrl}
              alt="Comparison"
              className="w-full h-auto select-none"
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
              priority
            />
          </div>

          {project.shareMessage ? (
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="flex items-start gap-3">
                <MessageSquare className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">Message from creator</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{project.shareMessage}</p>
                </div>
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-card p-6">
            <div className="flex items-center gap-4">
              {project.user?.image ? (
                <div className="h-12 w-12 rounded-full overflow-hidden flex-shrink-0">
                  <ProgressiveImage
                    src={project.user.image}
                    alt={project.user.name || "User"}
                    className="h-full w-full object-cover select-none"
                    draggable={false}
                    onContextMenu={(e) => e.preventDefault()}
                  />
                </div>
              ) : null}
              <div>
                {project.user?.name ? <p className="font-medium">{project.user.name}</p> : null}
                <p className="text-sm text-muted-foreground">
                  Created {new Date(project.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span>{project.viewCount} views</span>
              </div>
              {project.isPrivate ? (
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-amber-500" />
                  <span>Private</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
