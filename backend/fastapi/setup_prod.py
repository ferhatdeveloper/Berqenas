import os
import secrets
import getpass
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from models.user import User
from services.auth import get_password_hash

def clear_screen():
    os.system('cls' if os.name == 'nt' else 'clear')

def setup():
    clear_screen()
    print("====================================================")
    print("   Berqenas Cloud & Security - Kurulum Sihirbazı   ")
    print("====================================================\n")

    # 1. Veritabanı Şifresi
    print("[1/3] Veritabanı Yapılandırması")
    db_pass = getpass.getpass("PostgreSQL 'postgres' kullanıcısı şifresini girin: ")
    
    # 2. Admin Kullanıcısı
    print("\n[2/3] Yönetici Hesabı Oluşturma")
    admin_user = input("Admin kullanıcı adı (varsayılan: admin): ") or "admin"
    admin_pass = getpass.getpass(f"'{admin_user}' kullanıcısı için şifre belirleyin: ")
    admin_email = input("Admin e-posta adresi: ") or "admin@berqenas.com"

    # 3. Güvenlik Anahtarı
    print("\n[3/3] Güvenlik Yapılandırması")
    secret_key = secrets.token_hex(32)
    print(f"Uygulama Secret Key otomatik oluşturuldu.")

    # .env Dosyasını Oluştur
    env_content = f"""# Berqenas Platform - Production Env
DEBUG=False
SECRET_KEY={secret_key}
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

DATABASE_URL=postgresql://postgres:{db_pass}@localhost:5432/berqenas
REDIS_URL=redis://localhost:6379/0

ALLOWED_ORIGINS=http://localhost:5173
WIREGUARD_CONFIG_DIR=/etc/wireguard
WIREGUARD_INTERFACE=wg0
"""

    with open(".env", "w") as f:
        f.write(env_content)
    
    print("\n[+] '.env' dosyası başarıyla oluşturuldu.")

    # Veritabanı İlklendirme
    print("[+] Veritabanı tabloları oluşturuluyor...")
    Base.metadata.create_all(bind=engine)

    print(f"[+] '{admin_user}' hesabı oluşturuluyor...")
    db = SessionLocal()
    try:
        existing_user = db.query(User).filter(User.username == admin_user).first()
        if not existing_user:
            new_admin = User(
                username=admin_user,
                email=admin_email,
                full_name="System Administrator",
                hashed_password=get_password_hash(admin_pass),
                is_active=True
            )
            db.add(new_admin)
            db.commit()
            print(f"[✓] Yönetici hesabı '{admin_user}' başarıyla oluşturuldu.")
        else:
            print("[!] Yönetici hesabı zaten mevcut, atlanıyor.")
    except Exception as e:
        print(f"[✗] Hata oluştu: {e}")
    finally:
        db.close()

    print("\n====================================================")
    print("   KURULUM TAMAMLANDI! Platformu başlatabilirsiniz.  ")
    print("====================================================\n")

if __name__ == "__main__":
    setup()
