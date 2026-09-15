import pg from 'pg';

import { env } from '../config/env.js';

let pool;

// Lazy: only connects when a query actually runs. Nothing in P0 queries the DB.
export function getPool() {
  if (!pool) {
    if (!env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set — see .env.example');
    }
    pool = new pg.Pool({ connectionString: env.DATABASE_URL });
  }
  return pool;
}
