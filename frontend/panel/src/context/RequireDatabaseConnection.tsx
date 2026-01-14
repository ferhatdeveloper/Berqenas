import React from 'react';
import { Navigate } from 'react-router-dom';
import { useDatabaseConnections } from './DatabaseConnectionsContext';

interface Props {
  children: React.ReactNode;
}

const RequireDatabaseConnection: React.FC<Props> = ({ children }) => {
  const { selectedConnection } = useDatabaseConnections();

  if (!selectedConnection) {
    // Eğer seçili bağlantı yoksa, veritabanı seç/oluştur sayfasına yönlendir
    return <Navigate to="/select-database" replace />;
  }

  return <>{children}</>;
};

export default RequireDatabaseConnection; 