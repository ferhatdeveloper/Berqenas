import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Activity,
  Zap,
  Wifi,
  WifiOff,
  Play,
  Pause,
  Square,
  RefreshCw,
  Filter,
  Search,
  Eye,
  EyeOff,
  Settings,
  Download,
  Upload,
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
  Database,
  Table,
  FileText,
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
  MessageSquare as Chat,
  Bell as Notification,
  BellOff as NotificationOff,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Key,
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
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Fullscreen,
  FullscreenExit,
  Save,
  Loader2 as Spinner,
} from 'lucide-react';

// Event Item Component
const EventItem: React.FC<{
  event: {
    id: string;
    type: 'insert' | 'update' | 'delete' | 'create' | 'drop' | 'connect' | 'disconnect' | 'error' | 'warning' | 'info';
    table?: string;
    database?: string;
    user?: string;
    timestamp: string;
    details: string;
    data?: any;
    severity: 'low' | 'medium' | 'high' | 'critical';
    source: 'database' | 'file' | 'user' | 'system';
  };
  onViewDetails: (event: any) => void;
  onCopy: (event: any) => void;
  onShare: (event: any) => void;
}> = ({ event, onViewDetails, onCopy, onShare }) => {
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'insert':
        return <Plus className="text-green-500" size={16} />;
      case 'update':
        return <Edit className="text-blue-500" size={16} />;
      case 'delete':
        return <Trash2 className="text-red-500" size={16} />;
      case 'create':
        return <Plus className="text-green-500" size={16} />;
      case 'drop':
        return <Trash2 className="text-red-500" size={16} />;
      case 'connect':
        return <Wifi className="text-green-500" size={16} />;
      case 'disconnect':
        return <WifiOff className="text-red-500" size={16} />;
      case 'error':
        return <AlertCircle className="text-red-500" size={16} />;
      case 'warning':
        return <AlertTriangle className="text-yellow-500" size={16} />;
      case 'info':
        return <Info className="text-blue-500" size={16} />;
      default:
        return <Activity className="text-gray-500" size={16} />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'insert':
      case 'create':
      case 'connect':
        return 'border-l-green-500 bg-green-50';
      case 'update':
        return 'border-l-blue-500 bg-blue-50';
      case 'delete':
      case 'drop':
      case 'disconnect':
      case 'error':
        return 'border-l-red-500 bg-red-50';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'info':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'database':
        return <Database size={12} />;
      case 'file':
        return <FileText size={12} />;
      case 'user':
        return <User size={12} />;
      case 'system':
        return <Server size={12} />;
      default:
        return <Activity size={12} />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className={`border-l-4 p-4 rounded-r-lg ${getEventColor(event.type)}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          {getEventIcon(event.type)}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900">
                {event.type === 'insert' ? 'Yeni Kayıt' :
                 event.type === 'update' ? 'Güncelleme' :
                 event.type === 'delete' ? 'Silme' :
                 event.type === 'create' ? 'Oluşturma' :
                 event.type === 'drop' ? 'Silme' :
                 event.type === 'connect' ? 'Bağlantı' :
                 event.type === 'disconnect' ? 'Bağlantı Kesildi' :
                 event.type === 'error' ? 'Hata' :
                 event.type === 'warning' ? 'Uyarı' :
                 event.type === 'info' ? 'Bilgi' : 'Olay'}
              </span>
              
              {event.table && (
                <span className="text-sm text-gray-500">- {event.table}</span>
              )}
              
              {event.database && (
                <span className="text-sm text-gray-500">({event.database})</span>
              )}
            </div>
            
            <p className="text-sm text-gray-700 mt-1">{event.details}</p>
            
            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <Clock size={12} />
                <span>{formatTimestamp(event.timestamp)}</span>
              </div>
              
              {event.user && (
                <div className="flex items-center space-x-1">
                  <User size={12} />
                  <span>{event.user}</span>
                </div>
              )}
              
              <div className="flex items-center space-x-1">
                {getSourceIcon(event.source)}
                <span>{event.source}</span>
              </div>
              
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(event.severity)}`}>
                {event.severity === 'low' ? 'Düşük' :
                 event.severity === 'medium' ? 'Orta' :
                 event.severity === 'high' ? 'Yüksek' :
                 event.severity === 'critical' ? 'Kritik' : 'Bilinmiyor'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onViewDetails(event)}
            className="p-1 text-gray-400 hover:text-gray-600"
            title="Detayları Görüntüle"
          >
            <Eye size={14} />
          </button>
          
          <button
            onClick={() => onCopy(event)}
            className="p-1 text-gray-400 hover:text-gray-600"
            title="Kopyala"
          >
            <Copy size={14} />
          </button>
          
          <button
            onClick={() => onShare(event)}
            className="p-1 text-gray-400 hover:text-gray-600"
            title="Paylaş"
          >
            <Share2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Event Filter Component
const EventFilter: React.FC<{
  filters: {
    types: string[];
    sources: string[];
    severity: string[];
    databases: string[];
    tables: string[];
  };
  onFilterChange: (filters: any) => void;
}> = ({ filters, onFilterChange }) => {
  const eventTypes = [
    { value: 'insert', label: 'Yeni Kayıt' },
    { value: 'update', label: 'Güncelleme' },
    { value: 'delete', label: 'Silme' },
    { value: 'create', label: 'Oluşturma' },
    { value: 'drop', label: 'Silme' },
    { value: 'connect', label: 'Bağlantı' },
    { value: 'disconnect', label: 'Bağlantı Kesildi' },
    { value: 'error', label: 'Hata' },
    { value: 'warning', label: 'Uyarı' },
    { value: 'info', label: 'Bilgi' }
  ];

  const sources = [
    { value: 'database', label: 'Veritabanı' },
    { value: 'file', label: 'Dosya' },
    { value: 'user', label: 'Kullanıcı' },
    { value: 'system', label: 'Sistem' }
  ];

  const severityLevels = [
    { value: 'low', label: 'Düşük' },
    { value: 'medium', label: 'Orta' },
    { value: 'high', label: 'Yüksek' },
    { value: 'critical', label: 'Kritik' }
  ];

  const handleTypeChange = (type: string, checked: boolean) => {
    const newTypes = checked 
      ? [...filters.types, type]
      : filters.types.filter(t => t !== type);
    
    onFilterChange({ ...filters, types: newTypes });
  };

  const handleSourceChange = (source: string, checked: boolean) => {
    const newSources = checked 
      ? [...filters.sources, source]
      : filters.sources.filter(s => s !== source);
    
    onFilterChange({ ...filters, sources: newSources });
  };

  const handleSeverityChange = (severity: string, checked: boolean) => {
    const newSeverity = checked 
      ? [...filters.severity, severity]
      : filters.severity.filter(s => s !== severity);
    
    onFilterChange({ ...filters, severity: newSeverity });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Filtreler</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Event Types */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Olay Türleri</h4>
          <div className="space-y-2">
            {eventTypes.map((type) => (
              <label key={type.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.types.includes(type.value)}
                  onChange={(e) => handleTypeChange(type.value, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">{type.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Sources */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Kaynaklar</h4>
          <div className="space-y-2">
            {sources.map((source) => (
              <label key={source.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.sources.includes(source.value)}
                  onChange={(e) => handleSourceChange(source.value, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">{source.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Severity */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Önem Seviyeleri</h4>
          <div className="space-y-2">
            {severityLevels.map((severity) => (
              <label key={severity.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.severity.includes(severity.value)}
                  onChange={(e) => handleSeverityChange(severity.value, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">{severity.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const RealtimePage: React.FC = () => {
  // State management
  const [events, setEvents] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [filters, setFilters] = useState({
    types: ['insert', 'update', 'delete', 'create', 'drop', 'connect', 'disconnect', 'error', 'warning', 'info'],
    sources: ['database', 'file', 'user', 'system'],
    severity: ['low', 'medium', 'high', 'critical'],
    databases: [],
    tables: []
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [maxEvents, setMaxEvents] = useState(1000);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState<{type: 'success' | 'error', message: string} | null>(null);
  
  // Refs
  const eventsContainerRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Mock data
  const mockEvents = [
    {
      id: '1',
      type: 'insert' as const,
      table: 'users',
      database: 'production',
      user: 'admin',
      timestamp: new Date().toISOString(),
      details: 'Yeni kullanıcı eklendi: john.doe@example.com',
      data: { id: 123, email: 'john.doe@example.com', name: 'John Doe' },
      severity: 'low' as const,
      source: 'database' as const
    },
    {
      id: '2',
      type: 'update' as const,
      table: 'products',
      database: 'production',
      user: 'manager',
      timestamp: new Date(Date.now() - 5000).toISOString(),
      details: 'Ürün fiyatı güncellendi: Product #123',
      data: { id: 123, oldPrice: 100, newPrice: 120 },
      severity: 'medium' as const,
      source: 'database' as const
    },
    {
      id: '3',
      type: 'connect' as const,
      database: 'development',
      user: 'developer',
      timestamp: new Date(Date.now() - 10000).toISOString(),
      details: 'Veritabanı bağlantısı kuruldu',
      data: { host: '192.168.1.100', port: 5432 },
      severity: 'low' as const,
      source: 'system' as const
    },
    {
      id: '4',
      type: 'error' as const,
      table: 'orders',
      database: 'production',
      user: 'system',
      timestamp: new Date(Date.now() - 15000).toISOString(),
      details: 'Sipariş işleme hatası: Foreign key constraint failed',
      data: { orderId: 456, error: 'FK_CONSTRAINT_FAILED' },
      severity: 'high' as const,
      source: 'database' as const
    },
    {
      id: '5',
      type: 'delete' as const,
      table: 'temp_data',
      database: 'staging',
      user: 'cleanup_job',
      timestamp: new Date(Date.now() - 20000).toISOString(),
      details: 'Geçici veriler temizlendi',
      data: { deletedRows: 1500 },
      severity: 'low' as const,
      source: 'system' as const
    }
  ];

  // Toast notification
  const showNotification = useCallback((type: 'success' | 'error', message: string) => {
    setShowToast({ type, message });
    setTimeout(() => setShowToast(null), 3000);
  }, []);

  // WebSocket connection
  useEffect(() => {
    // Simulate WebSocket connection
    const connectWebSocket = () => {
      setIsConnected(true);
      showNotification('success', 'Gerçek zamanlı bağlantı kuruldu');
      
      // Simulate incoming events
      const interval = setInterval(() => {
        if (!isPaused) {
          const newEvent = {
            id: Date.now().toString(),
            type: ['insert', 'update', 'delete', 'connect', 'disconnect', 'error', 'warning', 'info'][Math.floor(Math.random() * 8)] as any,
            table: ['users', 'products', 'orders', 'customers'][Math.floor(Math.random() * 4)],
            database: ['production', 'development', 'staging'][Math.floor(Math.random() * 3)],
            user: ['admin', 'manager', 'developer', 'system'][Math.floor(Math.random() * 4)],
            timestamp: new Date().toISOString(),
            details: 'Simulated real-time event',
            data: { id: Math.floor(Math.random() * 1000) },
            severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as any,
            source: ['database', 'file', 'user', 'system'][Math.floor(Math.random() * 4)] as any
          };
          
          setEvents(prev => {
            const newEvents = [newEvent, ...prev];
            if (newEvents.length > maxEvents) {
              return newEvents.slice(0, maxEvents);
            }
            return newEvents;
          });
        }
      }, 2000);

      return () => clearInterval(interval);
    };

    const cleanup = connectWebSocket();
    return cleanup;
  }, [isPaused, maxEvents, showNotification]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScroll && eventsContainerRef.current) {
      eventsContainerRef.current.scrollTop = eventsContainerRef.current.scrollHeight;
    }
  }, [events, autoScroll]);

  // Filter events
  const filteredEvents = events.filter(event => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return event.details.toLowerCase().includes(query) ||
             event.table?.toLowerCase().includes(query) ||
             event.database?.toLowerCase().includes(query) ||
             event.user?.toLowerCase().includes(query);
    }
    
    if (filters.types.length > 0 && !filters.types.includes(event.type)) {
      return false;
    }
    
    if (filters.sources.length > 0 && !filters.sources.includes(event.source)) {
      return false;
    }
    
    if (filters.severity.length > 0 && !filters.severity.includes(event.severity)) {
      return false;
    }
    
    return true;
  });

  // Event handlers
  const handleViewDetails = (event: any) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  const handleCopyEvent = (event: any) => {
    navigator.clipboard.writeText(JSON.stringify(event, null, 2));
    showNotification('success', 'Olay kopyalandı');
  };

  const handleShareEvent = (event: any) => {
    // Simulate sharing
    showNotification('success', 'Olay paylaşıldı');
  };

  const handleClearEvents = () => {
    setEvents([]);
    showNotification('success', 'Tüm olaylar temizlendi');
  };

  const handleExportEvents = () => {
    const dataStr = JSON.stringify(filteredEvents, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `realtime-events-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('success', 'Olaylar dışa aktarıldı');
  };

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
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">Gerçek Zamanlı Olaylar</h1>
              
              <div className="flex items-center space-x-2">
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                  isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span>{isConnected ? 'Bağlı' : 'Bağlantı Yok'}</span>
                </div>
                
                <span className="text-sm text-gray-500">
                  {filteredEvents.length} olay
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsPaused(!isPaused)}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                  isPaused 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {isPaused ? <Play size={16} /> : <Pause size={16} />}
                <span>{isPaused ? 'Devam Et' : 'Duraklat'}</span>
              </button>
              
              <button
                onClick={handleClearEvents}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center space-x-2"
              >
                <Trash2 size={16} />
                <span>Temizle</span>
              </button>
              
              <button
                onClick={handleExportEvents}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Download size={16} />
                <span>Dışa Aktar</span>
              </button>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <Filter size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="p-4 border-b border-gray-200">
            <EventFilter filters={filters} onFilterChange={setFilters} />
          </div>
        )}

        {/* Search */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Olaylarda ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={autoScroll}
                  onChange={(e) => setAutoScroll(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Otomatik Kaydır</span>
              </label>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">Maks. Olay:</span>
                <select
                  value={maxEvents}
                  onChange={(e) => setMaxEvents(Number(e.target.value))}
                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value={100}>100</option>
                  <option value={500}>500</option>
                  <option value={1000}>1000</option>
                  <option value={5000}>5000</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Events List */}
        <div className="flex-1 overflow-auto">
          <div 
            ref={eventsContainerRef}
            className="p-4 space-y-4"
          >
            {filteredEvents.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Activity className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Olay bulunamadı</h3>
                  <p className="mt-1 text-sm text-gray-500">Filtrelerinizi kontrol edin veya bekleyin.</p>
                </div>
              </div>
            ) : (
              filteredEvents.map((event) => (
                <EventItem
                  key={event.id}
                  event={event}
                  onViewDetails={handleViewDetails}
                  onCopy={handleCopyEvent}
                  onShare={handleShareEvent}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Event Details Modal */}
      {showEventDetails && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Olay Detayları</h3>
              <button
                onClick={() => setShowEventDetails(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-96">
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
                {JSON.stringify(selectedEvent, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealtimePage; 