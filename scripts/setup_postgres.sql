-- ==============================================================================
-- LEADPULSE ENTERPRISE: DATABASE & APPLICATION USER INITIALIZATION SCRIPT
-- Execute this script in pgAdmin 4 (Query Tool) connected as superuser 'postgres'
-- ==============================================================================

-- 1. Create the dedicated application database user (if not exists)
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'lead_app_user') THEN
      CREATE USER lead_app_user WITH ENCRYPTED PASSWORD 'dev_secret_lead_pass_2026';
   ELSE
      ALTER USER lead_app_user WITH ENCRYPTED PASSWORD 'dev_secret_lead_pass_2026';
   END IF;
END
$do$;

-- 2. Terminate existing connections to allow database recreation if needed
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname IN ('lead_management_dev', 'lead_management_test')
  AND pid <> pg_backend_pid();

-- 3. Create Development Database
DROP DATABASE IF EXISTS lead_management_dev;
CREATE DATABASE lead_management_dev WITH OWNER = lead_app_user ENCODING = 'UTF8';

-- 4. Create Testing Database
DROP DATABASE IF EXISTS lead_management_test;
CREATE DATABASE lead_management_test WITH OWNER = lead_app_user ENCODING = 'UTF8';

-- 5. Grant Permissions to lead_app_user
GRANT ALL PRIVILEGES ON DATABASE lead_management_dev TO lead_app_user;
GRANT ALL PRIVILEGES ON DATABASE lead_management_test TO lead_app_user;

-- 6. Connect to development database and grant schema privileges
\c lead_management_dev
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
GRANT ALL ON SCHEMA public TO lead_app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO lead_app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO lead_app_user;
