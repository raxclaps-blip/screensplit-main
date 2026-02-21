"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutGrid, HelpCircle, Wand2, Menu, X, LogOut, Images, Film, Palette } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { signOut } from "next-auth/react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import Logo from "@/components/common/Logo"
import type { Session } from "next-auth"

const navigation = [
  { name: "Screensplit", href: "/apps/screensplit", icon: LayoutGrid },
  { name: "Videosplit", href: "/apps/videosplit", icon: Film },
  { name: "Designer", href: "/apps/designer", icon: Palette },
  { name: "Gallery", href: "/apps/gallery", icon: Images },
  { name: "Image Tools", href: "/apps/image-tools", icon: Wand2 },
]

const pageMeta: Array<{ path: string; title: string; subtitle: string }> = [
  { path: "/apps/screensplit", title: "Screensplit", subtitle: "Create before and after visual comparisons" },
  { path: "/apps/videosplit", title: "Videosplit", subtitle: "Build side-by-side video comparisons" },
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

interface DashboardLayoutClientProps {
  children: React.ReactNode
  session: Session
}

export function DashboardLayoutClient({ children, session }: DashboardLayoutClientProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const currentPage = getPageInfo(pathname)
  const initials =
    session?.user?.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "U"

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
            {session?.user && (
              <Link
                href="/apps/settings"
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  pathname === "/apps/settings"
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
        <div className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight">{currentPage.title}</p>
            <p className="truncate text-xs text-muted-foreground leading-tight">{currentPage.subtitle}</p>
          </div>
        </div>

        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  )
}
