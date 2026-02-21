"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, Eye, Loader2, AlertCircle, MessageSquare } from "lucide-react"
import { Navbar } from "@/components/common/Navbar"
import { Footer } from "@/components/common/Footer"
import { ProgressiveImage } from "@/components/ui/progressive-image"

interface ProjectData {
  shareSlug: string
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

export default function SharePage() {
  const params = useParams()
  const slug = params.slug as string

  const [project, setProject] = useState<ProjectData | null>(null)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [password, setPassword] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchProject()
    
    // Add performance optimization hints
    const preconnectLink = document.createElement("link")
    preconnectLink.rel = "preconnect"
    preconnectLink.href = window.location.origin
    document.head.appendChild(preconnectLink)
    
    // Prefetch the image API endpoint
    if (slug) {
      const prefetchLink = document.createElement("link")
      prefetchLink.rel = "prefetch"
      prefetchLink.href = `/api/i/${slug}`
      prefetchLink.as = "image"
      document.head.appendChild(prefetchLink)
      
      return () => {
        document.head.removeChild(preconnectLink)
        document.head.removeChild(prefetchLink)
      }
    }
  }, [slug])

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/share/${slug}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          setError("This share does not exist")
        } else {
          setError("Failed to load share")
        }
        setIsLoading(false)
        return
      }

      const data = await response.json()
      setProject(data)
      
      // If not private, set as authorized and increment view
      if (!data.isPrivate) {
        setIsAuthorized(true)
        incrementView()
      }
    } catch (err) {
      setError("Failed to load share")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
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
      incrementView()
    } catch (err) {
      setPasswordError("Failed to verify password")
    } finally {
      setIsVerifying(false)
    }
  }

  const incrementView = async () => {
    try {
      await fetch("/api/share-view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      })
    } catch (err) {
      console.error("Failed to increment view count:", err)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
        <AlertCircle className="h-16 w-16 text-destructive" />
        <h1 className="text-2xl font-bold">Share Not Found</h1>
        <p className="text-muted-foreground">{error}</p>
      </div>
    )
  }

  if (project?.isPrivate && !isAuthorized) {
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
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                disabled={isVerifying}
                autoFocus
              />
              {passwordError && (
                <p className="text-sm text-destructive">{passwordError}</p>
              )}
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

  if (!project) {
    return null
  }

  const imageUrl = `/api/i/${slug}`

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 mx-auto max-w-6xl px-6 py-12 mt-20">
        <div className="space-y-8">
          {/* Image with Progressive Loading */}
          <div className="overflow-hidden rounded-2xl border border-border bg-muted">
            <ProgressiveImage
              src={imageUrl}
              alt="Comparison"
              className="w-full h-auto select-none"
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
              priority={true}
            />
          </div>

          {/* Share Message */}
          {project.shareMessage && (
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="flex items-start gap-3">
                <MessageSquare className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">Message from creator</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{project.shareMessage}</p>
                </div>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-card p-6">
            <div className="flex items-center gap-4">
              {project.user?.image && (
                <div className="h-12 w-12 rounded-full overflow-hidden flex-shrink-0">
                  <ProgressiveImage
                    src={project.user.image}
                    alt={project.user.name || "User"}
                    className="h-full w-full object-cover select-none"
                    draggable={false}
                    onContextMenu={(e) => e.preventDefault()}
                  />
                </div>
              )}
              <div>
                {project.user?.name && (
                  <p className="font-medium">{project.user.name}</p>
                )}
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
              {project.isPrivate && (
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-amber-500" />
                  <span>Private</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
