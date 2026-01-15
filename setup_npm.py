import urllib.request
import urllib.error
import json
import time
import sys
import argparse

# Configuration
NPM_API_URL = "http://localhost:81/api"
DEFAULT_EMAIL = "admin@example.com"
DEFAULT_PASS = "changeme"

def get_token(email, password):
    """authenticate and return access token"""
    try:
        data = json.dumps({"identity": email, "secret": password}).encode('utf-8')
        headers = {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        req = urllib.request.Request(f"{NPM_API_URL}/tokens", data=data, headers=headers, method='POST')
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            return result.get('token')
    except urllib.error.HTTPError as e:
        try:
            error_body = e.read().decode('utf-8')
        except:
            error_body = ""

        if e.code == 400 or e.code == 401:
            # NPM returns 400 for "Invalid email or password"
            print(f"[!] Login failed ({e.code}): {error_body}")
            return None
            
        print(f"[!] HTTP Error {e.code}: {error_body}")
        raise e

def api_request(method, endpoint, token, data=None):
    """Generic API request wrapper"""
    url = f"{NPM_API_URL}{endpoint}"
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}'
    }
    
    body = None
    if data:
        body = json.dumps(data).encode('utf-8')
        
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        print(f"[!] API Error {endpoint}: {e.code} - {e.reason}")
        try:
            print(e.read().decode('utf-8'))
        except:
            pass
        return None

def wait_for_npm():
    """Wait until NPM is up and running"""
    print("[*] Nginx Proxy Manager'ın başlaması bekleniyor...")
    for i in range(30):
        try:
            urllib.request.urlopen(f"{NPM_API_URL}/", timeout=2)
            print("[✓] NPM API erişilebilir.")
            return True
        except:
            time.sleep(2)
            print(".", end="", flush=True)
    print("\n[✗] NPM başlatılamadı.")
    return False

def ask_user(question, default="e"):
    """Ask user a yes/no question"""
    valid = {"e": True, "h": False}
    prompt = f"{question} [E/h]" if default == "e" else f"{question} [e/H]"
    while True:
        sys.stdout.write(prompt + ": ")
        choice = input().lower()
        if choice == "":
            return valid[default]
        if choice in valid:
            return valid[choice]
        print("Lütfen 'e' veya 'h' girin.")

def retry_operation(operation, error_msg, max_retries=3):
    """Retry an operation with user interaction on failure"""
    for attempt in range(max_retries):
        if operation():
            return True
        print(f"[!] {error_msg} (Deneme {attempt+1}/{max_retries})")
        time.sleep(2)
    
    # If failed all automatic retries, ask user
    if ask_user(f"[?] {error_msg} başarısız oldu. Tekrar denemek ister misiniz?"):
        return retry_operation(operation, error_msg, max_retries)
    return False

def setup(admin_email, admin_password, domain):
    if not wait_for_npm():
        sys.exit(1)

    # 1. Login with default credentials
    # Smart Retry Loop for Initial DB Seeding
    print("[*] Nginx Proxy Manager veritabanı bekleniyor...")
    token = None
    while not token:
        # Try automatically for 5 minutes (60 * 5s)
        for i in range(60):
            token = get_token(DEFAULT_EMAIL, DEFAULT_PASS)
            if token: break
            
            # Also try with provided credentials in case it was already set up
            token = get_token(admin_email, admin_password)
            if token: break
            
            print(f"[!] Veritabanı henüz hazır değil... ({i+1}/60)")
            time.sleep(5)
        
        if token: break
        
        # If still failing, ask user
        print("\n[!] NPM veritabanı yanıt vermiyor (Zaman aşımı).")
        if not ask_user("Daha fazla beklemek ister misiniz? (Hayır derseniz kurulum durur)"):
            sys.exit(1)
        print("[*] Beklemeye devam ediliyor...")

    print("[✓] Giriş başarılı.")

    # 2. Update Admin User
    # Define operations for retry wrapper
    def update_admin_logic():
        # Check if we are using default creds (token from default email)
        # If we logged in with new creds, we might skip this or handle differently
        # Simplified: Just try to update ID 1.
        update_data = {"name": "Berqenas Admin", "email": admin_email, "roles": ["admin"]}
        return api_request("PUT", "/users/1", token, update_data)

    if not retry_operation(update_admin_logic, "Admin bilgileri güncellenemiyor"):
        print("[!] Admin güncellemesi atlandı (Manuel düzeltme gerekebilir).")

    # Change Password
    def change_pass_logic():
        pass_data = {"type": "password", "secret": admin_password, "current": DEFAULT_PASS}
        return api_request("PUT", "/users/1/auth", token, pass_data)

    # Only try changing password if we logged in with default
    # If we logged in with provided credentials, token is valid for them.
    # How to distinguish? We can try to get token with default again.
    if get_token(DEFAULT_EMAIL, DEFAULT_PASS):
        print("[*] Varsayılan şifre değiştiriliyor...")
        if not retry_operation(change_pass_logic, "Admin şifresi değiştirilemedi"):
             print("[!] Şifre değişimi başarısız. Lütfen panelden manuel değiştirin.")
        
        # Re-login required
        token = get_token(admin_email, admin_password)
        if not token:
            print("[✗] Şifre değişiminden sonra yeni şifreyle giriş yapılamadı!")
            sys.exit(1)

    # 3. Create Proxy Host
    print(f"[*] Proxy Host yapılandırılıyor: {domain}")
    
    def configure_proxy_logic():
        # Check existing
        hosts = api_request("GET", "/nginx/proxy-hosts", token) or []
        existing_id = next((h['id'] for h in hosts if domain in h.get('domain_names', [])), None)
        
        proxy_data = {
            "domain_names": [domain],
            "forward_scheme": "http",
            "forward_host": "frontend",
            "forward_port": 80,
            "access_list_id": 0,
            "certificate_id": "new",
            "ssl_forced": True,
            "http2_support": True,
            "meta": {
                "letsencrypt_email": admin_email,
                "letsencrypt_agree": True,
                "dns_challenge": False
            },
            "advanced_config": "",
            "locations": [
                {
                    "path": "/api",
                    "forward_scheme": "http",
                    "forward_host": "backend",
                    "forward_port": 8000
                }
            ],
            "block_exploits": True,
            "caching_enabled": True, # Websocket support requires this often implies upgrade too
            "allow_websocket_upgrade": True
        }

        if existing_id:
            print(f"[*] Mevcut kayıt tespit edildi (ID: {existing_id}). Temizleniyor...")
            # Instead of updating (which causes 500 if SSL state is weird), DELETE first.
            api_request("DELETE", f"/nginx/proxy-hosts/{existing_id}", token)
            time.sleep(2) # Give it a moment
            
        print("[*] Yeni Proxy Host oluşturuluyor...")
        return api_request("POST", "/nginx/proxy-hosts", token, proxy_data)

    if not retry_operation(configure_proxy_logic, "Proxy Host ve SSL yapılandırılamadı"):
        print("\n[!] OTOMATİK KURULUM BAŞARISIZ OLDU.")
        print("Lütfen panelden manuel ekleyiniz (Port 81).")
        sys.exit(1)

    print("\n[✓] NPM Kurulumu Tamamlandı!")
    print(f"    Admin: {admin_email}")
    print(f"    Site : https://{domain}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--email", required=True, help="Admin Email")
    parser.add_argument("--password", required=True, help="Admin Password")
    parser.add_argument("--domain", required=True, help="Domain Name")
    args = parser.parse_args()
    
    setup(args.email, args.password, args.domain)
