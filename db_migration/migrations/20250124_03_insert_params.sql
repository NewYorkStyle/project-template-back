INSERT INTO public.params (name, value, description)
VALUES (
        'ym_counter'::character varying,
        '99185667'::character varying,
        'Cчётчик для яндекс метрик'::character varying
    )
returning id;