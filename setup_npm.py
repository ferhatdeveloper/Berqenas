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

def setup(admin_email, admin_password, domain):
    if not wait_for_npm():
        sys.exit(1)

    # 1. Login with default credentials
    print("[*] Varsayılan bilgilerle giriş yapılıyor...")
    token = get_token(DEFAULT_EMAIL, DEFAULT_PASS)
    
    # If default login fails, try with provided credentials (maybe already setup)
    if not token:
        print("[!] Varsayılan giriş başarısız. Yeni bilgilerle deneniyor...")
        token = get_token(admin_email, admin_password)
        if not token:
            print("[✗] Giriş yapılamadı.")
            sys.exit(1)
        print("[✓] Mevcut admin bilgileriyle giriş yapıldı.")
    else:
        # 2. Update Admin User
        print(f"[*] Admin kullanıcısı güncelleniyor ({admin_email})...")
        # Get user ID 1 details first? Usually ID 1 is the default admin.
        update_data = {
            "name": "Berqenas Admin",
            "email": admin_email,
            "roles": ["admin"]
        }
        api_request("PUT", "/users/1", token, update_data)
        
        # Change Password
        print("[*] Admin şifresi değiştiriliyor...")
        pass_data = {
            "type": "password",
            "secret": admin_password,
            "current": DEFAULT_PASS
        }
        api_request("PUT", "/users/1/auth", token, pass_data)
        
        # Re-login with new credentials
        token = get_token(admin_email, admin_password)
        if not token:
            print("[✗] Şifre değişiminden sonra giriş yapılamadı.")
            sys.exit(1)

    # 3. Create Proxy Host
    print(f"[*] Proxy Host oluşturuluyor: {domain} -> frontend:80")
    
    # Check if exists
    hosts = api_request("GET", "/nginx/proxy-hosts", token)
    existing_id = None
    if hosts:
        for host in hosts:
            if domain in host.get('domain_names', []):
                existing_id = host['id']
                break
    
    proxy_data = {
        "domain_names": [domain],
        "forward_scheme": "http",
        "forward_host": "frontend",
        "forward_port": 80,
        "access_list_id": 0,
        "certificate_id": "new", # Request new SSL
        "ssl_forced": True,
        "http2_support": True,
        "meta": {
            "letsencrypt_agree": True,
            "dns_challenge": False
        },
        "advanced_config": "",
        "locations": [
            {
                "path": "/api",
                "forward_scheme": "http",
                "forward_host": "backend",
                "forward_port": 8000,
                "advanced_config": ""
            }
        ],
        "block_exploits": True,
        "caching_enabled": True,
        "allow_websocket_upgrade": True
    }

    if existing_id:
        print(f"[!] {domain} zaten var (ID: {existing_id}). Güncelleniyor...")
        # For update, we might preserve cert ID if valid, but forcing 'new' re-requests.
        # Let's try to update it.
        # NOTE: If we update, we should usually pass the existing cert ID if we don't want to re-request.
        # Simplified: Just update routing, keep SSL logic.
        api_request("PUT", f"/nginx/proxy-hosts/{existing_id}", token, proxy_data)
    else:
        print("[*] Yeni Proxy Host ekleniyor...")
        api_request("POST", "/nginx/proxy-hosts", token, proxy_data)

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
