import fs from "fs"
import path from "path"

function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return
  const raw = fs.readFileSync(filePath, "utf8")
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eq = trimmed.indexOf("=")
    if (eq <= 0) continue
    const key = trimmed.slice(0, eq).trim()
    if (process.env[key] !== undefined) continue
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    process.env[key] = value
  }
}

async function main() {
  const cwd = process.cwd()
  loadEnvFile(path.join(cwd, ".env.local"))
  loadEnvFile(path.join(cwd, ".env"))

  const { assertRedisConnection, checkRateLimit, authRateLimiter, isRedisAvailable, isRedisRequired } =
    await import("./lib/redis")

  console.log("Redis required:", isRedisRequired())
  console.log("Redis configured:", isRedisAvailable())

  await assertRedisConnection()
  console.log("Ping: OK")

  const key = `smoke:${Date.now()}`
  const first = await checkRateLimit(authRateLimiter, key)
  const second = await checkRateLimit(authRateLimiter, key)

  console.log("Rate limit smoke #1:", { success: first?.success, remaining: first?.remaining, reset: first?.reset })
  console.log("Rate limit smoke #2:", { success: second?.success, remaining: second?.remaining, reset: second?.reset })
  console.log("Redis smoke test passed.")
}

main().catch((error) => {
  console.error("Redis smoke test failed:", error)
  process.exit(1)
})
