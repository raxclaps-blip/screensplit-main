# Email Verification & Password Reset Implementation Guide

## âœ… Features Implemented

1. **Email Verification on Registration**
   - Users must verify their email before logging in
   - Verification emails sent automatically upon registration
   - 24-hour expiration on verification links
   - Welcome email sent after successful verification

2. **Forgot Password / Password Reset**
   - Secure password reset flow
   - Reset links expire after 1 hour
   - Rate-limited to prevent abuse
   - Beautiful email templates

## ðŸš€ Setup Instructions

### Step 1: Install Dependencies

```bash
npm install
```

**New package installed:**
- `nodemailer@^6.9.16` - Email sending
- `@types/nodemailer@^6.4.16` - TypeScript types

### Step 2: Run Database Migration

The schema has been updated with two new tables:
- `email_verification_tokens`
- `password_reset_tokens`

Run the migration:

```bash
npx prisma migrate dev --name add_email_verification_and_password_reset
npx prisma generate
```

### Step 3: SMTP Configuration (Already Done)

Your `.env` file has been updated with:

```env
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=onboarding@godfreysiaga.my.id
SMTP_PASSWORD=M5E4S*h0N
```

**Important:** These credentials are now in your `.env` file. Make sure:
- âœ… `.env` is in `.gitignore`
- âœ… Never commit these credentials to version control
- âœ… Use different credentials for production

### Step 4: Verify Site URL

Make sure `NEXT_PUBLIC_SITE_URL` is set correctly in `.env`:

