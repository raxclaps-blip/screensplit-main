# 🚨 Quick Fix for Auth Error

## The Problem
**Error:** `Unexpected token '<', "<!DOCTYPE "... is not valid JSON`

**Cause:** NextAuth v5 requires new environment variables for Next.js 16.

## The Solution (2 minutes)

### Step 1: Update `.env` file

Open your `.env` file and add these three lines:

```bash
AUTH_SECRET=<copy your NEXTAUTH_SECRET value here>
AUTH_URL=http://localhost:3000
AUTH_TRUST_HOST=true
```

**Example:**
```bash
# If your .env has:
NEXTAUTH_SECRET=abc123xyz789...

# Add these lines:
AUTH_SECRET=abc123xyz789...
AUTH_URL=http://localhost:3000
AUTH_TRUST_HOST=true
```

### Step 2: Restart Dev Server

```bash
# Stop current server (Ctrl+C in terminal)
# Then restart:
npm run dev
```

### Step 3: Test

Visit `http://localhost:3000` - auth should now work!

---

## What Changed?

- **NextAuth v5** (beta 29) uses `AUTH_*` variables instead of `NEXTAUTH_*`
- Next.js 16 requires explicit `trustHost` configuration
- Your code is already updated, just need environment variables

## Need Help?

See full migration guide: `Docs/NEXTJS_16_MIGRATION.md`
