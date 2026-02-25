import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Security headers middleware
 * Add this to your main middleware chain
 */
function buildCsp(nonce: string, isProd: boolean): string {
  return isProd
    ? [
        "default-src 'self'",
        `script-src 'self' 'unsafe-inline' https://www.google.com https://www.gstatic.com https://*.vercel.app https://static.cloudflareinsights.com`,
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com data:",
        "img-src 'self' data: blob: https:",
        "media-src 'self' data: blob: https:",
        "worker-src 'self' blob:",
        "connect-src 'self' https: wss:",
        "frame-src 'self' https://www.google.com",
        "frame-ancestors 'none'",
        "object-src 'none'",
        "base-uri 'self'",
      ].join('; ')
    : [
        "default-src 'self'",
        "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://static.cloudflareinsights.com",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob: https:",
        "media-src 'self' data: blob: https:",
        "worker-src 'self' blob:",
        "font-src 'self' data:",
        "connect-src 'self' https: wss:",
        "frame-src 'self' https://vercel.live",
        "frame-ancestors 'none'",
        "object-src 'none'",
        "base-uri 'self'",
      ].join('; ')
}

export function securityHeaders(response: NextResponse, cspOverride?: string): NextResponse {
  const isProd = process.env.NODE_ENV === "production"
  if (cspOverride) {
    response.headers.set("Content-Security-Policy", cspOverride)
  } else {
    const arr = new Uint8Array(16)
    crypto.getRandomValues(arr)
    const nonce = Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('')
    const csp = buildCsp(nonce, isProd)
    response.headers.set("Content-Security-Policy", csp)
  }

  // Prevent clickjacking
  response.headers.set("X-Frame-Options", "DENY")
  
  // Prevent MIME sniffing
  response.headers.set("X-Content-Type-Options", "nosniff")
  
  // XSS Protection (legacy, but still useful)
  response.headers.set("X-XSS-Protection", "1; mode=block")
  
  // Referrer Policy
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  
  // Permissions Policy
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  )
  
  // Strict Transport Security (HSTS)
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    )
  }

  return response
}

/**
 * Apply security headers to a request
 */
export function applySecurityHeaders(req: NextRequest): NextResponse {
  const isProd = process.env.NODE_ENV === "production"
  const nonce = "" // Nonce not used in simplified CSP
  const csp = buildCsp(nonce, isProd)

  const response = NextResponse.next()

  // Set security headers on the response
  return securityHeaders(response, csp)
}
