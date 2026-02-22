# Cloudflare R2 Configuration Guide

## Current Implementation

The application now supports saving final images to Cloudflare R2 storage. Here's what has been implemented:

### Files Added/Modified:
1. **`lib/r2.ts`** - R2 client utility for uploading files
2. **`app/api/upload-image/route.ts`** - API endpoint for image uploads
3. **`components/canvas-editor.tsx`** - Added "Save to Cloud" button with upload functionality
4. **`app/(dashboard)/layout.tsx`** - Added Toaster for notifications

### Features:
- âœ… Upload images directly from the canvas editor
- âœ… Support for both PNG and JPEG formats
- âœ… Automatic file naming with timestamps
- âœ… User authentication check before upload
- âœ… Toast notifications for success/failure
- âœ… Copy URL to clipboard functionality

## Important: R2 Public Access Configuration

By default, R2 buckets are **private**. To make uploaded images publicly accessible, you need to configure public access in Cloudflare:

### Option 1: Enable Public Access (Recommended for this use case)

1. Go to your [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **R2** â†’ **Your Bucket** (`combiner-images`)
3. Go to **Settings** â†’ **Public Access**
4. Click **Allow Access** and note the public URL format
5. Update the `uploadToR2` function in `lib/r2.ts` to use the correct public URL format

The public URL will typically be in this format:
```
https://pub-xxxxx.r2.dev/your-file-name.png
```

### Option 2: Custom Domain (Production Recommended)

1. Go to R2 bucket settings
2. Connect a custom domain (e.g., `images.yourdomain.com`)
3. Update `lib/r2.ts` to use your custom domain:

```typescript
const publicUrl = `https://images.yourdomain.com/${key}`
```

### Option 3: Signed URLs (Most Secure)

For private files with temporary access, implement signed URLs using `@aws-sdk/s3-request-presigner`.

## Testing the Implementation

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to the Screensplit editor
3. Upload before/after images
4. Customize your comparison
5. Click **"Save to Cloud"**
6. Check the console and toast notification for the URL
7. Test if the URL is publicly accessible

## Environment Variables

Make sure these are set in your `.env` file:

```env
R2_S3_ENDPOINT=https://8e3abde78dc356cebc7b245f928ad3d2.r2.cloudflarestorage.com
R2_REGION=auto
R2_ACCESS_KEY_ID=673d764d30848f508a0e5df0bec8afd3
R2_SECRET_ACCESS_KEY=1e310cec930a4e4050647209eee8bb85e262e56edfb2f7d44db50f4e8a596db2
R2_BUCKET=combiner-images
R2_S3_FORCE_PATH_STYLE=true
```

## Troubleshooting

### Images upload but URLs are not accessible
- **Solution**: Enable public access on your R2 bucket or use a custom domain

### Authentication errors
- **Solution**: Verify your R2 credentials are correct and have write permissions

### CORS errors
- **Solution**: Configure CORS settings in your R2 bucket if accessing from different domains

## Next Steps

1. Configure public access or custom domain for your R2 bucket
2. Test uploads in production environment
3. Consider adding image optimization before upload
4. Add database tracking of uploaded images (optional)
5. Implement image deletion functionality (optional)
