# ðŸš€ Setup Instructions

## âœ… Implementation Complete!

All features have been successfully implemented:
- âœ… Redis-based distributed rate limiting
- âœ… 1-hour session duration

---

## ðŸ“¦ Step 1: Install Dependencies

Run the following command to install all new packages:

```bash
npm install
```

**New packages that will be installed:**
- `@upstash/redis@^1.34.3`
- `@upstash/ratelimit@^2.0.4`

---

## ðŸ”‘ Step 2: Set Up Environment Variables

### Required Services

You need to configure the following services:

#### 1. **Upstash Redis** (for distributed rate limiting)

1. Go to [https://console.upstash.com/](https://console.upstash.com/)
2. Sign up for a free account
3. Click "Create Database"
4. Choose your region (closest to your users)
5. Copy the **REST URL** and **REST Token**
6. Add to your `.env` file:

```env
UPSTASH_REDIS_REST_URL=https://your-endpoint.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here
```


2. Click "+" to register a new site
4. Add your domains:
   - `localhost` (for development)
   - Your production domain (e.g., `yourdomain.com`)
5. Accept terms and submit
6. Copy both keys and add to `.env`:

```env
```

### Complete .env Template

Use the `.env.example` file as a reference. Here's what you need:

```env
# Existing variables (keep your current values)
DATABASE_URL="..."
DIRECT_URL="..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
R2_S3_ENDPOINT="..."
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
R2_BUCKET="..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="..."
NEXT_PUBLIC_SITE_URL="..."

# NEW: Add these for the new features
UPSTASH_REDIS_REST_URL=https://your-endpoint.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here
```

---

## ðŸ§ª Step 3: Test the Implementation

### Start Development Server

```bash
npm run dev
```


1. Navigate to `http://localhost:3000/auth/signup`
2. Fill in the form
4. Submit the form
5. âœ… Should create account successfully


1. Navigate to `http://localhost:3000/auth/signin`
2. Enter **wrong credentials** 2 times
5. Enter **correct credentials**
6. âœ… Should login successfully

### Test Session Expiration (1 hour)

**Option A: Wait 1 hour**
1. Sign in to the app
2. Wait 1 hour
3. Try to access a protected route
4. âœ… Should redirect to sign-in

**Option B: Quick test (modify code temporarily)**
1. Edit `lib/auth.ts` line 85
2. Change `maxAge: 60 * 60` to `maxAge: 60` (1 minute)
3. Restart dev server
4. Sign in and wait 1 minute
5. Refresh page
6. âœ… Should redirect to sign-in

### Test Rate Limiting

**Registration Rate Limit (5 per 15 minutes):**
```bash
# Try to register 6 times quickly
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"password123"}'
```

After 5 attempts, you should get:
```json
{
  "error": "Too many registration attempts. Please try again later."
}
```

---

## ðŸ“ Files Created/Modified

### âœ¨ New Files

- **`lib/redis.ts`** - Redis client and rate limiters
- **`.env.example`** - Environment variable template
- **`IMPLEMENTATION_GUIDE.md`** - Detailed technical documentation
- **`SETUP_INSTRUCTIONS.md`** - This file

### ðŸ“ Modified Files

- **`package.json`** - Added 4 new dependencies
- **`lib/auth.ts`** - Added 1-hour session, Redis login tracking
- **`lib/auth-edge.ts`** - Removed invalid signUp config
- **`app/api/upload-image/route.ts`** - Redis rate limit
- **`app/api/verify-share-password/route.ts`** - Redis rate limit
- **`app/api/share-view/route.ts`** - Redis rate limit

---

## ðŸ”§ Configuration Summary

### Rate Limiting Rules

| Endpoint | Limit | Window | Identifier |
|----------|-------|--------|------------|
| Registration | 5 requests | 15 minutes | IP address |
| Login | 5 attempts | 15 minutes | Email |
| Upload | 10 uploads | 1 minute | User ID |
| Password Verify | 5 attempts | 15 minutes | IP + Slug |
| View Count | 60 requests | 1 minute | IP + Slug |


- **Registration:** Always shown
- **Login:** After 2 failed attempts OR when rate limited

### Session Settings

- **Duration:** 1 hour (3600 seconds)
- **Strategy:** JWT tokens
- **Auto-refresh:** On activity

---

## ðŸš¨ Important Notes

### Development vs Production

**Development:**
- Redis is optional (falls back to in-memory)
- Session duration can be shortened for testing

**Production:**
- **Must have Redis configured** for proper rate limiting
- Consider monitoring rate limit hits

### Fallback Behavior

If Redis is not configured:
- âœ… App will still work
- âš ï¸ Rate limiting falls back to in-memory (not distributed)
- âš ï¸ Rate limits reset on server restart
- âš ï¸ Not suitable for production with multiple instances

- âš ï¸ Forms will work but without bot protection
- âœ… Development mode bypasses verification

---

## ðŸ› Troubleshooting

### "Cannot find module @upstash/redis"

**Solution:** Run `npm install`


**Checklist:**
- [ ] Server restarted after adding env vars

### Rate limiting not working

**Checklist:**
- [ ] `UPSTASH_REDIS_REST_URL` and token are correct
- [ ] Redis database is active in Upstash console
- [ ] Check server console for Redis connection errors
- [ ] Verify `.env` file is loaded (restart server)

### TypeScript errors

**Solution:** 
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## ðŸ“š Next Steps

1. âœ… Run `npm install`
2. âœ… Configure Upstash Redis
4. âœ… Update `.env` file
5. âœ… Test all features
6. ðŸš€ Deploy to production

### Before Production Deployment

- [ ] Verify all environment variables are set
- [ ] Test rate limiting with real traffic
- [ ] Monitor Redis usage in Upstash
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Test session expiration behavior
- [ ] Review rate limit thresholds

---

## ðŸ’¡ Additional Resources

- [Complete Implementation Guide](./IMPLEMENTATION_GUIDE.md)
- [Security Audit Report](./SECURITY_AUDIT_REPORT.md)
- [Upstash Redis Docs](https://docs.upstash.com/redis)

---

## âœ… Quick Checklist

- [ ] Installed dependencies (`npm install`)
- [ ] Created Upstash Redis account
- [ ] Added all environment variables to `.env`
- [ ] Restarted development server
- [ ] Verified rate limiting works
- [ ] Checked session expires after 1 hour

---

**Need Help?** Check the detailed [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) for technical details and troubleshooting.
