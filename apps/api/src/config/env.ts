import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  MONGODB_URI: z.string().default(''),
  JWT_SECRET: z.string().default('default-dev-secret-change-in-production-32chars'),
  JWT_REFRESH_SECRET: z.string().default('default-dev-refresh-secret-change-in-prod-32c'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  STRIPE_SECRET_KEY: z.string().default(''),
  STRIPE_WEBHOOK_SECRET: z.string().default(''),
  STRIPE_PRICE_ID_EUR: z.string().default(''),
  STRIPE_PRICE_ID_USD: z.string().default(''),
  SERPAPI_KEY: z.string().default(''),
  EXPO_ACCESS_TOKEN: z.string().default(''),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const parsed = envSchema.parse(process.env);

  // Log warnings for missing critical vars (but don't crash)
  const warnings: string[] = [];
  if (!parsed.MONGODB_URI) warnings.push('MONGODB_URI is not set — database features will not work');
  if (parsed.JWT_SECRET.startsWith('default-')) warnings.push('JWT_SECRET is using default value — set it in production!');
  if (parsed.JWT_REFRESH_SECRET.startsWith('default-')) warnings.push('JWT_REFRESH_SECRET is using default value — set it in production!');

  if (warnings.length > 0) {
    console.warn('⚠️  Environment warnings:');
    warnings.forEach(w => console.warn(`  - ${w}`));
  }

  console.log(`✅ Environment loaded: NODE_ENV=${parsed.NODE_ENV}, PORT=${parsed.PORT}, MONGODB_URI=${parsed.MONGODB_URI ? '***set***' : 'NOT SET'}`);

  return parsed;
}

export const env = validateEnv();
