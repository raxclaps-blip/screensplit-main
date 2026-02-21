"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ImageViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  image: {
    id: string;
    title: string;
    views: number;
    accent: string;
  } | null;
}

export function ImageViewDialog({
  open,
  onOpenChange,
  image,
}: ImageViewDialogProps) {
  if (!image) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-lg md:max-w-3xl lg:max-w-5xl p-0 gap-0 overflow-hidden bg-background border border-border/50">
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-50 h-8 w-8 rounded-full bg-background/80 backdrop-blur-md hover:bg-background border border-border/50"
          onClick={() => onOpenChange(false)}
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Accessible title for screen readers */}
        <DialogTitle className="sr-only">{image.title || "Image preview"}</DialogTitle>

        <div className="relative bg-muted/30">
          <div className="relative aspect-[4/3] overflow-hidden max-h-[80vh]">
            <div 
              className="absolute inset-0 bg-gradient-to-br opacity-80"
              style={{
                backgroundImage: `linear-gradient(to bottom right, ${image.accent}, ${image.accent}40)`
              }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
