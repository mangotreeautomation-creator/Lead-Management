-- ==============================================================================
-- LEADPULSE ENTERPRISE: EXTENSIONS & SCHEMA PRIVILEGES
-- Run this inside 'lead_management_dev' database
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

GRANT ALL ON SCHEMA public TO lead_app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO lead_app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO lead_app_user;
