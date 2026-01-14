const API_BASE_URL = 'http://localhost:8000/api/v1';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const api = {
  // Tenant Operations
  tenants: {
    list: () => fetch(`${API_BASE_URL}/tenant/list`).then(r => r.json()),
    create: (data: any) => fetch(`${API_BASE_URL}/tenant/create`, {
      method: 'POST',
      body: JSON.stringify(data)
    }).then(r => r.json()),
  },

  // Remote Sync Operations
  sync: {
    listRemoteDBs: () => fetch(`${API_BASE_URL}/sync/remote-db/list`).then(r => r.json()),
    registerDB: (data: any) => fetch(`${API_BASE_URL}/sync/remote-db/register`, {
      method: 'POST',
      body: JSON.stringify(data)
    }).then(r => r.json()),
    syncNow: (dbId: number) => fetch(`${API_BASE_URL}/sync/remote-db/${dbId}/sync`, {
      method: 'POST'
    }).then(r => r.json()),
  },

  // Auto-API Operations
  autogen: {
    listTables: (dbName: string) => fetch(`${API_BASE_URL}/autogen/tables/${dbName}`).then(r => r.json()),
    generate: (data: any) => fetch(`${API_BASE_URL}/autogen/generate`, {
      method: 'POST',
      body: JSON.stringify(data)
    }).then(r => r.json()),
  }
};