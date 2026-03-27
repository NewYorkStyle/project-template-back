import {z} from 'zod';

export const appParamsSchema = z
  .record(z.string(), z.string())
  .openapi('AppParamsDto', {
    description:
      'Application parameters map: key = param name, value = param value',
    example: {
      featureFlag: 'enabled',
      supportEmail: 'support@example.com',
    },
  });
