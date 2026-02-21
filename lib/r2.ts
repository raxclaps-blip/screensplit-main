import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"

// Initialize R2 client with credentials from environment
const r2Client = new S3Client({
  region: process.env.R2_REGION || "auto",
  endpoint: process.env.R2_S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
  forcePathStyle: process.env.R2_S3_FORCE_PATH_STYLE === "true",
})

/**
 * Upload a file to Cloudflare R2 storage
 * @param buffer - The file buffer to upload
 * @param key - The key/path where the file will be stored in R2
 * @param contentType - The MIME type of the file
 * @returns The public URL of the uploaded file
 */
export async function uploadToR2(
  buffer: Buffer,
  key: string,
  contentType: string,
): Promise<string> {
  const bucketName = process.env.R2_BUCKET

  if (!bucketName) {
    throw new Error("R2_BUCKET environment variable is not set")
  }

  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })

    await r2Client.send(command)

    // Construct the public URL
    // Note: You may need to adjust this based on your R2 public URL configuration
    const publicUrl = `${process.env.R2_S3_ENDPOINT}/${bucketName}/${key}`

    return publicUrl
  } catch (error) {
    console.error("Error uploading to R2:", error)
    throw new Error("Failed to upload file to R2 storage")
  }
}

/**
 * Generate a unique filename for uploaded images
 * @param format - The image format (png or jpeg)
 * @returns A unique filename with timestamp
 */
export function generateImageKey(format: "png" | "jpeg"): string {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  return `screensplit-${timestamp}-${randomString}.${format}`
}

/**
 * Get an object from R2 storage
 * @param key - The key/path of the file in R2
 * @returns The file stream and metadata
 */
export async function getFromR2(key: string) {
  const bucketName = process.env.R2_BUCKET

  if (!bucketName) {
    throw new Error("R2_BUCKET environment variable is not set")
  }

  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    })

    const response = await r2Client.send(command)
    return response
  } catch (error) {
    console.error("Error fetching from R2:", error)
    throw new Error("Failed to fetch file from R2 storage")
  }
}
