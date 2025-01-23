INSERT INTO public.users (username, password)
VALUES (
        'SuperUser'::character varying,
        '$argon2id$v=19$m=65536,t=3,p=4$Mx7XYHlqsUE/YGWFTgsKLA$ZjfIYzoenHGAbzvfMfKKYs4RJtXvCKqHT1X83i9ebkk'::character varying
    )
returning id;