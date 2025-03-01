CREATE TABLE IF NOT EXISTS public.user_permissions (
    'userId' uuid NOT NULL,
    'permissionId' uuid NOT NULL,
    CONSTRAINT user_permissions_pkey PRIMARY KEY ('userId', 'permissionId'),
    CONSTRAINT user_permissions_permissionid_fkey FOREIGN KEY ('permissionId') REFERENCES public.permissions (id) MATCH SIMPLE ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT user_permissions_userid_fkey FOREIGN KEY ('userId') REFERENCES public.users (id) MATCH SIMPLE ON DELETE CASCADE ON UPDATE CASCADE
) TABLESPACE pg_default;
ALTER TABLE IF EXISTS public.user_permissions OWNER to admin;
CREATE INDEX idx_user_permissions_userId ON user_permissions('userId');
CREATE INDEX idx_user_permissions_permissionId ON user_permissions('permissionId');