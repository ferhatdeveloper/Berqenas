import React, { useState, useEffect, useCallback } from 'react';
import {
  Database,
  Users,
  FileText,
  Activity,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  X,
  Plus,
  Settings,
  RefreshCw,
  Download,
  Upload,
  Eye,
  EyeOff,
  Grid,
  List,
  Filter,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Share2,
  Star,
  StarOff,
  Lock,
  Unlock,
  Wifi,
  WifiOff,
  Server,
  HardDrive,
  Cpu,
  Network,
  Globe,
  Shield,
  ShieldCheck,
  AlertTriangle,
  Info,
  HelpCircle,
  ExternalLink,
  Zap,
  Target,
  Flag,
  Award,
  Crown,
  Badge,
  Heart,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Bell,
  BellOff,
  Mail,
  Phone,
  MapPin,
  User,
  UserCheck,
  UserX,
  UserPlus,
  UserMinus,
  Key,
  Fingerprint,
  Smartphone,
  Monitor,
  Laptop,
  Tablet,
  Cloud,
  CloudOff,
  Sun,
  Moon,
  Palette,
  Layers,
  Layout,
  Columns,
  Rows,
  Maximize,
  Minimize,
  Move,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Save,
  Loader2,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

// Widget Component
const Widget: React.FC<{
  id: string;
  title: string;
  type: 'chart' | 'metric' | 'list' | 'status';
  data: any;
  size: 'small' | 'medium' | 'large';
  position: { x: number; y: number };
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, position: { x: number; y: number }) => void;
  onResize: (id: string, size: 'small' | 'medium' | 'large') => void;
}> = ({ id, title, type, data, size, position, onEdit, onDelete, onMove, onResize }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const sizeClasses = {
    small: 'col-span-1 row-span-1',
    medium: 'col-span-2 row-span-1',
    large: 'col-span-2 row-span-2',
  };

  const renderWidgetContent = () => {
    switch (type) {
      case 'metric':
        return (
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">{data.value}</div>
            <div className="text-sm text-gray-500">{data.label}</div>
            {data.change && (
              <div className={`flex items-center justify-center mt-2 text-sm ${
                data.change > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {data.change > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                <span className="ml-1">{Math.abs(data.change)}%</span>
              </div>
            )}
          </div>
        );

      case 'chart':
        return (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">{data.title || 'Grafik'}</p>
            </div>
          </div>
        );

      case 'list':
        return (
          <div className="space-y-2">
            {data.items?.map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center space-x-2">
                  {item.icon && <item.icon size={14} className="text-gray-500" />}
                  <span className="text-sm text-gray-900">{item.label}</span>
                </div>
                <span className="text-sm font-medium text-gray-700">{item.value}</span>
              </div>
            ))}
          </div>
        );

      case 'status':
        return (
          <div className="space-y-2">
            {data.items?.map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    item.status === 'online' ? 'bg-green-500' :
                    item.status === 'offline' ? 'bg-red-500' :
                    item.status === 'warning' ? 'bg-yellow-500' : 'bg-gray-500'
                  }`} />
                  <span className="text-sm text-gray-900">{item.name}</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  item.status === 'online' ? 'bg-green-100 text-green-800' :
                  item.status === 'offline' ? 'bg-red-100 text-red-800' :
                  item.status === 'warning' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {item.status === 'online' ? 'Çevrimiçi' :
                   item.status === 'offline' ? 'Çevrimdışı' :
                   item.status === 'warning' ? 'Uyarı' : 'Bilinmiyor'}
                </span>
              </div>
            ))}
          </div>
        );

      default:
        return <div>Bilinmeyen widget türü</div>;
    }
  };

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow ${sizeClasses[size]}`}
      style={{ gridColumn: position.x + 1, gridRow: position.y + 1 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-900">{title}</h3>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onEdit(id)}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={() => onDelete(id)}
            className="p-1 text-gray-400 hover:text-red-600"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      
      <div className="h-full">
        {renderWidgetContent()}
      </div>
    </div>
  );
};

// Connection Status Component
const ConnectionStatus: React.FC<{
  connection: {
    id: string;
    name: string;
    type: 'postgresql' | 'mysql' | 'mssql' | 'sqlite' | 'oracle';
    host: string;
    port: number;
    database: string;
    status: 'connected' | 'disconnected' | 'error';
    lastConnected: string;
    tableCount: number;
    size: string;
  };
  onConnect: (id: string) => void;
  onDisconnect: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}> = ({ connection, onConnect, onDisconnect, onEdit, onDelete }) => {
  const getDatabaseIcon = (type: string) => {
    switch (type) {
      case 'postgresql':
        return <Database className="text-blue-500" size={20} />;
      case 'mysql':
        return <Database className="text-orange-500" size={20} />;
      case 'mssql':
        return <Database className="text-red-500" size={20} />;
      case 'sqlite':
        return <Database className="text-green-500" size={20} />;
      case 'oracle':
        return <Database className="text-red-600" size={20} />;
      default:
        return <Database className="text-gray-500" size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800';
      case 'disconnected':
        return 'bg-gray-100 text-gray-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected':
        return 'Bağlı';
      case 'disconnected':
        return 'Bağlantı Kesildi';
      case 'error':
        return 'Hata';
      default:
        return 'Bilinmiyor';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getDatabaseIcon(connection.type)}
          <div>
            <h3 className="text-sm font-medium text-gray-900">{connection.name}</h3>
            <p className="text-xs text-gray-500">{connection.host}:{connection.port}/{connection.database}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(connection.status)}`}>
            {getStatusText(connection.status)}
          </span>
          
          <div className="flex items-center space-x-1">
            {connection.status === 'connected' ? (
              <button
                onClick={() => onDisconnect(connection.id)}
                className="p-1 text-gray-400 hover:text-red-600"
                title="Bağlantıyı Kes"
              >
                <WifiOff size={14} />
              </button>
            ) : (
              <button
                onClick={() => onConnect(connection.id)}
                className="p-1 text-gray-400 hover:text-green-600"
                title="Bağlan"
              >
                <Wifi size={14} />
              </button>
            )}
            
            <button
              onClick={() => onEdit(connection.id)}
              className="p-1 text-gray-400 hover:text-gray-600"
              title="Düzenle"
            >
              <Edit size={14} />
            </button>
            
            <button
              onClick={() => onDelete(connection.id)}
              className="p-1 text-gray-400 hover:text-red-600"
              title="Sil"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-3 gap-4 text-xs text-gray-500">
        <div>
          <div className="font-medium text-gray-900">{connection.tableCount}</div>
          <div>Tablo</div>
        </div>
        <div>
          <div className="font-medium text-gray-900">{connection.size}</div>
          <div>Boyut</div>
        </div>
        <div>
          <div className="font-medium text-gray-900">
            {new Date(connection.lastConnected).toLocaleDateString('tr-TR')}
          </div>
          <div>Son Bağlantı</div>
        </div>
      </div>
    </div>
  );
};

