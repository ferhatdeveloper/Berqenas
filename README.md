# Berqenas Cloud & Security Platform

<div align="center">
  <img src="https://via.placeholder.com/200x200?text=Berqenas+Logo" alt="Berqenas Logo" width="120">
  <h3>Secure Mesh Networking • Real-time Data Sync • Automated Infrastructure</h3>
  <p>
    The first <b>Software-Defined Cloud Platform</b> that turns any local infrastructure into a 
    secure, compliant, and globally available Cloud API in minutes.
  </p>
</div>

---

## 🌍 Select Language / Dil Seçin

<details>
<summary><b>🇺🇸 English - Detailed Documentation (Click to Expand)</b></summary>

### 1. Project Vision & Overview
**What is Berqenas?**  
Berqenas is not just a VPN or a Database; it is a **Central Nervous System for Enterprise Data**. It solves the problem of connecting fragmented, local, on-premise systems (factories, retail stores, legacy servers) to the modern cloud without complex hardware or expensive MPLS lines.

**The Logic:** "Hub & Spoke" Architecture.
- **The Hub (Berqenas)**: A central cloud server (hosted by you) that manages security, access, and APIs.
- **The Spoke (Your Clients)**: Any local server, computer, or IoT device running a simple WireGuard tunnel.

### 2. Core Architecture & Features
#### 🌐 Subdomain & Auto-SSL System (Nginx Proxy Manager)
Every customer gets their own "Entrance". Berqenas uses a smart proxy system.
- **How it works**: When you create a tenant named `acme`, the system recognizes `acme.yourdomain.com`.
- **Zero-Touch SSL**: You don't buy certificates. The system (NPM) talks to Let's Encrypt and gets free, auto-renewing SSL certificates for every single subdomain automatically.
- **Port 81 (Proxy Manager)**: A visual interface to manage all domains and SSL certs without touching a single config file.

#### 🛡️ WireGuard Mesh VPN (SDN)
- **Zero-Trust**: No port forwarding. No public IPs on client devices.
- **Virtual Subnets**: Every tenant gets a private network (`10.50.X.0/24`). Tenant A cannot see Tenant B's network.
- **Performance**: Faster than OpenVPN/IPsec using the kernel-level WireGuard protocol.

#### ⚡ Real-Time Bi-Directional Sync
- ** Problem**: Cloud data is old. Local data is isolated.
- ** Solution**: Berqenas Sync Engine watches your local MSSQL/PostgreSQL databases. When a row changes locally, it pushes to Cloud in <1s. When Cloud changes, it pushes locally.
- **Result**: You can build a modern React App on the Cloud that controls a legacy Factory Server in real-time.

### 3. Installation Guide (1-Command)
We have simplified the complex multi-container setup into a single Python script.

**Prerequisites**: A server (Ubuntu 20.04/22.04 recommended) with Docker installed.

```bash
# 1. Clone the Repository
git clone https://github.com/ferhatdeveloper/Berqenas.git && cd Berqenas

# 2. Run the Master Installer
python3 install.py
```

**What happens next?**
1. System checks Docker status.
2. It asks for your **Domain** (e.g., `berqenas.com`).
3. It asks for secure passwords for Database and Admin.
4. It auto-generates JWT Secrets and WireGuard keys.
5. It builds 5 Docker Containers: Backend, Frontend, Queue(Redis), DB, Proxy.
6. It initializes the database schema.

### 🔄 How to Update System?
To update your Berqenas installation when new features are released:

```bash
cd Berqenas
git pull origin main
docker compose up -d --build
docker image prune -f  # (Optional: Clean up old images)
```
Config and Data will remain SAFE.

### 4. Operation Manual (How-to)
**Access Points:**
- **Main Panel**: `https://yourdomain.com`
- **Proxy/SSL Admin**: `http://yourdomain.com:81` (Login: `admin@example.com` / `changeme`)
- **API Docs**: `https://yourdomain.com:8000/api/docs`

**Step 1: Configure SSL (First Time)**
1. Go to `http://yourdomain.com:81`.
2. Login and go to "Proxy Hosts".
3. Add a Host: 
   - Domain: `yourdomain.com` -> Forward to `frontend:80`
   - Domain: `api.yourdomain.com` -> Forward to `backend:8000`
4. Tab "SSL" -> Select "Request a New Certificate". Done!

