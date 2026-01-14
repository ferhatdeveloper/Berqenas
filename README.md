# Berqenas Cloud & Security Platform

<div align="center">
  <img src="https://via.placeholder.com/200x200?text=Berqenas+Logo" alt="Berqenas Logo" width="120">
  <h3>Secure Mesh Networking • Real-time Data Sync • Automated Infrastructure</h3>
</div>

---

## 🌍 Select Language / Dil Seçin

<details>
<summary><b>🇺🇸 English - Click to Expand</b></summary>

### 🏢 For Investors
Berqenas targets the $200B+ Cloud Security market. Our automated "Hub-Spoke" model reduces infrastructure costs by 70%.

### 🚀 Access Information
| Service | URL | Default Admin |
| :--- | :--- | :--- |
| **Main Panel** | `https://yourdomain.com` | User defined in `install.py` |
| **API Docs** | `https://yourdomain.com:8000/api/docs` | JWT Protected |
| **SSL/Proxy Manager** | `http://yourdomain.com:81` | `admin@example.com` / `changeme` |

### 📖 System Usage Guide
1. **Initial Setup**: Run `python3 install.py` and follow the prompts.
2. **SSL Config**: Login to Proxy Manager (Port 81), add a "Proxy Host" for your domain, and enable "SSL: Request a New Let's Encrypt Certificate".
3. **Adding Tenants**: Use the Admin Panel or CLI to create a new tenant. This automatically provisions a PSQL schema and VPN subnet.
4. **Remote Sync**: Install WireGuard on your edge device, connect to Berqenas, then register the database via "Remote DBs" section.

### 🛠️ API & Postman
- **Postman Collection**: [Download JSON](docs/Berqenas_API.postman_collection.json) (Import this into Postman)
- **Interactive API Docs**: `https://yourdomain.com:8000/api/docs`

### 🗄️ Direct Database Access
Each tenant can connect directly to their isolated PostgreSQL schema:
- **Host**: `yourdomain.com` (or WireGuard IP)
- **Port**: `5432`
- **User/Password**: Your tenant specific credentials.
- **Isolation**: You will only see and access your assigned schema.

</details>

<details>
<summary><b>🇹🇷 Türkçe - Genişletmek için Tıklayın</b></summary>

### 🏢 Yatırımcılar İçin
Berqenas, 200 milyar dolarlık bulut güvenliği pazarını hedefler. Otomatik altyapı modelimiz maliyetleri %70 azaltır.

### 🚀 Erişim Bilgileri
| Servis | URL | Varsayılan Yetkili |
| :--- | :--- | :--- |
| **Ana Panel** | `https://alanadiniz.com` | `install.py` ile belirlenen kullanıcı |
| **API Dokümanı** | `https://alanadiniz.com:8000/api/docs` | JWT Korumalı |
| **SSL/Proxy Paneli** | `http://alanadiniz.com:81` | `admin@example.com` / `changeme` |

### 📖 Sistem Kullanım Kılavuzu
1. **İlk Kurulum**: `python3 install.py` komutunu çalıştırın ve yönergeleri izleyin.
2. **SSL Ayarı**: Proxy Paneline (Port 81) girin, alan adınız için bir "Proxy Host" ekleyin ve "SSL: Request a New Let's Encrypt Certificate" seçeneğini aktif edin.
3. **Müşteri (Tenant) Ekleme**: Admin Panelini veya CLI'ı kullanarak yeni bir kiracı oluşturun. Sistem otomatik olarak DB şeması ve VPN subneti hazırlar.

### 🛠️ API & Postman
- **Postman Koleksiyonu**: [JSON İndir](docs/Berqenas_API.postman_collection.json) (Postman'a içe aktarın)
- **Canlı Dokümantasyon**: `https://alanadiniz.com:8000/api/docs`

### 🗄️ Direkt Veritabanı Bağlantısı
Her müşteri, kendi izole PostgreSQL şemasına direkt bağlanabilir:
- **Sunucu**: `alanadiniz.com` (Veya WireGuard IP)
- **Port**: `5432`
- **Yetkilendirme**: Kiracıya özel kullanıcı adı ve şifre.
- **İzolasyon**: Sadece size atanan şemayı görür ve yönetirsiniz.

</details>

---

## 🛠️ Quick Installation / Hızlı Kurulum

```bash
git clone https://github.com/ferhatdeveloper/Berqenas.git && cd Berqenas
python3 install.py
```

## 📊 Project Metrics & Technical Specs

<details>
<summary><b>Technical Data (Expand)</b></summary>
<ul>
  <li><b>Capacity</b>: 10,000+ simultaneous VPN tunnels.</li>
  <li><b>Security</b>: AES-256-GCM / WireGuard (ChaCha20).</li>
  <li><b>API</b>: FastAPI with OAuth2 JWT.</li>
  <li><b>DB Isolation</b>: Schema-based multi-tenancy.</li>
</ul>
</details>

---
© 2026 Berqenas Cloud & Security. All rights reserved.
