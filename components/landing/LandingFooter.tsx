import Link from "next/link"
import Logo from "@/components/common/Logo"

const groups = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "Gallery", href: "/apps/gallery" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
]

export function LandingFooter() {
  return (
    <footer className="bg-background">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <div className="mb-8 flex items-center gap-2">
          <Logo />
          <span className="text-sm font-semibold">ScreenSplit</span>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {groups.map((group) => (
            <div key={group.title}>
              <h3 className="mb-3 text-sm font-semibold">{group.title}</h3>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-10 border-t border-border pt-6 text-sm text-muted-foreground">
          © 2026 ScreenSplit. Built for fast, clear visual storytelling.
        </p>
      </div>
    </footer>
  )
}
