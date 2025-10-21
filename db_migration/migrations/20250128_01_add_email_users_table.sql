DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'email') THEN
        ALTER TABLE public.users ADD COLUMN email character varying NOT NULL DEFAULT 'email@mock.test';
        ALTER TABLE public.users ADD CONSTRAINT email UNIQUE (email);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'surname') THEN
        ALTER TABLE public.users ADD COLUMN surname character varying;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'name') THEN
        ALTER TABLE public.users ADD COLUMN name character varying;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'patronymic') THEN
        ALTER TABLE public.users ADD COLUMN patronymic character varying;
    END IF;
END $$;