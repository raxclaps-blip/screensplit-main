import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth-edge"
import { applySecurityHeaders } from "./middleware-security"

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  
  // Public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/about",
    "/contact",
    "/auth/signin",
    "/auth/signup",
    "/share",
  ]
  
  // API routes that should be public
  const publicApiRoutes = [
    "/api/auth",
    "/api/verify-share-password",
    "/api/i",
    "/api/share-view",
    "/api/share",
  ]
  
  // Check if the route is public
  const isPublicRoute = publicRoutes.some(route =>
    route === "/"
      ? pathname === "/"
      : pathname === route || pathname.startsWith(`${route}/`)
  )
  const isPublicApiRoute = publicApiRoutes.some(route => pathname.startsWith(route))
  
  // Allow public routes and API routes with security headers
  if (isPublicRoute || isPublicApiRoute) {
    return applySecurityHeaders(req)
  }
  
  // Check if user is authenticated for protected routes
  const protectedRoutes = [
    "/apps/screensplit",
    "/apps/videosplit",
    "/apps/optimizer",
    "/apps/converter",
    "/apps/settings",
    "/apps/support",
    "/apps/gallery",
    "/apps/image-tools",
  ]
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    // Properly validate the session using NextAuth
    const session = await auth()
    if (!session?.user) {
      // Redirect to signin page for dashboard routes
      const signInUrl = new URL("/auth/signin", req.url)
      signInUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(signInUrl)
    }
  }
  
  return applySecurityHeaders(req)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.json (PWA manifest)
     * - public files (public folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|public).*)",
  ],
}