**Step 2: Create a Tenant (Customer)**
1. Login to Berqenas Admin Panel.
2. Click "Create Tenant".
3. Enter Name: `Acme`, Subdomain: `acme`.
4. **Result**: System creates `tenant_acme` schema in DB and `10.50.101.0/24` network.
5. You can now reach this tenant at `acme.yourdomain.com` (after adding to Proxy).

**Step 3: Direct Database Connection (For Developers)**
Every tenant effectively has their own "Private Database".
- **Host**: `yourdomain.com`
- **Port**: `5432`
- **User**: `tenant_acme_user` (Auto-generated)
- **Password**: (Auto-generated)
- **Database**: `berqenas`
*Note: This user is LOCKED to `tenant_acme` schema. They cannot see other data.*

---

### 5. API Reference
Full Postman Collection available: [Download JSON](docs/Berqenas_API.postman_collection.json)

**Authentication**
```http
POST /auth/login
Content-Type: application/x-www-form-urlencoded

username=admin&password=SECURE_PASSWORD
```

**Create Tenant**
```http
POST /api/tenant/
Authorization: Bearer <TOKEN>

{
  "name": "tesla_factory",
  "subdomain": "tesla",
  "vpn_enabled": true
}
```

</details>

<details>
<summary><b>🇹🇷 Türkçe - Detaylı Dokümantasyon (Genişletmek için Tıklayın)</b></summary>

### 1. Vizyon ve Proje Özeti
**Berqenas Nedir?**  
Berqenas, sıradan bir VPN veya veritabanı yönetim aracı değildir; o, **Kurumsal Veri için Merkezi Bir Sinir Sistemidir**. Dağınık, yerel, internete kapalı sistemleri (fabrikalar, mağazalar, eski sunucular) pahalı donanımlar veya MPLS hatları olmadan modern buluta bağlayan, **Yazılım Tanımlı (SDN) bir Bulut Platformudur**.

**Mantık:** "Merkez ve Uç (Hub & Spoke)" Mimarisi.
- **Hub (Berqenas)**: Sizin barındırdığınız, güvenliği ve erişimi yöneten merkezi beyin.
- **Spoke (Müşterileriniz)**: Basit bir WireGuard tüneli çalıştıran herhangi bir bilgisayar veya cihaz.

### 2. Temel Mimari ve Özellikler
#### 🌐 Alt Alan Adı (Subdomain) & Otomatik SSL (NPM)
Sistem "1 Kurulum = Sınırsız Müşteri" mantığıyla çalışır.
- **Nasıl Çalışır?**: `Acme` adında bir müşteri oluşturduğunuzda, sistem `acme.alanadiniz.com` gibi alt alan adlarını tanıyacak şekilde yapılanır.
- **Otomatik SSL**: Sertifika satın almanıza gerek yoktur. Entegre **Nginx Proxy Manager**, Let's Encrypt ile konuşarak oluşturduğunuz her alt alan adı için (api.x.com, panel.x.com) otomatik ve ücretsiz SSL sertifikası alır.
- **Port 81 Paneli**: Tüm bu alan adlarını ve güvenliği görsel bir arayüzden yönetirsiniz.

#### 🛡️ WireGuard Mesh VPN (SDN)
- **Sıfır Güven (Zero-Trust)**: Müşteride port açmaya gerek yok. Sabit IP zorunluluğu yok.
- **Sanal Ağlar**: Her müşterinin kendi izole ağı (`10.50.X.0/24`) vardır. A Müşterisi, B müşterisinin ağını göremez.
- **Performans**: Çekirdek seviyesinde çalışan WireGuard protokolü ile IPsec'ten %60 daha hızlı.

#### ⚡ Çift Yönlü Gerçek Zamanlı Senkronizasyon (Sync Engine)
- **Sorun**: Bulut verisi bayattır. Yerel veri internete kapalıdır.
- **Çözüm**: Berqenas Sync Motoru, yerel MSSQL/PostgreSQL veritabanlarını izler. Yerelde bir fatura kesildiğinde, <1 saniye içinde Buluta yazar. Buluttan bir sipariş girildiğinde, anında yerel sisteme düşer.

### 3. Kurulum Rehberi (Tek Komut)
Karmaşık süreçleri tek bir Python sihirbazına indirdik.

**Gereksinim**: Docker kurulu bir Ubuntu sunucu.

```bash
# 1. Projeyi İndirin
git clone https://github.com/ferhatdeveloper/Berqenas.git && cd Berqenas

# 2. Kurulum Sihirbazını Başlatın
python3 install.py
```

