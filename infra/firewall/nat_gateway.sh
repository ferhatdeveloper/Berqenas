#!/bin/bash
# Berqenas NAT Gateway Management
# Exposes tenant VPN subnet services to public via NAT

set -e

# Configuration
TENANT_NAME=$1
TENANT_ID=$2
SERVICE_PORT=$3
PUBLIC_PORT=$4
ACTION=${5:-"enable"}  # enable or disable

TENANT_SUBNET="10.60.${TENANT_ID}.0/24"
TENANT_SERVICE_IP="10.60.${TENANT_ID}.10"
GATEWAY_PUBLIC_IP=$(curl -s ifconfig.me)

# Validate inputs
if [ -z "$TENANT_NAME" ] || [ -z "$TENANT_ID" ] || [ -z "$SERVICE_PORT" ] || [ -z "$PUBLIC_PORT" ]; then
    echo "Usage: $0 <tenant_name> <tenant_id> <service_port> <public_port> [enable|disable]"
    echo "Example: $0 acme 5 5432 15432 enable"
    exit 1
fi

echo "🌐 NAT Gateway Management for Tenant: $TENANT_NAME"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Tenant ID: $TENANT_ID"
echo "Tenant Subnet: $TENANT_SUBNET"
echo "Service IP: $TENANT_SERVICE_IP"
echo "Service Port: $SERVICE_PORT"
echo "Public Port: $PUBLIC_PORT"
echo "Gateway Public IP: $GATEWAY_PUBLIC_IP"
echo "Action: $ACTION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$ACTION" == "enable" ]; then
    echo "✅ Enabling public access..."
    
    # DNAT - Public port → VPN subnet
    echo "📝 Adding DNAT rule..."
    iptables -t nat -A PREROUTING \
        -p tcp --dport "$PUBLIC_PORT" \
        -j DNAT --to-destination "${TENANT_SERVICE_IP}:${SERVICE_PORT}" \
        -m comment --comment "berqenas-tenant-${TENANT_NAME}"
    
    # FORWARD - Allow forwarding
    echo "📝 Adding FORWARD rule..."
    iptables -A FORWARD \
        -p tcp -d "$TENANT_SERVICE_IP" --dport "$SERVICE_PORT" \
        -m state --state NEW,ESTABLISHED,RELATED \
        -j ACCEPT \
        -m comment --comment "berqenas-tenant-${TENANT_NAME}"
    
    # SNAT - Return traffic (if not already exists)
    if ! iptables -t nat -C POSTROUTING -s "$TENANT_SUBNET" -j MASQUERADE 2>/dev/null; then
        echo "📝 Adding SNAT rule..."
        iptables -t nat -A POSTROUTING \
            -s "$TENANT_SUBNET" \
            -j MASQUERADE \
            -m comment --comment "berqenas-tenant-${TENANT_NAME}"
    fi
    
    echo ""
    echo "✅ Public access enabled!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Public Endpoint: ${GATEWAY_PUBLIC_IP}:${PUBLIC_PORT}"
    echo "Routes to: ${TENANT_SERVICE_IP}:${SERVICE_PORT}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
elif [ "$ACTION" == "disable" ]; then
    echo "❌ Disabling public access..."
    
    # Remove DNAT rule
    echo "📝 Removing DNAT rule..."
    iptables -t nat -D PREROUTING \
        -p tcp --dport "$PUBLIC_PORT" \
        -j DNAT --to-destination "${TENANT_SERVICE_IP}:${SERVICE_PORT}" \
        -m comment --comment "berqenas-tenant-${TENANT_NAME}" 2>/dev/null || true
    
    # Remove FORWARD rule
    echo "📝 Removing FORWARD rule..."
    iptables -D FORWARD \
        -p tcp -d "$TENANT_SERVICE_IP" --dport "$SERVICE_PORT" \
        -m state --state NEW,ESTABLISHED,RELATED \
        -j ACCEPT \
        -m comment --comment "berqenas-tenant-${TENANT_NAME}" 2>/dev/null || true
    
    echo ""
    echo "✅ Public access disabled!"
    echo "Service is now VPN-only"
    
else
    echo "❌ Invalid action: $ACTION (use 'enable' or 'disable')"
    exit 1
fi

# Save iptables rules
echo ""
echo "💾 Saving iptables rules..."
if command -v netfilter-persistent &> /dev/null; then
    netfilter-persistent save
elif command -v iptables-save &> /dev/null; then
    iptables-save > /etc/iptables/rules.v4
fi

# Audit log
echo "📋 Logging to audit trail..."
psql -h localhost -U postgres -d berqenas <<SQL
INSERT INTO security.audit_log (
    tenant,
    event_type,
    actor,
    action,
    resource,
    metadata,
    severity
) VALUES (
    '$TENANT_NAME',
    'nat_gateway_${ACTION}',
    'system',
    '${ACTION}',
    'public_port_${PUBLIC_PORT}',
    jsonb_build_object(
        'tenant_id', $TENANT_ID,
        'service_ip', '$TENANT_SERVICE_IP',
        'service_port', $SERVICE_PORT,
        'public_port', $PUBLIC_PORT,
        'gateway_ip', '$GATEWAY_PUBLIC_IP'
    ),
    'info'
);
SQL

echo ""
echo "🎉 NAT Gateway configuration completed!"
