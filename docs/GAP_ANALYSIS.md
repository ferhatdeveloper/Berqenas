# Berqenas Platform - Gap Analysis & Requirements

## 🚨 Critical Gaps (Must Fix for Functionality)

### 1. Backend Implementation (Skeleton Only)
The current backend files are architectural skeletons. The actual logic is replaced with `TODO` comments.
- **Bi-Directional Sync (`bidirectional_sync.py`)**:
  - `_detect_changes_mssql`: Query logic exists but no database execution.
  - `_detect_changes_postgres`: Returns empty list.
  - `_apply_changes_to_local`: Returns 0, no DB write.
  - `_apply_changes_to_cloud`: Returns 0, no DB write.
- **Remote Sync API (`remote_sync_api.py`)**:
  - `register_remote_database`: Returns mock success, doesn't save to DB.
  - `sync_remote_database`: Background task is empty.
  - `get_remote_db_status`: Returns hardcoded static data.

### 2. Database Integration
- **Missing Persistence**: No database models or tables created for:
  - `remote_databases` (to store connection details)
  - `sync_jobs` (to track history)
  - `sync_conflicts` (to store unresolved conflicts)
- **Credential Storage**: Database passwords are currently passed in JSON, need secure storage (Vault or Encrypted DB column).

### 3. WireGuard Integration
- **No Automation**: API endpoints for VPN do not actually call the `wg` command or generate config files.
- **Connectivity Check**: `_check_wireguard_status` is not implemented (mocked).

---

## ⚠️ Important Gaps (Needed for Production)

### 1. Frontend Integration
- **Mock Data**: React pages (`TenantsPage.tsx`, `Dashboard.tsx`, etc.) use `useState` with hardcoded arrays. They do not call the `api.ts` services.
- **Authentication**:
  - Frontend has no login flow / JWT storage.
  - Backend endpoints are unprotected (no `Depends(get_current_user)`).

### 2. Auto-API Generator
- **Type Mapping**: Current mapper is basic. Needs comprehensive mapping for all SQL types (e.g., `geometry`, `jsonb`, `money`).
- **Dynamic Reload**: When a new API is generated, the FastAPI server needs to reload or dynamically mount the new router without downtime. currently, it requires a restart.

---

## 🎨 Nice-to-Have (Future Improvements)

### 1. Monitoring & Alerts
- Real-time WebSocket updates for sync status on the dashboard.
- Email/Slack alerts for failed syncs or critical conflicts.

### 2. Orchestration
- **Docker Compose**: A `docker-compose.yml` to spin up:
  - Berqenas Backend (FastAPI)
  - Berqenas Frontend (Vite)
  - PostgreSQL (System DB)
  - WireGuard container

---

## 🗺️ Recommended Roadmap

### Phase 1: Core Functionality (Next Session)
1.  **Implement DB Models**: Create SQLAlchemy/Pydantic models for `RemoteDatabase` and `SyncJob`.
2.  **Flesh out Sync Logic**: Write the actual `cursor.execute` code in `bidirectional_sync.py`.
3.  **Real API Integration**: Update React pages to `useEffect(() => api.tenants.list()...)` instead of mock data.

### Phase 2: Security & Networking
1.  **Implement JWT Auth**: Secure the backend and add Login page logic.
2.  **WireGuard Scripting**: Connect python subproccess calls to actual `wg` CLI commands.

### Phase 3: Polish
1.  **Dockerization**: Containerize the app for easy deployment.
2.  **Unit Testing**: Verify sync logic with test databases.
