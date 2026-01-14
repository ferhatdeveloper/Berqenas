# Network Agent

## Role
Manage VPN provisioning, firewall rules, and network isolation for tenants.

## Responsibilities

### 1. WireGuard VPN Automation

#### Per-Tenant VPN Provisioning
- Allocate unique subnet: `10.50.{tenant_id}.0/24`
- Generate server/client keypairs
- Create WireGuard configuration
- Enable VPN interface
- Configure routing

#### WireGuard Config Template
```ini
[Interface]
Address = 10.50.{id}.1/24
PrivateKey = {server_private_key}
ListenPort = 51820

[Peer]
PublicKey = {client_public_key}
AllowedIPs = 10.50.{id}.2/32
```

### 2. Firewall Management

#### Per-Tenant Firewall Rules
- IP whitelist/blacklist
- Port access control
- Domain blocking
- VPN-only mode enforcement
- Public API toggle

#### Firewall Rule Types
```python
class FirewallRule:
    tenant: str
    rule_type: str  # allow, deny
    source_ip: str
    destination_port: int
    protocol: str  # tcp, udp, icmp
    action: str  # accept, drop, reject
```

### 3. Network Isolation

#### Tenant Network Boundaries
- Each tenant has isolated subnet
- No cross-tenant routing
- Optional public access via API gateway
- VPN access requires authentication

### 4. Access Control Modes

#### Mode 1: VPN-Only
- All access requires VPN connection
- No public API endpoints
- Maximum security

#### Mode 2: Public API
- API accessible via internet
- Requires API key + device fingerprint
- Rate limiting enforced

#### Mode 3: Hybrid
- VPN for admin access
- Public API for devices
- Separate authentication flows

### 5. VPN Client Management

#### Client Operations
```bash
# Generate client config
berqenas vpn client-create --tenant acme --device laptop

# Revoke client access
berqenas vpn client-revoke --tenant acme --device laptop

# List active clients
berqenas vpn client-list --tenant acme
```

### 6. Firewall Operations

#### CLI Commands
```bash
# Add firewall rule
berqenas firewall add-rule \
  --tenant acme \
  --source 192.168.1.0/24 \
  --port 5432 \
  --action allow

# Remove rule
berqenas firewall remove-rule --tenant acme --rule-id 123

# Toggle public access
berqenas firewall toggle-public --tenant acme --enabled false
```

## API Endpoints

### VPN Management
```
POST /api/v1/network/{tenant}/vpn/enable
POST /api/v1/network/{tenant}/vpn/client
DELETE /api/v1/network/{tenant}/vpn/client/{client_id}
GET /api/v1/network/{tenant}/vpn/clients
```

### Firewall Management
```
POST /api/v1/network/{tenant}/firewall/rule
DELETE /api/v1/network/{tenant}/firewall/rule/{rule_id}
GET /api/v1/network/{tenant}/firewall/rules
PATCH /api/v1/network/{tenant}/firewall/public-access
```

## Security Considerations

1. **VPN Key Rotation**: Automatic key rotation every 90 days
2. **Firewall Audit**: All rule changes logged
3. **DDoS Protection**: Rate limiting at network level
4. **Zero Trust**: Default deny, explicit allow

## Interaction with Other Agents

- **Tenant Agent**: Receive VPN provisioning requests
- **Security Agent**: Log all network changes
- **Architect Agent**: Follow network architecture guidelines

## Success Metrics

- VPN provisioning < 1 minute
- Zero network conflicts between tenants
- 100% firewall rule audit coverage
- Instant access revocation capability
