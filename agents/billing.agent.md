# Billing Agent

## Role
Calculate tenant usage, enforce quotas, and prepare billing data.

## Responsibilities

### 1. Usage Tracking

#### Metrics to Track
- **Disk Usage**: Per-schema storage in GB
- **Connection Count**: Active database connections
- **Realtime Events**: Events ingested per period
- **API Calls**: HTTP requests per period
- **VPN Data Transfer**: Bytes in/out
- **Backup Storage**: Backup size in GB

### 2. Usage Calculation

#### Disk Usage Query
```sql
SELECT 
  schemaname,
  pg_size_pretty(
    SUM(pg_total_relation_size(schemaname || '.' || tablename))
  ) as total_size,
  SUM(pg_total_relation_size(schemaname || '.' || tablename)) as bytes
FROM pg_tables
WHERE schemaname LIKE 'tenant_%'
GROUP BY schemaname;
```

#### Connection Count
```sql
SELECT 
  usename as tenant_user,
  COUNT(*) as active_connections
FROM pg_stat_activity
WHERE usename LIKE 'tenant_%_user'
GROUP BY usename;
```

#### Realtime Events Count
```sql
SELECT 
  COUNT(*) as event_count,
  DATE_TRUNC('hour', timestamp) as hour
FROM tenant_{name}.events
WHERE timestamp > NOW() - INTERVAL '24 hours'
GROUP BY hour;
```

### 3. Quota Enforcement

#### Quota Limits Schema
```sql
CREATE TABLE billing.tenant_quotas (
  tenant varchar(255) PRIMARY KEY,
  disk_quota_gb integer DEFAULT 5,
  max_connections integer DEFAULT 20,
  events_per_hour integer DEFAULT 10000,
  api_calls_per_day integer DEFAULT 100000,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### Quota Enforcement Logic
```python
class QuotaEnforcer:
    def check_disk_quota(self, tenant: str) -> bool:
        current_usage = get_disk_usage(tenant)
        quota = get_quota(tenant, 'disk_quota_gb')
        return current_usage < quota * 1024 * 1024 * 1024
    
    def check_connection_quota(self, tenant: str) -> bool:
        current_connections = get_active_connections(tenant)
        quota = get_quota(tenant, 'max_connections')
        return current_connections < quota
    
    def check_event_quota(self, tenant: str) -> bool:
        events_this_hour = get_event_count(tenant, hours=1)
        quota = get_quota(tenant, 'events_per_hour')
        return events_this_hour < quota
```

### 4. Billing Calculation

#### Usage Billing Schema
```sql
CREATE TABLE billing.usage_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant varchar(255) NOT NULL,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  disk_usage_gb numeric(10,2),
  connection_hours numeric(10,2),
  event_count bigint,
  api_call_count bigint,
  vpn_data_gb numeric(10,2),
  backup_storage_gb numeric(10,2),
  total_amount numeric(10,2),
  currency varchar(3) DEFAULT 'USD',
  created_at timestamptz DEFAULT now()
);
```

#### Pricing Model
```python
class PricingCalculator:
    PRICES = {
        'disk_gb_per_month': 0.10,      # $0.10 per GB
        'connection_hour': 0.01,         # $0.01 per connection-hour
        'event_1000': 0.001,             # $0.001 per 1000 events
        'api_call_1000': 0.002,          # $0.002 per 1000 API calls
        'vpn_gb': 0.05,                  # $0.05 per GB transferred
        'backup_gb_per_month': 0.05      # $0.05 per GB backup
    }
    
    def calculate_monthly_bill(self, usage: UsageRecord) -> float:
        total = 0
        total += usage.disk_usage_gb * self.PRICES['disk_gb_per_month']
        total += usage.connection_hours * self.PRICES['connection_hour']
        total += (usage.event_count / 1000) * self.PRICES['event_1000']
        total += (usage.api_call_count / 1000) * self.PRICES['api_call_1000']
        total += usage.vpn_data_gb * self.PRICES['vpn_gb']
        total += usage.backup_storage_gb * self.PRICES['backup_gb_per_month']
        return round(total, 2)
```

### 5. Billing Reports

#### Monthly Invoice
```python
def generate_invoice(tenant: str, year: int, month: int):
    usage = get_usage_for_period(tenant, year, month)
    
    return {
        'tenant': tenant,
        'period': f'{year}-{month:02d}',
        'breakdown': {
            'disk_storage': {
                'usage_gb': usage.disk_usage_gb,
                'rate': PRICES['disk_gb_per_month'],
                'amount': usage.disk_usage_gb * PRICES['disk_gb_per_month']
            },
            'connections': {
                'hours': usage.connection_hours,
                'rate': PRICES['connection_hour'],
                'amount': usage.connection_hours * PRICES['connection_hour']
            },
            'realtime_events': {
                'count': usage.event_count,
                'rate_per_1000': PRICES['event_1000'],
                'amount': (usage.event_count / 1000) * PRICES['event_1000']
            },
            # ... other items
        },
        'total': usage.total_amount,
        'currency': 'USD'
    }
```

### 6. Payment Integration

#### Supported Payment Providers
- Stripe
- Iyzico (Turkey)
- Manual invoice

#### Payment Webhook Handler
```python
@app.post("/webhook/stripe/payment")
async def handle_stripe_payment(payload: dict):
    # Verify webhook signature
    # Update payment status
    # Send receipt email
    # Unlock tenant if suspended
```

## API Endpoints

### Usage Metrics
```
GET /api/v1/billing/{tenant}/usage/current
GET /api/v1/billing/{tenant}/usage/history
  ?start_date={date}
  &end_date={date}
```

### Quota Management
```
GET /api/v1/billing/{tenant}/quota
PATCH /api/v1/billing/{tenant}/quota
{
  "disk_quota_gb": 10,
  "max_connections": 50
}
```

### Billing & Invoices
```
GET /api/v1/billing/{tenant}/invoice/{year}/{month}
GET /api/v1/billing/{tenant}/invoices
POST /api/v1/billing/{tenant}/payment
```

## Quota Violation Actions

1. **Soft Limit (90%)**: Send warning email
2. **Hard Limit (100%)**: 
   - Block new connections
   - Throttle API calls
   - Reject new events
   - Send urgent notification

## Interaction with Other Agents

- **Tenant Agent**: Get quota settings during onboarding
- **Realtime Agent**: Count events for billing
- **Security Agent**: Log quota violations
- **Network Agent**: Track VPN data transfer

## Success Metrics

- Accurate usage tracking (±1% error)
- Real-time quota enforcement
- Automated monthly invoicing
- Zero billing disputes
- < 1 hour payment processing time
