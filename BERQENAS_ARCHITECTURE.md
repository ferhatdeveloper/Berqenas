# Berqenas Cloud & Security
## Architecture, Automation & Security Blueprint
### (Antigravity / Agent-based Design)

---

## 1. Proje Özeti

**Berqenas**, çok kiracılı (multi-tenant), güvenlik odaklı, otomasyonla yönetilen bir **Cloud + Security Platform**'dur.

### Temel Hedefler

- ✅ **1 komut = 1 müşteri** (tenant)
- ✅ PostgreSQL 16 (schema isolation)
- ✅ Public / VPN kontrollü erişim
- ✅ WireGuard otomasyon
- ✅ Realtime (device → DB)
- ✅ API-first (FastAPI)
- ✅ SOC / Audit / Billing hazır
- ✅ White-label Control Panel

---

## 2. Temel Teknoloji Stack

| Katman | Teknoloji | Amaç |
|--------|-----------|------|
| **Database** | PostgreSQL 16 | Multi-tenant schema isolation |
| **Connection Pool** | pgBouncer | Connection pooling, DoS protection |
| **Backend API** | FastAPI | RESTful API, WebSocket support |
| **VPN** | WireGuard | Per-tenant VPN automation |
| **Firewall** | UFW/iptables | Per-tenant firewall rules |
| **Backup** | Backblaze B2 / S3 | Automated backup & restore |
| **Monitoring** | Prometheus + Grafana | Metrics & dashboards |
| **Caching** | Redis | Rate limiting, session management |
| **Container** | Docker | Service orchestration |

---

## 3. Domain & Access Model

```
┌─────────────────────────────────────────────────┐
│           Berqenas Platform                     │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────────┐         ┌──────────────┐    │
│  │ Public API   │         │  VPN Access  │    │
│  │ (Optional)   │         │  (WireGuard) │    │
│  └──────┬───────┘         └──────┬───────┘    │
│         │                        │             │
│         └────────┬───────────────┘             │
│                  │                             │
│         ┌────────▼────────┐                    │
│         │   Firewall      │                    │
│         │   (Per-Tenant)  │                    │
│         └────────┬────────┘                    │
│                  │                             │
│         ┌────────▼────────┐                    │
│         │   FastAPI       │                    │
│         │   Backend       │                    │
│         └────────┬────────┘                    │
│                  │                             │
│         ┌────────▼────────┐                    │
│         │   pgBouncer     │                    │
│         └────────┬────────┘                    │
│                  │                             │
│         ┌────────▼────────┐                    │
│         │  PostgreSQL 16  │                    │
│         │  (Multi-Tenant) │                    │
│         └─────────────────┘                    │
│                                                 │
└─────────────────────────────────────────────────┘
```

> **Not**: Her servis VPN panelinden tek tıkla **public ↔ VPN only** yapılabilir.

---

## 3.1 Public Gateway + VPN Subnet Model (KRİTİK MİMARİ)

### 🎯 Senaryo

**Server veya cihazda WireGuard olacak, bizim subnet'ten IP alacak, bu subnet'teki sistemi public açacağız.**

### Trafik Akışı

```
[Tenant Cihaz/Server]
   └── WireGuard Client
         └── IP: 10.60.5.10 (Berqenas subnet)
         └── Service: PostgreSQL :5432

         ↓ VPN Tunnel

[Berqenas Gateway]
   └── Public IP: 72.60.182.107
   └── WG Interface: wg-tenant-5 (10.60.5.1/24)
   └── NAT/Proxy

         ↓ Internet

[External Client]
   └── Connects to: 72.60.182.107:15432
         └── NAT → 10.60.5.10:5432
```

### Adım Adım Trafik

1. **Tenant cihazı WireGuard ile bağlanır**
   ```
   Cihaz → wg0 → 10.60.5.10
   ```

2. **Berqenas Gateway public request alır**
   ```
   Client → 72.60.182.107:15432
   ```

3. **Gateway NAT/Proxy yapar**
   ```
   72.60.182.107:15432 → 10.60.5.10:5432
   ```

