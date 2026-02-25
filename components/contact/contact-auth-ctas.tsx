"use client";

import Link from "next/link";
import { ArrowRight, LayoutDashboard, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function ContactAuthCtas() {
  const { data: session, isPending } = authClient.useSession();
  const isAuthenticated = !isPending && Boolean(session?.user);

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
        <div className="h-12 w-52 animate-pulse rounded-full bg-muted/60" />
        <div className="h-12 w-44 animate-pulse rounded-full bg-muted/45" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button size="lg" className="h-12 rounded-full px-8 text-base" asChild>
          <Link href={isAuthenticated ? "/apps/dashboard" : "/auth/signup"}>
            {isAuthenticated ? "Go to Dashboard" : "Create Free Account"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>

        <Button size="lg" variant="outline" className="h-12 rounded-full border-border/60 px-8 text-base" asChild>
          <Link href={isAuthenticated ? "/apps/screensplit" : "/auth/signin"}>
            {isAuthenticated ? "Open Editor" : "Sign in"}
            {isAuthenticated ? (
              <LayoutDashboard className="ml-2 h-4 w-4" />
            ) : (
              <LogIn className="ml-2 h-4 w-4" />
            )}
          </Link>
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        Need direct assistance?{" "}
        <a href="mailto:hello@screensplit.com" className="font-medium text-foreground underline-offset-4 hover:underline">
          Email support
        </a>
      </p>
    </div>
  );
}
