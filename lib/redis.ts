import { Redis } from "@upstash/redis"
import { Ratelimit } from "@upstash/ratelimit"

// Initialize Redis client
// In production (or when REDIS_REQUIRED=true), missing/unreachable Redis is a hard error.
const isProduction = process.env.NODE_ENV === "production"
const redisRequiredByEnv = (process.env.REDIS_REQUIRED || "").toLowerCase() === "true"
const redisRequired = isProduction || redisRequiredByEnv

const redisUrl = process.env.UPSTASH_REDIS_REST_URL
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN

let redis: Redis | null = null

try {
  if (redisUrl && redisToken) {
    redis = new Redis({
      url: redisUrl,
      token: redisToken,
    })
  } else if (redisRequired) {
    throw new Error("UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required")
  }
} catch (error) {
  console.error("Failed to initialize Redis:", error)
  if (redisRequired) {
    throw error
  }
}

/**
 * Redis-based rate limiters for different use cases
 * Falls back to in-memory rate limiting if Redis is not available
 */

// Authentication rate limiter: 5 requests per 15 minutes
export const authRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "15 m"),
      analytics: true,
      prefix: "@screensplit/auth",
    })
  : null

// Upload rate limiter: 10 requests per minute
export const uploadRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "1 m"),
      analytics: true,
      prefix: "@screensplit/upload",
    })
  : null

// General API rate limiter: 60 requests per minute
export const apiRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, "1 m"),
      analytics: true,
      prefix: "@screensplit/api",
    })
  : null

// Strict rate limiter for password attempts: 5 requests per 15 minutes
export const passwordRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "15 m"),
      analytics: true,
      prefix: "@screensplit/password",
    })
  : null

/**
 * Helper function to check rate limit
 * @param rateLimiter - The rate limiter instance
 * @param identifier - Unique identifier for the rate limit (e.g., IP address, user ID)
 * @returns Object with success status and limit info
 */
export async function checkRateLimit(
  rateLimiter: Ratelimit | null,
  identifier: string
): Promise<{
  success: boolean
  limit: number
  remaining: number
  reset: number
  pending: Promise<unknown>
} | null> {
  if (!rateLimiter) {
    if (redisRequired) {
      throw new Error("Rate limiter unavailable while Redis is required")
    }
    // Dev fallback when Redis is intentionally optional.
    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: 0,
      pending: Promise.resolve(),
    }
  }

  try {
    const result = await rateLimiter.limit(identifier)
    void result.pending.catch((pendingError) => {
      console.error("Rate limiter analytics pending promise failed:", pendingError)
    })
    return result
  } catch (error) {
    console.error("Rate limit check failed:", error)
    if (redisRequired) {
      throw error
    }
    // Dev fallback when Redis is intentionally optional.
    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: 0,
      pending: Promise.resolve(),
    }
  }
}

/**
 * Check if Redis is available
 */
export function isRedisAvailable(): boolean {
  return redis !== null
}

export function isRedisRequired(): boolean {
  return redisRequired
}

export async function assertRedisConnection(): Promise<void> {
  if (!redis) {
    throw new Error("Redis client is not initialized")
  }
  await redis.ping()
}

export { redis }
