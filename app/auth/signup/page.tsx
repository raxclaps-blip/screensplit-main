import { SignUpForm } from "@/components/auth/signup-form"
import { getCurrentUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { AuthShell } from "@/components/auth/auth-shell"

export default async function SignUpPage() {
  const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
  const githubEnabled = Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET)

  // Redirect if already authenticated
  const user = await getCurrentUser()
  if (user) {
    redirect("/apps/screensplit")
  }

  return (
    <AuthShell title="Create account" subtitle="Get started in under a minute." tone="signup">
      <SignUpForm googleEnabled={googleEnabled} githubEnabled={githubEnabled} />
    </AuthShell>
  )
}
