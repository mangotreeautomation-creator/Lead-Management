-- ==============================================================================
-- LEADPULSE ENTERPRISE: SAFE & NON-DESTRUCTIVE POSTGRESQL INITIALIZATION
-- 100% Pure SQL Compatible with pgAdmin 4 Query Tool & psql
-- NEVER DROPS DATABASES. Enforces Principle of Least Privilege (No SUPERUSER, No CREATEDB).
-- ==============================================================================

-- STEP 1: Create or verify least-privilege application user (Run in 'postgres' database)
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE rolname = 'lead_app_user') THEN
      CREATE ROLE lead_app_user WITH 
         LOGIN 
         ENCRYPTED PASSWORD 'dev_secret_lead_pass_2026'
         NOSUPERUSER 
         NOCREATEDB 
         NOCREATEROLE;
      RAISE NOTICE 'Role lead_app_user created successfully with least privilege.';
   ELSE
      ALTER ROLE lead_app_user WITH 
         LOGIN
         ENCRYPTED PASSWORD 'dev_secret_lead_pass_2026'
         NOSUPERUSER 
         NOCREATEDB 
         NOCREATEROLE;
      RAISE NOTICE 'Role lead_app_user verified with least privilege.';
   END IF;
END
$do$;

-- STEP 2: Create Development Database (Run in 'postgres' database)
-- Note: If already created, PostgreSQL will report 'already exists' without modifying data.
CREATE DATABASE lead_management_dev WITH OWNER = lead_app_user ENCODING = 'UTF8';

-- STEP 3: Grant database connection & privileges to application user
GRANT ALL PRIVILEGES ON DATABASE lead_management_dev TO lead_app_user;
