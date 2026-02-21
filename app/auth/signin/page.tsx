import { SignInForm } from "@/components/auth/signin-form"
import { getCurrentUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { AuthShell } from "@/components/auth/auth-shell"

interface SignInPageProps {
  searchParams: Promise<{
    callbackUrl?: string
    error?: string
  }>
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  // Await searchParams before accessing its properties (Next.js 15+)
  const params = await searchParams
  const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
  const githubEnabled = Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET)
  
  // Redirect if already authenticated
  const user = await getCurrentUser()
  if (user) {
    redirect(params.callbackUrl || "/apps/screensplit")
  }

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to continue." tone="signin">
      <SignInForm
        callbackUrl={params.callbackUrl}
        googleEnabled={googleEnabled}
        githubEnabled={githubEnabled}
      />
    </AuthShell>
  )
}
