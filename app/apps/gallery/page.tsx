"use client"

import { useState, useEffect, useCallback, useMemo, memo, useRef } from "react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { 
  ImageIcon, 
  Eye, 
  Download, 
  Share2, 
  Lock, 
  Globe, 
  Calendar,
  MoreHorizontal,
  Trash2,
  Edit,
  Loader2
} from "lucide-react"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { ShareDialog } from "@/components/screensplit/share-dialog"
import { ProgressiveImage } from "@/components/ui/progressive-image"
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
  shareMessage?: string
  isPrivate: boolean
  isPublic: boolean
  viewCount: number
  createdAt: string
  updatedAt: string
  beforeLabel: string
  afterLabel: string
  layout: string
}

export default function GalleryPage() {
  const { data: session } = useSession()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
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
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  const fetchProjects = useCallback(async (cursorId?: string, append: boolean = false) => {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)
    try {
      if (append) setLoadingMore(true)
      else setRefreshing(true)
      const url = cursorId ? `/api/gallery?take=24&cursorId=${encodeURIComponent(cursorId)}` : '/api/gallery?take=24'
      const response = await fetch(url, { signal: controller.signal, cache: 'no-store' })
      if (response.ok) {
        const data = await response.json()
        const list: Project[] = Array.isArray(data.projects) ? data.projects : []
        setHasMore(Boolean(data.hasMore))
        setNextCursor(data.nextCursorId || null)
        setProjects(prev => append ? [...prev, ...list.filter(p => !prev.some(x => x.id === p.id))] : list)
        if (!append) {
          try { localStorage.setItem('gallery_cache_v1', JSON.stringify({ ts: Date.now(), projects: list })) } catch {}
        }
      } else if (response.status === 401) {
        setUnauthorized(true)
        setProjects([])
      } else {
        toast.error('Failed to load gallery')
      }
    } catch (error: any) {
      if (error?.name !== 'AbortError') {
        console.error('Error fetching projects:', error)
        toast.error('Failed to load gallery')
      }
    } finally {
      clearTimeout(timeout)
      if (append) setLoadingMore(false)
      else setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('gallery_cache_v1')
      if (raw) {
        const cached = JSON.parse(raw)
        if (Array.isArray(cached?.projects)) {
          setProjects(cached.projects)
        }
      }
    } catch {}
    
    fetchProjects()
    
    // Add performance optimization hints
    const preconnectLink = document.createElement("link")
    preconnectLink.rel = "preconnect"
    preconnectLink.href = window.location.origin
    document.head.appendChild(preconnectLink)
    
    return () => {
      try {
        document.head.removeChild(preconnectLink)
      } catch {}
    }
  }, [fetchProjects])

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    if (!hasMore || loading || loadingMore) return
    const el = loadMoreRef.current
    if (!el) return
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        fetchProjects(nextCursor ?? undefined, true)
      }
    }, { rootMargin: '200px' })
    obs.observe(el)
    return () => obs.disconnect()
  }, [hasMore, nextCursor, loading, loadingMore, fetchProjects])

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
        setProjects(prev => prev.filter(p => p.id !== projectToDelete.id))
        toast.success('Deleted', { description: 'Project deleted successfully', id: toastId })
        setDeleteDialogOpen(false)
        setProjectToDelete(null)
      } else {
        toast.error('Delete failed', { description: 'Failed to delete project', id: toastId })
      }
    } catch (error) {
      console.error('Error deleting project:', error)
      toast.error('Delete failed', { description: 'An unexpected error occurred' })
    } finally {
      setIsDeleting(false)
    }
  }, [projectToDelete])

  const handleOpenImagePreview = useCallback((project: Project) => {
    setPreviewProject(project)
    setImagePreviewOpen(true)
  }, [])

  const handleOpenShareDialog = useCallback((project: Project) => {
    setSelectedProject(project)
    setShareDialogOpen(true)
    toast('Privacy settings', { description: 'Adjust sharing options for your image' })
  }, [])

  const handleCloseShareDialog = useCallback(() => {
    setShareDialogOpen(false)
    // Refresh projects to get updated data
    fetchProjects()
  }, [fetchProjects])

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
        toast.loading('Downloading image...', { id: toastId })
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

  const comparisons = useMemo(() => projects.filter(p => p.shareSlug), [projects])
  const sharedImages = useMemo(() => projects.filter(p => p.isPublic), [projects])

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }, [])

  const ProjectCard = memo(({ project }: { project: Project }) => {
    const handleImageClick = useCallback(() => {
      handleOpenImagePreview(project)
    }, [project])

    const handleCardHover = useCallback(() => {
      // Preload image on hover for instant preview
      const img = new Image()
      img.src = `/api/i/${project.shareSlug}`
    }, [project.shareSlug])

    const handleCopyClick = useCallback(() => {
      copyShareLink(project)
    }, [project])

    const handleDownloadClick = useCallback(() => {
      downloadImage(project)
    }, [project])

    const handleShareClick = useCallback(() => {
      handleOpenShareDialog(project)
    }, [project])

    const handleDeleteClick = useCallback(() => {
      handleOpenDeleteDialog(project)
    }, [project])

    const imageUrl = useMemo(() => `/api/i/${project.shareSlug}`, [project.shareSlug])

    return (
      <Card className="group overflow-hidden transition-all hover:shadow-lg" onMouseEnter={handleCardHover}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate">
                {project.title || 'Untitled Comparison'}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {project.beforeLabel} vs {project.afterLabel}
              </p>
              {project.shareMessage && (
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                  💬 {project.shareMessage}
                </p>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleCopyClick}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Copy Link
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadClick}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShareClick}>
                  <Lock className="h-4 w-4 mr-2" />
                  Privacy Settings
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleDeleteClick}
                  className="text-foreground focus:text-foreground"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div 
            className="relative aspect-video bg-muted rounded-lg overflow-hidden mb-4 cursor-pointer hover:ring-2 hover:ring-primary transition-all"
            onClick={handleImageClick}
          >
            <ProgressiveImage
              src={imageUrl}
              alt={project.title || 'Comparison'}
              className="w-full h-full object-cover"
              priority={false}
            />
          </div>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{project.viewCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(project.createdAt)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {project.isPrivate ? (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  Private
                </Badge>
              ) : (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  Public
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  })

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
      <div className="mb-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gallery</h1>
            <p className="text-muted-foreground mt-2">Manage your image comparisons and shared content</p>
          </div>
          {refreshing && (
            <div className="text-xs text-muted-foreground">Refreshing…</div>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="comparisons" className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Comparisons ({comparisons.length})
          </TabsTrigger>
          <TabsTrigger value="shared" className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Shared ({sharedImages.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="comparisons" className="mt-6">
          {comparisons.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No comparisons yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first before/after comparison to get started
              </p>
              <Button asChild>
                <Link href="/apps/screensplit">Create Comparison</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {comparisons.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
              {hasMore && (
                <div ref={loadMoreRef} className="py-6 text-center text-xs text-muted-foreground">
                  {loadingMore ? (
                    <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin"/> Loading…</span>
                  ) : (
                    <span>Scroll to load more…</span>
                  )}
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="shared" className="mt-6">
          {sharedImages.length === 0 ? (
            <div className="text-center py-12">
              <Share2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No shared images yet</h3>
              <p className="text-muted-foreground mb-6">
                Share your comparisons to make them appear here
              </p>
              <Button asChild>
                <Link href="/apps/screensplit">Create & Share</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sharedImages.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
              {hasMore && (
                <div ref={loadMoreRef} className="py-6 text-center text-xs text-muted-foreground">
                  {loadingMore ? (
                    <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin"/> Loading…</span>
                  ) : (
                    <span>Scroll to load more…</span>
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
          if (!open) setStickyImage(false) // Reset sticky state when dialog closes
        }}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <DialogTitle>{previewProject.title || 'Untitled Comparison'}</DialogTitle>
                  <DialogDescription>
                    {previewProject.beforeLabel} vs {previewProject.afterLabel}
                  </DialogDescription>
                </div>
                {/* Sticky Image Toggle - Mobile Only */}
                <div className="flex items-center gap-2 md:hidden">
                  <Switch
                    id="sticky-image"
                    checked={stickyImage}
                    onCheckedChange={setStickyImage}
                  />
                  <Label htmlFor="sticky-image" className="text-xs cursor-pointer whitespace-nowrap">
                    Sticky
                  </Label>
                </div>
              </div>
            </DialogHeader>
            <div className={`relative w-full rounded-lg overflow-hidden min-h-[400px] ${
              stickyImage ? 'md:relative sticky top-0 z-50 bg-background' : ''
            }`}>
              <ProgressiveImage
                src={`/api/i/${previewProject.shareSlug}`}
                alt={previewProject.title || 'Comparison'}
                className="w-full h-auto"
                priority={true}
              />
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  onClick={() => {
                    copyShareLink(previewProject)
                    setImagePreviewOpen(false)
                  }}
                  className="flex-1 sm:flex-none"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    downloadImage(previewProject)
                  }}
                  className="flex-1 sm:flex-none"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
              <Button onClick={() => setImagePreviewOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{projectToDelete?.title || 'this project'}"? This action cannot be undone and will permanently remove the project and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Share Dialog */}
      {selectedProject && (
        <ShareDialog
          open={shareDialogOpen}
          onOpenChange={handleCloseShareDialog}
          imagePreviewSrc={`/api/i/${selectedProject.shareSlug}`}
          slug={selectedProject.shareSlug!}
          initialIsPrivate={selectedProject.isPrivate}
          initialMessage={selectedProject.shareMessage || ""}
        />
      )}
    </div>
  )
}
