# Berqenas Cloud & Security Platform

A comprehensive multi-tenant cloud platform featuring WireGuard VPN management, remote database synchronization, auto-API generation, and a modern control panel.

![Berqenas Platform](https://via.placeholder.com/1200x600?text=Berqenas+Cloud+Platform)

## 🚀 Features

- **Multi-Tenancy**: Isolated environments for multiple clients.
- **WireGuard VPN**: Automated VPN client management and secure tunneling.
- **Remote Database Sync**:
  - Connect on-premise MSSQL/PostgreSQL databases via VPN.
  - Bi-directional synchronization with conflict resolution.
  - Auto-API generation (REST CRUD) for synced tables.
- **Control Panel**: Modern React-based dashboard for management.
- **Gateway & NAT**: Securely expose internal services.

## 🏗️ Architecture

The platform consists of three main components:

1.  **Backend (FastAPI)**:
    - REST API for management.
    - WireGuard interface control.
    - Database sync engine (SQLAlchemy).
    - Auto-API generator.

2.  **Frontend (React/Vite)**:
    - Modern control panel.
    - Tenant & VPN management.
    - Analytics dashboard.

3.  **Infrastructure**:
    - PostgreSQL (System DB).
    - WireGuard (VPN Server).
    - Docker Compose orchestration.

## 🛠️ Installation & Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed production deployment instructions using Docker.

### Quick Start (Development)

1.  **Backend**:
    ```bash
    cd backend/fastapi
    pip install -r requirements.txt
    uvicorn main:app --reload
    ```

2.  **Frontend**:
    ```bash
    cd frontend/panel
    npm install
    npm run dev
    ```

3.  **Access**:
    - Panel: http://localhost:5173
    - API Docs: http://localhost:8000/api/docs

## 📂 Project Structure

```
/
├── backend/
│   └── fastapi/       # Core API & Logic
├── frontend/
│   └── panel/         # React Control Panel
├── infra/             # Infrastructure scripts (SQL, etc.)
├── docs/              # Documentation
├── docker-compose.yml # Container orchestration
└── DEPLOYMENT.md      # Deployment guide
```

## 🔒 Security

- All database connections are encrypted via WireGuard.
- Frontend talks to Backend via REST API.
- Production deployment uses Nginx reverse proxy.

## 📄 License

Proprietary Software. All rights reserved.
