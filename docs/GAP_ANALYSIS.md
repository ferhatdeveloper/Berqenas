# Berqenas Platform - Gap Analysis & Deep Completion Roadmap (v1.2)

## ✅ Completed & Verified
- **Frontend Connectivity**: All pages (Tenants, Remote DBs, Dashboard, VPN, Gateway) are now connected to the FastAPI backend via `api.ts`.
- **Headless API Engine**: Hasura is integrated into `docker-compose.yml` and managed via `HasuraService`.
- **Infrastructure**: Full Docker stack defined (Frontend, Backend, DB, Hasura, WireGuard, Redis).
- **Git Setup**: Local repository initialized and initial commit completed.

## 🚨 Critical "Deep" Gaps (The "Mock" Problem)
The deep audit revealed that while the project looks "complete" from the UI, the core system logic is largely composed of **Architectural Skeletons (Mocks)**.

### 1. Authentication & Security
- **Backend**: NO JWT logic. Routers exist but lack security deps. Endpoints are unprotected.
- **Frontend**: NO Login/Register screens. Tokens are not handled.
- **Secrets**: Database passwords for remote connections are stored/transmitted in plain text.

### 2. System Level Operations
- **Tenant Provisioner**: The API claims to create a tenant, but no PostgreSQL schema, user, or role is actually created on the database server.
- **WireGuard Manager**: The VPN page buttons "Add Client" send requests, but no WireGuard `.conf` files are generated, and `wg` service is not reloaded.
- **Firewall/NAT**: Gateway exposure logic is currently just `logger.info`. It does not interact with `ufw` or `iptables`.

### 3. Data Sync Engine
- **Logic**: `bidirectional_sync.py` has the structure for change detection but returns hardcoded 0s or empty lists.
- **Reliability**: Sync jobs run inside the FastAPI process; they should be moved to Celery/Redis for production resilience.

---

## 🗺️ Deep Completion Roadmap (TODO List)

### Phase 9: Security & Real Logic
- [ ] **JWT Auth System**: Implement `auth.py` and secure all routers.
- [ ] **Provisioning Service**: Implement real PostgreSQL schema/role automation.
- [ ] **Network Service**: Implement real WireGuard and Iptables command execution.

### Phase 10: Advanced Data Flow
- [ ] **Real-time Sync**: Implement RowVersion-based delta sync for MSSQL.
- [ ] **Hasura Automation**: Automatically track/untrack tables in Hasura based on sync results.

### Phase 11: Production Deployment
- [ ] **CLI Security**: Secure the CLI tool with API keys.
- [ ] **Monitoring**: Add health checks for VPN and Remote DB connections.
