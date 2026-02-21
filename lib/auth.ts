import { NextAuthConfig } from "next-auth"
import NextAuth from "next-auth"
import { CredentialsSignin } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcrypt"
import { prisma } from "@/lib/prisma"
import { redis, isRedisRequired } from "@/lib/redis"

// Validate essential environment variables
const authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
if (!authSecret && process.env.NODE_ENV === 'production') {
  console.error('FATAL: AUTH_SECRET or NEXTAUTH_SECRET environment variable is not set!')
  throw new Error('AUTH_SECRET is required for authentication. Please check your environment variables.')
}

// Track login attempts in Redis or in-memory
const loginAttempts = new Map<string, { count: number; resetTime: number }>()
const ONE_HOUR_IN_SECONDS = 60 * 60
const THIRTY_DAYS_IN_SECONDS = 60 * 60 * 24 * 30

class RateLimitedSignInError extends CredentialsSignin {
  code = "rate_limited"
}

class EmailNotVerifiedSignInError extends CredentialsSignin {
  code = "email_not_verified"
}

class AuthUnavailableSignInError extends CredentialsSignin {
  code = "auth_unavailable"
}

async function checkLoginRateLimit(keySuffix: string): Promise<{ allowed: boolean; attempts: number }> {
  const key = `login_attempts:${keySuffix}`
  const now = Date.now()
  
  if (redis) {
    try {
      // Use Redis for distributed rate limiting
      const attempts = await redis.incr(key)
      if (attempts === 1) {
        // Set expiry on first attempt
        await redis.expire(key, 15 * 60) // 15 minutes
      }
      return { allowed: attempts <= 5, attempts }
    } catch (error) {
      console.error("Redis error in rate limit:", error)
      if (isRedisRequired()) {
        throw new Error("Redis rate limiter unavailable")
      }
    }
  }

  if (isRedisRequired()) {
    throw new Error("Redis is required but not initialized")
  }
  
  // Fall back to in-memory
  const attempt = loginAttempts.get(key)
  
  if (!attempt || attempt.resetTime < now) {
    loginAttempts.set(key, { count: 1, resetTime: now + 15 * 60 * 1000 })
    return { allowed: true, attempts: 1 }
  }
  
  if (attempt.count >= 5) {
    return { allowed: false, attempts: attempt.count }
  }
  
  attempt.count++
  return { allowed: true, attempts: attempt.count }
}

async function resetLoginAttempts(keySuffix: string): Promise<void> {
  const key = `login_attempts:${keySuffix}`
  
  if (redis) {
    try {
      await redis.del(key)
    } catch (error) {
      console.error("Redis error resetting attempts:", error)
      if (isRedisRequired()) {
        throw new Error("Redis reset failed")
      }
    }
  }
  
  if (!isRedisRequired()) {
    loginAttempts.delete(key)
  }
}

const config: NextAuthConfig = {
  basePath: "/api/auth",
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        remember: { label: "Remember me", type: "text" },
      },
      async authorize(credentials, request) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null
          }

          const email = (credentials.email as string).toLowerCase().trim()
          const password = credentials.password as string
          const rememberMe = String(credentials.remember ?? "false") === "true"

          // Derive client IP for rate limiting
          const forwarded = request.headers?.get("x-forwarded-for")
          const realIp = request.headers?.get("x-real-ip")
          const ip = forwarded ? forwarded.split(",")[0]?.trim() || "unknown" : realIp || "unknown"

          // Rate limit check
          const rateLimitResult = await checkLoginRateLimit(`${email}:${ip}`)
          if (!rateLimitResult.allowed) {
            throw new RateLimitedSignInError()
          }

          // Find user with timeout protection
          const user = await Promise.race([
            prisma.user.findUnique({
              where: { email },
              select: {
                id: true,
                email: true,
                name: true,
                image: true,
                password: true,
                emailVerified: true,
              }
            }),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Database timeout')), 10000)
            )
          ]) as any

          if (!user) {
            return null
          }

          if (!user.password) {
            return null
          }

          // Check if email is verified
          if (!user.emailVerified) {
            throw new EmailNotVerifiedSignInError()
          }

          // Compare passwords with error handling
          let isPasswordValid = false
          try {
            isPasswordValid = await bcrypt.compare(password, user.password)
          } catch (error) {
            console.error("Password comparison error:", error)
            throw new AuthUnavailableSignInError()
          }

          if (!isPasswordValid) {
            // Don't reset rate limit on failed password
            return null
          }

          // Reset rate limit on successful login
          await resetLoginAttempts(`${email}:${ip}`)

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            rememberMe,
          }
        } catch (error) {
          if (error instanceof CredentialsSignin) {
            throw error
          }
          console.error("Authorization error:", error)
          throw new AuthUnavailableSignInError()
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: THIRTY_DAYS_IN_SECONDS,
  },
  trustHost: true,
  secret: authSecret,
  debug: process.env.NODE_ENV === "development",
  pages: {
    signIn: "/auth/signin",
    signOut: "/",
    error: "/auth/signin", // Redirect errors to signin page
  },
  callbacks: {
    async signIn({ account }) {
      // Allow OAuth sign-ins without email verification
      if (account?.provider === "google") {
        return true
      }
      
      // For credentials login, email verification is checked in authorize
      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        const rememberFromUser = (user as any).rememberMe
        const rememberMe =
          typeof rememberFromUser === "boolean"
            ? rememberFromUser
            : account?.provider === "credentials"
              ? false
              : true
        const sessionMaxAge = rememberMe ? THIRTY_DAYS_IN_SECONDS : ONE_HOUR_IN_SECONDS
        const now = Math.floor(Date.now() / 1000)

        token.id = (user as any).id
        ;(token as any).tokenVersion = (user as any).tokenVersion ?? 0
        ;(token as any).rememberMe = rememberMe
        ;(token as any).sessionMaxAge = sessionMaxAge
        token.iat = now
        token.exp = now + sessionMaxAge
      }
      if (!user && token?.id) {
        const now = Math.floor(Date.now() / 1000)
        if (typeof token.exp === "number" && token.exp <= now) {
          return {} as any
        }

        try {
          const dbUser = await (prisma as any).user.findUnique({
            where: { id: token.id as string },
            select: { tokenVersion: true } as any,
          })
          if (dbUser && (token as any).tokenVersion !== (dbUser as any).tokenVersion) {
            return {} as any
          }
        } catch {}
      }
      return token
    },
    async session({ session, token }) {
      if (token && session?.user) {
        session.user.id = token.id as string
      }
      return session
    }
  },
  events: {
    async signIn({ user, account }) {
      // Track sign in analytics
      if (user?.id) {
        await prisma.analytics.create({
          data: {
            event: "USER_LOGIN",
            userId: user.id,
            metadata: {
              provider: account?.provider || "credentials"
            }
          }
        }).catch(() => {
          // Silently fail analytics to not break auth flow
        })
      }
    },
    async createUser({ user }) {
      // Track user registration analytics
      if (user?.id) {
        await prisma.analytics.create({
          data: {
            event: "USER_REGISTERED",
            userId: user.id,
            metadata: {
              method: "oauth"
            }
          }
        }).catch(() => {
          // Silently fail analytics to not break auth flow
        })
      }
    }
  }
}

// Back-compat for routes using getServerSession(authOptions)
export const authOptions = config

export const { handlers, auth, signIn, signOut } = NextAuth(config)
