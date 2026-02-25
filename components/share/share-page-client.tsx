"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  CalendarDays,
  Eye,
  Loader2,
  Lock,
  MessageSquare,
  Sparkles,
  UserRound,
} from "lucide-react"
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

  const createdDate = new Date(project.createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
  const creatorName = project.user?.name?.trim() || "Anonymous creator"

  if (project.isPrivate && !isAuthorized) {
    return (
      <section className="relative isolate overflow-hidden px-4 pb-16 pt-28 md:px-6 md:pb-24 md:pt-36">
        <div className="pointer-events-none absolute inset-x-0 top-8 flex justify-center">
          <div className="h-56 w-[70vw] max-w-4xl rounded-full bg-primary/15 blur-[120px] dark:hidden" />
        </div>

        <div className="relative mx-auto w-full max-w-md space-y-6 rounded-[2rem] border border-border/60 bg-card/80 p-8 shadow-xl backdrop-blur-sm">
          <div className="text-center space-y-3">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-border/60 bg-muted/60">
              <Lock className="h-7 w-7 text-amber-500" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Protected share</h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              This comparison is password protected. Enter the password to view the image.
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-5">
            <div className="space-y-2.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter password"
                disabled={isVerifying}
                className="h-11 rounded-xl border-border/70 bg-background/70"
                autoFocus
              />
              {passwordError ? <p className="text-sm text-destructive">{passwordError}</p> : null}
            </div>

            <Button
              type="submit"
              className="h-11 w-full rounded-xl"
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
      </section>
    )
  }

  const imageUrl = project.isPrivate
    ? `/api/i/${slug}`
    : toImageKitUrl(project.finalImageUrl || `/api/i/${slug}`)

  return (
    <section className="relative isolate overflow-hidden px-4 pb-16 pt-28 md:px-6 md:pb-24 md:pt-36">
      <div className="pointer-events-none absolute inset-x-0 top-6 flex justify-center">
        <div className="h-64 w-[72vw] max-w-5xl rounded-full bg-primary/15 blur-[120px] dark:hidden" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl space-y-8">
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Shared comparison
          </div>
          <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
            {project.beforeLabel} <span className="text-muted-foreground">vs</span> {project.afterLabel}
          </h1>
          <p className="text-sm text-muted-foreground md:text-base">
            Published by {creatorName} on {createdDate}
          </p>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-border/60 bg-card/70 p-2 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.55)] backdrop-blur-sm">
          <div className="overflow-hidden rounded-[1.5rem] border border-border/60 bg-muted/40">
            <ProgressiveImage
              src={imageUrl}
              alt="Comparison"
              className="h-auto w-full select-none"
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
              priority
            />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="rounded-2xl border border-border/60 bg-card/80 p-6 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <MessageSquare className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
              <div className="flex-1 space-y-2">
                <h2 className="font-semibold">Message from creator</h2>
                <p className="whitespace-pre-wrap text-muted-foreground">
                  {project.shareMessage?.trim() || "No message was provided for this share."}
                </p>
              </div>
            </div>
          </div>

          <aside className="rounded-2xl border border-border/60 bg-card/80 p-6 backdrop-blur-sm">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Share details
            </h2>

            <div className="mt-4 flex items-center gap-3 rounded-xl border border-border/60 bg-muted/35 p-3">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-border/60 bg-muted/60">
                <UserRound className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium">{creatorName}</p>
                <p className="text-sm text-muted-foreground">Creator</p>
              </div>
            </div>

            <div className="mt-4 space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span>{project.viewCount} views</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                <span>{createdDate}</span>
              </div>
              {project.isPrivate ? (
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-amber-500" />
                  <span>Private</span>
                </div>
              ) : null}
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
