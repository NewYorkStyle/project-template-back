CREATE TABLE IF NOT EXISTS public.otp (
    "otpId" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" uuid REFERENCES public.users(id) ON DELETE CASCADE,
    otp VARCHAR(6) NOT NULL,
    purpose VARCHAR(50) NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "expiresAt" TIMESTAMP NOT NULL DEFAULT NOW() + INTERVAL '5 minutes'
) TABLESPACE pg_default;
ALTER TABLE IF EXISTS public.otp OWNER to admin;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_otp_userId_purpose') THEN
        CREATE INDEX idx_otp_userId_purpose ON otp("userId", purpose);
    END IF;
END $$;