import os
import sys
import subprocess
import secrets
import getpass
import time

def clear_screen():
    os.system('cls' if os.name == 'nt' else 'clear')

def run_command(command, cwd=None):
    try:
        subprocess.run(command, shell=True, check=True, cwd=cwd)
        return True
    except subprocess.CalledProcessError as e:
        print(f"\n[✗] Hata: Komut başarısız oldu: {command}")
        return False

def install():
    clear_screen()
    print("====================================================")
    print("   Berqenas Cloud & Security - Tek Komut Kurulum   ")
    print("====================================================\n")
    
    print("[Aşama 1/3] Sistem ve Gereksinim Kontrolleri")
    
    # 1. OS Check & Full System Update
    if sys.platform.startswith("linux"):
        print("[*] Ubuntu/Debian sistem güncellemeleri kontrol ediliyor...")
        print("[*] 'apt-get update && apt-get upgrade' çalıştırılıyor (Bu işlem biraz sürebilir)...")
        run_command("apt-get update && DEBIAN_FRONTEND=noninteractive apt-get upgrade -y")
        print("[✓] Sistem güncellendi.")
    elif not sys.platform.startswith("darwin"):
         print("[!] Uyarı: Bu script en iyi Linux (Ubuntu/Debian) üzerinde çalışır.")
        
    # 2. System Packages Check & Install
    missing_pkgs = []
    for pkg in ["curl", "git"]:
        if subprocess.call(["which", pkg], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL) != 0:
            missing_pkgs.append(pkg)
    
    if missing_pkgs:
        print(f"[*] Eksik paketler tespit edildi: {', '.join(missing_pkgs)}. Kuruluyor...")
        run_command(f"apt-get update && apt-get install -y {' '.join(missing_pkgs)}")

    # 3. Port Conflict Check (80, 443)
    def check_port(port):
        import socket
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        result = sock.connect_ex(('127.0.0.1', port))
        sock.close()
        return result == 0

    conflicting_services = []
    if check_port(80): conflicting_services.append("HTTP (Port 80)")
    if check_port(443): conflicting_services.append("HTTPS (Port 443)")
    
    if conflicting_services:
        print(f"[!] DİKKAT: Şu portlar dolu görünüyor: {', '.join(conflicting_services)}")
        print("[*] Sistemdeki Apache/Nginx servisleri portları işgal ediyor olabilir.")
        print("[*] Çakışan servisler durdurulmaya çalışılıyor...")
        run_command("systemctl stop apache2 nginx || true")
        run_command("systemctl disable apache2 nginx || true")
        time.sleep(2)

    # 3.5 Firewall Configuration (UFW)
    print("[*] Firewall (UFW) portları açılıyor...")
    # Ensure ufw is installed
    run_command("apt-get install -y ufw")
    run_command("ufw allow 22/tcp")  # SSH (Critical!)
    run_command("ufw allow 80/tcp")  # HTTP
    run_command("ufw allow 443/tcp") # HTTPS
    run_command("ufw allow 81/tcp")  # NPM Admin
    run_command("ufw allow 51820/udp") # WireGuard
    # run_command("ufw --force enable") # Don't force enable, might lock user out if SSH config varies. Just allow rules.

    # 4. Automate Docker Installation
    try:
        subprocess.run(["docker", "--version"], capture_output=True, check=True)
        print("[✓] Docker bulundu.")
    except:
        print("[!] Docker bulunamadı. Otomatik kurulum başlatılıyor...")
        time.sleep(1)
        
        # Install Docker via official script
        if run_command("curl -fsSL https://get.docker.com | sh"):
            print("[✓] Docker başarıyla kuruldu.")
            print("[*] Docker servisi başlatılıyor...")
            run_command("sudo systemctl start docker && sudo systemctl enable docker")
            # Add user to docker group (optional but good practice)
            # run_command("sudo usermod -aG docker $USER") 
        else:
            print("[✗] Docker otomatik kurulamadı. Lütfen 'curl -fsSL https://get.docker.com | sh' komutunu elle çalıştırın.")
            return

    time.sleep(1)
    
    print("\n[Aşama 2/3] İnteraktif Yapılandırma")
    print("----------------------------------------------------")
    domain = input("Ana alan adınızı girin (ör: berqenas.com): ") or "localhost"
    db_pass = getpass.getpass("PostgreSQL 'postgres' kullanıcısı şifresini girin: ")
    admin_user = input("Arayüz Admin kullanıcı adı (varsayılan: admin): ") or "admin"
    admin_pass = getpass.getpass(f"'{admin_user}' kullanıcısı için şifre belirleyin: ")
    admin_email = input("Admin e-posta adresi: ") or "admin@berqenas.com"
    secret_key = secrets.token_hex(32)
    
    # .env Dosyasını Oluştur (Root ve Backend için)
    env_content = f"""# Berqenas Platform - Production Env
DEBUG=False
SECRET_KEY={secret_key}
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

POSTGRES_PASSWORD={db_pass}
DATABASE_URL=postgresql://postgres:{db_pass}@db:5432/berqenas
REDIS_URL=redis://redis:6379/0

ALLOWED_ORIGINS=http://{domain}
WIREGUARD_CONFIG_DIR=/etc/wireguard
WIREGUARD_INTERFACE=wg0

# Auto-Setup Config (Used by Backend Container on Start)
SETUP_ADMIN_USER={admin_user}
SETUP_ADMIN_EMAIL={admin_email}
SETUP_ADMIN_PASSWORD={admin_pass}
"""
    
    # Write to root and backend
    with open(".env", "w") as f:
        f.write(env_content)
    with open("backend/fastapi/.env", "w") as f:
        f.write(env_content)
        
    print("[✓] Yapılandırma dosyaları (.env) başarıyla oluşturuldu.")
    time.sleep(1)

    print("\n[Aşama 3/3] Docker Dağıtımı Başlatılıyor")
    print("----------------------------------------------------")
    print("Konteynerler (Proxy, DB, Backend, Frontend) kuruluyor...")
    
    if run_command("docker compose up -d --build"):
        print("\n[✓] Konteynerler başarıyla başlatıldı.")
        print("[+] Backend servisi veritabanını otomatik olarak başlatıyor...")
        time.sleep(5) 
        
        print("\n[Aşama 3.1/3] Nginx Proxy Manager Otomatik Yapılandırılıyor...")
        print("----------------------------------------------------")
        try:
            # Wait a bit more for DB to be totally ready
            time.sleep(5)
            npm_cmd = f"{sys.executable} setup_npm.py --email '{admin_email}' --password '{admin_pass}' --domain '{domain}'"
            run_command(npm_cmd)
        except Exception as e:
            print(f"[!] NPM Otomasyon Hatası: {e}")
            print("[*] Ayarları manuel yapmanız gerekebilir.")

        print("\n====================================================")
        print("   TEBRİKLER! Berqenas başarıyla kuruldu.          ")
        print(f"   Ana Panel:   https://{domain}                   ")
        print(f"   API Docs:    https://{domain}:8000/api/docs     ")
        print(f"   SSL & Proxy: http://{domain}:81                 ")
        print("   ------------------------------------------------")
        print("   NPM Giriş Bilgileri:                            ")
        print(f"   E-posta: {admin_email}                          ")
        print(f"   Şifre  : {admin_pass}                           ")
        print("====================================================\n")
    else:
        print("\n[✗] Kurulum sırasında bir hata oluştu.")

if __name__ == "__main__":
    install()
