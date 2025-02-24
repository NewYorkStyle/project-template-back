UPDATE public.users
SET surname = 'Тестов'::character varying,
    name = 'Тест'::character varying,
    patronymic = 'Тестович'::character varying
WHERE username = 'SuperUser';