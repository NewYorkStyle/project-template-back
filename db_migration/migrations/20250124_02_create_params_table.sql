CREATE TABLE IF NOT EXISTS public.params (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name character varying COLLATE pg_catalog."default" NOT NULL,
    value character varying COLLATE pg_catalog."default" NOT NULL,
    description character varying COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT params_pkey PRIMARY KEY (id),
    CONSTRAINT name UNIQUE (name)
) TABLESPACE pg_default;
ALTER TABLE IF EXISTS public.params OWNER to admin;