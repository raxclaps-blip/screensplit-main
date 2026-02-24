import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function getPreferredDatabaseUrl() {
  // For local development, direct connections are usually more stable than pooler endpoints.
  // In production, keep using DATABASE_URL (pooler) unless explicitly overridden.
  if (process.env.NODE_ENV === 'development') {
    return process.env.DIRECT_URL || process.env.DATABASE_URL
  }
  return process.env.DATABASE_URL
}

function withSupabaseSslMode(url: string | undefined) {
  if (!url) return url

  try {
    const parsed = new URL(url)
    const isPostgres =
      parsed.protocol === 'postgres:' || parsed.protocol === 'postgresql:'
    const isSupabase = parsed.hostname.endsWith('.supabase.com')

    if (isPostgres && isSupabase && !parsed.searchParams.has('sslmode')) {
      parsed.searchParams.set('sslmode', 'require')
      return parsed.toString()
    }
  } catch {
    return url
  }

  return url
}

const databaseUrl = withSupabaseSslMode(getPreferredDatabaseUrl())

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
