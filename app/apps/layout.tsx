import type React from "react"
import { DashboardLayoutClient } from "@/components/layouts/dashboard-layout-client"
import { cacheLife } from "next/cache"

export default async function AppsLayout({ children }: { children: React.ReactNode }) {
  "use cache"
  cacheLife("max")

  return <DashboardLayoutClient>{children}</DashboardLayoutClient>
}
