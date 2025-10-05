INSERT INTO public.permissions (name, description)
VALUES (
        'email_verified'::character varying,
        'Признак подтверждённой почты'::character varying
    )
returning id;