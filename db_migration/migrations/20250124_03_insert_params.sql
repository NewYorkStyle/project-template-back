INSERT INTO public.params (name, value, description)
VALUES 
    ('ym_counter', '99185667', 'Cчётчик для яндекс метрик')
ON CONFLICT (name) DO UPDATE SET 
    value = EXCLUDED.value,
    description = EXCLUDED.description;