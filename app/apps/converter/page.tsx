"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ConverterRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/image-tools")
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
