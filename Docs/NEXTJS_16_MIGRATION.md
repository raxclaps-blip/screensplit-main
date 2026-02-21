# Next.js 16 Migration Guide

## âœ… Completed Migrations

### 1. **Package Updates**
- âœ… Next.js: 15.2.4 â†’ 16.0.0-beta.0
- âœ… React: 19.2.0 (already compatible)
- âœ… Turbopack: Enabled for development
- âœ… ESLint: Migrated to flat config
- âœ… vaul: 0.9.9 â†’ 1.1.2 (React 19 support)

### 2. **Configuration Updates**
- âœ… Removed deprecated `eslint` option from `next.config.mjs`
- âœ… Added `basePath` to NextAuth configs
- âœ… Added `trustHost: true` to auth configs
- âœ… Added `runtime = 'nodejs'` to auth route handler
- âœ… `proxy.ts` filename (correct for Next.js 16)

### 3. **ESLint Configuration**
- âœ… Migrated to flat config using `FlatCompat`
- âœ… Updated to use ESLint CLI instead of `next lint`

## ðŸ”§ Required Actions

### **Update Your `.env` File**

NextAuth v5 requires new environment variable names. Add these to your `.env` file:

```bash
# Add these NEW variables (required for NextAuth v5)
AUTH_SECRET=<copy_from_NEXTAUTH_SECRET>
AUTH_URL=http://localhost:3000
AUTH_TRUST_HOST=true

# Keep these for backward compatibility (optional)
NEXTAUTH_SECRET=<your_existing_value>
NEXTAUTH_URL=http://localhost:3000
```

**Steps:**
1. Open your `.env` file
2. Copy the value from `NEXTAUTH_SECRET`
3. Create new line: `AUTH_SECRET=<paste_value_here>`
4. Add: `AUTH_URL=http://localhost:3000` (or your production URL)
5. Add: `AUTH_TRUST_HOST=true`
6. Save and restart your dev server

### **Restart Development Server**

After updating `.env`, restart the server:

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

## ðŸ“‹ Next.js 16 Deprecation Notes

### âœ… Already Compliant
- **`proxy.ts` filename**: Correctly using `proxy.ts` (replaces `middleware.ts`)

### ðŸ” To Review Later
- **`images.domains`**: Consider migrating to `images.remotePatterns` for better security
- **`next/legacy/image`**: Ensure you're using `next/image` throughout

## ðŸ› Troubleshooting

### Auth Error: "Unexpected token '<', '<!DOCTYPE'..."

This error occurs when:
1. âŒ Missing `AUTH_SECRET`, `AUTH_URL`, or `AUTH_TRUST_HOST` in `.env`
2. âŒ Server not restarted after updating `.env`

**Solution:**
1. âœ… Add all three `AUTH_*` variables to `.env`
2. âœ… Restart dev server completely
3. âœ… Clear browser cache/cookies if issues persist

### ESLint Errors

Run auto-fix to resolve many warnings:
```bash
npm run lint -- --fix
```

## ðŸ”’ Security Vulnerabilities

12 vulnerabilities remain in **devDependencies only** (Vercel CLI):
- No production/runtime impact
- Related to: `esbuild`, `path-to-regexp`, `undici`
- Can be resolved with: `npm audit fix --force` (when network is stable)

## ðŸ“š Resources

- [Next.js 16 Upgrade Guide](https://nextjs.org/docs/app/building-your-application/upgrading/version-16)
- [NextAuth v5 Migration](https://authjs.dev/getting-started/migrating-to-v5)
- [Next.js 16 Deprecations](https://nextjs.org/docs/messages/deprecated-features)

## âœ¨ New Features Available

- **Turbopack**: Faster dev server (already enabled)
- **Improved Edge Runtime**: Better performance for middleware/proxy
- **Enhanced TypeScript Support**: Stricter type checking
- **React 19**: Server Components improvements