**Sihirbaz Ne Yapar?**
1. Docker kontrolü yapar.
2. Alan adınızı (ör: `berqenas.com`) ve şifrelerinizi sorar.
3. Arka planda tüm şifreleme anahtarlarını üretir.
4. 5 adet Servisi (Backend, Frontend, Redis, DB, Proxy) kurar ve başlatır.
5. Veritabanını kullanıma hazır hale getirir.

### 🔄 Sistem Nasıl Güncellenir?
Yeni özellikler geldiğinde sisteminizi güncellemek çok basittir:

```bash
cd Berqenas
git pull origin main
docker compose up -d --build
docker image prune -f  # (Opsiyonel: Eski imajları temizler)
```
Merak etmeyin; Veritabanı, Ayarlar ve SSL sertifikalarınız **SİLİNMEZ**, korunur.

### 4. Kullanım ve Operasyon Kılavuzu
**Erişim Noktaları:**
- **Ana Panel**: `https://alanadiniz.com`
- **Proxy/SSL Yöneticisi**: `http://alanadiniz.com:81` (Giriş: `admin@example.com` / `changeme`)
- **API Dokümanı**: `https://alanadiniz.com:8000/api/docs`

**Adım 1: SSL Ayarı (İlk Kez)**
1. `http://alanadiniz.com:81` adresine gidin.
2. Giriş yapın ve "Proxy Hosts" sekmesine tıklayın.
3. Yeni Ekle: 
   - Domain: `alanadiniz.com` -> Hedef: `frontend` Port: `80`
   - Domain: `api.alanadiniz.com` -> Hedef: `backend` Port: `8000`
4. "SSL" sekmesinden "Request a New Certificate" seçin ve kaydedin. Siteniz artık güvenli!

**Adım 2: Müşteri (Tenant) Oluşturma**
1. Berqenas Admin paneline girin.
2. "Yeni Kiracı" butonuna basın.
3. İsim: `Acme`, Subdomain: `acme` olarak girin.
4. **Sonuç**: Sistem veritabanında `tenant_acme` şemasını ve `10.50.101.0` VPN ağını otomatik oluşturur.

**Adım 3: Direkt Veritabanı Erişimi (Geliştiriciler İçin)**
Her müşteri aslında kendi özel veritabanına sahip gibidir. Kendi yazılımlarınızı direkt bağlayabilirsiniz:
- **Host**: `alanadiniz.com` (veya VPN IP)
- **Port**: `5432`
- **Kullanıcı**: `tenant_acme_user` (Otomatik üretilir)
- **Şifre**: (Otomatik üretilir)
- **Database**: `berqenas`
*Not: Bu kullanıcı Postgres seviyesinde izole edilmiştir. Başka müşterinin verisini göremez.*

---

### 5. API Referansı
Hazır Postman Koleksiyonu: [İndir (JSON)](docs/Berqenas_API.postman_collection.json)

**Giriş Yapma**
```http
POST /auth/login
Content-Type: application/x-www-form-urlencoded

username=admin&password=SIFRENIZ
```

**Yeni Müşteri Oluşturma**
```http
POST /api/tenant/
Authorization: Bearer <TOKEN>

{
  "name": "yeni_firma",
  "subdomain": "yenifirma",
  "vpn_enabled": true
}
```

</details>

<details>
<summary><b>🇸🇦 العربية / 🇩🇪 Deutsch (Other Languages)</b></summary>
Please refer to the English section for detailed technical specifications. / Bitte beziehen Sie sich für detaillierte technische Spezifikationen auf den englischen Abschnitt.
</details>

---

## 🛠️ Quick Start

```bash
git clone https://github.com/ferhatdeveloper/Berqenas.git && cd Berqenas
python3 install.py

## günceleme

cd Berqenas
git pull origin main           # 1. Yeni kodları indir
docker compose up -d --build   # 2. Konteynerleri yeni kodla yeniden oluştur
```



## 📊 Technical Specs Summary

<details>
<summary><b>Metrics (Expand)</b></summary>
<ul>
  <li><b>VPN Capacity</b>: 10,000+ simultaneous tunnels / node.</li>
  <li><b>Encryption</b>: AES-256-GCM (Data) & ChaCha20 (VPN).</li>
  <li><b>Database</b>: PostgreSQL 16 with Row-Level Security (RLS) & Schema Isolation.</li>
  <li><b>Sync Speed</b>: < 1000ms latency for DB replication.</li>
</ul>
</details>

---
© 2026 Berqenas Cloud & Security. All rights reserved.
