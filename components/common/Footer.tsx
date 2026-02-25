"use client";
import Link from "next/link";
import Logo from "../common/Logo";
import { authClient } from "@/lib/auth-client";

export function Footer() {
  const { data, isPending } = authClient.useSession();
  const isAuthenticated = !isPending && Boolean(data?.user);
  return (
    <footer className="relative border-t border-border bg-background/60 backdrop-blur-md supports-[backdrop-filter]:bg-background/50 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 py-12 border-l border-r border-border">
        <div className="grid gap-8 md:grid-cols-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Logo/>
              <span className="font-semibold">Screensplit</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Create beautiful before & after comparisons in seconds.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href={isAuthenticated ? "/apps/screensplit" : "/auth/signup"}
                  className="hover:text-foreground transition-colors"
                >
                  {isAuthenticated ? "Screensplit" : "Create Account"}
                </Link>
              </li>
              <li>
                <Link
                  href="/apps/videosplit"
                  className="hover:text-foreground transition-colors"
                >
                  Videosplit
                </Link>
              </li>
              <li>
                <Link
                  href="/apps/gallery"
                  className="hover:text-foreground transition-colors"
                >
                  Gallery
                </Link>
              </li>
              <li>
                <Link
                  href="/community"
                  className="hover:text-foreground transition-colors"
                >
                  Community Gallery
                </Link>
              </li>
              <li>
                <Link
                  href="/#features"
                  className="hover:text-foreground transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="/#use-cases"
                  className="hover:text-foreground transition-colors"
                >
                  Use Cases
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/about"
                  className="hover:text-foreground transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-foreground transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-foreground transition-colors"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-foreground transition-colors"
                >
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col items-center justify-between gap-4 pt-8 border-t border-border md:flex-row">
          <p className="text-sm text-muted-foreground">
            © 2025 Screensplit. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Made with care for creators</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
