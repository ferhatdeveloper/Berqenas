-- Berqenas MSSQL Tenant Creation Script
-- Creates isolated database for tenant with resource limits

USE master;
GO

-- 1. Create isolated database
CREATE DATABASE tenant_:tenant_name;
GO

-- 2. Create login
CREATE LOGIN tenant_:tenant_name_user
WITH PASSWORD = ':tenant_password';
GO

-- 3. Switch to tenant database
USE tenant_:tenant_name;
GO

-- 4. Create user and grant permissions
CREATE USER tenant_:tenant_name_user FOR LOGIN tenant_:tenant_name_user;
ALTER ROLE db_datareader ADD MEMBER tenant_:tenant_name_user;
ALTER ROLE db_datawriter ADD MEMBER tenant_:tenant_name_user;
ALTER ROLE db_ddladmin ADD MEMBER tenant_:tenant_name_user;
GO

PRINT 'MSSQL Tenant created: tenant_:tenant_name';
GO
