import { z } from 'zod';

const schema = z.object({
  appEnv: z.enum(['development', 'preview', 'production']).default('development'),
  apiBaseUrl: z.url().optional(),
});

export type Env = z.infer<typeof schema>;

export function parseEnv(source: Record<string, string | undefined> = process.env): Env {
  const parsed = schema.safeParse({
    appEnv: source.EXPO_PUBLIC_APP_ENV ?? 'development',
    apiBaseUrl: source.EXPO_PUBLIC_API_BASE_URL,
  });

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `${issue.path.join('.') || 'env'}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid EXPO_PUBLIC_* configuration: ${issues}`);
  }

  return parsed.data;
}

export const env = parseEnv();

export const isProduction = env.appEnv === 'production';
