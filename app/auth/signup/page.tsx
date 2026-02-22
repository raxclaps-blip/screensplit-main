import { SignUpForm } from "@/components/auth/signup-form"
import { AuthShell } from "@/components/auth/auth-shell"
import { cacheLife } from "next/cache"

export default async function SignUpPage() {
  "use cache"
  cacheLife("max")

  const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
  const githubEnabled = Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET)

  return (
    <AuthShell title="Create account" subtitle="Get started in under a minute." tone="signup">
      <SignUpForm googleEnabled={googleEnabled} githubEnabled={githubEnabled} />
    </AuthShell>
  )
}
