import { NextRequest } from "next/server"

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key]
    }
  })
}, 5 * 60 * 1000)

interface RateLimitOptions {
  interval: number // Time window in milliseconds
  maxRequests: number // Maximum requests per interval
}

/**
 * Rate limiter using in-memory store
 * For production, consider using Redis or other distributed storage
 */
export function rateLimit(options: RateLimitOptions) {
  return (req: NextRequest, identifier: string) => {
    const now = Date.now()
    const key = `${identifier}`

    if (!store[key] || store[key].resetTime < now) {
      store[key] = {
        count: 1,
        resetTime: now + options.interval,
      }
      return {
        success: true,
        remaining: options.maxRequests - 1,
        resetTime: store[key].resetTime,
      }
    }

    store[key].count++

    if (store[key].count > options.maxRequests) {
      return {
        success: false,
        remaining: 0,
        resetTime: store[key].resetTime,
      }
    }

    return {
      success: true,
      remaining: options.maxRequests - store[key].count,
      resetTime: store[key].resetTime,
    }
  }
}

/**
 * Get client identifier from request
 */
export function getClientIdentifier(req: NextRequest): string {
  // Use IP address as identifier
  const forwarded = req.headers.get("x-forwarded-for")
  const ip = forwarded ? forwarded.split(",")[0] : req.headers.get("x-real-ip") || "unknown"
  return ip
}

/**
 * Pre-configured rate limiters for different endpoints
 */
export const authRateLimit = rateLimit({
  interval: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 attempts per 15 minutes
})

export const apiRateLimit = rateLimit({
  interval: 60 * 1000, // 1 minute
  maxRequests: 60, // 60 requests per minute
})

export const uploadRateLimit = rateLimit({
  interval: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 uploads per minute
})
