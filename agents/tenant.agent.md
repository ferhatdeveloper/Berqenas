# Tenant Agent

## Role
Manage tenant lifecycle from onboarding to offboarding.

## Responsibilities

### 1. Tenant Onboarding
Automate complete tenant provisioning with a single command:

```bash
berqenas tenant create \
  --name acme \
  --db-quota 5GB \
  --vpn enabled \
  --public-api true
```

#### Onboarding Steps
1. Create PostgreSQL schema
2. Create dedicated database role
3. Set quota limits
4. Generate API keys
5. Provision VPN subnet (if enabled)
6. Configure firewall rules
7. Setup backup policy
8. Create audit log entry

### 2. Schema Management

#### Schema Creation Template
```sql
-- Create isolated schema
CREATE SCHEMA tenant_{name};

-- Create dedicated role
CREATE ROLE tenant_{name}_user LOGIN PASSWORD '{secure_password}';

-- Grant permissions
GRANT USAGE ON SCHEMA tenant_{name} TO tenant_{name}_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA tenant_{name}
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO tenant_{name}_user;

-- Set quota
ALTER ROLE tenant_{name}_user SET temp_file_limit = '{quota}';
```

### 3. Tenant Configuration

Each tenant has:
- **Unique schema name**: `tenant_{name}`
- **Database role**: `tenant_{name}_user`
- **API key**: UUID-based, revocable
- **VPN subnet**: `10.50.{id}.0/24`
- **Quota limits**: Disk, connections, realtime events
- **Access mode**: Public, VPN-only, or hybrid

### 4. Quota Enforcement

Monitor and enforce:
- **Disk usage**: Per-schema storage
- **Connection count**: Max concurrent connections
- **Realtime events**: Events per minute/hour
- **API calls**: Rate limiting

### 5. Tenant Offboarding

Reversible deletion process:
1. Disable API access
2. Revoke VPN access
3. Create final backup
4. Archive tenant data
5. Drop schema (after retention period)
6. Audit log entry

## API Endpoints

### Create Tenant
```
POST /api/v1/tenant
{
  "name": "acme",
  "db_quota": "5GB",
  "vpn_enabled": true,
  "public_api": true
}
```

### Get Tenant Info
```
GET /api/v1/tenant/{tenant_name}
```

### Update Tenant
```
PATCH /api/v1/tenant/{tenant_name}
{
  "db_quota": "10GB",
  "public_api": false
}
```

### Delete Tenant
```
DELETE /api/v1/tenant/{tenant_name}
```

## Interaction with Other Agents

- **Network Agent**: Request VPN subnet and firewall rules
- **Security Agent**: Log all tenant operations
- **Billing Agent**: Report tenant creation for billing
- **Realtime Agent**: Setup event tables for tenant

## Success Metrics

- Tenant onboarding < 5 minutes
- Zero manual SQL execution
- 100% reversible operations
- Complete audit trail
