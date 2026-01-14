# Uzak Cihaz MSSQL → Berqenas Cloud API
## Adım Adım Kullanım Senaryosu

---

## 🎯 Senaryo

Müşterinizin ofisinde bir Windows Server var, üzerinde MSSQL çalışıyor. Bu veritabanını Berqenas Cloud Panel üzerinden REST API'ye çevirmek istiyorsunuz.

---

## 📋 Adım 1: Uzak Cihaza WireGuard Kur

### Berqenas Cloud Panel'den:

```bash
# Tenant oluştur
berqenas tenant create --name musteri_a --vpn

# VPN client config oluştur
berqenas vpn client-create --tenant musteri_a --device office-server
```

**Çıktı:**
```
✓ VPN client created!
Device: office-server
IP Address: 10.60.5.10
Config saved to: musteri_a_office-server.conf
```

### Uzak Cihazda (Windows Server):

1. **WireGuard İndir**: https://www.wireguard.com/install/
2. **Config Dosyasını İçe Aktar**: `musteri_a_office-server.conf`
3. **Bağlan**: WireGuard'ı aktif et

**Test:**
```powershell
# Berqenas Gateway'e ping at
ping 10.60.5.1

# Başarılı ise bağlantı hazır!
```

---

## 📋 Adım 2: MSSQL Bilgilerini Berqenas Panel'e Gir

### Seçenek A: Web Panel (UI)

```
Berqenas Cloud Panel
  └── Remote Databases
      └── Add Remote Database
          ├── Name: Müşteri A ERP
          ├── Type: MSSQL
          ├── WireGuard IP: 10.60.5.10
          ├── Database Host: 10.60.5.10 (veya localhost)
          ├── Port: 1433
          ├── Database Name: ERP_Production
          ├── Username: berqenas_readonly
          └── Password: ********
```

### Seçenek B: CLI

```bash
berqenas sync register \
  --name musteri_a_erp \
  --type mssql \
  --wg-ip 10.60.5.10 \
  --host 10.60.5.10 \
  --port 1433 \
  --database ERP_Production \
  --username berqenas_readonly \
  --password SecurePass123
```

### Seçenek C: API

```http
POST https://panel.berqenas.com/api/v1/sync/remote-db/register
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "name": "musteri_a_erp",
  "database_type": "mssql",
  "wireguard_ip": "10.60.5.10",
  "database_host": "10.60.5.10",
  "database_port": 1433,
  "database_name": "ERP_Production",
  "username": "berqenas_readonly",
  "password": "SecurePass123",
  "schema": "dbo"
}
```

**Yanıt:**
```json
{
  "success": true,
  "message": "Remote database registered successfully",
  "database_id": 42,
  "status": "connected"
}
```

---

## 📋 Adım 3: Tabloları Görüntüle (Önizleme)

```bash
# Uzak veritabanındaki tabloları listele
berqenas sync tables musteri_a_erp
```

**Çıktı:**
```
✓ Tables retrieved!

Database: ERP_Production
Tables Found: 8

┌──────────────┬─────────┬──────────────┐
│ Table Name   │ Columns │ Primary Keys │
├──────────────┼─────────┼──────────────┤
│ Customers    │ 12      │ CustomerID   │
│ Orders       │ 15      │ OrderID      │
│ Products     │ 10      │ ProductID    │
│ Invoices     │ 18      │ InvoiceID    │
│ Employees    │ 14      │ EmployeeID   │
│ Inventory    │ 8       │ ItemID       │
│ Suppliers    │ 11      │ SupplierID   │
│ Payments     │ 9       │ PaymentID    │
└──────────────┴─────────┴──────────────┘
```

---

## 📋 Adım 4: Otomatik API Oluştur

```bash
# Tüm tablolar için otomatik CRUD API oluştur
berqenas sync generate-api musteri_a_erp
```

**Arka Planda Olanlar:**
1. ✅ WireGuard üzerinden `10.60.5.10:1433`'e bağlanır
2. ✅ Tablo yapılarını analiz eder
3. ✅ Her tablo için Pydantic model oluşturur
4. ✅ CRUD endpoints oluşturur (GET, POST, PUT, DELETE)
5. ✅ API'yi Berqenas Cloud'a deploy eder

**Çıktı:**
```
✓ API generation started!

Database: ERP_Production
Tables: 8
Generated Endpoints: 40

APIs created:
  GET    /api/remote/42/customers
  POST   /api/remote/42/customers
  GET    /api/remote/42/customers/{id}
  PUT    /api/remote/42/customers/{id}
  DELETE /api/remote/42/customers/{id}
  ... (35 more endpoints)

Status: Processing...
```

---

## 📋 Adım 5: Public Erişim Aç (Opsiyonel)

```bash
# API'yi internete aç
berqenas sync enable-public musteri_a_erp
```

**Çıktı:**
```
✓ Public access enabled!

Public Endpoint: https://api.berqenas.com/remote/42
API Key: bq_live_xK8mN2pQ9rT4vW7yZ1aB3cD5eF6gH8iJ

Example Usage:
  curl https://api.berqenas.com/remote/42/customers \
    -H "X-API-Key: bq_live_xK8mN2pQ9rT4vW7yZ1aB3cD5eF6gH8iJ"
```

