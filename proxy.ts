import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { applySecurityHeaders } from "./middleware-security"
import { AUTH_CALLBACK_COOKIE } from "@/lib/auth-callback"

const PUBLIC_ROUTES = new Set(["/", "/about", "/contact", "/privacy", "/terms", "/auth/signin", "/auth/signup"])
const PUBLIC_ROUTE_PREFIXES = ["/share/"]
const PUBLIC_API_PREFIXES = ["/api/auth", "/api/verify-share-password", "/api/i", "/api/share-view", "/api/share"]

async function hasValidSession(req: NextRequest): Promise<boolean> {
  const cookieHeader = req.headers.get("cookie")
  if (!cookieHeader) return false

  try {
    const response = await fetch(new URL("/api/auth/get-session", req.url), {
      method: "GET",
      headers: {
        cookie: cookieHeader,
      },
      cache: "no-store",
    })

    if (!response.ok) return false
    const data = await response.json()
    return Boolean(data?.user?.id)
  } catch {
    return false
  }
}

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isPublicRoute =
    PUBLIC_ROUTES.has(pathname) || PUBLIC_ROUTE_PREFIXES.some((routePrefix) => pathname.startsWith(routePrefix))

  const isPublicApiRoute = PUBLIC_API_PREFIXES.some((routePrefix) => pathname.startsWith(routePrefix))

  if (!isPublicRoute && !isPublicApiRoute && (pathname === "/apps" || pathname.startsWith("/apps/"))) {
    const isAuthenticated = await hasValidSession(req)

    if (!isAuthenticated) {
      const signInUrl = new URL("/auth/signin", req.url)
      const callbackPath = `${pathname}${req.nextUrl.search ? req.nextUrl.search : ""}`
      const response = NextResponse.redirect(signInUrl)
      response.cookies.set({
        name: AUTH_CALLBACK_COOKIE,
        value: encodeURIComponent(callbackPath),
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 10 * 60,
      })
      return response
    }
  }

  return applySecurityHeaders(req)
}

export const config = {
  matcher: [
    "/",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
    "/auth/:path*",
    "/apps/:path*",
    "/share/:path*",
    "/api/:path*",
  ],
}
