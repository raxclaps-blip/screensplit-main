import { SignInForm } from "@/components/auth/signin-form"
import { AuthShell } from "@/components/auth/auth-shell"
import { cacheLife } from "next/cache"
import { Suspense } from "react"

export default async function SignInPage() {
  "use cache"
  cacheLife("max")

  const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
  const githubEnabled = Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET)

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to continue." tone="signin">
      <Suspense fallback={null}>
        <SignInForm googleEnabled={googleEnabled} githubEnabled={githubEnabled} />
      </Suspense>
    </AuthShell>
  )
}
