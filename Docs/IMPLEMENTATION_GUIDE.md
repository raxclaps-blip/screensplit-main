
## Overview

This guide documents the implementation of:
1. **Redis-based distributed rate limiting** using Upstash
3. **1-hour session duration** for enhanced security

---

## ðŸš€ Quick Start

### 1. Install Dependencies

```bash
npm install
```

**New packages added:**
- `@upstash/redis@^1.34.3` - Upstash Redis client
- `@upstash/ratelimit@^2.0.4` - Rate limiting library

### 2. Set Up Upstash Redis

1. Create a free account at [https://console.upstash.com/](https://console.upstash.com/)
2. Create a new Redis database
3. Copy your REST URL and token
4. Add to `.env`:

```env
UPSTASH_REDIS_REST_URL=https://your-redis-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```


3. Add your domains (including localhost for development)
4. Copy your Site Key and Secret Key
5. Add to `.env`:

```env
```

### 4. Start Development Server

```bash
npm run dev
```

---

## ðŸ“ New Files Created

### `/lib/redis.ts`
- Redis client initialization with Upstash
- Pre-configured rate limiters for different use cases
- Graceful fallback to in-memory if Redis unavailable


- Ref-based API for programmatic control
- Theme and size customization

### `.env.example`
- Complete environment variable template
- Documentation for all required secrets

---

## ðŸ”’ Rate Limiting Configuration

All rate limiters use **sliding window** algorithm for accurate rate limiting.

### Auth Rate Limiter
- **Limit:** 5 requests per 15 minutes
- **Used for:** Registration, login attempts, password verification
- **Identifier:** IP address or email

```typescript
import { authRateLimiter, checkRateLimit } from "@/lib/redis"

const result = await checkRateLimit(authRateLimiter, `register:${ip}`)
if (result && !result.success) {
  // Rate limited
}
```

### Upload Rate Limiter
- **Limit:** 10 requests per minute
- **Used for:** Image uploads
- **Identifier:** User ID

```typescript
import { uploadRateLimiter, checkRateLimit } from "@/lib/redis"

const result = await checkRateLimit(uploadRateLimiter, `upload:${userId}`)
```

### API Rate Limiter
- **Limit:** 60 requests per minute
- **Used for:** General API endpoints, view counts
- **Identifier:** IP address

```typescript
import { apiRateLimiter, checkRateLimit } from "@/lib/redis"

const result = await checkRateLimit(apiRateLimiter, `api:${ip}`)
```

### Password Rate Limiter
- **Limit:** 5 requests per 15 minutes
- **Used for:** Share password verification
- **Identifier:** IP + slug combination

---


### Registration Form
- Token sent with registration request
- Server-side verification before account creation

### Login Form
- Automatically displayed on rate limit errors
- Prevents automated brute force attacks

### Server-Side Verification

```typescript

}
```

---

## â±ï¸ Session Configuration

### 1-Hour Session Duration

Configured in `/lib/auth.ts`:

```typescript
session: {
  strategy: "jwt",
  maxAge: 60 * 60, // 1 hour in seconds
}
```

**Behavior:**
- Sessions expire after 1 hour of inactivity
- Users must re-authenticate after expiration
- JWT tokens automatically refresh on activity
- Enhanced security for sensitive operations

---

## ðŸ”„ Updated API Endpoints

### `/api/auth/register`
- âœ… Redis rate limiting (5 per 15min per IP)
- âœ… Validates all inputs with Zod
- âœ… Returns rate limit headers

### `/api/upload-image`
- âœ… Redis rate limiting (10 per min per user)
- âœ… File size validation (10MB max)
- âœ… Authentication required
- âœ… Returns rate limit headers

### `/api/verify-share-password`
- âœ… Redis rate limiting (5 per 15min per IP+slug)
- âœ… Prevents brute force password attacks
- âœ… Returns rate limit headers

### `/api/share-view`
- âœ… Redis rate limiting (60 per min per IP+slug)
- âœ… Prevents view count manipulation
- âœ… Silent failure on rate limit (maintains UX)

### `/lib/auth.ts` (Login)
- âœ… Redis-based login attempt tracking
- âœ… Fallback to in-memory if Redis unavailable
- âœ… Clear error messages with attempt counts
- âœ… Automatic reset on successful login

---

## ðŸ§ª Testing

### Test Rate Limiting

```bash
# Test registration rate limit (should fail after 5 attempts)
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"name":"Test","email":"test@test.com","password":"password123"}'
done
```


1. Go to `/auth/signup`
3. Submit the form

### Test Session Expiration

1. Sign in to the app
2. Wait 1 hour (or modify `maxAge` to 60 seconds for testing)
3. Try to access protected route
4. Should redirect to sign-in page

---

## ðŸ”§ Configuration Options

### Customize Rate Limits

Edit `/lib/redis.ts`:

```typescript
export const authRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "15 m"), // Change here
      analytics: true,
      prefix: "@screensplit/auth",
    })
  : null
```



```typescript
  return failedAttempts >= 2 // Change threshold here
}
```

### Customize Session Duration

Edit `/lib/auth.ts`:

```typescript
session: {
  strategy: "jwt",
  maxAge: 60 * 60, // Change duration here (in seconds)
}
```

---

## ðŸ“Š Rate Limit Headers

All rate-limited endpoints return these headers:

```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 3
X-RateLimit-Reset: 1234567890
```

- **Limit:** Maximum requests allowed
- **Remaining:** Requests remaining in current window
- **Reset:** Unix timestamp when limit resets

---

## ðŸš¨ Error Handling

### Rate Limit Exceeded (429)

```json
{
  "error": "Too many requests. Please try again later."
}
```


```json
{
}
```

### Login Rate Limited

```
```

---

## ðŸ” Security Best Practices

### âœ… Implemented

1. **Distributed Rate Limiting** - Prevents abuse across multiple instances
3. **Short Sessions** - Reduces token theft risk
4. **Rate Limit Headers** - Transparent limits for clients
5. **Graceful Fallbacks** - Works without Redis (dev mode)
6. **IP-based Tracking** - Identifies malicious actors

### ðŸ“‹ Recommended Next Steps

1. **Monitor Rate Limits** - Track limit hits in production
2. **Adjust Thresholds** - Tune based on usage patterns
3. **Add Logging** - Log rate limit violations
4. **IP Allowlisting** - Whitelist trusted IPs
5. **Email Alerts** - Notify on suspicious activity

---

## ðŸ› Troubleshooting


2. Verify domain is registered with Google
3. Check browser console for errors

### Rate Limiting Not Working

1. Check Upstash Redis connection
2. Verify `UPSTASH_REDIS_REST_URL` and token
3. Check console for Redis errors
4. System falls back to in-memory if Redis fails

### Sessions Expiring Too Quickly

1. Check `maxAge` in `/lib/auth.ts`
2. Verify system clock is correct
3. Clear browser cookies and test again

### TypeScript Errors

Run to install all dependencies:
```bash
npm install
```

---

## ðŸ“š Additional Resources

- [Upstash Redis Docs](https://docs.upstash.com/redis)
- [Upstash Rate Limiting](https://github.com/upstash/ratelimit)
- [NextAuth.js Sessions](https://next-auth.js.org/configuration/options#session)

---

## ðŸŽ‰ Summary

Your application now has:

âœ… **Production-ready rate limiting** with Redis (Upstash)  
âœ… **1-hour session duration** for enhanced security  
âœ… **Comprehensive error handling** with proper HTTP status codes  
âœ… **Rate limit headers** for transparency  
âœ… **Graceful fallbacks** for development without Redis  

**Security Improvements:**
- Prevents brute force attacks
- Blocks automated registration spam
- Reduces session hijacking risk
- Protects API from abuse
- Provides distributed rate limiting for scaled deployments

Run `npm install` and configure your environment variables to get started!
