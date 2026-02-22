import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth-edge"
import { applySecurityHeaders } from "./middleware-security"

const PUBLIC_ROUTES = new Set(["/", "/about", "/contact", "/privacy", "/terms", "/auth/signin", "/auth/signup"])
const PUBLIC_ROUTE_PREFIXES = ["/share/"]
const PUBLIC_API_PREFIXES = ["/api/auth", "/api/verify-share-password", "/api/i", "/api/share-view", "/api/share"]

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isPublicRoute =
    PUBLIC_ROUTES.has(pathname) || PUBLIC_ROUTE_PREFIXES.some((routePrefix) => pathname.startsWith(routePrefix))

  const isPublicApiRoute = PUBLIC_API_PREFIXES.some((routePrefix) => pathname.startsWith(routePrefix))

  if (!isPublicRoute && !isPublicApiRoute && (pathname === "/apps" || pathname.startsWith("/apps/"))) {
    const session = await auth()
    if (!session?.user) {
      const signInUrl = new URL("/auth/signin", req.url)
      signInUrl.searchParams.set(
        "callbackUrl",
        `${pathname}${req.nextUrl.search ? req.nextUrl.search : ""}`,
      )
      return NextResponse.redirect(signInUrl)
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
