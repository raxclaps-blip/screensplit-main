import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

// Initialize cloud storage client with credentials from environment
const r2Client = new S3Client({
  region: process.env.R2_REGION || "auto",
  endpoint: process.env.R2_S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
  forcePathStyle: process.env.R2_S3_FORCE_PATH_STYLE === "true",
})

function getBucketName(): string {
  const bucketName = process.env.R2_BUCKET
  if (!bucketName) {
    throw new Error("Cloud storage bucket environment variable is not set")
  }
  return bucketName
}

function getPublicEndpoint(): string {
  const endpoint = (process.env.R2_S3_ENDPOINT || "").trim().replace(/\/+$/, "")
  if (!endpoint) {
    throw new Error("Cloud storage endpoint environment variable is not set")
  }
  return endpoint
}

export function buildR2ObjectUrl(key: string): string {
  const bucketName = getBucketName()
  const endpoint = getPublicEndpoint()
  return `${endpoint}/${bucketName}/${key}`
}

/**
 * Upload a file to cloud storage
 * @param buffer - The file buffer to upload
 * @param key - The key/path where the file will be stored in cloud storage
 * @param contentType - The MIME type of the file
 * @returns The public URL of the uploaded file
 */
export async function uploadToR2(
  buffer: Buffer,
  key: string,
  contentType: string,
): Promise<string> {
  const bucketName = getBucketName()

  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    })

    await r2Client.send(command)

    return buildR2ObjectUrl(key)
  } catch (error) {
    console.error("Error uploading to cloud storage:", error)
    throw new Error("Failed to upload file to cloud storage")
  }
}

type PresignedUploadInput = {
  key: string
  contentType: string
  expiresInSeconds?: number
}

export async function createPresignedR2Upload({
  key,
  contentType,
  expiresInSeconds = 900,
}: PresignedUploadInput): Promise<{ uploadUrl: string; objectUrl: string; expiresInSeconds: number }> {
  const bucketName = getBucketName()

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
    CacheControl: "public, max-age=31536000, immutable",
  })

  const uploadUrl = await getSignedUrl(r2Client, command, {
    expiresIn: Math.min(Math.max(expiresInSeconds, 60), 3600),
  })

  return {
    uploadUrl,
    objectUrl: buildR2ObjectUrl(key),
    expiresInSeconds: Math.min(Math.max(expiresInSeconds, 60), 3600),
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
 * Get an object from cloud storage
 * @param key - The key/path of the file in cloud storage
 * @returns The file stream and metadata
 */
export async function getFromR2(key: string) {
  const bucketName = getBucketName()

  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    })

    const response = await r2Client.send(command)
    return response
  } catch (error) {
    console.error("Error fetching from cloud storage:", error)
    throw new Error("Failed to fetch file from cloud storage")
  }
}
