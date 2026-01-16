#!/usr/bin/env python3
import subprocess
import sys
import time
import shutil

# ANSI Colors
RED = "\033[91m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
CYAN = "\033[96m"
RESET = "\033[0m"

def print_status(message, status="info"):
    if status == "info":
        print(f"[*] {message}")
    elif status == "success":
        print(f"{GREEN}[✓] {message}{RESET}")
    elif status == "warning":
        print(f"{YELLOW}[!] {message}{RESET}")
    elif status == "error":
        print(f"{RED}[✗] {message}{RESET}")

def run_command(command):
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        return result.stdout.strip(), result.stderr.strip(), result.returncode
    except Exception as e:
        return "", str(e), 1

def check_docker_containers():
    print_status("Konteyner Durumları Kontrol Ediliyor...", "info")
    
    required_containers = [
        "berqenas-proxy-1",
        "berqenas-backend-1",
        "berqenas-frontend-1",
        "berqenas-db-1",
        "berqenas-redis-1",
        "berqenas-worker-1"
    ]
    
    all_healthy = True
    
    # Get formatted output: "Name Status"
    out, err, code = run_command("docker ps -a --format '{{.Names}}|{{.Status}}'")
    
    if code != 0:
        print_status("Docker çalışmıyor veya erişilemiyor!", "error")
        return False

    running_containers = {}
    for line in out.split("\n"):
        if "|" in line:
            name, status = line.split("|")
            running_containers[name] = status

    for container in required_containers:
        status = running_containers.get(container, "MISSING")
        
        if "Up" in status and "Restarting" not in status:
            print(f"  {GREEN}●{RESET} {container:<25} : ÇALIŞIYOR ({status})")
        elif "Restarting" in status:
            print(f"  {RED}●{RESET} {container:<25} : ÇÖKÜYOR (Restart Loop) - {status}")
            all_healthy = False
            # Fetch logs for restarting container
            log_out, _, _ = run_command(f"docker logs {container} --tail 10")
            print(f"{YELLOW}    Son Hatalar:{RESET}\n{log_out}\n")
        elif "Exited" in status:
            print(f"  {RED}●{RESET} {container:<25} : DURDU ({status})")
            all_healthy = False
        else:
            print(f"  {RED}●{RESET} {container:<25} : BULUNAMADI")
            all_healthy = False

    return all_healthy

def check_ports():
    print_status("Port Erişilebilirlik Testi...", "info")
    ports = {
        80: "Frontend (HTTP)",
        81: "NPM Admin Panel",
        8000: "Backend API (Internal)"
    }
    
    for port, name in ports.items():
        # Using netcat (nc) to check port locally
        out, _, code = run_command(f"nc -z -v -w1 localhost {port}")
        # Note: 'nc' output goes to stderr mostly
        if code == 0:
             print(f"  {GREEN}●{RESET} Port {port:<5} ({name:<20}) : AÇIK")
        else:
             print(f"  {RED}●{RESET} Port {port:<5} ({name:<20}) : KAPALI (veya meşgul)")

def check_backend_health():
    print_status("Backend Sağlık Kontrolü...", "info")
    # Check for recent errors in logs even if running
    out, _, _ = run_command("docker logs berqenas-backend-1 --tail 50")
    
    critical_errors = ["Traceback", "Error:", "Exception", "ModuleNotFoundError", "NameError"]
    found_errors = [line for line in out.split('\n') if any(err in line for err in critical_errors)]
    
    if found_errors:
        print_status(f"Backend loglarında {len(found_errors)} adet olası hata tespit edildi!", "warning")
        for err in found_errors[-3:]: # Show last 3
            print(f"    {YELLOW}{err.strip()}{RESET}")
    else:
        print_status("Backend logları temiz görünüyor.", "success")

def main():
    print(f"\n{CYAN}=============================================={RESET}")
    print(f"{CYAN}   Berqenas Sistem Analiz Aracı v1.0          {RESET}")
    print(f"{CYAN}=============================================={RESET}\n")
    
    containers_ok = check_docker_containers()
    print("-" * 40)
    
    if shutil.which("nc"):
        check_ports()
        print("-" * 40)
    
    check_backend_health()
    
    print(f"\n{CYAN}=============================================={RESET}")
    if containers_ok:
        print(f"{GREEN}GENEL DURUM: SİSTEM SAĞLIKLI GÖRÜNÜYOR ✅{RESET}")
    else:
        print(f"{RED}GENEL DURUM: SİSTEMDE SORUNLAR VAR ⚠️{RESET}")
        print(f"{YELLOW}Öneri: Yukarıdaki kırmızı hataları kontrol edin.{RESET}")
        print(f"{YELLOW}Öneri: 'docker logs <container_adi>' komutu ile detaylara bakın.{RESET}")
    print(f"{CYAN}=============================================={RESET}\n")

if __name__ == "__main__":
    main()
