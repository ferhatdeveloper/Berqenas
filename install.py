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
    
    print("[Aşama 1/3] Sistem Kontrolleri")
    # Check docker
    try:
        subprocess.run(["docker", "--version"], capture_output=True, check=True)
        print("[✓] Docker bulundu.")
    except:
        print("[✗] Docker bulunamadı! Lütfen önce Docker'ı kurun.")
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
        
        print("\n[+] Veritabanı şemaları ve yönetici hesabı hazırlanıyor...")
        time.sleep(10) # Give containers time to initialize
        
        # Admin initialization script embedded
        setup_cmd = f"docker compose exec backend python -c \"from database import Base, engine, SessionLocal; from models.user import User; from services.auth import get_password_hash; Base.metadata.create_all(bind=engine); db=SessionLocal(); existing=db.query(User).filter(User.username == '{admin_user}').first(); (not existing and db.add(User(username='{admin_user}', email='{admin_email}', hashed_password=get_password_hash('{admin_pass}'), is_active=True)) or True); db.commit(); db.close(); print('✓ Veritabanı hazır.')\""
        
        run_command(setup_cmd)
        
        print("\n====================================================")
        print("   TEBRİKLER! Berqenas başarıyla kuruldu.          ")
        print(f"   Ana Panel:   http://{domain}                    ")
        print(f"   API Docs:    http://{domain}:8000/api/docs      ")
        print(f"   SSL & Proxy: http://{domain}:81                 ")
        print("   ------------------------------------------------")
        print("   NPM Varsayılan Giriş:                           ")
        print("   E-posta: admin@example.com                      ")
        print("   Şifre  : changeme                               ")
        print("====================================================\n")
    else:
        print("\n[✗] Kurulum sırasında bir hata oluştu.")

if __name__ == "__main__":
    install()
