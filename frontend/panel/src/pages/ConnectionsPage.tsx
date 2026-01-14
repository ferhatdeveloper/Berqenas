import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  TrashIcon, 
  PencilIcon, 
  PlayIcon, 
  StopIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  CircleStackIcon,
  ServerIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { api } from '../services/api';

interface Connection {
  id: string;
  name: string;
  type: 'postgresql' | 'mysql' | 'mssql' | 'sqlite' | 'oracle';
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
  status: 'connected' | 'disconnected' | 'error' | 'testing';
  lastConnected?: string;
  poolSize: number;
  maxConnections: number;
  activeConnections: number;
  idleConnections: number;
}

const ConnectionsPage: React.FC = () => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingConnection, setEditingConnection] = useState<Connection | null>(null);
  const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>({});
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'postgresql' as Connection['type'],
    host: 'localhost',
    port: 5432,
    database: '',
    username: '',
    password: '',
    ssl: false,
    poolSize: 10,
    maxConnections: 100
  });

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    setLoading(true);
    try {
      const response = await api.getConnections();
      setConnections(response.connections || []);
    } catch (error) {
      console.error('Bağlantılar yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async (connection: Connection) => {
    try {
      // Test API'si henüz mevcut değil
      console.log('Test ediliyor:', connection.id);
      await loadConnections();
    } catch (error) {
      console.error('Bağlantı test edilemedi:', error);
    }
  };

  const addConnection = async () => {
    try {
      await api.createConnection(formData);
      setShowAddModal(false);
      resetForm();
      await loadConnections();
    } catch (error) {
      console.error('Bağlantı eklenemedi:', error);
    }
  };

  const updateConnection = async () => {
    if (!editingConnection) return;
    
    try {
      // Update API'si henüz mevcut değil
      console.log('Güncelleniyor:', editingConnection.id, formData);
      setEditingConnection(null);
      resetForm();
      await loadConnections();
    } catch (error) {
      console.error('Bağlantı güncellenemedi:', error);
    }
  };

  const deleteConnection = async (id: string) => {
    if (!confirm('Bu bağlantıyı silmek istediğinizden emin misiniz?')) return;
    
    try {
      await api.deleteConnection(id);
      await loadConnections();
    } catch (error) {
      console.error('Bağlantı silinemedi:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'postgresql',
      host: 'localhost',
      port: 5432,
      database: '',
      username: '',
      password: '',
      ssl: false,
      poolSize: 10,
      maxConnections: 100
    });
  };

  const openEditModal = (connection: Connection) => {
    setEditingConnection(connection);
    setFormData({
      name: connection.name,
      type: connection.type,
      host: connection.host,
      port: connection.port,
      database: connection.database,
      username: connection.username,
      password: connection.password,
      ssl: connection.ssl,
      poolSize: connection.poolSize,
      maxConnections: connection.maxConnections
    });
  };

  const getStatusIcon = (status: Connection['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'disconnected':
        return <XCircleIcon className="w-5 h-5 text-gray-400" />;
      case 'error':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
      case 'testing':
        return <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      default:
        return <XCircleIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: Connection['status']) => {
    switch (status) {
      case 'connected': return 'Bağlı';
      case 'disconnected': return 'Bağlantısız';
      case 'error': return 'Hata';
      case 'testing': return 'Test Ediliyor';
      default: return 'Bilinmiyor';
    }
  };

  const getDatabaseIcon = (type: Connection['type']) => {
    const iconClass = "w-5 h-5";
    switch (type) {
      case 'postgresql': return <CircleStackIcon className={`${iconClass} text-blue-600`} />;
      case 'mysql': return <CircleStackIcon className={`${iconClass} text-orange-600`} />;
      case 'mssql': return <CircleStackIcon className={`${iconClass} text-red-600`} />;
      case 'sqlite': return <CircleStackIcon className={`${iconClass} text-green-600`} />;
      case 'oracle': return <CircleStackIcon className={`${iconClass} text-red-800`} />;
      default: return <CircleStackIcon className={`${iconClass} text-gray-600`} />;
    }
  };

  const getDefaultPort = (type: Connection['type']) => {
    switch (type) {
      case 'postgresql': return 5432;
      case 'mysql': return 3306;
      case 'mssql': return 1433;
      case 'oracle': return 1521;
      default: return 5432;
    }
  };

  const handleTypeChange = (type: Connection['type']) => {
    setFormData(prev => ({
      ...prev,
      type,
      port: getDefaultPort(type)
    }));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Veritabanı Bağlantıları</h1>
          <p className="text-gray-600">Çoklu veritabanı bağlantılarını yönetin ve izleyin</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CircleStackIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Toplam Bağlantı</p>
                <p className="text-2xl font-bold text-gray-900">{connections.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Aktif Bağlantı</p>
                <p className="text-2xl font-bold text-gray-900">
                  {connections.filter(c => c.status === 'connected').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <ServerIcon className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Toplam Bağlantı Havuzu</p>
                <p className="text-2xl font-bold text-gray-900">
                  {connections.reduce((sum, c) => sum + c.activeConnections, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <KeyIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Boşta Bağlantı</p>
                <p className="text-2xl font-bold text-gray-900">
                  {connections.reduce((sum, c) => sum + c.idleConnections, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Yeni Bağlantı
            </button>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={loadConnections}
              disabled={loading}
              className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Yenile
            </button>
          </div>
        </div>

        {/* Connections Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {connections.map((connection) => (
              <div key={connection.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getDatabaseIcon(connection.type)}
                      <div>
                        <h3 className="font-semibold text-gray-900">{connection.name}</h3>
                        <p className="text-sm text-gray-500 capitalize">{connection.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(connection.status)}
                      <span className={`text-sm px-2 py-1 rounded-full ${
                        connection.status === 'connected' ? 'bg-green-100 text-green-800' :
                        connection.status === 'error' ? 'bg-red-100 text-red-800' :
                        connection.status === 'testing' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {getStatusText(connection.status)}
                      </span>
                    </div>
                  </div>

                  {/* Connection Details */}
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Host:</span>
                      <span className="font-mono text-gray-900">{connection.host}:{connection.port}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Database:</span>
                      <span className="font-mono text-gray-900">{connection.database}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Kullanıcı:</span>
                      <span className="font-mono text-gray-900">{connection.username}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Şifre:</span>
                      <div className="flex items-center space-x-1">
                        <span className="font-mono text-gray-900">
                          {showPassword[connection.id] ? connection.password : '••••••••'}
                        </span>
                        <button
                          onClick={() => setShowPassword(prev => ({ ...prev, [connection.id]: !prev[connection.id] }))}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {showPassword[connection.id] ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Pool Stats */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Bağlantı Havuzu</h4>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-gray-600">Aktif:</span>
                        <span className="ml-1 font-semibold text-blue-600">{connection.activeConnections}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Boşta:</span>
                        <span className="ml-1 font-semibold text-green-600">{connection.idleConnections}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Maks:</span>
                        <span className="ml-1 font-semibold text-gray-600">{connection.maxConnections}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => testConnection(connection)}
                      disabled={connection.status === 'testing'}
                      className="flex-1 flex items-center justify-center px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
                    >
                      <PlayIcon className="w-4 h-4 mr-1" />
                      Test Et
                    </button>
                    <button
                      onClick={() => openEditModal(connection)}
                      className="flex items-center px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteConnection(connection.id)}
                      className="flex items-center px-3 py-2 text-sm text-red-600 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        {(showAddModal || editingConnection) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  {editingConnection ? 'Bağlantı Düzenle' : 'Yeni Bağlantı Ekle'}
                </h2>

                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bağlantı Adı
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Bağlantı adını girin"
                    />
                  </div>

                  {/* Database Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Veritabanı Türü
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => handleTypeChange(e.target.value as Connection['type'])}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="postgresql">PostgreSQL</option>
                      <option value="mysql">MySQL</option>
                      <option value="mssql">Microsoft SQL Server</option>
                      <option value="sqlite">SQLite</option>
                      <option value="oracle">Oracle</option>
                    </select>
                  </div>

                  {/* Host & Port */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Host
                      </label>
                      <input
                        type="text"
                        value={formData.host}
                        onChange={(e) => setFormData(prev => ({ ...prev, host: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="localhost"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Port
                      </label>
                      <input
                        type="number"
                        value={formData.port}
                        onChange={(e) => setFormData(prev => ({ ...prev, port: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Database & Username */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Veritabanı Adı
                      </label>
                      <input
                        type="text"
                        value={formData.database}
                        onChange={(e) => setFormData(prev => ({ ...prev, database: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="veritabani_adi"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kullanıcı Adı
                      </label>
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="kullanici"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Şifre
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="••••••••"
                    />
                  </div>

                  {/* SSL & Pool Settings */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="ssl"
                        checked={formData.ssl}
                        onChange={(e) => setFormData(prev => ({ ...prev, ssl: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="ssl" className="ml-2 text-sm text-gray-700">
                        SSL Kullan
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Havuz Boyutu
                      </label>
                      <input
                        type="number"
                        value={formData.poolSize}
                        onChange={(e) => setFormData(prev => ({ ...prev, poolSize: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="1"
                        max="50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maks Bağlantı
                      </label>
                      <input
                        type="number"
                        value={formData.maxConnections}
                        onChange={(e) => setFormData(prev => ({ ...prev, maxConnections: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="10"
                        max="200"
                      />
                    </div>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingConnection(null);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    onClick={editingConnection ? updateConnection : addConnection}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingConnection ? 'Güncelle' : 'Ekle'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionsPage; 