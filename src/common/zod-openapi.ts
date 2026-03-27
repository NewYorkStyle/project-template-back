import {
  extendZodWithOpenApi,
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from '@asteasolutions/zod-to-openapi';
import {z, type ZodType} from 'zod';

extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

export function registerSchema<T extends ZodType>(name: string, schema: T): T {
  return registry.register(name, schema);
}

export function generateOpenApiComponents(): ReturnType<
  OpenApiGeneratorV3['generateComponents']
> {
  return new OpenApiGeneratorV3(registry.definitions).generateComponents();
}
