-- Create central database (untuk data tenant, user, subscription, dll)
-- Database ini akan di-create otomatis oleh PostgreSQL saat container start

-- Set default encoding
SET CLIENT_ENCODING TO 'UTF8';

-- Create schema publik untuk central database
CREATE SCHEMA IF NOT EXISTS public;

-- Comments untuk dokumentasi
COMMENT ON SCHEMA public IS 'Central database schema untuk multi-tenant gym management system';

-- Database init done
-- Schema details akan dibuat oleh Laravel migrations