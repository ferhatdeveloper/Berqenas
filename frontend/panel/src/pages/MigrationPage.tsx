import React, { useState, useEffect, useCallback } from 'react';
import {
  Database,
  FileText,
  Upload,
  Download,
  Play,
  Pause,
  RotateCcw,
  RefreshCw,
  Filter,
  Search,
  Eye,
  EyeOff,
  Settings,
  Trash2,
  Copy,
  Share2,
  MoreVertical,
  Edit,
  Star,
  StarOff,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  Table,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  X,
  Plus,
  Minus,
  Target,
  Flag,
  Award,
  Crown,
  Badge,
  Star as StarIcon,
  Heart,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Server,
  Cloud,
  HardDrive,
  Network,
  Globe,
  Shield,
  ShieldCheck,
  AlertTriangle,
  Info,
  HelpCircle,
  ExternalLink,
  Loader2,
  Save,
  Loader2 as Spinner,
  GitBranch,
  GitCommit,
  GitMerge,
  GitPullRequest,
  History,
  Calendar,
  Clock as TimeIcon,
  User as UserIcon,
  Database as DbIcon,
  Table as TableIcon,
  FileText as FileIcon,
  Code,
  Terminal,
  Command,
  Zap,
  Lightning,
  Flash,
  Sparkles,
  Magic,
  Wand2,
  Hammer,
  Wrench,
  Screwdriver,
  Tool,
  Settings2,
  Cog,
  Gear,
  Sliders,
  ToggleLeft,
  ToggleRight,
  CheckSquare,
  Square,
  Circle,
  Dot,
  Hash,
  Hash as HashIcon,
  Key,
  Lock,
  Unlock,
  KeyRound,
  Fingerprint,
  Smartphone as Mobile,
  Monitor as Desktop,
  Laptop as LaptopIcon,
  Tablet as TabletIcon,
  SmartphoneIcon as MobileIcon,
  Cloud as CloudIcon,
  CloudOff,
  Sun,
  Moon,
  Palette,
  Layers,
  Layout,
  Grid3X3,
  Columns,
  Rows,
  Maximize,
  Minimize,
  Move,
  RotateCcw as RotateCcwIcon,
  RotateCw as RotateCwIcon,
  ZoomIn,
  ZoomOut,
  Fullscreen,
  FullscreenExit,
  Save as SaveIcon,
  Loader2 as SpinnerIcon,
} from 'lucide-react';

