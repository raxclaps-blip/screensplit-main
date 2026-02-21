#!/bin/bash
# This script will help you push all environment variables to Vercel
# Run: chmod +x .vercel-env-setup.sh && ./vercel-env-setup.sh

vercel env add AUTH_SECRET production
vercel env add AUTH_URL production
vercel env add AUTH_TRUST_HOST production
vercel env add DATABASE_URL production
vercel env add DIRECT_URL production
vercel env add UPSTASH_REDIS_REST_URL production
vercel env add UPSTASH_REDIS_REST_TOKEN production
vercel env add SMTP_HOST production
vercel env add SMTP_PORT production
vercel env add SMTP_USER production
vercel env add SMTP_APP_PASSWORD production
vercel env add EMAIL_FROM production
vercel env add RECAPTCHA_SECRET_KEY production
vercel env add NEXT_PUBLIC_RECAPTCHA_SITE_KEY production
vercel env add R2_S3_ENDPOINT production
vercel env add R2_REGION production
vercel env add R2_ACCESS_KEY_ID production
vercel env add R2_SECRET_ACCESS_KEY production
vercel env add R2_BUCKET production
vercel env add R2_S3_FORCE_PATH_STYLE production
vercel env add NEXT_PUBLIC_SITE_URL production
vercel env add GOOGLE_CLIENT_ID production
vercel env add GOOGLE_CLIENT_SECRET production
