# Remote Database Sync via WireGuard

**Connect on-premise databases to Berqenas Cloud and expose as public APIs**

## Overview

Berqenas Cloud Panel can connect to your on-premise databases via WireGuard VPN, sync data, and automatically expose them as public REST APIs.

## Architecture

```
[On-Premise Database]
   └── MSSQL/PostgreSQL
         └── WireGuard Client (10.60.5.10)
               ↓ VPN Tunnel
         [Berqenas Cloud]
               └── Connects via WireGuard IP
               └── Syncs Data
               └── Generates API
               └── Exposes Publicly
                     ↓
         [Internet]
               └── Public API: https://api.berqenas.com/remote/1
```

## Use Cases

### 1. Legacy System Modernization
- On-premise ERP/CRM database
- Connect via WireGuard
- Auto-generate modern REST API
- Expose to mobile apps/web

### 2. Data Replication
- Sync on-premise data to cloud
- Real-time or scheduled sync
- Disaster recovery
- Analytics in cloud

### 3. Hybrid Cloud
- Keep sensitive data on-premise
- Expose specific tables via API
- Control access via Berqenas

## Features

### ✅ Multi-Database Support
- PostgreSQL
- MSSQL
- MySQL (coming soon)

### ✅ Sync Modes
- **Full Sync**: Complete database copy
- **Incremental**: Only changed data
- **Realtime**: Live replication

### ✅ Auto-API Generation
- Automatic CRUD endpoints
- Type-safe Pydantic models
- OpenAPI documentation

### ✅ Security
- VPN-only access
- Encrypted data transfer
- API key authentication
- IP whitelist

## Setup Guide

### Step 1: Setup WireGuard on On-Premise Server

```bash
# On your on-premise server
berqenas vpn client-create --tenant yourcompany --device db-server

# This generates WireGuard config
# Apply it to your server
```

### Step 2: Register Remote Database

#### Via API
```http
POST /api/v1/sync/remote-db/register
Content-Type: application/json

{
  "name": "customer_erp",
  "database_type": "mssql",
  "wireguard_ip": "10.60.5.10",
  "database_host": "10.60.5.10",
  "database_port": 1433,
  "database_name": "ERP_Production",
  "username": "berqenas_sync",
  "password": "secure_password",
  "schema": "dbo"
}
```

#### Via CLI
```bash
berqenas sync register \
  --name customer_erp \
  --type mssql \
  --wg-ip 10.60.5.10 \
  --host 10.60.5.10 \
  --port 1433 \
  --database ERP_Production \
  --username berqenas_sync \
  --password secure_password
```

### Step 3: Sync Data

```bash
# One-time sync
berqenas sync run customer_erp

# Schedule sync (every hour)
berqenas sync schedule customer_erp --cron "0 * * * *"
```

### Step 4: Generate Public API

```bash
# Generate API from synced data
berqenas sync generate-api customer_erp

# Enable public access
berqenas sync enable-public customer_erp
```

### Step 5: Access Public API

```bash
# Your database is now accessible via REST API
curl https://api.berqenas.com/remote/1/customers \
  -H "X-API-Key: your_api_key"
```

## API Endpoints

### Remote Database Management

```http
# Register remote database
POST /api/v1/sync/remote-db/register

# List remote databases
GET /api/v1/sync/remote-db

# Get database status
GET /api/v1/sync/remote-db/{db_id}/status

# Delete remote database
DELETE /api/v1/sync/remote-db/{db_id}
```

### Data Sync

```http
# Start sync
POST /api/v1/sync/remote-db/{db_id}/sync

# Get sync status
GET /api/v1/sync/remote-db/{db_id}/sync/status
```

### API Generation

```http
# Generate API
POST /api/v1/sync/remote-db/{db_id}/generate-api

# Enable public access
POST /api/v1/sync/remote-db/{db_id}/enable-public
```

## Example Workflow

### Scenario: Expose On-Premise ERP to Mobile App

```bash
# 1. Create tenant
berqenas tenant create --name acme --vpn

# 2. Setup WireGuard on ERP server
berqenas vpn client-create --tenant acme --device erp-server
# Apply generated config to ERP server

# 3. Register ERP database
berqenas sync register \
  --name acme_erp \
  --type mssql \
  --wg-ip 10.60.5.10 \
  --database ERP_Production

# 4. Sync data
berqenas sync run acme_erp

# 5. Generate API
berqenas sync generate-api acme_erp

# 6. Enable public access
berqenas sync enable-public acme_erp

# 7. Mobile app can now access:
# GET https://api.berqenas.com/remote/acme_erp/customers
# GET https://api.berqenas.com/remote/acme_erp/orders
# POST https://api.berqenas.com/remote/acme_erp/invoices
```

## Security Best Practices

### 1. Network Security
- ✅ Use WireGuard VPN (encrypted tunnel)
- ✅ Never expose database directly to internet
- ✅ Use firewall rules

### 2. Database Security
- ✅ Create read-only user for sync
- ✅ Grant minimal permissions
- ✅ Use strong passwords

### 3. API Security
- ✅ API key authentication
- ✅ IP whitelist
- ✅ Rate limiting
- ✅ Audit logging

## Sync Configuration

### Full Sync
```json
{
  "sync_mode": "full",
  "schedule": "0 2 * * *"  // Daily at 2 AM
}
```

### Incremental Sync
```json
{
  "sync_mode": "incremental",
  "timestamp_column": "updated_at",
  "schedule": "*/15 * * * *"  // Every 15 minutes
}
```

### Realtime Sync
```json
{
  "sync_mode": "realtime",
  "method": "trigger"  // Database triggers
}
```

## Monitoring

### Check Sync Status
```bash
berqenas sync status acme_erp
```

### View Sync Logs
```bash
berqenas sync logs acme_erp --tail 100
```

### Sync Metrics
- Last sync time
- Records synced
- Sync duration
- Error count

## Limitations

- Maximum database size: 100GB (configurable)
- Sync frequency: Minimum 5 minutes
- Concurrent syncs: 5 per tenant

## Pricing

- **Basic**: 1 remote database, daily sync
- **Pro**: 5 remote databases, hourly sync
- **Enterprise**: Unlimited, realtime sync

## Support

For issues or questions:
- Documentation: docs/REMOTE_SYNC.md
- Support: support@berqenas.com