4. **Trafik geri döner**
   ```
   10.60.5.10 → wg → gateway → client
   ```

### ÖNEMLİ: Public Olan Şey

❌ **Tenant DEĞİL**  
✅ **Gateway**

- Tenant: VPN içinde, asla internete direkt çıkmaz
- Public: Senin gateway'in, senin firewall'un, senin policy'in

### Teknik Uygulama

#### WireGuard Config (Tenant Cihazı)

```ini
# tenant-5.conf
[Interface]
Address = 10.60.5.10/32

[Peer]
PublicKey = GATEWAY_KEY
AllowedIPs = 10.60.5.0/24
Endpoint = 72.60.182.107:51820
PersistentKeepalive = 25
```

#### Gateway NAT (iptables)

```bash
# DNAT - Public port → VPN subnet
iptables -t nat -A PREROUTING \
  -p tcp --dport 15432 \
  -j DNAT --to-destination 10.60.5.10:5432

# FORWARD - Allow forwarding
iptables -A FORWARD \
  -p tcp -d 10.60.5.10 --dport 5432 \
  -m state --state NEW,ESTABLISHED,RELATED -j ACCEPT

# SNAT - Return traffic
iptables -t nat -A POSTROUTING \
  -s 10.60.5.0/24 \
  -j MASQUERADE
```

### Tenant Bazlı İzolasyon

Her tenant için ayrı:

| Katman | Ayrı mı? |
|--------|----------|
| Subnet | ✅ |
| WireGuard interface | ✅ |
| Firewall rules | ✅ |
| Public ports | ✅ |
| Rate limit | ✅ |
| Audit log | ✅ |

### Public / VPN Toggle

Panel'de switch:

```
[✔] Public Access Enabled
    Port: 15432 → postgres
    Allowed IPs: 1.2.3.4/32

[ ] VPN Only
```

**Switch kapatılınca:**
```bash
iptables -t nat -D PREROUTING ...
```

**Açılınca:**
```bash
iptables -t nat -A PREROUTING ...
```

### Güvenlik (KRİTİK)

#### ❌ Yanlış Olan:
- Tenant cihazına public IP vermek
- Tenant subnet'i doğrudan route etmek
- NAT olmadan expose etmek

#### ✅ Doğru Olan:
- Public sadece gateway
- Tenant sadece VPN
- Stateful firewall
- Logging + rate limit

### Kullanım Senaryoları

Bu model şunlar için idealdir:

- ✅ PostgreSQL
- ✅ ERP Server
- ✅ On-prem müşteri sistemi
- ✅ IoT Gateway
- ✅ Kamera / cihaz
- ✅ Legacy Windows server

### Enterprise Karşılaştırma

Bu model aşağıdakilerin network-level versiyonudur:

- Cloudflare Tunnel
- AWS PrivateLink
- Zero Trust Gateway

---

## 4. Multi-Tenant Model

### 4.1 Isolation Strategy

- **Single PostgreSQL cluster** (default)
- **OR MSSQL Server** (alternative)
- **Schema/Database-based isolation**

Her tenant:
- ✅ Ayrı schema/database (`tenant_acme`)
- ✅ Ayrı DB role/login (`tenant_acme_user`)
- ✅ Ayrı quota (disk, connections)
- ✅ Ayrı VPN subnet (`10.60.X.0/24`)

### 4.2 Database Type Selection

Berqenas **multi-database** desteği sunar:

| Database | Isolation | Use Case |
|----------|-----------|----------|
| **PostgreSQL** | Schema-based | Default, modern apps |
| **MSSQL** | Database-based | Enterprise, legacy systems |

> **Not**: Her tenant farklı database tipi seçebilir!

### 4.3 PostgreSQL Tenant Create

```sql
-- Schema
CREATE SCHEMA tenant_acme;

-- Role
CREATE ROLE tenant_acme_user LOGIN PASSWORD 'STRONG_PASSWORD';

-- Permission
GRANT USAGE ON SCHEMA tenant_acme TO tenant_acme_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA tenant_acme
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO tenant_acme_user;

-- Quota
ALTER ROLE tenant_acme_user SET temp_file_limit = '5GB';
```

