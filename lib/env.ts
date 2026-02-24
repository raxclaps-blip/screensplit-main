export function ensureEnv() {
  if (process.env.NODE_ENV !== "production") return
  const required = [
    process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET,
    process.env.BETTER_AUTH_URL || process.env.AUTH_URL || process.env.NEXT_PUBLIC_SITE_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.DATABASE_URL,
    process.env.UPSTASH_REDIS_REST_URL,
    process.env.UPSTASH_REDIS_REST_TOKEN,
    process.env.SMTP_HOST,
    process.env.SMTP_USER,
    process.env.SMTP_APP_PASSWORD,
  ]
  if (required.some(v => !v)) {
    throw new Error("Missing required environment variables for production")
  }
}
