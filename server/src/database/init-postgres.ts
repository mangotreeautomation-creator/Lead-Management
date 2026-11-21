import pg from 'pg';

const { Client } = pg;

export async function initPostgres(adminPassword?: string) {
  const adminPass = adminPassword || process.env.PG_ADMIN_PASSWORD || 'postgres';
  const appDbPass = process.env.DB_PASSWORD || 'dev_secret_lead_pass_2026';
  console.log('[PostgreSQL Init] Starting non-destructive initialization...');
  
  // Step 1: Connect as PostgreSQL admin to the default 'postgres' database
  const adminClient = new Client({
    host: '127.0.0.1',
    port: 5432,
    user: 'postgres',
    password: adminPass,
    database: 'postgres',
  });

  try {
    await adminClient.connect();
    console.log('[PostgreSQL Init] Connected to PostgreSQL admin catalog.');

    // Step 2: Create or verify least-privilege role 'lead_app_user'
    const roleSql = `
      DO $do$
      BEGIN
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'lead_app_user') THEN
          CREATE ROLE lead_app_user WITH 
            LOGIN 
            ENCRYPTED PASSWORD '${appDbPass}'
            NOSUPERUSER 
            NOCREATEDB 
            NOCREATEROLE;
          RAISE NOTICE 'Role lead_app_user created successfully with least privilege.';
        ELSE
          ALTER ROLE lead_app_user WITH 
            LOGIN 
            ENCRYPTED PASSWORD '${appDbPass}'
            NOSUPERUSER 
            NOCREATEDB 
            NOCREATEROLE;
          RAISE NOTICE 'Role lead_app_user verified with least privilege.';
        END IF;
      END $do$;
    `;
    await adminClient.query(roleSql);
    console.log('[PostgreSQL Init] Role lead_app_user verified/created with least-privilege (NOSUPERUSER, NOCREATEDB).');

    // Step 3: Check if database exists before attempting creation
    const dbCheck = await adminClient.query(
      "SELECT 1 FROM pg_catalog.pg_database WHERE datname = 'lead_management_dev'"
    );

    if (dbCheck.rowCount === 0) {
      console.log("[PostgreSQL Init] Database 'lead_management_dev' does not exist. Creating safely...");
      // CREATE DATABASE cannot run inside a transaction
      await adminClient.query(
        "CREATE DATABASE lead_management_dev WITH OWNER = lead_app_user ENCODING = 'UTF8'"
      );
      console.log("[PostgreSQL Init] Database 'lead_management_dev' created with owner 'lead_app_user'.");
    } else {
      console.log("[PostgreSQL Init] Database 'lead_management_dev' already exists. Preserving existing database without changes.");
    }

    // Step 4: Grant database privileges
    await adminClient.query('GRANT ALL PRIVILEGES ON DATABASE lead_management_dev TO lead_app_user');
    console.log('[PostgreSQL Init] Granted ALL PRIVILEGES ON DATABASE lead_management_dev TO lead_app_user.');
  } finally {
    await adminClient.end();
  }

  // Step 5: Connect to 'lead_management_dev' to install extensions and grants
  const devDbClient = new Client({
    host: '127.0.0.1',
    port: 5432,
    user: 'postgres',
    password: adminPassword,
    database: 'lead_management_dev',
  });

  try {
    await devDbClient.connect();
    console.log("[PostgreSQL Init] Connected to 'lead_management_dev' for extensions and schema setup.");

    await devDbClient.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    await devDbClient.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto";');
    await devDbClient.query('GRANT ALL ON SCHEMA public TO lead_app_user;');
    await devDbClient.query('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO lead_app_user;');
    await devDbClient.query('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO lead_app_user;');
    console.log("[PostgreSQL Init] Installed uuid-ossp, pgcrypto and configured public schema permissions.");
  } finally {
    await devDbClient.end();
  }

  // Step 6: Verify connection as least-privilege 'lead_app_user'
  const appClient = new Client({
    host: '127.0.0.1',
    port: 5432,
    user: 'lead_app_user',
    password: appDbPass,
    database: 'lead_management_dev',
  });

  try {
    await appClient.connect();
    const res = await appClient.query('SELECT current_user, current_database(), version();');
    console.log('[PostgreSQL Init] Verification Successful! Connected as application user:');
    console.log(`  Current User: ${res.rows[0].current_user}`);
    console.log(`  Current Database: ${res.rows[0].current_database}`);
    console.log(`  Engine: ${res.rows[0].version.split(' on ')[0]}`);
  } finally {
    await appClient.end();
  }

  console.log('[PostgreSQL Init] Completed successfully.');
}

if (require.main === module || process.argv[1]?.endsWith('init-postgres.ts')) {
  initPostgres()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[PostgreSQL Init Failed]', err);
      process.exit(1);
    });
}