### 4.4 MSSQL Tenant Create (NEW!)

```sql
-- Database
CREATE DATABASE tenant_acme;

-- Login
CREATE LOGIN tenant_acme_user WITH PASSWORD = 'STRONG_PASSWORD';

-- User & Permissions
USE tenant_acme;
CREATE USER tenant_acme_user FOR LOGIN tenant_acme_user;
ALTER ROLE db_datareader ADD MEMBER tenant_acme_user;
ALTER ROLE db_datawriter ADD MEMBER tenant_acme_user;
ALTER ROLE db_ddladmin ADD MEMBER tenant_acme_user;
```

---

## 5. Tenant Onboarding (1 Komut = 1 Firma)

### CLI Akışı

```bash
berqenas tenant create \
  --name acme \
  --db-quota 5GB \
  --vpn enabled \
  --public-api true
```

### Arka Planda Olanlar

1. ✅ PostgreSQL schema + role
2. ✅ WireGuard subnet atanır (`10.50.X.0/24`)
3. ✅ Firewall kuralları yazılır
4. ✅ API key üretilir
5. ✅ Realtime token oluşturulur
6. ✅ Backup policy eklenir

---

## 6. WireGuard Otomasyonu

### Tenant Başına Subnet

Her tenant için **izole VPN subnet**:
- Tenant 1: `10.50.1.0/24`
- Tenant 2: `10.50.2.0/24`
- Tenant N: `10.50.N.0/24`

### WireGuard Config (Örnek)

```ini
[Interface]
Address = 10.50.1.1/24
PrivateKey = SERVER_PRIVATE_KEY
ListenPort = 51820

[Peer]
PublicKey = CLIENT_PUBLIC_KEY
AllowedIPs = 10.50.1.2/32
```

---

## 7. Firewall & Virtual Firewall

Her tenant için **logical firewall**:
- UFW / iptables arka planda
- UI üzerinden:
  - ✅ IP allow/deny
  - ✅ Port allow/deny
  - ✅ Domain block
  - ✅ VPN zorunlu / opsiyonel

---

## 8. Public Access Güvenliği (VPN yoksa)

### Device Fingerprint Policy

VPN yoksa aşağıdakiler **zorunlu**:
- ✅ API Key
- ✅ Device Token
- ✅ MAC Address hash
- ✅ OS fingerprint

```json
{
  "api_key": "xxx",
  "device_id": "hashed_mac_cpu",
  "tenant": "acme"
}
```

---

## 9. Realtime Architecture

### Akış

```
Device
 → Token Auth
 → Realtime Gateway
 → PostgreSQL (events table)
 → Listener / Trigger
```

### Örnek Event Tablosu

```sql
CREATE TABLE tenant_acme.events (
  id uuid default gen_random_uuid(),
  device_id text,
  event_type varchar(100),
  payload jsonb,
  created_at timestamptz default now()
);
```

---

## 10. FastAPI – Control API

### Auth

- ✅ API Key
- ✅ JWT (panel)
- ✅ Role-based (admin / customer)

### Örnek Endpoint

```python
@app.post("/tenant/{tenant}/firewall/rule")
def add_rule(tenant: str, rule: FirewallRule):
    validate_role()
    apply_iptables(rule)
```

---

## 11. pgBouncer + Quota Enforcement

```ini
max_client_conn = 100
default_pool_size = 20
```

- ✅ Connection limit
- ✅ Per-tenant pool
- ✅ DoS protection

---

## 12. Backup (S3 / Backblaze B2)

### Policy

- ✅ Hourly snapshot
- ✅ Tenant bazlı
- ✅ Encrypted

```bash
pg_dump tenant_acme | s3cmd put - s3://berqenas-backups/acme/$(date).sql
```

### Restore

- ✅ Saat seç
- ✅ Clone veya overwrite

---

## 13. Monitoring / SOC / Audit

### İzlenenler

- ✅ DB login
- ✅ API calls
- ✅ VPN connects
- ✅ Firewall changes

### Stack

- **Prometheus**: Metrics collection
- **Grafana**: Dashboards
- **PostgreSQL logs**: Audit trail

