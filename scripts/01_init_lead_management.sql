-- ==============================================================================
-- LEADPULSE ENTERPRISE: DATABASE & APPLICATION USER INITIALIZATION
-- Run this in pgAdmin 4 (connected to server 'PostgreSQL 16' -> database 'postgres')
-- ==============================================================================

-- 1. Create or update the application user
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE rolname = 'lead_app_user') THEN
      CREATE USER lead_app_user WITH ENCRYPTED PASSWORD 'dev_secret_lead_pass_2026';
   ELSE
      ALTER USER lead_app_user WITH ENCRYPTED PASSWORD 'dev_secret_lead_pass_2026';
   END IF;
END
$do$;

-- 2. Grant superuser/createdb permissions for local development convenience
ALTER USER lead_app_user WITH CREATEDB;

-- 3. Terminate existing connections to allow database recreation
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname IN ('lead_management_dev', 'lead_management_test')
  AND pid <> pg_backend_pid();

-- 4. Create Development & Testing Databases
DROP DATABASE IF EXISTS lead_management_dev;
CREATE DATABASE lead_management_dev WITH OWNER = lead_app_user ENCODING = 'UTF8';

DROP DATABASE IF EXISTS lead_management_test;
CREATE DATABASE lead_management_test WITH OWNER = lead_app_user ENCODING = 'UTF8';

-- 5. Grant Privileges
GRANT ALL PRIVILEGES ON DATABASE lead_management_dev TO lead_app_user;
GRANT ALL PRIVILEGES ON DATABASE lead_management_test TO lead_app_user;
