-- Add opt-in flag for public community/featured surfaces
ALTER TABLE "projects"
ADD COLUMN "isFeaturedInCommunity" BOOLEAN NOT NULL DEFAULT false;

-- Speed up community-featured listing queries
CREATE INDEX "projects_isFeaturedInCommunity_isPrivate_createdAt_idx"
ON "projects"("isFeaturedInCommunity", "isPrivate", "createdAt" DESC);
