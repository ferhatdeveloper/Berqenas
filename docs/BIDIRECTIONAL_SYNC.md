# Bi-Directional Database Sync
## Berqenas Cloud ↔ Local Database

---

## 🎯 Özellik

Berqenas Cloud'daki veritabanı ile yerel veritabanınızı **iki yönlü senkronize** eder:
- ✅ Cloud → Local (değişiklikler yerel DB'ye)
- ✅ Local → Cloud (değişiklikler cloud'a)
- ✅ Conflict Detection (çakışma tespiti)
- ✅ Automatic Conflict Resolution (otomatik çözüm)

---

## 📊 Nasıl Çalışır?

### 1. Change Detection (Değişiklik Tespiti)

Her tabloda şu kolonlar olmalı:
```sql
-- MSSQL
ALTER TABLE customers ADD 
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    is_deleted BIT DEFAULT 0;

-- Trigger for updated_at
CREATE TRIGGER trg_customers_updated
ON customers
AFTER UPDATE
AS
BEGIN
    UPDATE customers
    SET updated_at = GETDATE()
    FROM customers c
    INNER JOIN inserted i ON c.customer_id = i.customer_id;
END;

-- PostgreSQL
ALTER TABLE customers ADD 
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE;

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_customers_updated
BEFORE UPDATE ON customers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();
```

### 2. Sync Process

```
┌─────────────────────────────────────────────┐
│ 1. Son sync zamanından beri değişenleri bul│
├─────────────────────────────────────────────┤
│ Cloud DB: updated_at > last_sync            │
│ Local DB: updated_at > last_sync            │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│ 2. Conflict Detection (Çakışma Kontrolü)   │
├─────────────────────────────────────────────┤
│ Aynı kayıt her iki tarafta da değişmiş mi? │
│ Hash karşılaştırması                        │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│ 3. Conflict Resolution (Çözüm)             │
├─────────────────────────────────────────────┤
│ Strategy:                                   │
│ - latest_wins (en son değişiklik kazanır)  │
│ - cloud_wins (cloud öncelikli)             │
│ - local_wins (local öncelikli)             │
│ - manual (manuel çözüm)                     │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│ 4. Apply Changes (Değişiklikleri Uygula)   │
├─────────────────────────────────────────────┤
│ Cloud → Local: INSERT/UPDATE/DELETE        │
│ Local → Cloud: INSERT/UPDATE/DELETE        │
└─────────────────────────────────────────────┘
```

---

## 🚀 Kullanım

### API Endpoint

```http
POST /api/v1/sync/remote-db/{db_id}/bidirectional-sync
Content-Type: application/json

{
  "tables": ["customers", "orders", "products"],
  "conflict_strategy": "latest_wins",
  "dry_run": false
}
```

**Yanıt:**
```json
{
  "success": true,
  "sync_id": "sync_20260114_153000",
  "results": {
    "customers": {
      "cloud_to_local": 15,
      "local_to_cloud": 8,
      "conflicts_detected": 3,
      "conflicts_resolved": 3
    },
    "orders": {
      "cloud_to_local": 42,
      "local_to_cloud": 27,
      "conflicts_detected": 1,
      "conflicts_resolved": 1
    }
  },
  "total_synced": 92,
  "duration_seconds": 2.4
}
```

### CLI

```bash
# Tek seferlik sync
berqenas sync bidirectional musteri_erp \
  --strategy latest_wins

# Dry run (sadece göster, uygulama)
berqenas sync bidirectional musteri_erp \
  --dry-run

# Belirli tablolar
berqenas sync bidirectional musteri_erp \
  --tables customers,orders \
  --strategy cloud_wins

# Otomatik sync (her 15 dakika)
berqenas sync schedule musteri_erp \
  --interval 15 \
  --strategy latest_wins
```

---

## 🔧 Conflict Resolution Strategies

### 1. `latest_wins` (Önerilen)
En son değişiklik kazanır.

**Örnek:**
```
Cloud: Customer updated at 14:30
Local: Customer updated at 14:35
Result: Local değişiklik uygulanır (14:35 > 14:30)
```

### 2. `cloud_wins`
Cloud her zaman öncelikli.

**Kullanım:** Master-slave yapılar, cloud authoritative

### 3. `local_wins`
Local her zaman öncelikli.

**Kullanım:** Offline-first uygulamalar

### 4. `manual`
Çakışmalar manuel çözülür.

**Kullanım:** Kritik veriler, insan onayı gerekli

---

## 📋 Örnek Senaryo

### Durum:
- Cloud'da: Customer #123, Email: old@email.com (14:30)
- Local'de: Customer #123, Email: new@email.com (14:35)

### Sync Çalıştırıldığında:

#### Strategy: `latest_wins`
```
Conflict Detected:
  Table: customers
  PK: customer_id = 123
  Cloud: {email: "old@email.com", updated_at: "14:30"}
  Local: {email: "new@email.com", updated_at: "14:35"}

Resolution: Local wins (14:35 > 14:30)

Actions:
  ✓ Update Cloud: email = "new@email.com"
  ✓ Keep Local: email = "new@email.com"
```

#### Strategy: `cloud_wins`
```
Resolution: Cloud wins (policy)

Actions:
  ✓ Keep Cloud: email = "old@email.com"
  ✓ Update Local: email = "old@email.com"
```

---

## 🔍 Monitoring

### Sync Durumu
```bash
berqenas sync status musteri_erp
```

**Çıktı:**
```
Sync Status: musteri_erp
─────────────────────────────────
Last Sync: 2 minutes ago
Next Sync: in 13 minutes
Mode: Bi-directional
Strategy: latest_wins

Last Sync Results:
  Cloud → Local: 15 records
  Local → Cloud: 8 records
  Conflicts: 3 (all resolved)
  Duration: 2.4s
  Status: ✓ Success
```

### Sync History
```bash
berqenas sync history musteri_erp --limit 10
```

**Çıktı:**
```
┌────────────────────┬──────────┬──────────┬───────────┬─────────┐
│ Timestamp          │ Cloud→L  │ Local→C  │ Conflicts │ Status  │
├────────────────────┼──────────┼──────────┼───────────┼─────────┤
│ 2026-01-14 15:30   │ 15       │ 8        │ 3         │ Success │
│ 2026-01-14 15:15   │ 8        │ 12       │ 1         │ Success │
│ 2026-01-14 15:00   │ 23       │ 5        │ 0         │ Success │
│ 2026-01-14 14:45   │ 0        │ 0        │ 0         │ Success │
└────────────────────┴──────────┴──────────┴───────────┴─────────┘
```

### Conflict Log
```bash
berqenas sync conflicts musteri_erp --date today
```

**Çıktı:**
```
Conflicts Today: 7 (all resolved)

┌──────────┬────────┬─────────────────┬──────────┬────────────┐
│ Time     │ Table  │ Primary Key     │ Strategy │ Winner     │
├──────────┼────────┼─────────────────┼──────────┼────────────┤
│ 15:30:12 │ orders │ order_id=456    │ latest   │ Cloud      │
│ 15:30:08 │ cust.. │ customer_id=123 │ latest   │ Local      │
│ 15:15:45 │ prod.. │ product_id=789  │ latest   │ Local      │
└──────────┴────────┴─────────────────┴──────────┴────────────┘
```

---

## ⚠️ Önemli Notlar

### 1. Database Schema Gereksinimleri
Her tablo **mutlaka** şunlara sahip olmalı:
- ✅ `created_at` (TIMESTAMP)
- ✅ `updated_at` (TIMESTAMP)
- ✅ `is_deleted` (BOOLEAN) - soft delete için
- ✅ Trigger for `updated_at` auto-update

### 2. Primary Key
Her tabloda **primary key** olmalı (conflict detection için).

### 3. Soft Delete
Hard delete yerine **soft delete** kullanın:
```sql
-- Yanlış
DELETE FROM customers WHERE customer_id = 123;

-- Doğru
UPDATE customers 
SET is_deleted = 1, updated_at = GETDATE()
WHERE customer_id = 123;
```

### 4. Network Latency
Sync süresi network hızına bağlı:
- LAN: ~1-2 saniye
- WireGuard VPN: ~2-5 saniye
- Internet: ~5-15 saniye

---

## 🎯 Best Practices

### 1. Sync Interval
```bash
# Yüksek trafik: Her 5 dakika
berqenas sync schedule db --interval 5

# Normal: Her 15 dakika
berqenas sync schedule db --interval 15

# Düşük trafik: Saatlik
berqenas sync schedule db --interval 60
```

### 2. Table Selection
Tüm tabloları sync etmeyin, sadece gerekenleri:
```bash
berqenas sync bidirectional db \
  --tables customers,orders,products
  # invoices, logs gibi büyük tabloları hariç tut
```

### 3. Off-Peak Sync
Büyük sync'leri gece saatlerinde yapın:
```bash
# Her gece 02:00'da full sync
berqenas sync schedule db \
  --cron "0 2 * * *" \
  --full-sync
```

---

## 🔐 Güvenlik

### Encryption
Tüm sync trafiği **WireGuard** üzerinden şifreli.

### Audit Log
Her sync işlemi loglanır:
```sql
SELECT * FROM sync_audit_log
WHERE remote_db_id = 42
ORDER BY sync_timestamp DESC;
```

### Rollback
Hatalı sync'i geri al:
```bash
berqenas sync rollback musteri_erp \
  --sync-id sync_20260114_153000
```

---

## 📞 Troubleshooting

### Sync Başarısız
```bash
# Detaylı log
berqenas sync logs musteri_erp --level debug

# Connection test
berqenas sync test-connection musteri_erp

# Manuel sync (verbose)
berqenas sync bidirectional musteri_erp --verbose
```

### Çok Fazla Conflict
```bash
# Conflict raporu
berqenas sync conflicts musteri_erp --analyze

# Strategy değiştir
berqenas sync configure musteri_erp \
  --strategy cloud_wins
```

---

**Bi-directional sync ile verileriniz her zaman güncel! 🔄**
