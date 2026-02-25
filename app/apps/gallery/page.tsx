"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  ImageIcon,
  Download,
  Share2,
  Loader2,
  MoreHorizontal,
} from "lucide-react"
import { toast } from "sonner"
import { ShareDialog } from "@/components/screensplit/share-dialog"
import { GalleryCard } from "@/components/gallery/gallery-card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { toImageKitUrl } from "@/lib/imagekit"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Project {
  id: string
  title?: string
  description?: string
  shareSlug?: string
  finalImageUrl?: string | null
  shareMessage?: string
  isPrivate: boolean
  isPublic: boolean
  isFeaturedInCommunity?: boolean
  viewCount: number
  createdAt: string
  updatedAt: string
  beforeLabel: string
  afterLabel: string
  layout: string
}

export default function GalleryPage() {
  const PAGE_SIZE = 12
  const CACHE_KEY = "gallery_cache_v3"
  const CACHE_TTL_MS = 2 * 60 * 1000
  const [projects, setProjects] = useState<Project[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState("comparisons")
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false)
  const [previewProject, setPreviewProject] = useState<Project | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [unauthorized, setUnauthorized] = useState(false)
  const [stickyImage, setStickyImage] = useState(false)
  const [previewLoaded, setPreviewLoaded] = useState(false)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)
  const isFetchingRef = useRef(false)

  const clearBodyPointerLock = useCallback(() => {
    if (typeof document === "undefined") return
    if (document.body.style.pointerEvents === "none") {
      document.body.style.pointerEvents = ""
    }
  }, [])

  const fetchProjects = useCallback(async (cursorId?: string, append: boolean = false, silent: boolean = false) => {
    if (isFetchingRef.current) return
    isFetchingRef.current = true
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)
    try {
      if (append) setLoadingMore(true)
      else if (!silent) setRefreshing(true)
      const url = cursorId
        ? `/api/gallery?take=${PAGE_SIZE}&cursorId=${encodeURIComponent(cursorId)}`
        : `/api/gallery?take=${PAGE_SIZE}`
      const response = await fetch(url, { signal: controller.signal, cache: 'no-store' })
      if (response.ok) {
        const data = await response.json()
        const list: Project[] = Array.isArray(data.projects) ? data.projects : []
        setHasMore(Boolean(data.hasMore))
        setNextCursor(data.nextCursorId || null)
        setProjects(prev => append ? [...prev, ...list.filter(p => !prev.some(x => x.id === p.id))] : list)
        if (!append) {
          try {
            localStorage.setItem(
              CACHE_KEY,
              JSON.stringify({ ts: Date.now(), projects: list, hasMore: Boolean(data.hasMore), nextCursorId: data.nextCursorId || null })
            )
          } catch { }
        }
      } else if (response.status === 401) {
        setUnauthorized(true)
        setProjects([])
      } else {
        const rawBody = await response.text().catch(() => "")
        let errorData: Record<string, any> | null = null
        if (rawBody) {
          try {
            errorData = JSON.parse(rawBody)
          } catch {
            errorData = null
          }
        }
        const errorMessage =
          (typeof errorData?.details?.message === "string" && errorData.details.message) ||
          (typeof errorData?.error === "string" && errorData.error) ||
          `Failed to load gallery (${response.status})`
        console.error("Gallery API error:", {
          status: response.status,
          statusText: response.statusText,
          errorData,
          rawBody: errorData ? null : rawBody.slice(0, 300),
        })
        toast.error(errorMessage)
      }
    } catch (error: any) {
      if (error?.name !== 'AbortError') {
        console.error('Error fetching projects:', error)
        toast.error('Failed to load gallery')
      }
    } finally {
      clearTimeout(timeout)
      if (append) setLoadingMore(false)
      else if (!silent) setRefreshing(false)
      isFetchingRef.current = false
    }
  }, [CACHE_KEY, PAGE_SIZE])

  useEffect(() => {
    let loadedFromFreshCache = false
    try {
      const raw = localStorage.getItem(CACHE_KEY)
      if (raw) {
        const cached = JSON.parse(raw)
        if (Array.isArray(cached?.projects)) {
          setProjects(cached.projects)
          setHasMore(Boolean(cached?.hasMore))
          setNextCursor(cached?.nextCursorId || null)
          if (typeof cached?.ts === "number" && Date.now() - cached.ts < CACHE_TTL_MS) {
            loadedFromFreshCache = true
          }
        }
      }
    } catch { }

    if (loadedFromFreshCache) {
      void fetchProjects(undefined, false, true)
      return
    }
    void fetchProjects()
  }, [CACHE_KEY, CACHE_TTL_MS, fetchProjects])

  // Infinite scroll
  useEffect(() => {
    if (!hasMore || loadingMore) return
    const el = loadMoreRef.current
    if (!el) return
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && nextCursor && !isFetchingRef.current) {
        void fetchProjects(nextCursor, true)
      }
    }, { rootMargin: '200px' })
    obs.observe(el)
    return () => obs.disconnect()
  }, [hasMore, nextCursor, loadingMore, fetchProjects])

  const handleOpenDeleteDialog = useCallback((project: Project) => {
    setProjectToDelete(project)
    setDeleteDialogOpen(true)
  }, [])

  const handleConfirmDelete = useCallback(async () => {
    if (!projectToDelete) return

    setIsDeleting(true)
    try {
      const toastId = toast.loading('Deleting project...')
      const response = await fetch(`/api/gallery/${projectToDelete.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        const deletedProjectId = projectToDelete.id
        setDeleteDialogOpen(false)
        setProjectToDelete(null)
        setProjects(prev => prev.filter(p => p.id !== deletedProjectId))
        requestAnimationFrame(clearBodyPointerLock)
        toast.success('Deleted', { description: 'Project deleted successfully', id: toastId })
      } else {
        toast.error('Delete failed', { description: 'Failed to delete project', id: toastId })
      }
    } catch (error) {
      console.error('Error deleting project:', error)
      toast.error('Delete failed', { description: 'An unexpected error occurred' })
    } finally {
      setIsDeleting(false)
    }
  }, [clearBodyPointerLock, projectToDelete])

  useEffect(() => {
    if (deleteDialogOpen || imagePreviewOpen || shareDialogOpen) return
    const timer = window.setTimeout(() => {
      clearBodyPointerLock()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [clearBodyPointerLock, deleteDialogOpen, imagePreviewOpen, shareDialogOpen])

  const handleOpenImagePreview = useCallback((project: Project) => {
    setPreviewProject(project)
    setPreviewLoaded(false)
    setImagePreviewOpen(true)
  }, [])

  const handleOpenShareDialog = useCallback((project: Project) => {
    setSelectedProject(project)
    setShareDialogOpen(true)
  }, [])

  const handleCloseShareDialog = useCallback(() => {
    setShareDialogOpen(false)
  }, [])

  const copyShareLink = useCallback(async (project: Project) => {
    const shareUrl = `${window.location.origin}/share/${project.shareSlug}`
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Link copied', { description: 'Share link copied to clipboard' })
    } catch (err) {
      toast.error('Copy failed', { description: 'Could not copy link to clipboard' })
    }
  }, [])

  const downloadImage = useCallback(async (project: Project) => {
    const toastId = toast.loading('Preparing download...')
    try {
      const response = await fetch(`/api/i/${project.shareSlug}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${project.title || 'comparison'}.png`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success('Download complete!', { id: toastId })
      } else {
        toast.error('Failed to download image', { id: toastId })
      }
    } catch (error) {
      console.error('Error downloading image:', error)
      toast.error('Download failed', { id: toastId })
    }
  }, [])

  const comparisons = useMemo(() => projects.filter((p) => p.shareSlug && p.finalImageUrl), [projects])
  const sharedImages = useMemo(() => projects.filter((p) => p.isPublic && p.shareSlug && p.finalImageUrl), [projects])

  const previewImageUrl = useMemo(() => {
    if (!previewProject?.finalImageUrl) return ""
    const version = new Date(previewProject.updatedAt).getTime()
    if (!previewProject.isPrivate) {
      const optimizedUrl = toImageKitUrl(previewProject.finalImageUrl)
      const joinChar = optimizedUrl.includes("?") ? "&" : "?"
      return `${optimizedUrl}${joinChar}v=${version}`
    }
    if (!previewProject.shareSlug) return ""
    return `/api/i/${previewProject.shareSlug}?v=${version}`
  }, [previewProject])

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }, [])

  if (unauthorized) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Sign in to view your gallery</h1>
        <p className="text-muted-foreground mb-6">Your saved comparisons and shared images will appear here after you sign in.</p>
        <Button asChild size="lg" className="rounded-full">
          <Link href="/auth/signin">Sign in</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <div className="flex items-center justify-between gap-3">
          {refreshing && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full animate-pulse">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Updating…</span>
            </div>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8 h-12 p-1 bg-muted/50 rounded-xl">
          <TabsTrigger value="comparisons" className="flex items-center gap-2 rounded-lg data-[state=active]:shadow-sm">
            <ImageIcon className="h-4 w-4" />
            <span className="font-medium">Comparisons</span>
            <span className="ml-1 text-xs opacity-50 bg-foreground/10 px-1.5 py-0.5 rounded-md">{comparisons.length}</span>
          </TabsTrigger>
          <TabsTrigger value="shared" className="flex items-center gap-2 rounded-lg data-[state=active]:shadow-sm">
            <Share2 className="h-4 w-4" />
            <span className="font-medium">Shared</span>
            <span className="ml-1 text-xs opacity-50 bg-foreground/10 px-1.5 py-0.5 rounded-md">{sharedImages.length}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="comparisons" className="mt-0 outline-none">
          {comparisons.length === 0 && !refreshing ? (
            <div className="text-center py-20 bg-muted/20 border-2 border-dashed border-muted rounded-3xl">
              <ImageIcon className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
              <h3 className="text-xl font-bold mb-2">No comparisons yet</h3>
              <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                Create your first before/after comparison to showcase your professional edits.
              </p>
              <Button asChild size="lg" className="rounded-full shadow-lg shadow-primary/20">
                <Link href="/apps/screensplit">Create Comparison</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {comparisons.map((project, index) => (
                  <GalleryCard
                    key={project.id}
                    project={project}
                    prioritize={index < 6}
                    onPreview={handleOpenImagePreview}
                    onCopyLink={copyShareLink}
                    onDownload={downloadImage}
                    onShareSettings={handleOpenShareDialog}
                    onDelete={handleOpenDeleteDialog}
                    formatDate={formatDate}
                  />
                ))}
              </div>
              {hasMore && (
                <div ref={loadMoreRef} className="py-12 text-center">
                  {loadingMore ? (
                    <div className="inline-flex items-center gap-3 bg-secondary px-4 py-2 rounded-full border border-border shadow-sm">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      <span className="font-medium text-sm italic">Loading more high-res previews…</span>
                    </div>
                  ) : (
                    <div className="h-1 w-full" />
                  )}
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="shared" className="mt-0 outline-none">
          {sharedImages.length === 0 && !refreshing ? (
            <div className="text-center py-20 bg-muted/20 border-2 border-dashed border-muted rounded-3xl">
              <Share2 className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
              <h3 className="text-xl font-bold mb-2">No shared images yet</h3>
              <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                Share your comparisons to build your professional public portfolio.
              </p>
              <Button asChild size="lg" className="rounded-full shadow-lg shadow-primary/20">
                <Link href="/apps/screensplit">Create & Share</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {sharedImages.map((project, index) => (
                  <GalleryCard
                    key={project.id}
                    project={project}
                    prioritize={index < 6}
                    onPreview={handleOpenImagePreview}
                    onCopyLink={copyShareLink}
                    onDownload={downloadImage}
                    onShareSettings={handleOpenShareDialog}
                    onDelete={handleOpenDeleteDialog}
                    formatDate={formatDate}
                  />
                ))}
              </div>
              {hasMore && (
                <div ref={loadMoreRef} className="py-12 text-center text-xs text-muted-foreground">
                  {loadingMore ? (
                    <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</span>
                  ) : (
                    <div className="h-1" />
                  )}
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Image Preview Dialog */}
      {previewProject && (
        <Dialog open={imagePreviewOpen} onOpenChange={(open) => {
          setImagePreviewOpen(open)
          if (!open) {
            setStickyImage(false)
            setPreviewProject(null)
          }
        }}>
          <DialogContent className="flex max-h-[calc(100svh-1rem)] w-[calc(100vw-1rem)] max-w-6xl flex-col overflow-hidden rounded-2xl border-muted/50 p-3 shadow-2xl sm:max-h-[95vh] sm:rounded-3xl sm:p-6">
            <DialogHeader className="mb-3 sm:mb-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div className="flex-1 min-w-0">
                  <DialogTitle className="truncate text-lg font-bold sm:text-2xl">
                    {previewProject.title || 'Untitled Comparison'}
                  </DialogTitle>
                  <DialogDescription className="text-sm sm:text-base">
                    {previewProject.beforeLabel} vs {previewProject.afterLabel}
                  </DialogDescription>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto md:hidden">
                  <div className="flex items-center gap-2 bg-secondary/50 px-2 py-1 rounded-full border border-border">
                    <Switch
                      id="sticky-image"
                      checked={stickyImage}
                      onCheckedChange={setStickyImage}
                      className="scale-90"
                    />
                    <Label htmlFor="sticky-image" className="text-[10px] font-bold uppercase tracking-tight cursor-pointer whitespace-nowrap">
                      Sticky
                    </Label>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-9 w-9 border border-border/70 bg-background/80 shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">More actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem onClick={() => copyShareLink(previewProject)}>
                        <Share2 className="h-4 w-4 mr-2" />
                        Copy Link
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => downloadImage(previewProject)}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="hidden md:flex">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-9 w-9 border border-border/70 bg-background/80 shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">More actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem onClick={() => copyShareLink(previewProject)}>
                        <Share2 className="h-4 w-4 mr-2" />
                        Copy Link
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => downloadImage(previewProject)}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </DialogHeader>

            <div className={cn(
              "relative flex-1 rounded-2xl overflow-hidden bg-muted/30 border border-muted/50 group shadow-inner min-h-[220px] sm:min-h-[300px]",
              stickyImage ? 'md:relative sticky top-0 z-50' : ''
            )}>
              {/* Skeleton/Loader */}
              {!previewLoaded && (
                <div className="absolute inset-0 flex items-center justify-center z-10 transition-opacity bg-muted">
                  <Skeleton className="w-full h-full" />
                  <div className="absolute flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest animate-pulse">Rendering full-res</p>
                  </div>
                </div>
              )}

              <Image
                src={previewImageUrl}
                alt={previewProject.title || "Comparison"}
                fill
                className={cn(
                  "object-contain transition-all duration-700 ease-in-out",
                  previewLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
                )}
                onLoad={() => setPreviewLoaded(true)}
                priority
              />
            </div>

            <DialogFooter className="mt-4 border-t border-muted/30 pt-3 pb-[max(env(safe-area-inset-bottom),0.25rem)] sm:mt-6 sm:pt-4">
              <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    copyShareLink(previewProject)
                  }}
                  className="w-full rounded-full px-4 transition-all hover:bg-secondary/80 border-border"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    downloadImage(previewProject)
                  }}
                  className="w-full rounded-full px-4 transition-all hover:bg-secondary/80 border-border"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  onClick={() => setImagePreviewOpen(false)}
                  className="w-full rounded-full px-4 shadow-lg shadow-primary/10 sm:col-span-2 lg:col-span-1"
                >
                  Close
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open)
          if (!open) {
            setProjectToDelete(null)
            requestAnimationFrame(clearBodyPointerLock)
          }
        }}
      >
        <AlertDialogContent className="rounded-3xl max-w-md border-muted/50">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">Delete Project?</AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Are you sure you want to delete <span className="font-bold text-foreground">"{projectToDelete?.title || 'this project'}"</span>?
              <br /><br />
              This action cannot be undone and will permanently remove the project and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel disabled={isDeleting} className="rounded-full px-6">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full px-8 shadow-lg shadow-destructive/10"
            >
              {isDeleting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </span>
              ) : 'Confirm Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Share Dialog */}
      {selectedProject && (
        <ShareDialog
          open={shareDialogOpen}
          onOpenChange={handleCloseShareDialog}
          imagePreviewSrc={
            selectedProject.isPrivate
              ? `/api/i/${selectedProject.shareSlug}`
              : toImageKitUrl(selectedProject.finalImageUrl || `/api/i/${selectedProject.shareSlug}`)
          }
          slug={selectedProject.shareSlug!}
          initialIsPrivate={selectedProject.isPrivate}
          initialMessage={selectedProject.shareMessage || ""}
          initialFeaturedInCommunity={Boolean(selectedProject.isFeaturedInCommunity)}
        />
      )}
    </div>
  )
}
