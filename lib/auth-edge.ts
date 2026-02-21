import NextAuth, { NextAuthConfig } from "next-auth"

const edgeConfig: NextAuthConfig = {
  basePath: "/api/auth",
  // Important: define providers array so NextAuth internal code doesn't access undefined .map
  providers: [],
  session: {
    strategy: "jwt",
  },
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id
      }
      return token
    },
    async session({ session, token }) {
      if (token && session?.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
}

export const { auth } = NextAuth(edgeConfig)
