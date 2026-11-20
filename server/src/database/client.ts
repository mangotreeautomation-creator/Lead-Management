import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema/index';
import { env } from '../config/env';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  min: env.DB_POOL_MIN,
  max: env.DB_POOL_MAX,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('[PostgreSQL Pool Error]', err);
});

export const db = drizzle(pool, { schema });

export async function checkDatabaseHealth(): Promise<{ ok: boolean; timestamp?: string; error?: string }> {
  try {
    const result = await pool.query('SELECT NOW() as current_time');
    return { ok: true, timestamp: result.rows[0].current_time };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}