---

## 📋 Adım 6: API'yi Kullan

### Müşterileri Listele
```bash
curl https://api.berqenas.com/remote/42/customers \
  -H "X-API-Key: bq_live_xK8mN2pQ9rT4vW7yZ1aB3cD5eF6gH8iJ"
```

**Yanıt:**
```json
[
  {
    "CustomerID": 1,
    "CustomerName": "Acme Corp",
    "Email": "contact@acme.com",
    "Phone": "+90 555 123 4567",
    "CreatedDate": "2024-01-15T10:30:00"
  },
  {
    "CustomerID": 2,
    "CustomerName": "TechStart Ltd",
    "Email": "info@techstart.com",
    "Phone": "+90 555 987 6543",
    "CreatedDate": "2024-02-20T14:45:00"
  }
]
```

### Yeni Müşteri Ekle
```bash
curl -X POST https://api.berqenas.com/remote/42/customers \
  -H "X-API-Key: bq_live_xK8mN2pQ9rT4vW7yZ1aB3cD5eF6gH8iJ" \
  -H "Content-Type: application/json" \
  -d '{
    "CustomerName": "New Company",
    "Email": "hello@newcompany.com",
    "Phone": "+90 555 111 2233"
  }'
```

### Müşteri Güncelle
```bash
curl -X PUT https://api.berqenas.com/remote/42/customers/1 \
  -H "X-API-Key: bq_live_xK8mN2pQ9rT4vW7yZ1aB3cD5eF6gH8iJ" \
  -H "Content-Type: application/json" \
  -d '{
    "Email": "newemail@acme.com"
  }'
```

### Müşteri Sil
```bash
curl -X DELETE https://api.berqenas.com/remote/42/customers/1 \
  -H "X-API-Key: bq_live_xK8mN2pQ9rT4vW7yZ1aB3cD5eF6gH8iJ"
```

---

## 🔒 Güvenlik Notları

### 1. MSSQL Kullanıcısı (Uzak Cihazda)

```sql
-- Read-only kullanıcı oluştur (önerilir)
CREATE LOGIN berqenas_readonly WITH PASSWORD = 'SecurePass123';
USE ERP_Production;
CREATE USER berqenas_readonly FOR LOGIN berqenas_readonly;

-- Sadece okuma izni ver
EXEC sp_addrolemember 'db_datareader', 'berqenas_readonly';

-- Eğer yazma da gerekiyorsa:
EXEC sp_addrolemember 'db_datawriter', 'berqenas_readonly';
```

### 2. Firewall (Uzak Cihazda)

```powershell
# MSSQL'i sadece WireGuard IP'sine aç
New-NetFirewallRule -DisplayName "MSSQL for Berqenas" `
  -Direction Inbound `
  -LocalPort 1433 `
  -Protocol TCP `
  -Action Allow `
  -RemoteAddress 10.60.5.1
```

### 3. API Güvenliği

- ✅ API Key zorunlu
- ✅ Rate limiting (100 req/min)
- ✅ IP whitelist (opsiyonel)
- ✅ Audit logging

---

## 📊 Monitoring

### Bağlantı Durumu
```bash
berqenas sync status musteri_a_erp
```

**Çıktı:**
```
Database: musteri_a_erp
WireGuard: ✓ Connected (10.60.5.10)
Database: ✓ Online
Last Sync: 2 minutes ago
API Status: ✓ Enabled
Public Endpoint: https://api.berqenas.com/remote/42
```

### API İstatistikleri
```bash
berqenas sync stats musteri_a_erp
```

**Çıktı:**
```
API Statistics (Last 24h)
─────────────────────────
Total Requests: 1,247
GET: 1,105 (88.6%)
POST: 89 (7.1%)
PUT: 42 (3.4%)
DELETE: 11 (0.9%)

Top Endpoints:
  /customers: 645 requests
  /orders: 312 requests
  /products: 198 requests
```

---

## 🎯 Tam Akış Özeti

```
[Uzak Cihaz - Windows Server]
  └── MSSQL (ERP_Production)
  └── WireGuard Client (10.60.5.10)
        ↓ VPN Tunnel
[Berqenas Cloud]
  └── WireGuard Gateway (10.60.5.1)
  └── Remote Sync Service
      ├── Bağlanır: 10.60.5.10:1433
      ├── Analiz eder: 8 tablo
      ├── API oluşturur: 40 endpoint
      └── Deploy eder: api.berqenas.com/remote/42
        ↓ Public Internet
[Mobil App / Web App / 3rd Party]
  └── REST API: https://api.berqenas.com/remote/42/customers
  └── Auth: X-API-Key header
```

---

## ✅ Avantajlar

1. **Güvenlik**: Veritabanı asla internete açılmaz, sadece VPN
2. **Hız**: Direkt bağlantı, proxy yok
3. **Otomasyon**: Tek komutla API oluşturma
4. **Esneklik**: İstediğin tabloları seç
5. **Kontrol**: İstediğin zaman kapat/aç

---

## 📞 Destek

Sorun yaşarsanız:
```bash
berqenas sync logs musteri_a_erp --tail 100
```

veya support@berqenas.com
