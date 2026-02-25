import type React from "react"
import type { Metadata } from "next"
import { DashboardLayoutClient } from "@/components/layouts/dashboard-layout-client"
import { cacheLife } from "next/cache"

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
}

export default async function AppsLayout({ children }: { children: React.ReactNode }) {
  "use cache"
  cacheLife("max")

  return <DashboardLayoutClient>{children}</DashboardLayoutClient>
}
