"use client"

import type React from "react"


import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutGrid, Settings, HelpCircle, Wand2, Menu, X, LogOut, User, Images, Film, Palette } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserNav } from "@/components/auth/user-nav"
import AuthProvider from "@/components/providers/session-provider"
import { toast } from "sonner"
import Logo from "@/components/common/Logo"

const navigation = [
  { name: "Screensplit", href: "/apps/screensplit", icon: LayoutGrid },
  { name: "Videosplit", href: "/apps/videosplit", icon: Film },
  { name: "Designer", href: "/apps/designer", icon: Palette },
  { name: "Gallery", href: "/apps/gallery", icon: Images },
  { name: "Image Tools", href: "/apps/image-tools", icon: Wand2 },
  { name: "Settings", href: "/apps/settings", icon: Settings },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [hasRedirected, setHasRedirected] = useState(false)

  // Redirect unauthenticated users only once to prevent loops
  useEffect(() => {
    if (status === "unauthenticated" && !hasRedirected) {
      setHasRedirected(true)
      const callbackUrl = encodeURIComponent(pathname)
      router.replace(`/auth/signin?callbackUrl=${callbackUrl}`)
    }
  }, [status, pathname, router, hasRedirected])

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <AuthProvider>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      </AuthProvider>
    )
  }

  // Don't render content for unauthenticated users
  if (!session) {
    return null
  }

  return (
    <AuthProvider>
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
          {/* Logo & Close Button */}
          <div className="flex h-16 items-center justify-between border-b border-border px-6">
            <Link href="/" className="flex items-center gap-2">
              <Logo/>
              <span className="text-lg font-semibold">Screensplit</span>
            </Link>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* User Info */}
          {session?.user && (
            <div className="border-t border-border px-3 py-4">
              <div className="flex items-center gap-3 rounded-lg px-3 py-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                  <User className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{session.user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-muted text-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-border p-4 space-y-2">
            <div className="mb-2 flex items-center justify-between px-3">
              <span className="text-xs font-medium text-muted-foreground">Theme</span>
              <ThemeToggle />
            </div>
            <Link
              href="/apps/support"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
              onClick={() => setSidebarOpen(false)}
            >
              <HelpCircle className="h-5 w-5" />
              Support
            </Link>
            <button
              onClick={() => {
                setSidebarOpen(false)
                toast("Signing out...")
                signOut({ callbackUrl: "/" })
              }}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground w-full text-left"
            >
              <LogOut className="h-5 w-5" />
              Log out
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <div className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <span className="text-lg font-semibold">Screensplit</span>
          <div className="ml-auto">
            <UserNav />
          </div>
        </div>

        {/* Main content */}
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
    </AuthProvider>
  )
}
