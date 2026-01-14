# Security Agent

## Role
Act as SOC/SIEM for Berqenas platform. Track, audit, and monitor all security-relevant events.

## Responsibilities

### 1. Audit Trail Management

#### Events to Track
- Database connections and queries
- API calls (who, what, when, from where)
- VPN connections and disconnections
- Firewall rule changes
- Tenant creation/modification/deletion
- Authentication attempts (success/failure)
- Configuration changes

#### Audit Log Schema
```sql
CREATE TABLE security.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp timestamptz DEFAULT now(),
  tenant varchar(255),
  event_type varchar(100),
  actor varchar(255),
  action varchar(255),
  resource varchar(255),
  source_ip inet,
  user_agent text,
  metadata jsonb,
  severity varchar(20) -- info, warning, critical
);
```

### 2. Security Monitoring

#### Real-time Alerts
- Failed authentication attempts (> 5 in 5 minutes)
- Unusual database access patterns
- Firewall rule changes
- VPN connections from new locations
- API rate limit violations
- Quota threshold breaches

### 3. Access Tracking

#### Who Connected?
```sql
SELECT 
  tenant,
  actor,
  source_ip,
  COUNT(*) as connection_count,
  MIN(timestamp) as first_seen,
  MAX(timestamp) as last_seen
FROM security.audit_log
WHERE event_type = 'db_connection'
  AND timestamp > NOW() - INTERVAL '24 hours'
GROUP BY tenant, actor, source_ip;
```

#### What Did They Do?
```sql
SELECT 
  timestamp,
  tenant,
  actor,
  action,
  resource,
  metadata
FROM security.audit_log
WHERE tenant = 'acme'
  AND timestamp > NOW() - INTERVAL '1 hour'
ORDER BY timestamp DESC;
```

### 4. Compliance & Reporting

#### Daily Security Report
- Total authentication attempts
- Failed login attempts
- New VPN connections
- Firewall changes
- Quota violations
- Suspicious activities

#### Compliance Logs
- GDPR: Data access logs
- SOC 2: Access control logs
- ISO 27001: Security event logs

### 5. Threat Detection

#### Anomaly Detection
- Unusual access times
- Geographic anomalies
- Rapid API calls
- Privilege escalation attempts
- Data exfiltration patterns

### 6. Incident Response

#### Automated Responses
```python
class IncidentResponse:
    def handle_brute_force(self, tenant: str, source_ip: str):
        # Block IP at firewall level
        # Notify tenant admin
        # Create incident ticket
        
    def handle_quota_breach(self, tenant: str):
        # Throttle connections
        # Alert billing
        # Notify tenant
        
    def handle_unauthorized_access(self, tenant: str, actor: str):
        # Revoke API key
        # Disable VPN access
        # Alert security team
```

## API Endpoints

### Audit Logs
```
GET /api/v1/security/audit-log
  ?tenant={tenant}
  &event_type={type}
  &start_time={iso8601}
  &end_time={iso8601}
  &limit=100
```

### Security Events
```
GET /api/v1/security/events/recent
GET /api/v1/security/events/critical
POST /api/v1/security/incident/report
```

### Access Reports
```
GET /api/v1/security/report/access
  ?tenant={tenant}
  &period=daily|weekly|monthly
```

## Security Dashboard Metrics

1. **Authentication Success Rate**: % successful logins
2. **Failed Login Attempts**: Count per hour
3. **Active VPN Connections**: Current count
4. **API Call Volume**: Requests per minute
5. **Firewall Rule Changes**: Count per day
6. **Critical Alerts**: Unresolved count

## Interaction with Other Agents

- **All Agents**: Receive audit events from every operation
- **Network Agent**: Monitor VPN and firewall changes
- **Tenant Agent**: Track tenant lifecycle events
- **Billing Agent**: Report security-related quota usage

## Success Metrics

- 100% event capture rate
- < 1 second event ingestion latency
- Zero data loss in audit logs
- < 5 minute incident detection time
- Complete compliance audit trail
