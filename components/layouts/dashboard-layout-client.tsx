"use client"

import type React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { House, LayoutGrid, HelpCircle, Wand2, X, LogOut, Images, Film, Palette, Settings, User2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import Logo from "@/components/common/Logo"
import { AUTH_CALLBACK_COOKIE } from "@/lib/auth-callback"
import { authClient } from "@/lib/auth-client"

const navigation = [
  { name: "Dashboard", href: "/apps/dashboard", icon: House },
  { name: "Screensplit", href: "/apps/screensplit", icon: LayoutGrid },
  { name: "Videosplit", href: "/apps/videosplit", icon: Film, beta: true },
  { name: "Designer", href: "/apps/designer", icon: Palette },
  { name: "Gallery", href: "/apps/gallery", icon: Images },
  { name: "Image Tools", href: "/apps/image-tools", icon: Wand2 },
]

const mobilePrimaryNavigation = [
  { name: "Dashboard", href: "/apps/dashboard", icon: House },
  { name: "Screensplit", href: "/apps/screensplit", icon: LayoutGrid },
  { name: "Designer", href: "/apps/designer", icon: Palette, center: true },
  { name: "Videosplit", href: "/apps/videosplit", icon: Film },
]

const iconAccentByRoute: Record<string, string> = {
  "/apps/screensplit": "text-blue-500 dark:text-blue-400",
  "/apps/videosplit": "text-rose-500 dark:text-rose-400",
  "/apps/designer": "text-violet-500 dark:text-violet-400",
  "/apps/gallery": "text-emerald-500 dark:text-emerald-400",
  "/apps/image-tools": "text-amber-500 dark:text-amber-400",
}

const pageMeta: Array<{ path: string; title: string; subtitle: string }> = [
  { path: "/apps/dashboard", title: "Dashboard", subtitle: "Choose a workflow and continue where you left off." },
  { path: "/apps", title: "Dashboard", subtitle: "Choose a workflow and continue where you left off." },
  { path: "/apps/screensplit", title: "Screensplit", subtitle: "Create before and after visual comparisons" },
  { path: "/apps/videosplit", title: "Videosplit (Beta)", subtitle: "Build side-by-side video comparisons" },
  {
    path: "/apps/designer",
    title: "Designer",
    subtitle: "Upload an image, apply a smooth black bottom fade, and place readable text with full layout control.",
  },
  { path: "/apps/gallery", title: "Gallery", subtitle: "Manage your saved and shared exports" },
  { path: "/apps/image-tools", title: "Image Tools", subtitle: "Convert and optimize images" },
  { path: "/apps/settings", title: "Settings", subtitle: "Manage your account and preferences" },
  { path: "/apps/support", title: "Support", subtitle: "Get help and product guidance" },
  { path: "/apps/converter", title: "Converter", subtitle: "Convert files into target formats" },
  { path: "/apps/optimizer", title: "Optimizer", subtitle: "Compress assets for faster delivery" },
]

function setAuthCallbackCookie(callbackPath: string) {
  if (!callbackPath.startsWith("/")) return
  if (typeof window === "undefined") return

  const secure = window.location.protocol === "https:" ? "; Secure" : ""
  document.cookie = `${encodeURIComponent(AUTH_CALLBACK_COOKIE)}=${encodeURIComponent(callbackPath)}; Path=/; Max-Age=${10 * 60}; SameSite=Lax${secure}`
}

function getPageInfo(pathname: string) {
  const bestMatch = pageMeta
    .sort((a, b) => b.path.length - a.path.length)
    .find((item) => pathname === item.path || pathname.startsWith(`${item.path}/`))

  if (bestMatch) return bestMatch
  return {
    title: "Apps",
    subtitle: "Professional visual workflow tools",
  }
}

function isRouteActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()
  const status = isPending ? "loading" : session ? "authenticated" : "unauthenticated"
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mobileAccountOpen, setMobileAccountOpen] = useState(false)
  const currentPage = getPageInfo(pathname)
  const isAccountRoute =
    isRouteActive(pathname, "/apps/image-tools") ||
    isRouteActive(pathname, "/apps/gallery") ||
    isRouteActive(pathname, "/apps/settings")
  const initials =
    session?.user?.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "U"

  const signOut = async () => {
    setSidebarOpen(false)
    setMobileAccountOpen(false)
    toast("Signing out...")
    await authClient.signOut()
    router.replace("/")
    router.refresh()
  }

  useEffect(() => {
    if (status === "unauthenticated") {
      const callbackPath = `${pathname || "/apps/dashboard"}${window.location.search || ""}`
      setAuthCallbackCookie(callbackPath)
      router.replace("/auth/signin")
    }
  }, [pathname, router, status])

  useEffect(() => {
    const routesToPrefetch = [
      "/",
      "/apps/dashboard",
      ...navigation.map((item) => item.href),
      "/apps/support",
      "/apps/settings",
    ]

    const timer = window.setTimeout(() => {
      routesToPrefetch.forEach((route) => router.prefetch(route))
    }, 120)

    return () => window.clearTimeout(timer)
  }, [router])

  useEffect(() => {
    if (sidebarOpen) {
      setMobileAccountOpen(false)
    }
  }, [sidebarOpen])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileAccountOpen(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return

    document.documentElement.dataset.mobileAccountOpen = mobileAccountOpen ? "true" : "false"
    window.dispatchEvent(
      new CustomEvent("mobile-account-menu-change", {
        detail: { open: mobileAccountOpen },
      }),
    )
  }, [mobileAccountOpen])

  useEffect(
    () => () => {
      if (typeof window === "undefined") return
      document.documentElement.dataset.mobileAccountOpen = "false"
      window.dispatchEvent(
        new CustomEvent("mobile-account-menu-change", {
          detail: { open: false },
        }),
      )
    },
    [],
  )

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background font-sans antialiased">
        <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
          Loading your workspace...
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return null
  }

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform border-r border-border bg-background transition-transform duration-200 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between border-b border-border px-6">
            <Link href="/" className="flex items-center gap-2">
              <Logo />
              <span className="text-lg font-semibold">Screensplit</span>
            </Link>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = isRouteActive(pathname, item.href)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  onMouseEnter={() => router.prefetch(item.href)}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-muted text-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border transition-colors",
                      isActive
                        ? "border-border/70 bg-background/80"
                        : "border-transparent bg-muted/40 group-hover:bg-muted",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 transition-colors",
                        iconAccentByRoute[item.href] || "text-sky-500 dark:text-sky-400",
                      )}
                    />
                  </span>
                  <span className="flex items-center gap-2">
                    <span>{item.name}</span>
                    {item.beta ? (
                      <Badge
                        variant="secondary"
                        className="border-amber-500/40 bg-amber-500/15 px-1.5 py-0 text-[10px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400"
                      >
                        Beta
                      </Badge>
                    ) : null}
                  </span>
                </Link>
              )
            })}
          </nav>

          <div className="border-t border-border p-4 space-y-2">
            <div className="mb-2 flex items-center justify-between px-3">
              <span className="text-xs font-medium text-muted-foreground">Theme</span>
              <ThemeToggle />
            </div>
            <Link
              href="/apps/support"
              onMouseEnter={() => router.prefetch("/apps/support")}
              className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted/40 transition-colors group-hover:bg-muted">
                <HelpCircle className="h-4 w-4 text-cyan-500 dark:text-cyan-400" />
              </span>
              Support
            </Link>
            {session?.user && (
              <Link
                href="/apps/settings"
                onClick={() => setSidebarOpen(false)}
                onMouseEnter={() => router.prefetch("/apps/settings")}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isRouteActive(pathname, "/apps/settings")
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session.user.image || ""} alt={session.user.name || "User"} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {session.user.name || "Account"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{session.user.email}</p>
                </div>
              </Link>
            )}
            <button
              onClick={signOut}
              className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
            >
              <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted/40 transition-colors group-hover:bg-muted">
                <LogOut className="h-4 w-4 text-orange-500 dark:text-orange-400" />
              </span>
              Log out
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <div className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:px-6">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold leading-tight">{currentPage.title}</p>
            <p className="truncate text-xs text-muted-foreground leading-tight">{currentPage.subtitle}</p>
          </div>
          <div id="header-actions" className="flex items-center gap-2 empty:hidden"></div>
        </div>

        <main className="min-h-screen pb-[calc(5.8rem+env(safe-area-inset-bottom))] lg:pb-0">{children}</main>
      </div>

      {mobileAccountOpen && (
        <button
          type="button"
          aria-label="Close account menu"
          className="fixed inset-0 z-40 bg-black/35 lg:hidden"
          onClick={() => setMobileAccountOpen(false)}
        />
      )}

      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 lg:hidden",
          sidebarOpen && "hidden",
        )}
      >
        <div className="relative w-full">
          <div
            id="mobile-account-menu"
            className={cn(
              "absolute inset-x-3 bottom-[calc(100%+0.6rem)] origin-bottom rounded-2xl border border-border/60 bg-card/96 p-2 shadow-2xl backdrop-blur transition-all duration-250",
              mobileAccountOpen
                ? "translate-y-0 opacity-100 pointer-events-auto"
                : "translate-y-6 opacity-0 pointer-events-none",
            )}
          >
            <div className="mb-2 rounded-xl border border-border/60 bg-muted/30 px-3 py-2">
              <p className="truncate text-sm font-medium">{session?.user?.name || "Account"}</p>
              <p className="truncate text-xs text-muted-foreground">{session?.user?.email}</p>
            </div>
            <div className="grid gap-1">
              <Link
                href="/apps/image-tools"
                onMouseEnter={() => router.prefetch("/apps/image-tools")}
                onClick={() => setMobileAccountOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isRouteActive(pathname, "/apps/image-tools")
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                )}
              >
                <Wand2 className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                Image Tools
              </Link>
              <Link
                href="/apps/gallery"
                onMouseEnter={() => router.prefetch("/apps/gallery")}
                onClick={() => setMobileAccountOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isRouteActive(pathname, "/apps/gallery")
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                )}
              >
                <Images className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                Gallery
              </Link>
              <Link
                href="/apps/settings"
                onMouseEnter={() => router.prefetch("/apps/settings")}
                onClick={() => setMobileAccountOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isRouteActive(pathname, "/apps/settings")
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                )}
              >
                <Settings className="h-4 w-4 text-cyan-500 dark:text-cyan-400" />
                Settings
              </Link>
              <button
                type="button"
                onClick={signOut}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
              >
                <LogOut className="h-4 w-4 text-orange-500 dark:text-orange-400" />
                Logout
              </button>
            </div>
          </div>

          <nav className="grid h-[5.15rem] grid-cols-5 items-end border-t border-border/60 bg-background/94 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 shadow-[0_-12px_40px_rgba(0,0,0,0.28)] backdrop-blur supports-[backdrop-filter]:bg-background/82">
            {mobilePrimaryNavigation.map((item) => {
              const Icon = item.icon
              const isActive = isRouteActive(pathname, item.href)

              if (item.center) {
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onMouseEnter={() => router.prefetch(item.href)}
                    onClick={() => setMobileAccountOpen(false)}
                    className="relative -mt-7 flex flex-col items-center justify-end gap-1 px-1"
                  >
                    <span
                      className={cn(
                        "inline-flex h-12 w-12 items-center justify-center rounded-2xl border shadow-lg transition-all",
                        isActive
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border/70 bg-card text-muted-foreground",
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className={cn("text-[11px] font-medium leading-none", isActive ? "text-foreground" : "text-muted-foreground")}>
                      {item.name}
                    </span>
                  </Link>
                )
              }

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onMouseEnter={() => router.prefetch(item.href)}
                  onClick={() => setMobileAccountOpen(false)}
                  className={cn(
                    "flex flex-col items-center justify-end gap-1 rounded-xl px-1 py-1 text-[11px] font-medium transition-colors",
                    isActive ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex h-8 w-8 items-center justify-center rounded-xl border transition-colors",
                      isActive
                        ? "border-border/70 bg-muted text-foreground"
                        : "border-transparent bg-transparent",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="leading-none">{item.name}</span>
                </Link>
              )
            })}

            <button
              type="button"
              onClick={() => setMobileAccountOpen((previous) => !previous)}
              aria-expanded={mobileAccountOpen}
              aria-controls="mobile-account-menu"
              className={cn(
                "flex flex-col items-center justify-end gap-1 rounded-xl px-1 py-1 text-[11px] font-medium transition-colors",
                isAccountRoute || mobileAccountOpen ? "text-foreground" : "text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "inline-flex h-8 w-8 items-center justify-center rounded-xl border transition-colors",
                  isAccountRoute || mobileAccountOpen
                    ? "border-border/70 bg-muted text-foreground"
                    : "border-transparent bg-transparent",
                )}
              >
                <User2 className="h-4 w-4" />
              </span>
              <span className="leading-none">Account</span>
            </button>
          </nav>
        </div>
      </div>
    </div>
  )
}
