-- DropForeignKey
ALTER TABLE "otp" DROP CONSTRAINT "otp_userId_fkey";

-- CreateTable
CREATE TABLE "tours" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "key" VARCHAR NOT NULL,
    "name" VARCHAR NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_tours" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "tourId" UUID NOT NULL,
    "seenAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_tours_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tours_key_key" ON "tours"("key");

-- CreateIndex
CREATE INDEX "user_tours_userId_idx" ON "user_tours"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_tours_userId_tourId_key" ON "user_tours"("userId", "tourId");

-- RenameForeignKey
ALTER TABLE "user_permissions" RENAME CONSTRAINT "user_permissions_permissionid_fkey" TO "user_permissions_permissionId_fkey";

-- RenameForeignKey
ALTER TABLE "user_permissions" RENAME CONSTRAINT "user_permissions_userid_fkey" TO "user_permissions_userId_fkey";

-- AddForeignKey
ALTER TABLE "otp" ADD CONSTRAINT "otp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_tours" ADD CONSTRAINT "user_tours_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_tours" ADD CONSTRAINT "user_tours_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "tours"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "idx_otp_userid_purpose" RENAME TO "otp_userId_purpose_idx";

-- RenameIndex
ALTER INDEX "name" RENAME TO "params_name_key";

-- RenameIndex
ALTER INDEX "unique_name" RENAME TO "permissions_name_key";

-- RenameIndex
ALTER INDEX "idx_user_permissions_permissionid" RENAME TO "user_permissions_permissionId_idx";

-- RenameIndex
ALTER INDEX "idx_user_permissions_userid" RENAME TO "user_permissions_userId_idx";

-- RenameIndex
ALTER INDEX "email" RENAME TO "users_email_key";

-- RenameIndex
ALTER INDEX "username" RENAME TO "users_username_key";
