# Berqenas Cloud - Production Deployment Guide

Bu rehber, Berqenas platformunun Docker kullanarak üretim ortamına nasıl dağıtılacağını adım adım açıklar.

## 🚀 Tek Komutla Kurulum (Single-Command Setup)

Platformu kurmak için ana dizinde aşağıdaki komutu çalıştırmanız yeterlidir. Kurulum aşamalı ve etkileşimli olarak gerçekleşecektir:

```bash
python install.py
```

### Kurulum Aşamaları:
1. **Sistem Kontrolü**: Docker ve gerekli bağımlılıkların varlığı kontrol edilir.
2. **Yapılandırma**: Veritabanı şifreleri ve admin hesap bilgileri size sorulur.
3. **Dağıtım**: Tüm servisler (Backend, Frontend, DB, VPN, Redis) Docker üzerinden otomatik olarak ayağa kaldırılır.

---

## 🛠️ Manuel Kurulum (Alternatif)
Eğer aşamaları manuel kontrol etmek isterseniz:

## 🌐 Erişim Portları
- **Kontrol Paneli**: http://sunucu-ip (Port 80/443)
- **API Dokümantasyonu**: http://sunucu-ip:8000/api/docs
- **VPN**: 51820 (UDP)

## 🔒 Güvenlik Notları
1. **SSL/TLS**: Üretim ortamında Nginx Reverse Proxy ve Let's Encrypt kullanılması zorunludur.
2. **Güvenlik Duvarı**: Sadece 80, 443 ve 51820 (UDP) portlarına izin verin.
3. **Şifreler**: `.env` dosyasındaki varsayılan şifreleri mutlaka değiştirin.

---
© 2026 Berqenas Cloud & Security - Tüm Hakları Saklıdır.
