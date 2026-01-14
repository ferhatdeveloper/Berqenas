import React, { useState } from 'react';
import { Database, Plus, Settings, TestTube, Trash2, Copy, ExternalLink } from 'lucide-react';

const DatabasePage = () => {
  const [selectedConnection, setSelectedConnection] = useState(1);

  const connections = [
    {
      id: 1,
      name: 'Production Database',
      type: 'PostgreSQL',
      host: 'db.example.com',
      port: 5432,
      database: 'graphcore_prod',
      username: 'admin',
      status: 'connected',
      lastSync: '2024-01-15 14:30:00',
      size: '2.4 GB',
      tables: 45,
    },
    {
      id: 2,
      name: 'Development Database',
      type: 'PostgreSQL',
      host: 'localhost',
      port: 5432,
      database: 'graphcore_dev',
      username: 'dev_user',
      status: 'connected',
      lastSync: '2024-01-15 14:25:00',
      size: '1.2 GB',
      tables: 23,
    },
    {
      id: 3,
      name: 'Analytics Database',
      type: 'MySQL',
      host: 'analytics.example.com',
      port: 3306,
      database: 'analytics',
      username: 'analytics_user',
      status: 'disconnected',
      lastSync: '2024-01-15 12:00:00',
      size: '5.8 GB',
      tables: 67,
    },
    {
      id: 4,
      name: 'Backup Database',
      type: 'PostgreSQL',
      host: 'backup.example.com',
      port: 5432,
      database: 'graphcore_backup',
      username: 'backup_user',
      status: 'connected',
      lastSync: '2024-01-15 14:20:00',
      size: '2.4 GB',
      tables: 45,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'text-green-600 bg-green-100';
      case 'disconnected':
        return 'text-red-600 bg-red-100';
      case 'connecting':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <div className="w-2 h-2 bg-green-500 rounded-full" />;
      case 'disconnected':
        return <div className="w-2 h-2 bg-red-500 rounded-full" />;
      case 'connecting':
        return <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />;
      default:
        return <div className="w-2 h-2 bg-gray-500 rounded-full" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'PostgreSQL':
        return 'text-blue-600 bg-blue-100';
      case 'MySQL':
        return 'text-orange-600 bg-orange-100';
      case 'SQLite':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const selectedConnectionData = connections.find(conn => conn.id === selectedConnection);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Veritabanı</h1>
            <p className="text-gray-600 mt-1">Veritabanı bağlantıları ve yönetimi</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              Yeni Bağlantı
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 bg-gray-50 flex">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r">
          <div className="p-4 border-b">
            <h3 className="text-lg font-medium text-gray-900">Bağlantılar</h3>
          </div>
          <div className="p-4">
            <div className="space-y-2">
              {connections.map((connection) => (
                <button
                  key={connection.id}
                  onClick={() => setSelectedConnection(connection.id)}
                  className={`w-full text-left p-4 rounded-lg border transition-colors ${
                    selectedConnection === connection.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(connection.status)}
                      <h4 className="font-medium text-gray-900">{connection.name}</h4>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getTypeColor(connection.type)}`}>
                      {connection.type}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">{connection.host}:{connection.port}</p>
                    <p className="text-sm text-gray-500">{connection.database}</p>
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getStatusColor(connection.status)}`}>
                        {connection.status === 'connected' ? 'Bağlı' : 
                         connection.status === 'disconnected' ? 'Bağlantı Yok' : 'Bağlanıyor'}
                      </span>
                      <span className="text-xs text-gray-400">{connection.size}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {selectedConnectionData && (
            <div className="space-y-6">
              {/* Connection Details */}
              <div className="bg-white rounded-lg border">
                <div className="px-6 py-4 border-b">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">{selectedConnectionData.name}</h3>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(selectedConnectionData.status)}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedConnectionData.status)}`}>
                        {selectedConnectionData.status === 'connected' ? 'Bağlı' : 
                         selectedConnectionData.status === 'disconnected' ? 'Bağlantı Yok' : 'Bağlanıyor'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-3">Bağlantı Bilgileri</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Tür:</span>
                          <span className="text-sm font-medium text-gray-900">{selectedConnectionData.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Host:</span>
                          <span className="text-sm font-medium text-gray-900">{selectedConnectionData.host}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Port:</span>
                          <span className="text-sm font-medium text-gray-900">{selectedConnectionData.port}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Veritabanı:</span>
                          <span className="text-sm font-medium text-gray-900">{selectedConnectionData.database}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Kullanıcı:</span>
                          <span className="text-sm font-medium text-gray-900">{selectedConnectionData.username}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-3">İstatistikler</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Boyut:</span>
                          <span className="text-sm font-medium text-gray-900">{selectedConnectionData.size}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Tablo Sayısı:</span>
                          <span className="text-sm font-medium text-gray-900">{selectedConnectionData.tables}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Son Senkronizasyon:</span>
                          <span className="text-sm font-medium text-gray-900">{selectedConnectionData.lastSync}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="bg-white rounded-lg border">
                <div className="px-6 py-4 border-b">
                  <h3 className="text-lg font-medium text-gray-900">İşlemler</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                      <TestTube className="h-4 w-4" />
                      Bağlantıyı Test Et
                    </button>
                    <button className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                      <Settings className="h-4 w-4" />
                      Ayarları Düzenle
                    </button>
                    <button className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                      Bağlantıyı Sil
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg border">
                <div className="px-6 py-4 border-b">
                  <h3 className="text-lg font-medium text-gray-900">Hızlı İşlemler</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button className="flex flex-col items-center gap-2 p-4 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100">
                      <Database className="h-6 w-6 text-blue-600" />
                      <span>Tablo Yöneticisi</span>
                    </button>
                    <button className="flex flex-col items-center gap-2 p-4 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100">
                      <Copy className="h-6 w-6 text-green-600" />
                      <span>Yedek Al</span>
                    </button>
                    <button className="flex flex-col items-center gap-2 p-4 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100">
                      <ExternalLink className="h-6 w-6 text-purple-600" />
                      <span>SQL Editor</span>
                    </button>
                    <button className="flex flex-col items-center gap-2 p-4 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100">
                      <Settings className="h-6 w-6 text-orange-600" />
                      <span>Şema Görüntüle</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DatabasePage; 