---

## 14. Billing Engine

### Ölçülenler

- ✅ Disk (GB)
- ✅ Connection count
- ✅ Realtime events
- ✅ VPN usage

### Ödeme

- Stripe
- Iyzico
- Manual

---

## 15. Control Panel (Frontend)

### Özellikler

- ✅ Tenant yönetimi
- ✅ Firewall UI
- ✅ WireGuard UI
- ✅ Backup restore
- ✅ Billing
- ✅ Logs / Audit

### Role-Based UI

- **Admin**: Full access
- **Customer**: Tenant-specific access

---

## 16. Repository Yapısı

```
berqenas/
├── agents/
│   ├── architect.agent.md
│   ├── tenant.agent.md
│   ├── network.agent.md
│   ├── security.agent.md
│   ├── realtime.agent.md
│   └── billing.agent.md
├── backend/
│   └── fastapi/
│       ├── main.py
│       ├── routers/
│       ├── models/
│       └── services/
├── infra/
│   ├── postgres/
│   │   ├── tenant_create.sql
│   │   └── tenant_events.sql
│   ├── wireguard/
│   │   ├── wg_template.conf
│   │   └── wg_provision.sh
│   ├── firewall/
│   │   └── firewall_rules.py
│   ├── backup/
│   │   ├── backup.sh
│   │   └── restore.sh
│   └── docker/
├── frontend/
│   └── panel/
├── cli/
│   └── berqenas.py
├── docker-compose.yml
├── README.md
└── BERQENAS_ARCHITECTURE.md
```

---

## 17. Production Hardening (Checklist)

- [ ] Fail2ban
- [ ] SSH key only
- [ ] Rate limiting
- [ ] Secrets vault
- [ ] Read-only FS (where possible)
- [ ] Audit logs immutable

---

## 18. Neden Bu Mimari?

✅ Supabase Studio'ya bağımlı değil  
✅ Tam kontrol  
✅ Enterprise-grade  
✅ MSP / SaaS uyumlu  
✅ Ölçeklenebilir  
✅ White-label  

---

## 19. Agent-Based Design

### 6 Specialized Agents

#### 1. Architect Agent
**Görev**: System design, technology stack, integration planning

#### 2. Tenant Agent
**Görev**: Tenant onboarding, schema creation, quota management

#### 3. Network Agent
**Görev**: VPN provisioning, firewall rules, network isolation

#### 4. Security / SOC / Audit Agent
**Görev**: 
- Kim bağlandı
- Nereden bağlandı
- Ne yaptı
- Log + audit trail

#### 5. Realtime / Device Agent
**Görev**:
- Device → event → PostgreSQL
- Token bazlı auth
- Realtime stream

#### 6. Billing & Quota Agent
**Görev**:
- Disk, Connection, Realtime usage
- Tenant billing

---

## 20. Antigravity Workflow

### ✅ Doğru Yöntem

Her aşama agent'a görev vererek:

**Örnek:**
```
Tenant Automation Agent:
Implement tenant onboarding CLI.
Requirements:
- one command
- reversible
- secure
```

**Antigravity:**
- Kod yazar
- Eksik varsa söyler
- Diğer agent'larla çakışmayı engeller

### ❌ Yanlış Yöntem

"Bana tüm sistemi yaz"

---

## 21. Sonraki Geliştirme Aşamaları

1. ✅ Agent dosyalarının yazılması
2. ✅ Tenant CLI implementasyonu
3. ⏳ Control Panel MVP
4. ⏳ Billing entegrasyonu
5. ⏳ SOC dashboard

---

## Son Not (Uzman Yorumu)

Bu yapı:
- ✅ Gerçek ürün
- ✅ Satılabilir
- ✅ Uzun vadeli
- ✅ Yeniden yazılmadan büyüyebilir

**Antigravity seçimin çok doğru**  
Bu proje **SaaS / MSP / Cloud platform** seviyesinde.  
Acele tek script yerine **agent-based sistem** uzun vadede kazanır.

---

**Made with ❤️ using Antigravity Agent-Based Development**
