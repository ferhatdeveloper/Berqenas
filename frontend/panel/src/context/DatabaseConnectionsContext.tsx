import React, { createContext, useContext, useState, ReactNode } from 'react';

// Desteklenen veritabanı türleri
type DatabaseType = 'postgresql' | 'mysql' | 'mssql' | 'sqlite' | 'oracle';

export interface DatabaseConnection {
  id: string;
  name: string;
  type: DatabaseType;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  status?: 'connected' | 'disconnected' | 'error';
}

interface DatabaseConnectionsContextProps {
  connections: DatabaseConnection[];
  selectedConnection: DatabaseConnection | null;
  addConnection: (conn: DatabaseConnection) => void;
  removeConnection: (id: string) => void;
  selectConnection: (id: string) => void;
  updateConnection: (conn: DatabaseConnection) => void;
}

const DatabaseConnectionsContext = createContext<DatabaseConnectionsContextProps | undefined>(undefined);

export const DatabaseConnectionsProvider = ({ children }: { children: ReactNode }) => {
  const [connections, setConnections] = useState<DatabaseConnection[]>([
    {
      id: 'default-postgres',
      name: 'Demo PostgreSQL',
      type: 'postgresql',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'password',
      database: 'demo',
      status: 'disconnected',
    },
  ]);
  const [selectedConnection, setSelectedConnection] = useState<DatabaseConnection | null>(connections[0] || null);

  const addConnection = (conn: DatabaseConnection) => {
    setConnections((prev) => [...prev, conn]);
  };

  const removeConnection = (id: string) => {
    setConnections((prev) => prev.filter((c) => c.id !== id));
    if (selectedConnection?.id === id) setSelectedConnection(null);
  };

  const selectConnection = (id: string) => {
    const found = connections.find((c) => c.id === id) || null;
    setSelectedConnection(found);
  };

  const updateConnection = (conn: DatabaseConnection) => {
    setConnections((prev) => prev.map((c) => (c.id === conn.id ? conn : c)));
    if (selectedConnection?.id === conn.id) setSelectedConnection(conn);
  };

  return (
    <DatabaseConnectionsContext.Provider
      value={{ connections, selectedConnection, addConnection, removeConnection, selectConnection, updateConnection }}
    >
      {children}
    </DatabaseConnectionsContext.Provider>
  );
};

export const useDatabaseConnections = () => {
  const ctx = useContext(DatabaseConnectionsContext);
  if (!ctx) throw new Error('useDatabaseConnections must be used within DatabaseConnectionsProvider');
  return ctx;
}; 