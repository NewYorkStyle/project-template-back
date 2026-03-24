import {z} from 'zod';

export const permissionNamesSchema = z
  .array(
    z.string().openapi({
      description: 'Permission name',
      example: 'EMAIL_VERIFIED',
    })
  )
  .openapi('PermissionNamesDto');
