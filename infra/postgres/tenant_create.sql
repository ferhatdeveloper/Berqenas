-- Berqenas Tenant Creation Script
-- This script creates a new isolated tenant with schema, role, and permissions

-- Variables (replace these with actual values)
-- :tenant_name - Name of the tenant (e.g., 'acme')
-- :tenant_password - Secure password for the tenant role
-- :disk_quota - Disk quota in GB (e.g., '5GB')

-- 1. Create isolated schema for tenant
CREATE SCHEMA IF NOT EXISTS tenant_:tenant_name;

-- 2. Create dedicated database role for tenant
CREATE ROLE tenant_:tenant_name_user WITH LOGIN PASSWORD ':tenant_password';

-- 3. Grant schema usage permission
GRANT USAGE ON SCHEMA tenant_:tenant_name TO tenant_:tenant_name_user;

-- 4. Grant default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA tenant_:tenant_name
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO tenant_:tenant_name_user;

-- 5. Grant default privileges for sequences
ALTER DEFAULT PRIVILEGES IN SCHEMA tenant_:tenant_name
  GRANT USAGE, SELECT ON SEQUENCES TO tenant_:tenant_name_user;

-- 6. Set quota limits
ALTER ROLE tenant_:tenant_name_user SET temp_file_limit = ':disk_quota';

-- 7. Set connection limit (default 20)
ALTER ROLE tenant_:tenant_name_user CONNECTION LIMIT 20;

-- 8. Set search path to tenant schema
ALTER ROLE tenant_:tenant_name_user SET search_path TO tenant_:tenant_name, public;

-- 9. Create metadata table for tenant info
CREATE TABLE IF NOT EXISTS public.tenants (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  schema_name VARCHAR(255) UNIQUE NOT NULL,
  role_name VARCHAR(255) UNIQUE NOT NULL,
  disk_quota_gb INTEGER NOT NULL,
  max_connections INTEGER DEFAULT 20,
  vpn_enabled BOOLEAN DEFAULT false,
  public_api_enabled BOOLEAN DEFAULT false,
  api_key UUID DEFAULT gen_random_uuid(),
  vpn_subnet VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'active'
);

-- 10. Insert tenant metadata
INSERT INTO public.tenants (
  name, 
  schema_name, 
  role_name, 
  disk_quota_gb,
  vpn_enabled,
  public_api_enabled
) VALUES (
  ':tenant_name',
  'tenant_:tenant_name',
  'tenant_:tenant_name_user',
  :disk_quota_value,
  :vpn_enabled,
  :public_api_enabled
);

-- 11. Create audit log entry
INSERT INTO security.audit_log (
  tenant,
  event_type,
  actor,
  action,
  resource,
  metadata
) VALUES (
  ':tenant_name',
  'tenant_created',
  'system',
  'create',
  'tenant_:tenant_name',
  jsonb_build_object(
    'schema', 'tenant_:tenant_name',
    'role', 'tenant_:tenant_name_user',
    'disk_quota_gb', :disk_quota_value
  )
);

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Tenant % created successfully', ':tenant_name';
  RAISE NOTICE 'Schema: tenant_%', ':tenant_name';
  RAISE NOTICE 'Role: tenant_%_user', ':tenant_name';
END $$;
