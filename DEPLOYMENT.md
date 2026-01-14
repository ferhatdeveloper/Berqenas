# Berqenas Cloud - Production Deployment Guide

## 🚀 Deployment Steps

### 1. Prepare Server
Ensure your Ubuntu/Debian server has Docker and Docker Compose installed.

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

### 2. Copy Files
Upload the project files to your server (e.g., via SCP or Git).

Required structure:
```
/opt/berqenas/
├── docker-compose.yml
├── backend/
│   └── fastapi/
│       ├── Dockerfile
│       ├── requirements.txt
│       └── ...
└── frontend/
    └── panel/
        ├── Dockerfile
        ├── package.json
        └── ...
```

### 3. Configure Environment
Create a `.env` file for secrets (do not commit this):

```ini
POSTGRES_PASSWORD=SuperSecurePassword123
DATABASE_URL=postgresql://berqenas:SuperSecurePassword123@db:5432/berqenas
WIREGUARD_PRIVATE_KEY=...
```

### 4. Build & Launch
Run the stack using Docker Compose:

```bash
cd /opt/berqenas
docker compose up -d --build
```

### 5. Verify Status
Check if all containers are running:
```bash
docker compose ps
```

You should see:
- `backend` (Port 8000)
- `frontend` (Port 80)
- `db` (Postgres 5432)
- `wireguard` (UDP 51820)

---

## 🌐 Access
- **Control Panel**: http://your-server-ip
- **API**: http://your-server-ip:8000/api/docs

## 🔒 Security Post-Install
1. Setup Nginx/Traefik as reverse proxy with SSL (Let's Encrypt).
2. Firewall: Allow only ports 80, 443, and 51820 (UDP).
3. Change default passwords.
