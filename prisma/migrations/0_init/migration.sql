-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- gen_random_uuid() требует pgcrypto
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateTable
CREATE TABLE "otp" (
    "otpId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID,
    "otp" VARCHAR(6) NOT NULL,
    "purpose" VARCHAR(50) NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(6) NOT NULL DEFAULT (now() + '00:05:00'::interval),
    "metadata" VARCHAR,

    CONSTRAINT "otp_pkey" PRIMARY KEY ("otpId")
);

-- CreateTable
CREATE TABLE "params" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR NOT NULL,
    "value" VARCHAR NOT NULL,
    "description" VARCHAR NOT NULL,

    CONSTRAINT "params_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR NOT NULL,
    "description" VARCHAR NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_permissions" (
    "userId" UUID NOT NULL,
    "permissionId" UUID NOT NULL,

    CONSTRAINT "user_permissions_pkey" PRIMARY KEY ("userId","permissionId")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "username" VARCHAR NOT NULL,
    "password" VARCHAR NOT NULL,
    "refreshToken" VARCHAR,
    "createdAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6),
    "email" VARCHAR NOT NULL DEFAULT 'email@mock.test',
    "surname" VARCHAR,
    "name" VARCHAR,
    "patronymic" VARCHAR,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_otp_userid_purpose" ON "otp"("userId", "purpose");

-- CreateIndex
CREATE UNIQUE INDEX "name" ON "params"("name");

-- CreateIndex
CREATE UNIQUE INDEX "unique_name" ON "permissions"("name");

-- CreateIndex
CREATE INDEX "idx_user_permissions_permissionid" ON "user_permissions"("permissionId");

-- CreateIndex
CREATE INDEX "idx_user_permissions_userid" ON "user_permissions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "username" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "email" ON "users"("email");

-- AddForeignKey
ALTER TABLE "otp" ADD CONSTRAINT "otp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_permissionid_fkey" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_userid_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

