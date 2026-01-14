const API_BASE_URL = 'http://localhost:8000/api/v1';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const api = {
  // Auth Operations
  auth: {
    login: (formData: FormData) => fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: formData // OAuth2PasswordRequestForm uses form-data
    }).then(r => r.json()),
    me: (token: string) => fetch(`${API_BASE_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json()),
  },

  // Tenant Operations
  tenants: {
    list: () => fetch(`${API_BASE_URL}/tenant/list`).then(r => r.json()),
    create: (data: any) => fetch(`${API_BASE_URL}/tenant/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),
  },

  // Remote Sync Operations
  sync: {
    listRemoteDBs: () => fetch(`${API_BASE_URL}/sync/remote-db/list`).then(r => r.json()),
    registerDB: (data: any) => fetch(`${API_BASE_URL}/sync/remote-db/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),
    syncNow: (dbId: number) => fetch(`${API_BASE_URL}/sync/remote-db/${dbId}/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }).then(r => r.json()),
  },

  // Auto-API Operations
  autogen: {
    listTables: (dbName: string) => fetch(`${API_BASE_URL}/autogen/tables/${dbName}`).then(r => r.json()),
    generate: (data: any) => fetch(`${API_BASE_URL}/autogen/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),
  },

  // Dashboard & Network
  dashboard: {
    stats: () => fetch(`${API_BASE_URL}/dashboard/stats`).then(r => r.json()),
  },
  network: {
    clients: () => fetch(`${API_BASE_URL}/network/clients`).then(r => r.json()),
  }
};