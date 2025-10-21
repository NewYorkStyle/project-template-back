DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'otp' AND column_name = 'metadata') THEN
        ALTER TABLE public.otp ADD COLUMN metadata character varying COLLATE pg_catalog."default";
    END IF;
END $$;