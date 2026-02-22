"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Upload, Download, X, ArrowRight, Sparkles } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import Image from "next/image";

type ImageFormat = "jpeg" | "png" | "gif" | "webp" | "avif" | "tiff";

export default function ImageToolsPage() {
  const [image, setImage] = useState<string | null>(null);
  const [sourceFormat, setSourceFormat] = useState<string>("");
  const [targetFormat, setTargetFormat] = useState<ImageFormat>("png");
  const [quality, setQuality] = useState([85]);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [optimizedSize, setOptimizedSize] = useState<number>(0);
  const [enableOptimization, setEnableOptimization] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Auto-calculate optimized size when quality changes
  useEffect(() => {
    if (image && originalSize > 0) {
      const estimatedSize = originalSize * (quality[0] / 100);
      setOptimizedSize(estimatedSize);
    }
  }, [quality, image, originalSize]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const format = file.type.split("/")[1].toUpperCase();
      setSourceFormat(format);
      setOriginalSize(file.size);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        toast.success("Image loaded");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const format = file.type.split("/")[1].toUpperCase();
      setSourceFormat(format);
      setOriginalSize(file.size);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        toast.success("Image loaded from drop");
      };
      reader.readAsDataURL(file);
    } else {
      toast.error("Unsupported file type");
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const handleProcess = () => {
    if (!image || !canvasRef.current) {
      toast.error("No image to process");
      return;
    }

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = canvasRef.current!;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);

      let mimeType = "image/jpeg";
      let extension = "jpg";

      switch (targetFormat) {
        case "png":
          mimeType = "image/png";
          extension = "png";
          break;
        case "webp":
          mimeType = "image/webp";
          extension = "webp";
          break;
        case "avif":
          mimeType = "image/avif";
          extension = "avif";
          break;
        case "gif":
          mimeType = "image/gif";
          extension = "gif";
          break;
        case "tiff":
          mimeType = "image/tiff";
          extension = "tiff";
          break;
      }

      // Use quality setting if optimization is enabled, otherwise max quality
      const qualityValue = enableOptimization ? quality[0] / 100 : 1.0;
      const filename = `image.${extension}`;

      const toastId = toast.loading("Processing image...");
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
            toast.success("Download ready", { id: toastId });
          } else {
            toast.error("Failed to process image", { id: toastId });
          }
        },
        mimeType,
        qualityValue
      );
    };
    img.src = image;
  };

  const clearImage = () => {
    setImage(null);
    setSourceFormat("");
    setOptimizedSize(0);
    setOriginalSize(0);
    toast("Cleared", { description: "Image removed" });
  };

  const getFormatInfo = (format: ImageFormat) => {
    const info = {
      jpeg: {
        desc: "Best for photographs with good compression",
        badge: "Popular",
      },
      png: {
        desc: "Lossless format with transparency support",
        badge: "Lossless",
      },
      webp: {
        desc: "Modern format with excellent compression",
        badge: "Modern",
      },
      avif: {
        desc: "Next-gen format with superior compression",
        badge: "Next-Gen",
      },
      gif: { desc: "Supports animation and transparency", badge: "Animated" },
      tiff: { desc: "High-quality format for professional use", badge: "Pro" },
    };
    return info[format];
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl font-bold">Image Tools</h1>
          <Badge variant="outline" className="text-xs">
            Convert & Optimize
          </Badge>
        </div>
        <p className="text-muted-foreground">
          Convert images to any format and optimize with quality control
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upload Section */}
        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold">Source Image</h2>
          {!image ? (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="flex min-h-[400px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 transition-colors hover:border-muted-foreground/50 hover:bg-muted/50"
            >
              <Upload className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="mb-2 text-sm font-medium">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">
                JPEG, PNG, GIF, WEBP, AVIF, TIFF
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          ) : (
            <div className="relative">
              <Image
                src={image || "/placeholder.svg"}
                alt="Source"
                className="w-full rounded-lg"
              />
              <Button
                size="icon"
                variant="destructive"
                className="absolute right-2 top-2"
                onClick={clearImage}
              >
                <X className="h-4 w-4" />
              </Button>
              <div className="mt-4 space-y-2">
                {sourceFormat && (
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-sm text-muted-foreground">
                      Format:{" "}
                      <span className="font-semibold text-foreground">
                        {sourceFormat}
                      </span>
                    </p>
                  </div>
                )}
                {originalSize > 0 && (
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-sm text-muted-foreground">
                      Size:{" "}
                      <span className="font-semibold text-foreground">
                        {formatBytes(originalSize)}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>

        {/* Settings Section */}
        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold">Output Settings</h2>
          <div className="space-y-6">
            {/* Format Conversion */}
            <div className="flex items-center justify-center gap-4 rounded-lg bg-gradient-to-r from-muted/50 to-muted p-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">From</p>
                <p className="text-2xl font-bold">{sourceFormat || "—"}</p>
              </div>
              <ArrowRight className="h-6 w-6 text-primary" />
              <div className="text-center">
                <p className="text-sm text-muted-foreground">To</p>
                <p className="text-2xl font-bold">
                  {targetFormat.toUpperCase()}
                </p>
              </div>
            </div>

            {/* Output Format Selection */}
            <div>
              <Label className="mb-3 block">Output Format</Label>
              <Select
                value={targetFormat}
                onValueChange={(value) => {
                  setTargetFormat(value as ImageFormat);
                  toast.success("Output format set", {
                    description: value.toUpperCase(),
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jpeg">JPEG</SelectItem>
                  <SelectItem value="png">PNG</SelectItem>
                  <SelectItem value="webp">WebP</SelectItem>
                  <SelectItem value="avif">AVIF</SelectItem>
                  <SelectItem value="gif">GIF</SelectItem>
                  <SelectItem value="tiff">TIFF</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Optimization Toggle */}
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4">
              <div className="flex-1">
                <Label
                  htmlFor="optimize-toggle"
                  className="text-sm font-semibold cursor-pointer"
                >
                  Enable Optimization
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Compress image to reduce file size
                </p>
              </div>
              <Switch
                id="optimize-toggle"
                checked={enableOptimization}
                onCheckedChange={(v) => {
                  setEnableOptimization(v);
                  toast(v ? "Optimization enabled" : "Optimization disabled");
                }}
              />
            </div>

            {/* Quality Slider (shown when optimization is enabled) */}
            {enableOptimization && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Quality</Label>
                  <span className="text-sm font-semibold text-primary">
                    {quality[0]}%
                  </span>
                </div>
                <Slider
                  value={quality}
                  onValueChange={setQuality}
                  min={1}
                  max={100}
                  step={1}
                  className="mb-2"
                />
                <p className="text-xs text-muted-foreground">
                  Adjust quality to balance file size and image clarity
                </p>
              </div>
            )}

            {/* Optimization Preview */}
            {enableOptimization && image && optimizedSize > 0 && (
              <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-green-500" />
                  <h3 className="text-sm font-semibold text-green-700 dark:text-green-400">
                    Estimated Results
                  </h3>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Original:{" "}
                    <span className="font-semibold text-foreground">
                      {formatBytes(originalSize)}
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Optimized:{" "}
                    <span className="font-semibold text-foreground">
                      {formatBytes(optimizedSize)}
                    </span>
                  </p>
                  <div className="pt-2 border-t border-green-500/20">
                    <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                      Saved:{" "}
                      {Math.round(
                        ((originalSize - optimizedSize) / originalSize) * 100
                      )}
                      % ({formatBytes(originalSize - optimizedSize)})
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Format Information */}
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold">Format Information</h3>
                <Badge variant="secondary" className="text-xs">
                  {getFormatInfo(targetFormat).badge}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {getFormatInfo(targetFormat).desc}
              </p>
            </div>

            {/* Process Button */}
            <Button
              onClick={handleProcess}
              disabled={!image}
              className="w-full"
              size="lg"
            >
              <Download className="mr-2 h-4 w-4" />
              {enableOptimization
                ? "Optimize & Download"
                : "Convert & Download"}
            </Button>
          </div>
        </Card>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
