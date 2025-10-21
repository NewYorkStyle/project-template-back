INSERT INTO public.permissions (name, description)
VALUES 
    ('email_verified', 'Признак подтверждённой почты')
ON CONFLICT (name) DO UPDATE SET 
    description = EXCLUDED.description;