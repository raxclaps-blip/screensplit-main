import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export async function getCurrentUser() {
  const session = await auth()
  return session?.user
}

export async function requireAuth() {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/auth/signin")
  }
  
  return session.user
}

export async function getSession() {
  return await auth()
}

// Client-side hook for checking auth status
export function useRequireAuth() {
  // This would be used in client components
  // The actual implementation would use useSession from next-auth/react
}