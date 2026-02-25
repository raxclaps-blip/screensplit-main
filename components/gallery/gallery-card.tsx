"use client"

import { useState, useCallback, useMemo } from "react"
import Image from "next/image"
import { MoreHorizontal, Share2, Download, Lock, Globe, Eye, Calendar, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { toImageKitUrl } from "@/lib/imagekit"

interface Project {
    id: string
    title?: string
    description?: string
    shareSlug?: string
    finalImageUrl?: string | null
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

interface GalleryCardProps {
    project: Project
    prioritize?: boolean
    onPreview: (project: Project) => void
    onCopyLink: (project: Project) => void
    onDownload: (project: Project) => void
    onShareSettings: (project: Project) => void
    onDelete: (project: Project) => void
    formatDate: (dateString: string) => string
}

export function GalleryCard({
    project,
    prioritize = false,
    onPreview,
    onCopyLink,
    onDownload,
    onShareSettings,
    onDelete,
    formatDate,
}: GalleryCardProps) {
    const [imageLoaded, setImageLoaded] = useState(false)
    const [imageError, setImageError] = useState(false)

    const imageUrl = useMemo(() => {
        if (!project.finalImageUrl) return null
        const version = new Date(project.updatedAt).getTime()

        if (!project.isPrivate) {
            const optimizedUrl = toImageKitUrl(project.finalImageUrl)
            const joinChar = optimizedUrl.includes("?") ? "&" : "?"
            return `${optimizedUrl}${joinChar}v=${version}`
        }

        if (!project.shareSlug) return null
        return `/api/i/${project.shareSlug}?v=${version}`
    }, [project.finalImageUrl, project.isPrivate, project.shareSlug, project.updatedAt])

    const handleImageClick = useCallback(() => {
        onPreview(project)
    }, [onPreview, project])

    return (
        <Card className="group overflow-hidden transition-all hover:shadow-lg border-muted/50">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate font-semibold">
                            {project.title || 'Untitled Comparison'}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1 font-medium">
                            {project.beforeLabel} vs {project.afterLabel}
                        </p>
                        {project.shareMessage && (
                            <p className="text-xs text-muted-foreground mt-2 line-clamp-2 italic">
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
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => onCopyLink(project)}>
                                <Share2 className="h-4 w-4 mr-2" />
                                Copy Link
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onDownload(project)}>
                                <Download className="h-4 w-4 mr-2" />
                                Download
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onShareSettings(project)}>
                                <Lock className="h-4 w-4 mr-2" />
                                Privacy Settings
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onDelete(project)}
                                className="text-destructive focus:text-destructive focus:bg-destructive/10"
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
                    className="relative aspect-video bg-muted rounded-xl overflow-hidden mb-4 cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all shadow-inner"
                    onClick={handleImageClick}
                >
                    {/* Skeleton Loader */}
                    {!imageLoaded && !imageError && Boolean(imageUrl) && (
                        <Skeleton className="absolute inset-0 z-10" />
                    )}

                    {/* Error State */}
                    {(imageError || !imageUrl) && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted text-muted-foreground p-4 text-center">
                            <p className="text-xs font-medium">Preview unavailable</p>
                        </div>
                    )}

                    {imageUrl ? (
                        <Image
                            src={imageUrl}
                            alt={project.title || "Comparison"}
                            fill
                            className={cn(
                                "object-cover transition-opacity duration-500",
                                imageLoaded ? "opacity-100" : "opacity-0"
                            )}
                            onLoad={() => setImageLoaded(true)}
                            onError={() => setImageError(true)}
                            priority={prioritize}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    ) : null}
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 bg-secondary/50 px-2 py-0.5 rounded-full">
                            <Eye className="h-3.5 w-3.5" />
                            <span className="font-semibold">{project.viewCount}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{formatDate(project.createdAt)}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {project.isPrivate ? (
                            <Badge variant="secondary" className="text-[10px] uppercase tracking-wider py-0 px-2 h-5 font-bold">
                                <Lock className="h-3 w-3 mr-1" />
                                Private
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="text-[10px] uppercase tracking-wider py-0 px-2 h-5 font-bold border-green-500/50 text-green-600 dark:text-green-400">
                                <Globe className="h-3 w-3 mr-1" />
                                Public
                            </Badge>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
