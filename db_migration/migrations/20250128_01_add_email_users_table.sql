ALTER TABLE IF EXISTS public.users
ADD COLUMN email character varying NOT NULL DEFAULT 'email@mock.test',
    ADD COLUMN patronymic character varying,
    ADD COLUMN surname character varying,
    ADD COLUMN name character varying,
    ADD COLUMN patronymic character varying,
    ADD CONSTRAINT email UNIQUE (email);