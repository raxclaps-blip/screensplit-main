-- Add email verification tokens table
CREATE TABLE IF NOT EXISTS "email_verification_tokens" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "email" TEXT NOT NULL,
  "token" TEXT NOT NULL UNIQUE,
  "expires" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "email_verification_tokens_email_token_key" UNIQUE ("email", "token")
);

-- Add password reset tokens table
CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "email" TEXT NOT NULL,
  "token" TEXT NOT NULL UNIQUE,
  "expires" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "password_reset_tokens_email_token_key" UNIQUE ("email", "token")
);

-- Add designer preferences table
CREATE TABLE IF NOT EXISTS "designer_preferences" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "user_id" TEXT NOT NULL UNIQUE,
  "bottomRightText" TEXT NOT NULL DEFAULT '',
  "bottom_right_history" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "designer_preferences_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

-- Better Auth migration (remove NextAuth-specific assumptions)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'users'
      AND column_name = 'email_verified'
      AND data_type <> 'boolean'
  ) THEN
    ALTER TABLE "users"
      ALTER COLUMN "email_verified"
      TYPE BOOLEAN
      USING CASE WHEN "email_verified" IS NULL THEN FALSE ELSE TRUE END;
  END IF;
END $$;

ALTER TABLE "users"
  ALTER COLUMN "email_verified" SET DEFAULT FALSE;

UPDATE "users"
SET "email_verified" = FALSE
WHERE "email_verified" IS NULL;

ALTER TABLE "users"
  ALTER COLUMN "email_verified" SET NOT NULL;

ALTER TABLE "accounts"
  ALTER COLUMN "type" DROP NOT NULL;

ALTER TABLE "accounts"
  ADD COLUMN IF NOT EXISTS "password" TEXT,
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "access_token_expires_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "refresh_token_expires_at" TIMESTAMP(3);

UPDATE "accounts"
SET "access_token_expires_at" = to_timestamp("expires_at")
WHERE "expires_at" IS NOT NULL
  AND "access_token_expires_at" IS NULL;

INSERT INTO "accounts" (
  "id",
  "user_id",
  "type",
  "provider",
  "provider_account_id",
  "password",
  "createdAt",
  "updatedAt"
)
SELECT
  'cred_' || u."id",
  u."id",
  'credentials',
  'credential',
  u."id",
  u."password",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "users" u
LEFT JOIN "accounts" a
  ON a."provider" = 'credential'
  AND a."provider_account_id" = u."id"
WHERE u."password" IS NOT NULL
  AND a."id" IS NULL;

ALTER TABLE "sessions"
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "ip_address" TEXT,
  ADD COLUMN IF NOT EXISTS "user_agent" TEXT;

ALTER TABLE "verificationtokens"
  ADD COLUMN IF NOT EXISTS "id" TEXT,
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "verificationtokens"
SET "id" = 'vt_' || md5("identifier" || ':' || "token")
WHERE "id" IS NULL;

ALTER TABLE "verificationtokens"
  ALTER COLUMN "id" SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'verificationtokens_pkey'
  ) THEN
    ALTER TABLE "verificationtokens"
      ADD CONSTRAINT "verificationtokens_pkey" PRIMARY KEY ("id");
  END IF;
END $$;
