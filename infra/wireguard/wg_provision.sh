#!/bin/bash
# Berqenas WireGuard Provisioning Script
# Automatically provisions VPN for a new tenant

set -e

# Configuration
TENANT_NAME=$1
TENANT_ID=$2
SERVER_PUBLIC_IP=${3:-"YOUR_SERVER_IP"}
WG_CONFIG_DIR="/etc/wireguard"
CLIENT_CONFIG_DIR="/var/berqenas/vpn/clients"

# Validate inputs
if [ -z "$TENANT_NAME" ] || [ -z "$TENANT_ID" ]; then
    echo "Usage: $0 <tenant_name> <tenant_id> [server_public_ip]"
    echo "Example: $0 acme 1 203.0.113.10"
    exit 1
fi

echo "🔧 Provisioning WireGuard VPN for tenant: $TENANT_NAME (ID: $TENANT_ID)"

# Generate server keys if not exists
SERVER_PRIVATE_KEY_FILE="$WG_CONFIG_DIR/server_${TENANT_ID}_private.key"
SERVER_PUBLIC_KEY_FILE="$WG_CONFIG_DIR/server_${TENANT_ID}_public.key"

if [ ! -f "$SERVER_PRIVATE_KEY_FILE" ]; then
    echo "📝 Generating server keys..."
    wg genkey | tee "$SERVER_PRIVATE_KEY_FILE" | wg pubkey > "$SERVER_PUBLIC_KEY_FILE"
    chmod 600 "$SERVER_PRIVATE_KEY_FILE"
fi

SERVER_PRIVATE_KEY=$(cat "$SERVER_PRIVATE_KEY_FILE")
SERVER_PUBLIC_KEY=$(cat "$SERVER_PUBLIC_KEY_FILE")

# Generate client keys
echo "📝 Generating client keys..."
CLIENT_PRIVATE_KEY=$(wg genkey)
CLIENT_PUBLIC_KEY=$(echo "$CLIENT_PRIVATE_KEY" | wg pubkey)

# Create server configuration
echo "⚙️  Creating server configuration..."
cat > "$WG_CONFIG_DIR/wg${TENANT_ID}.conf" <<EOF
[Interface]
Address = 10.50.${TENANT_ID}.1/24
PrivateKey = $SERVER_PRIVATE_KEY
ListenPort = $((51820 + TENANT_ID))
SaveConfig = false

PostUp = iptables -A FORWARD -i wg${TENANT_ID} -j ACCEPT
PostUp = iptables -A FORWARD -o wg${TENANT_ID} -j ACCEPT
PostUp = iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE

PostDown = iptables -D FORWARD -i wg${TENANT_ID} -j ACCEPT
PostDown = iptables -D FORWARD -o wg${TENANT_ID} -j ACCEPT
PostDown = iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE

[Peer]
PublicKey = $CLIENT_PUBLIC_KEY
AllowedIPs = 10.50.${TENANT_ID}.2/32
PersistentKeepalive = 25
EOF

# Create client configuration
echo "📱 Creating client configuration..."
mkdir -p "$CLIENT_CONFIG_DIR/$TENANT_NAME"

cat > "$CLIENT_CONFIG_DIR/$TENANT_NAME/client.conf" <<EOF
[Interface]
PrivateKey = $CLIENT_PRIVATE_KEY
Address = 10.50.${TENANT_ID}.2/24
DNS = 1.1.1.1, 8.8.8.8

[Peer]
PublicKey = $SERVER_PUBLIC_KEY
Endpoint = ${SERVER_PUBLIC_IP}:$((51820 + TENANT_ID))
AllowedIPs = 10.50.${TENANT_ID}.0/24
PersistentKeepalive = 25
EOF

# Save keys for reference
cat > "$CLIENT_CONFIG_DIR/$TENANT_NAME/keys.txt" <<EOF
Tenant: $TENANT_NAME
Tenant ID: $TENANT_ID
Server Public Key: $SERVER_PUBLIC_KEY
Client Private Key: $CLIENT_PRIVATE_KEY
Client Public Key: $CLIENT_PUBLIC_KEY
VPN Subnet: 10.50.${TENANT_ID}.0/24
Server IP: 10.50.${TENANT_ID}.1
Client IP: 10.50.${TENANT_ID}.2
Listen Port: $((51820 + TENANT_ID))
EOF

# Enable and start WireGuard interface
echo "🚀 Starting WireGuard interface..."
wg-quick up wg${TENANT_ID}

# Enable at boot
systemctl enable wg-quick@wg${TENANT_ID}

# Generate QR code for mobile clients
if command -v qrencode &> /dev/null; then
    echo "📲 Generating QR code..."
    qrencode -t ansiutf8 < "$CLIENT_CONFIG_DIR/$TENANT_NAME/client.conf"
    qrencode -o "$CLIENT_CONFIG_DIR/$TENANT_NAME/client-qr.png" < "$CLIENT_CONFIG_DIR/$TENANT_NAME/client.conf"
fi

echo ""
echo "✅ WireGuard VPN provisioned successfully!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Tenant: $TENANT_NAME"
echo "VPN Subnet: 10.50.${TENANT_ID}.0/24"
echo "Server IP: 10.50.${TENANT_ID}.1"
echo "Client IP: 10.50.${TENANT_ID}.2"
echo "Listen Port: $((51820 + TENANT_ID))"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Client config: $CLIENT_CONFIG_DIR/$TENANT_NAME/client.conf"
echo ""
echo "To connect:"
echo "  wg-quick up $CLIENT_CONFIG_DIR/$TENANT_NAME/client.conf"
echo ""