```env
# For development
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# For production
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### Step 5: Restart Development Server

```bash
# Stop current server (Ctrl+C or Cmd+C)
npm run dev
```

---

## ðŸ“§ Email Templates

All emails use beautiful HTML templates with:
- Gradient headers
- Responsive design
- Clear call-to-action buttons
- Security warnings
- Professional branding

### Email Types

1. **Verification Email**
   - Subject: "Verify your email - ScreenSplit"
   - Contains verification link
   - Expires in 24 hours

2. **Password Reset Email**
   - Subject: "Reset your password - ScreenSplit"
   - Contains reset link
   - Expires in 1 hour
   - Security warnings included

3. **Welcome Email**
   - Subject: "Welcome to ScreenSplit! ðŸŽ‰"
   - Sent after email verification
   - Lists available features
   - Call-to-action to get started

---

## ðŸ” API Endpoints

### Email Verification

#### Register User
```
POST /api/auth/register
```
- Now sends verification email automatically
- User cannot log in until email is verified

#### Verify Email
```
GET /api/auth/verify-email?token={token}
```
- Verifies the email token
- Updates user's `emailVerified` status
- Sends welcome email

#### Resend Verification
```
POST /api/auth/resend-verification
Body: { "email": "user@example.com" }
```
- Rate limited: 5 requests per 15 minutes
- Generates new verification token
- Sends new verification email

### Password Reset

#### Request Reset
```
POST /api/auth/forgot-password
Body: { "email": "user@example.com" }
```
- Rate limited: 5 requests per 15 minutes
- Doesn't reveal if email exists (security)
- Sends reset link if user exists

#### Reset Password
```
POST /api/auth/reset-password
Body: {
  "token": "reset-token",
  "password": "newpassword123"
}
```
- Validates token
- Updates password with bcrypt hashing
- Deletes used token

---

## ðŸŽ¨ Frontend Pages

### Email Verification Page
**Route:** `/auth/verify-email`

Features:
- Automatic verification on page load
- Loading state
- Success/error messages
- Auto-redirect to sign-in after success

### Forgot Password Page
**Route:** `/auth/forgot-password`

Features:
- Email input form
- Rate limit protection
- Success confirmation
- Link back to sign-in

### Reset Password Page
**Route:** `/auth/reset-password`

Features:
- Token validation
- New password form
- Password confirmation
- Auto-redirect after success

---

## ðŸ”„ User Flow

### Registration Flow

2. Server creates user with `emailVerified: null`
3. Verification email sent automatically
4. User receives email with verification link
5. User clicks link â†’ redirected to `/auth/verify-email?token=xxx`
6. Email gets verified â†’ `emailVerified` updated
7. Welcome email sent
8. User redirected to sign-in

### Login Flow

1. User attempts to sign in
2. Server checks if email is verified
3. **If not verified:** Error message with instructions
4. **If verified:** Login proceeds normally

### Password Reset Flow

1. User clicks "Forgot password?"
2. User enters email address
3. If account exists, reset email sent
4. User clicks reset link â†’ redirected to `/auth/reset-password?token=xxx`
5. User enters new password (twice)
6. Password updated
7. User redirected to sign-in

---

## ðŸ›¡ï¸ Security Features

### Email Verification
- âœ… Tokens are 64-character random strings (nanoid)
- âœ… Tokens expire after 24 hours
- âœ… Tokens are deleted after use
- âœ… Old tokens deleted when new one generated
- âœ… Users cannot log in without verification

### Password Reset
- âœ… Reset links expire after 1 hour
- âœ… Tokens are single-use
- âœ… Rate limited to prevent abuse
- âœ… Doesn't reveal if email exists
- âœ… Secure password hashing (bcrypt rounds=12)

### Rate Limiting
- 5 requests per 15 minutes for:
  - Resend verification
  - Forgot password
  - Registration

---

## ðŸ§ª Testing

### Test Email Verification

1. Register a new account
2. Check `onboarding@godfreysiaga.my.id` inbox
3. Click verification link
4. Should see success message
5. Try to sign in â†’ should work

### Test Password Reset

1. Go to `/auth/forgot-password`
2. Enter your email
3. Check inbox for reset email
4. Click reset link
5. Enter new password
6. Try to sign in with new password

### Test Unverified Login

1. Manually create user in database without `emailVerified`
2. Try to sign in
3. Should see error: "Please verify your email before signing in"

---

## ðŸ“ Database Schema

### EmailVerificationToken
```prisma
model EmailVerificationToken {
  id        String   @id @default(cuid())
  email     String
  token     String   @unique
  expires   DateTime
  createdAt DateTime @default(now())

  @@unique([email, token])
  @@map("email_verification_tokens")
}
```

### PasswordResetToken
```prisma
model PasswordResetToken {
  id        String   @id @default(cuid())
  email     String
  token     String   @unique
  expires   DateTime
  createdAt DateTime @default(now())

  @@unique([email, token])
  @@map("password_reset_tokens")
}
```

---

## ðŸŽ¯ Updated Files

### New Files Created
- `lib/email.ts` - Email service with templates
- `lib/tokens.ts` - Token generation and verification
- `app/api/auth/verify-email/route.ts` - Email verification endpoint
- `app/api/auth/resend-verification/route.ts` - Resend verification endpoint
- `app/api/auth/forgot-password/route.ts` - Forgot password endpoint
- `app/api/auth/reset-password/route.ts` - Reset password endpoint
- `app/auth/verify-email/page.tsx` - Email verification UI
- `app/auth/forgot-password/page.tsx` - Forgot password UI
- `app/auth/reset-password/page.tsx` - Reset password UI
- `EMAIL_VERIFICATION_GUIDE.md` - This file

### Modified Files
- `package.json` - Added nodemailer
- `prisma/schema.prisma` - Added token tables
- `app/api/auth/register/route.ts` - Send verification email
- `lib/auth.ts` - Check email verification on login
- `components/auth/signin-form.tsx` - Added forgot password link
- `components/auth/signup-form.tsx` - Updated success message
- `.env` - Added SMTP credentials

---

## ðŸš¨ Important Notes

### For Development
- Emails are sent from `onboarding@godfreysiaga.my.id`
- All emails will appear to come from this address
- Test with real email addresses

### For Production
1. **Use production SMTP credentials**
2. **Update `NEXT_PUBLIC_SITE_URL`** to your domain
3. **Test email deliverability**
4. **Monitor email sending errors**
5. **Consider using a dedicated email service:**
   - SendGrid
   - Mailgun
   - Amazon SES
   - Postmark

### Email Deliverability Tips
- Verify domain ownership with your email provider
- Set up SPF and DKIM records
- Use a professional "from" address
- Keep email templates simple
- Monitor bounce rates

---

## ðŸ› Troubleshooting

### Emails Not Sending

1. **Check SMTP credentials**
   ```bash
   echo $SMTP_USER
   echo $SMTP_HOST
   ```

2. **Check server logs**
   ```
   Failed to send verification email
   SMTP connection error: ...
   ```

3. **Test SMTP connection**
   - Server logs should show: "SMTP server is ready to send emails"

### Verification Link Doesn't Work

1. **Check token expiration**
   - Verification tokens expire after 24 hours
   - Request a new one with resend endpoint

2. **Check `NEXT_PUBLIC_SITE_URL`**
   - Must match your actual domain
   - Include protocol (http:// or https://)

### User Can't Log In After Verification

1. **Check database**
   ```sql
   SELECT email, emailVerified FROM users WHERE email = 'user@example.com';
   ```

2. **Manually verify if needed**
   ```sql
   UPDATE users SET emailVerified = NOW() WHERE email = 'user@example.com';
   ```

---

## ðŸ“Š Next Steps

### Recommended Enhancements

1. **Email Service Integration**
   - Replace Hostinger SMTP with SendGrid/Mailgun
   - Better deliverability and tracking

2. **Admin Dashboard**
   - View email verification status
   - Manually verify users if needed
   - Resend verification emails

3. **Email Preferences**
   - Let users opt-in/out of marketing emails
   - Notification preferences

4. **Email Templates**
   - Customize branding
   - Add more email types
   - Multi-language support

---

## âœ… Quick Checklist

Before going live:

- [ ] Run database migration (`npx prisma migrate dev`)
- [ ] Install nodemailer (`npm install`)
- [ ] Restart dev server (`npm run dev`)
- [ ] Test registration â†’ email â†’ verification flow
- [ ] Test forgot password â†’ reset flow
- [ ] Update `NEXT_PUBLIC_SITE_URL` for production
- [ ] Set up production SMTP credentials
- [ ] Test email deliverability
- [ ] Monitor email sending logs

---

**Implementation Complete!** ðŸŽ‰

Your application now has:
- âœ… Email verification on registration
- âœ… Forgot password functionality
- âœ… Beautiful email templates
- âœ… Secure token management
- âœ… Rate limiting protection
- âœ… User-friendly UI

Run the database migration and restart your server to test it out!
