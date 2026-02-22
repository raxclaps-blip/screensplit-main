"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function OptimizerRedirect() {
  const router = useRouter()

  useEffect(() => {
    toast("Redirecting", { description: "Opening Image Tools..." })
    router.replace("/apps/image-tools")
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
        <p className="text-muted-foreground">Redirecting to Image Tools...</p>
      </div>
    </div>
  )
}
