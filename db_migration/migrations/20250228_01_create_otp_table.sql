CREATE TABLE otp (
    "otpId" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" uuid REFERENCES public.users(id) ON DELETE CASCADE,
    otp VARCHAR(6) NOT NULL,
    purpose VARCHAR(50) NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "expiresAt" TIMESTAMP NOT NULL DEFAULT NOW() + INTERVAL '5 minutes'
);
ALTER TABLE IF EXISTS public.permissions OWNER to admin;
CREATE INDEX idx_otp_userId_purpose ON otp("userId", purpose);