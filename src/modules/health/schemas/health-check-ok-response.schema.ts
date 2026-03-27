import {z} from 'zod';

/** Формат JSON при успешном ответе @nestjs/terminus HealthCheck (status === 'ok') */

const healthAppIndicatorSchema = z.object({
  environment: z.string().openapi({
    description: 'Runtime environment name',
    example: 'development',
  }),
  status: z.literal('up').openapi({
    description: 'Indicator status from Terminus',
    example: 'up',
  }),
  timestamp: z.string().openapi({
    description: 'ISO 8601 timestamp of the check',
    example: '2025-01-01T12:00:00.000Z',
  }),
});

export const healthCheckOkResponseSchema = z
  .object({
    details: z
      .object({
        app: healthAppIndicatorSchema,
      })
      .openapi({
        description: 'All indicators (healthy and unhealthy merged)',
      }),
    error: z.record(z.string(), z.unknown()).openapi({
      description: 'Failed indicators; empty object when all checks pass',
      example: {},
    }),
    info: z
      .object({
        app: healthAppIndicatorSchema,
      })
      .openapi({
        description: 'Only healthy indicators',
      }),
    status: z.literal('ok').openapi({
      description: 'Overall health status',
      example: 'ok',
    }),
  })
  .openapi('HealthCheckOkResponseDto', {
    description: 'Successful health check payload from Terminus',
  });

export type THealthCheckOkResponseDto = z.infer<
  typeof healthCheckOkResponseSchema
>;