// System Stats Component
const SystemStats: React.FC<{
  stats: {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
    activeConnections: number;
    totalUsers: number;
    totalTables: number;
    totalFiles: number;
  };
}> = ({ stats }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-900">CPU</p>
          <p className="text-2xl font-bold text-gray-900">{stats.cpu}%</p>
        </div>
        <Cpu className="text-blue-500" size={24} />
      </div>
    </div>
    
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-900">Bellek</p>
          <p className="text-2xl font-bold text-gray-900">{stats.memory}%</p>
        </div>
                        <HardDrive className="text-green-500" size={24} />
      </div>
    </div>
    
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-900">Disk</p>
          <p className="text-2xl font-bold text-gray-900">{stats.disk}%</p>
        </div>
        <HardDrive className="text-orange-500" size={24} />
      </div>
    </div>
    
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-900">Ağ</p>
          <p className="text-2xl font-bold text-gray-900">{stats.network}%</p>
        </div>
        <Network className="text-purple-500" size={24} />
      </div>
    </div>
  </div>
);

const DashboardPage: React.FC = () => {
  // State management
  const [widgets, setWidgets] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [systemStats, setSystemStats] = useState<any>(null);
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [showAddConnection, setShowAddConnection] = useState(false);
  const [editWidget, setEditWidget] = useState<any>(null);
  const [editConnection, setEditConnection] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState<{type: 'success' | 'error', message: string} | null>(null);

  // Mock data
  const mockWidgets = [
    {
      id: '1',
      title: 'Aktif Kullanıcılar',
      type: 'metric',
      data: { value: 24, label: 'Kullanıcı', change: 12 },
      size: 'small' as const,
      position: { x: 0, y: 0 }
    },
    {
      id: '2',
      title: 'Toplam Tablo',
      type: 'metric',
      data: { value: 156, label: 'Tablo', change: -3 },
      size: 'small' as const,
      position: { x: 1, y: 0 }
    },
    {
      id: '3',
      title: 'Sistem Durumu',
      type: 'status',
      data: {
        items: [
          { name: 'Web Sunucusu', status: 'online' },
          { name: 'Veritabanı', status: 'online' },
          { name: 'Dosya Sunucusu', status: 'warning' },
          { name: 'E-posta Sunucusu', status: 'offline' }
        ]
      },
      size: 'medium' as const,
      position: { x: 0, y: 1 }
    },
    {
      id: '4',
      title: 'Son Aktiviteler',
      type: 'list',
      data: {
        items: [
          { label: 'Yeni kullanıcı eklendi', value: '2 dk önce', icon: UserPlus },
          { label: 'Tablo güncellendi', value: '5 dk önce', icon: Edit },
          { label: 'Dosya yüklendi', value: '10 dk önce', icon: Upload },
          { label: 'Bağlantı kesildi', value: '15 dk önce', icon: WifiOff }
        ]
      },
      size: 'medium' as const,
      position: { x: 2, y: 1 }
    }
  ];

  const mockConnections = [
    {
      id: '1',
      name: 'Production DB',
      type: 'postgresql' as const,
      host: '192.168.1.100',
      port: 5432,
      database: 'production',
      status: 'connected' as const,
      lastConnected: '2024-01-15T10:30:00Z',
      tableCount: 45,
      size: '2.5 GB'
    },
    {
      id: '2',
      name: 'Development DB',
      type: 'mysql' as const,
      host: '192.168.1.101',
      port: 3306,
      database: 'development',
      status: 'connected' as const,
      lastConnected: '2024-01-15T09:15:00Z',
      tableCount: 23,
      size: '1.2 GB'
    },
    {
      id: '3',
      name: 'Test DB',
      type: 'sqlite' as const,
      host: 'localhost',
      port: 0,
      database: 'test.db',
      status: 'disconnected' as const,
      lastConnected: '2024-01-14T16:45:00Z',
      tableCount: 12,
      size: '500 MB'
    }
  ];

  const mockSystemStats = {
    cpu: 45,
    memory: 68,
    disk: 72,
    network: 23,
    activeConnections: 8,
    totalUsers: 156,
    totalTables: 234,
    totalFiles: 1247
  };

  // Toast notification
  const showNotification = useCallback((type: 'success' | 'error', message: string) => {
    setShowToast({ type, message });
    setTimeout(() => setShowToast(null), 3000);
  }, []);

  // Load data on mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      setWidgets(mockWidgets);
      setConnections(mockConnections);
      setSystemStats(mockSystemStats);
    } catch (error) {
      showNotification('error', 'Dashboard verileri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Widget operations
  const handleAddWidget = async (widgetData: any) => {
    try {
      const newWidget = {
        id: Date.now().toString(),
        ...widgetData,
        position: { x: 0, y: 0 }
      };
      
      setWidgets(prev => [...prev, newWidget]);
      setShowAddWidget(false);
      showNotification('success', 'Widget başarıyla eklendi');
    } catch (error) {
      showNotification('error', 'Widget eklenirken hata oluştu');
    }
  };

  const handleEditWidget = (id: string) => {
    const widget = widgets.find(w => w.id === id);
    if (widget) {
      setEditWidget(widget);
      setShowAddWidget(true);
    }
  };

  const handleDeleteWidget = async (id: string) => {
    try {
      setWidgets(prev => prev.filter(w => w.id !== id));
      showNotification('success', 'Widget başarıyla silindi');
    } catch (error) {
      showNotification('error', 'Widget silinirken hata oluştu');
    }
  };

  const handleMoveWidget = (id: string, position: { x: number; y: number }) => {
    setWidgets(prev => prev.map(w => 
      w.id === id ? { ...w, position } : w
    ));
  };

  const handleResizeWidget = (id: string, size: 'small' | 'medium' | 'large') => {
    setWidgets(prev => prev.map(w => 
      w.id === id ? { ...w, size } : w
    ));
  };

  // Connection operations
  const handleAddConnection = async (connectionData: any) => {
    try {
      const newConnection = {
        id: Date.now().toString(),
        ...connectionData,
        status: 'disconnected' as const,
        lastConnected: new Date().toISOString(),
        tableCount: 0,
        size: '0 MB'
      };
      
      setConnections(prev => [...prev, newConnection]);
      setShowAddConnection(false);
      showNotification('success', 'Bağlantı başarıyla eklendi');
    } catch (error) {
      showNotification('error', 'Bağlantı eklenirken hata oluştu');
    }
  };

  const handleEditConnection = (id: string) => {
    const connection = connections.find(c => c.id === id);
    if (connection) {
      setEditConnection(connection);
      setShowAddConnection(true);
    }
  };

  const handleDeleteConnection = async (id: string) => {
    try {
      setConnections(prev => prev.filter(c => c.id !== id));
      showNotification('success', 'Bağlantı başarıyla silindi');
    } catch (error) {
      showNotification('error', 'Bağlantı silinirken hata oluştu');
    }
  };

  const handleConnect = async (id: string) => {
    try {
      // Simulate connection
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setConnections(prev => prev.map(c => 
        c.id === id ? { 
          ...c, 
          status: 'connected' as const, 
          lastConnected: new Date().toISOString() 
        } : c
      ));
      
      showNotification('success', 'Bağlantı başarılı');
    } catch (error) {
      showNotification('error', 'Bağlantı başarısız');
    }
  };

  const handleDisconnect = async (id: string) => {
    try {
      setConnections(prev => prev.map(c => 
        c.id === id ? { ...c, status: 'disconnected' as const } : c
      ));
      
      showNotification('success', 'Bağlantı kesildi');
    } catch (error) {
      showNotification('error', 'Bağlantı kesilirken hata oluştu');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Toast Notification */}
      {showToast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          showToast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            {showToast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            <span>{showToast.message}</span>
            <button onClick={() => setShowToast(null)} className="ml-2">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowAddWidget(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Plus size={16} />
                <span>Widget Ekle</span>
              </button>
              
              <button
                onClick={() => setShowAddConnection(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
              >
                <Database size={16} />
                <span>Bağlantı Ekle</span>
              </button>
              
              <button
                onClick={loadDashboardData}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* System Stats */}
        <div className="p-4">
          <SystemStats stats={systemStats} />
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Widgets Grid */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-gray-900">Widget'lar</h2>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      <Grid size={16} />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      <List size={16} />
                    </button>
                  </div>
                </div>
                
                <div className={`grid gap-4 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                    : 'grid-cols-1'
                }`}>
                  {widgets.map((widget) => (
                    <Widget
                      key={widget.id}
                      {...widget}
                      onEdit={handleEditWidget}
                      onDelete={handleDeleteWidget}
                      onMove={handleMoveWidget}
                      onResize={handleResizeWidget}
                    />
                  ))}
                  
                  {widgets.length === 0 && (
                    <div className="col-span-full flex items-center justify-center h-32">
                      <div className="text-center">
                        <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Widget bulunamadı</h3>
                        <p className="mt-1 text-sm text-gray-500">Dashboard'a widget ekleyin.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Connections */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Veritabanı Bağlantıları</h2>
                
                <div className="space-y-4">
                  {connections.map((connection) => (
                    <ConnectionStatus
                      key={connection.id}
                      connection={connection}
                      onConnect={handleConnect}
                      onDisconnect={handleDisconnect}
                      onEdit={handleEditConnection}
                      onDelete={handleDeleteConnection}
                    />
                  ))}
                  
                  {connections.length === 0 && (
                    <div className="text-center py-8">
                      <Database className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">Bağlantı bulunamadı</h3>
                      <p className="mt-1 text-sm text-gray-500">Veritabanı bağlantısı ekleyin.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 