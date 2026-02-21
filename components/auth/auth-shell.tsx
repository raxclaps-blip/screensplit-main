import Link from "next/link"
import type { ReactNode } from "react"
import Logo from "@/components/common/Logo"

type AuthShellTone = "signin" | "signup"

interface AuthShellProps {
  title: string
  subtitle: string
  tone: AuthShellTone
  children: ReactNode
}

const toneClassMap: Record<AuthShellTone, string> = {
  signin:
    "bg-[radial-gradient(80%_55%_at_50%_0%,rgba(34,197,94,0.16),transparent_70%),radial-gradient(90%_65%_at_50%_100%,rgba(14,165,233,0.14),transparent_75%)]",
  signup:
    "bg-[radial-gradient(80%_55%_at_50%_0%,rgba(251,146,60,0.16),transparent_70%),radial-gradient(90%_65%_at_50%_100%,rgba(20,184,166,0.14),transparent_75%)]",
}

export function AuthShell({ title, subtitle, tone, children }: AuthShellProps) {
  return (
    <div className="relative min-h-svh overflow-hidden bg-background">
      <div className={`pointer-events-none absolute inset-0 ${toneClassMap[tone]}`} />

      <div className="relative mx-auto flex min-h-svh w-full max-w-md items-start justify-center px-4 py-5 sm:items-center sm:py-8">
        <div className="w-full space-y-4">
          <div className="space-y-1.5 text-center">
            <div className="mx-auto flex w-fit items-center gap-2.5">
              <Logo />
              <p className="text-sm font-semibold tracking-[0.12em] uppercase">Screensplit</p>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>

          {children}

          <p className="px-1 text-center text-xs text-muted-foreground">
            By continuing, you agree to our{" "}
            <Link
              href="/terms"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Terms
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