// Migration Item Component
const MigrationItem: React.FC<{
  migration: {
    id: string;
    name: string;
    version: string;
    description: string;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'rolled_back';
    type: 'up' | 'down';
    database: string;
    table?: string;
    sql: string;
    createdAt: string;
    executedAt?: string;
    executedBy?: string;
    duration?: number;
    error?: string;
    checksum: string;
    dependencies?: string[];
  };
  onExecute: (id: string) => void;
  onRollback: (id: string) => void;
  onViewDetails: (migration: any) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}> = ({ migration, onExecute, onRollback, onViewDetails, onEdit, onDelete }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="text-gray-500" size={16} />;
      case 'running':
        return <Loader2 className="animate-spin text-blue-500" size={16} />;
      case 'completed':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'failed':
        return <AlertCircle className="text-red-500" size={16} />;
      case 'rolled_back':
        return <RotateCcw className="text-orange-500" size={16} />;
      default:
        return <Circle className="text-gray-500" size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'rolled_back':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Beklemede';
      case 'running':
        return 'Çalışıyor';
      case 'completed':
        return 'Tamamlandı';
      case 'failed':
        return 'Başarısız';
      case 'rolled_back':
        return 'Geri Alındı';
      default:
        return 'Bilinmiyor';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'up':
        return <ArrowUp className="text-green-500" size={16} />;
      case 'down':
        return <ArrowDown className="text-red-500" size={16} />;
      default:
        return <Database className="text-gray-500" size={16} />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '-';
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          {getStatusIcon(migration.status)}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-medium text-gray-900">{migration.name}</h3>
              <span className="text-xs text-gray-500">v{migration.version}</span>
              {getTypeIcon(migration.type)}
            </div>
            
            <p className="text-sm text-gray-600 mt-1">{migration.description}</p>
            
            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <Database size={12} />
                <span>{migration.database}</span>
              </div>
              
              {migration.table && (
                <div className="flex items-center space-x-1">
                  <Table size={12} />
                  <span>{migration.table}</span>
                </div>
              )}
              
              <div className="flex items-center space-x-1">
                <Clock size={12} />
                <span>{formatDate(migration.createdAt)}</span>
              </div>
              
              {migration.executedAt && (
                <div className="flex items-center space-x-1">
                  <TimeIcon size={12} />
                  <span>{formatDate(migration.executedAt)}</span>
                </div>
              )}
              
              {migration.duration && (
                <div className="flex items-center space-x-1">
                  <Zap size={12} />
                  <span>{formatDuration(migration.duration)}</span>
                </div>
              )}
            </div>
            
            {migration.error && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                {migration.error}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(migration.status)}`}>
            {getStatusText(migration.status)}
          </span>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onViewDetails(migration)}
              className="p-1 text-gray-400 hover:text-gray-600"
              title="Detayları Görüntüle"
            >
              <Eye size={14} />
            </button>
            
            {migration.status === 'pending' && (
              <button
                onClick={() => onExecute(migration.id)}
                className="p-1 text-gray-400 hover:text-green-600"
                title="Çalıştır"
              >
                <Play size={14} />
              </button>
            )}
            
            {migration.status === 'completed' && (
              <button
                onClick={() => onRollback(migration.id)}
                className="p-1 text-gray-400 hover:text-orange-600"
                title="Geri Al"
              >
                <RotateCcw size={14} />
              </button>
            )}
            
            <button
              onClick={() => onEdit(migration.id)}
              className="p-1 text-gray-400 hover:text-gray-600"
              title="Düzenle"
            >
              <Edit size={14} />
            </button>
            
            <button
              onClick={() => onDelete(migration.id)}
              className="p-1 text-gray-400 hover:text-red-600"
              title="Sil"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Migration History Component
const MigrationHistory: React.FC<{
  history: Array<{
    id: string;
    migrationId: string;
    migrationName: string;
    action: 'up' | 'down';
    status: 'success' | 'failed';
    executedAt: string;
    executedBy: string;
    duration: number;
    error?: string;
  }>;
}> = ({ history }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-4">
    <h3 className="text-lg font-medium text-gray-900 mb-4">Migration Geçmişi</h3>
    
    <div className="space-y-3">
      {history.map((item) => (
        <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            {item.status === 'success' ? (
              <CheckCircle className="text-green-500" size={16} />
            ) : (
              <AlertCircle className="text-red-500" size={16} />
            )}
            
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900">{item.migrationName}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  item.action === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {item.action === 'up' ? 'Yükselt' : 'Düşür'}
                </span>
              </div>
              
              <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                <span>{new Date(item.executedAt).toLocaleString('tr-TR')}</span>
                <span>{item.executedBy}</span>
                <span>{item.duration}ms</span>
              </div>
            </div>
          </div>
          
          {item.error && (
            <div className="text-xs text-red-600 max-w-xs truncate" title={item.error}>
              {item.error}
            </div>
          )}
        </div>
      ))}
      
      {history.length === 0 && (
        <div className="text-center py-8">
          <History className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Geçmiş bulunamadı</h3>
          <p className="mt-1 text-sm text-gray-500">Henüz migration çalıştırılmamış.</p>
        </div>
      )}
    </div>
  </div>
);

const MigrationPage: React.FC = () => {
  // State management
  const [migrations, setMigrations] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [selectedMigration, setSelectedMigration] = useState<any>(null);
  const [showMigrationDetails, setShowMigrationDetails] = useState(false);
  const [showCreateMigration, setShowCreateMigration] = useState(false);
  const [showUploadMigration, setShowUploadMigration] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'running' | 'completed' | 'failed' | 'rolled_back'>('all');
  const [filterType, setFilterType] = useState<'all' | 'up' | 'down'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'version' | 'createdAt' | 'status'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState<string | null>(null);
  const [showToast, setShowToast] = useState<{type: 'success' | 'error', message: string} | null>(null);

  // Mock data
  const mockMigrations = [
    {
      id: '1',
      name: 'Create users table',
      version: '001',
      description: 'Create users table with basic fields',
      status: 'completed' as const,
      type: 'up' as const,
      database: 'production',
      table: 'users',
      sql: 'CREATE TABLE users (id SERIAL PRIMARY KEY, name VARCHAR(255), email VARCHAR(255) UNIQUE, created_at TIMESTAMP DEFAULT NOW());',
      createdAt: '2024-01-15T10:30:00Z',
      executedAt: '2024-01-15T10:35:00Z',
      executedBy: 'admin',
      duration: 2500,
      checksum: 'abc123def456',
      dependencies: []
    },
    {
      id: '2',
      name: 'Add user roles',
      version: '002',
      description: 'Add role column to users table',
      status: 'pending' as const,
      type: 'up' as const,
      database: 'production',
      table: 'users',
      sql: 'ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT \'user\';',
      createdAt: '2024-01-15T11:00:00Z',
      checksum: 'def456ghi789',
      dependencies: ['001']
    },
    {
      id: '3',
      name: 'Create products table',
      version: '003',
      description: 'Create products table',
      status: 'failed' as const,
      type: 'up' as const,
      database: 'production',
      table: 'products',
      sql: 'CREATE TABLE products (id SERIAL PRIMARY KEY, name VARCHAR(255), price DECIMAL(10,2), created_at TIMESTAMP DEFAULT NOW());',
      createdAt: '2024-01-15T11:30:00Z',
      executedAt: '2024-01-15T11:35:00Z',
      executedBy: 'admin',
      duration: 1500,
      error: 'Table already exists',
      checksum: 'ghi789jkl012',
      dependencies: []
    },
    {
      id: '4',
      name: 'Drop old table',
      version: '004',
      description: 'Drop deprecated table',
      status: 'rolled_back' as const,
      type: 'down' as const,
      database: 'production',
      table: 'old_data',
      sql: 'DROP TABLE old_data;',
      createdAt: '2024-01-15T12:00:00Z',
      executedAt: '2024-01-15T12:05:00Z',
      executedBy: 'admin',
      duration: 800,
      checksum: 'jkl012mno345',
      dependencies: []
    }
  ];

  const mockHistory = [
    {
      id: '1',
      migrationId: '1',
      migrationName: 'Create users table',
      action: 'up' as const,
      status: 'success' as const,
      executedAt: '2024-01-15T10:35:00Z',
      executedBy: 'admin',
      duration: 2500
    },
    {
      id: '2',
      migrationId: '3',
      migrationName: 'Create products table',
      action: 'up' as const,
      status: 'failed' as const,
      executedAt: '2024-01-15T11:35:00Z',
      executedBy: 'admin',
      duration: 1500,
      error: 'Table already exists'
    },
    {
      id: '3',
      migrationId: '4',
      migrationName: 'Drop old table',
      action: 'down' as const,
      status: 'success' as const,
      executedAt: '2024-01-15T12:05:00Z',
      executedBy: 'admin',
      duration: 800
    }
  ];

  // Toast notification
  const showNotification = useCallback((type: 'success' | 'error', message: string) => {
    setShowToast({ type, message });
    setTimeout(() => setShowToast(null), 3000);
  }, []);

  // Load data on mount
  useEffect(() => {
    loadMigrationData();
  }, []);

  const loadMigrationData = async () => {
    setLoading(true);
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMigrations(mockMigrations);
      setHistory(mockHistory);
    } catch (error) {
      showNotification('error', 'Migration verileri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort migrations
  const filteredAndSortedMigrations = migrations
    .filter(migration => {
      if (searchQuery) {
        return migration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
               migration.description.toLowerCase().includes(searchQuery.toLowerCase());
      }
      if (filterStatus !== 'all') {
        return migration.status === filterStatus;
      }
      if (filterType !== 'all') {
        return migration.type === filterType;
      }
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'version':
          comparison = a.version.localeCompare(b.version);
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Migration operations
  const handleExecuteMigration = async (id: string) => {
    setExecuting(id);
    try {
      // Simulate migration execution
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setMigrations(prev => prev.map(migration => 
        migration.id === id ? { 
          ...migration, 
          status: 'completed' as const,
          executedAt: new Date().toISOString(),
          executedBy: 'admin',
          duration: Math.floor(Math.random() * 5000) + 1000
        } : migration
      ));
      
      showNotification('success', 'Migration başarıyla çalıştırıldı');
    } catch (error) {
      setMigrations(prev => prev.map(migration => 
        migration.id === id ? { 
          ...migration, 
          status: 'failed' as const,
          error: 'Migration execution failed'
        } : migration
      ));
      
      showNotification('error', 'Migration çalıştırılırken hata oluştu');
    } finally {
      setExecuting(null);
    }
  };

  const handleRollbackMigration = async (id: string) => {
    setExecuting(id);
    try {
      // Simulate rollback
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setMigrations(prev => prev.map(migration => 
        migration.id === id ? { 
          ...migration, 
          status: 'rolled_back' as const
        } : migration
      ));
      
      showNotification('success', 'Migration başarıyla geri alındı');
    } catch (error) {
      showNotification('error', 'Migration geri alınırken hata oluştu');
    } finally {
      setExecuting(null);
    }
  };

  const handleViewDetails = (migration: any) => {
    setSelectedMigration(migration);
    setShowMigrationDetails(true);
  };

  const handleEditMigration = (id: string) => {
    const migration = migrations.find(m => m.id === id);
    if (migration) {
      setSelectedMigration(migration);
      setShowCreateMigration(true);
    }
  };

  const handleDeleteMigration = async (id: string) => {
    try {
      setMigrations(prev => prev.filter(m => m.id !== id));
      showNotification('success', 'Migration başarıyla silindi');
    } catch (error) {
      showNotification('error', 'Migration silinirken hata oluştu');
    }
  };

  const handleCreateMigration = async (migrationData: any) => {
    try {
      const newMigration = {
        id: Date.now().toString(),
        ...migrationData,
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
        checksum: Math.random().toString(36).substring(7),
        dependencies: []
      };
      
      setMigrations(prev => [newMigration, ...prev]);
      setShowCreateMigration(false);
      setSelectedMigration(null);
      showNotification('success', 'Migration başarıyla oluşturuldu');
    } catch (error) {
      showNotification('error', 'Migration oluşturulurken hata oluştu');
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
            <h1 className="text-xl font-semibold text-gray-900">Migration Yönetimi</h1>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowCreateMigration(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Plus size={16} />
                <span>Yeni Migration</span>
              </button>
              
              <button
                onClick={() => setShowUploadMigration(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
              >
                <Upload size={16} />
                <span>Migration Yükle</span>
              </button>
              
              <button
                onClick={loadMigrationData}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Migration'larda ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="pending">Beklemede</option>
              <option value="running">Çalışıyor</option>
              <option value="completed">Tamamlandı</option>
              <option value="failed">Başarısız</option>
              <option value="rolled_back">Geri Alındı</option>
            </select>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tüm Türler</option>
              <option value="up">Yükselt</option>
              <option value="down">Düşür</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="createdAt">Oluşturulma</option>
              <option value="name">İsim</option>
              <option value="version">Versiyon</option>
              <option value="status">Durum</option>
            </select>
            
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              {sortOrder === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Migrations List */}
            <div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Migration'lar</h2>
                
                <div className="space-y-4">
                  {filteredAndSortedMigrations.map((migration) => (
                    <MigrationItem
                      key={migration.id}
                      migration={migration}
                      onExecute={handleExecuteMigration}
                      onRollback={handleRollbackMigration}
                      onViewDetails={handleViewDetails}
                      onEdit={handleEditMigration}
                      onDelete={handleDeleteMigration}
                    />
                  ))}
                  
                  {filteredAndSortedMigrations.length === 0 && (
                    <div className="text-center py-8">
                      <Database className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">Migration bulunamadı</h3>
                      <p className="mt-1 text-sm text-gray-500">Filtrelerinizi kontrol edin veya yeni migration oluşturun.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Migration History */}
            <div>
              <MigrationHistory history={history} />
            </div>
          </div>
        </div>
      </div>

      {/* Migration Details Modal */}
      {showMigrationDetails && selectedMigration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Migration Detayları</h3>
              <button
                onClick={() => setShowMigrationDetails(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-96">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">SQL</h4>
                  <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
                    {selectedMigration.sql}
                  </pre>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Bilgiler</h4>
                    <dl className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Versiyon:</dt>
                        <dd className="text-gray-900">{selectedMigration.version}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Veritabanı:</dt>
                        <dd className="text-gray-900">{selectedMigration.database}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Tablo:</dt>
                        <dd className="text-gray-900">{selectedMigration.table || '-'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Checksum:</dt>
                        <dd className="text-gray-900 font-mono text-xs">{selectedMigration.checksum}</dd>
                      </div>
                    </dl>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Durum</h4>
                    <dl className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Durum:</dt>
                        <dd className="text-gray-900">{selectedMigration.status}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Tür:</dt>
                        <dd className="text-gray-900">{selectedMigration.type}</dd>
                      </div>
                      {selectedMigration.executedAt && (
                        <div className="flex justify-between">
                          <dt className="text-gray-500">Çalıştırılma:</dt>
                          <dd className="text-gray-900">{new Date(selectedMigration.executedAt).toLocaleString('tr-TR')}</dd>
                        </div>
                      )}
                      {selectedMigration.executedBy && (
                        <div className="flex justify-between">
                          <dt className="text-gray-500">Çalıştıran:</dt>
                          <dd className="text-gray-900">{selectedMigration.executedBy}</dd>
                        </div>
                      )}
                      {selectedMigration.duration && (
                        <div className="flex justify-between">
                          <dt className="text-gray-500">Süre:</dt>
                          <dd className="text-gray-900">{selectedMigration.duration}ms</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MigrationPage; 