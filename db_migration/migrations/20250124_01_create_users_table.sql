CREATE TABLE IF NOT EXISTS public.users (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    username character varying COLLATE pg_catalog."default" NOT NULL,
    password character varying COLLATE pg_catalog."default" NOT NULL,
    "refreshToken" character varying COLLATE pg_catalog."default",
    "createdAt" timestamp with time zone DEFAULT now(),
    "updatedAt" timestamp with time zone,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT username UNIQUE (username)
) TABLESPACE pg_default;
ALTER TABLE IF EXISTS public.users OWNER to admin;