import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db, pool } from './client';
import path from 'path';

export async function runMigrations() {
  console.log('[Migrations] Starting Drizzle schema migrations...');
  try {
    const migrationsFolder = path.resolve(__dirname, 'migrations');
    await migrate(db, { migrationsFolder });
    console.log('[Migrations] Successfully executed all database migrations!');
  } catch (error) {
    console.error('[Migrations] Failed to run database migrations:', error);
    throw error;
  }
}

// Allow direct execution: npx tsx src/database/migrate.ts
if (require.main === module || process.argv[1]?.endsWith('migrate.ts')) {
  runMigrations()
    .then(async () => {
      await pool.end();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error(err);
      await pool.end();
      process.exit(1);
    });
}
