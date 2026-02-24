import bcrypt from "bcrypt"
import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { toNextJsHandler } from "better-auth/next-js"
import { headers as nextHeaders } from "next/headers"
import type { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

const authSecret = process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET

if (!authSecret && process.env.NODE_ENV === "production") {
  throw new Error(
    "BETTER_AUTH_SECRET (or AUTH_SECRET) is required for authentication in production."
  )
}

const baseURL =
  process.env.BETTER_AUTH_URL ||
  process.env.AUTH_URL ||
  process.env.NEXT_PUBLIC_SITE_URL

const trustedOrigins = [
  process.env.NEXT_PUBLIC_SITE_URL,
  process.env.BETTER_AUTH_URL,
  process.env.AUTH_URL,
].filter((value): value is string => Boolean(value))

export const authApi = betterAuth({
  secret: authSecret,
  baseURL,
  basePath: "/api/auth",
  trustedOrigins,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    requireEmailVerification: true,
    password: {
      hash: async (password) => {
        const saltRounds = Number.parseInt(process.env.BCRYPT_COST || "12")
        return bcrypt.hash(password, saltRounds)
      },
      verify: async ({ hash, password }) => {
        return bcrypt.compare(password, hash)
      },
    },
  },
  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {}),
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? {
          github: {
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
          },
        }
      : {}),
  },
  user: {
    modelName: "user",
  },
  session: {
    modelName: "session",
    fields: {
      token: "sessionToken",
      expiresAt: "expires",
    },
  },
  account: {
    modelName: "account",
    fields: {
      accountId: "providerAccountId",
      providerId: "provider",
      accessToken: "access_token",
      refreshToken: "refresh_token",
      idToken: "id_token",
    },
  },
  verification: {
    modelName: "verificationToken",
    fields: {
      value: "token",
      expiresAt: "expires",
    },
  },
  databaseHooks: {
    session: {
      create: {
        async after(session) {
          await prisma.analytics
            .create({
              data: {
                event: "USER_LOGIN",
                userId: session.userId,
                metadata: {
                  provider: "unknown",
                },
              },
            })
            .catch(() => {})
        },
      },
    },
    user: {
      create: {
        async after(user) {
          await prisma.analytics
            .create({
              data: {
                event: "USER_REGISTERED",
                userId: user.id,
                metadata: {
                  method: "unknown",
                },
              },
            })
            .catch(() => {})
        },
      },
    },
  },
})

export const authHandler = toNextJsHandler(authApi)

type AuthInput = NextRequest | Request | Headers | undefined

type AppAuthSession = {
  user: {
    id: string
    email: string | null
    name: string | null
    image: string | null
    createdAt?: string
  }
  session: {
    id: string
    token: string
    expires: Date
  }
}

export async function auth(input?: AuthInput): Promise<AppAuthSession | null> {
  const requestHeaders =
    input instanceof Headers
      ? input
      : input instanceof Request
      ? input.headers
      : await nextHeaders()

  const session = await authApi.api.getSession({
    headers: requestHeaders,
  })

  if (!session) {
    return null
  }

  return {
    user: {
      id: session.user.id,
      email: session.user.email ?? null,
      name: session.user.name ?? null,
      image: session.user.image ?? null,
      createdAt:
        session.user.createdAt instanceof Date
          ? session.user.createdAt.toISOString()
          : undefined,
    },
    session: {
      id: session.session.id,
      token: session.session.token,
      expires: session.session.expiresAt,
    },
  }
}
