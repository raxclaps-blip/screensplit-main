import type React from "react"
import { redirect } from "next/navigation"
import type { Session } from "next-auth"
import { auth } from "@/lib/auth"
import AuthProvider from "@/components/providers/session-provider"
import { DashboardLayoutClient } from "@/components/layouts/dashboard-layout-client"

export default async function AppsLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=%2Fapps")
  }

  return (
    <AuthProvider session={session as Session}>
      <DashboardLayoutClient session={session as Session}>{children}</DashboardLayoutClient>
    </AuthProvider>
  )
}
