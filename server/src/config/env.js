import { z } from 'zod';

// NOTE: Supabase/DB vars are optional at this phase (P0) because no code
// reads them yet — auth and data access land in P1. Tighten to `.min(1)`
// (required) as each is wired up, per docs/PHASES.md P1.
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_URL: z.string().url().default('http://localhost:3000'),
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SECRET_KEY: z.string().optional(),
  SUPABASE_PUBLISHABLE_KEY: z.string().optional(),
  DATABASE_URL: z.string().optional(),
  LOGIN_RATE_LIMIT_PER_15MIN: z.coerce.number().int().positive().default(10),
});

export const env = envSchema.parse(process.env);
