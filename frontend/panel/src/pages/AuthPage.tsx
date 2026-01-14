import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  User,
  Shield,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  Upload,
  Settings,
  Activity,
  Clock,
  AlertCircle,
  CheckCircle,
  X,
  MoreVertical,
  Star,
  StarOff,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Key,
  Fingerprint,
  Smartphone,
  Globe,
  RefreshCw,
  Loader2,
  ChevronDown,
  ChevronUp,
  UserCheck,
  UserX,
  UserPlus,
  UserMinus,
  Crown,
  Badge,
  Award,
  Zap,
  ShieldCheck,
  ShieldAlert,
  QrCode,
  MailCheck,
  PhoneCall,
  MessageSquare,
  Bell,
  BellOff,
  Settings2,
  Database,
  FileText,
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Target,
  Flag,
  AlertTriangle,
  Info,
  HelpCircle,
  ExternalLink,
  Copy,
  Share2,
  Link,
  Unlink,
  Wifi,
  WifiOff,
  Monitor,
  Tablet,
  Laptop,
  Server,
  Cloud,
  HardDrive,
  Network,
  Router,
  Cable,
  Bluetooth,
  BluetoothOff,
} from 'lucide-react';

// User Status Badge Component
const UserStatusBadge: React.FC<{ status: 'active' | 'inactive' | 'suspended' | 'pending' }> = ({ status }) => {
  const statusConfig = {
    active: { color: 'bg-green-100 text-green-800', icon: <CheckCircle size={12} /> },
    inactive: { color: 'bg-gray-100 text-gray-800', icon: <UserX size={12} /> },
    suspended: { color: 'bg-red-100 text-red-800', icon: <AlertCircle size={12} /> },
    pending: { color: 'bg-yellow-100 text-yellow-800', icon: <Clock size={12} /> },
  };

  const config = statusConfig[status];

  return (
    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.icon}
      <span>{status === 'active' ? 'Aktif' : status === 'inactive' ? 'Pasif' : status === 'suspended' ? 'Askıya Alınmış' : 'Beklemede'}</span>
    </span>
  );
};

// Role Badge Component
const RoleBadge: React.FC<{ role: string; level: number }> = ({ role, level }) => {
  const roleConfig = {
    admin: { color: 'bg-purple-100 text-purple-800', icon: <Crown size={12} /> },
    manager: { color: 'bg-blue-100 text-blue-800', icon: <Award size={12} /> },
    user: { color: 'bg-green-100 text-green-800', icon: <User size={12} /> },
    guest: { color: 'bg-gray-100 text-gray-800', icon: <UserCheck size={12} /> },
  };

  const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.user;

  return (
    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.icon}
      <span>{role.charAt(0).toUpperCase() + role.slice(1)}</span>
      {level > 1 && <span className="text-xs">L{level}</span>}
    </span>
  );
};

// Security Level Badge Component
const SecurityLevelBadge: React.FC<{ level: 'low' | 'medium' | 'high' | 'critical' }> = ({ level }) => {
  const levelConfig = {
    low: { color: 'bg-green-100 text-green-800', icon: <ShieldCheck size={12} /> },
    medium: { color: 'bg-yellow-100 text-yellow-800', icon: <Shield size={12} /> },
    high: { color: 'bg-orange-100 text-orange-800', icon: <ShieldAlert size={12} /> },
    critical: { color: 'bg-red-100 text-red-800', icon: <AlertTriangle size={12} /> },
  };

  const config = levelConfig[level];

  return (
    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.icon}
      <span>{level === 'low' ? 'Düşük' : level === 'medium' ? 'Orta' : level === 'high' ? 'Yüksek' : 'Kritik'}</span>
    </span>
  );
};

// User Card Component
const UserCard: React.FC<{
  user: {
    id: string;
    username: string;
    email: string;
    fullName: string;
    avatar?: string;
    role: string;
    roleLevel: number;
    status: 'active' | 'inactive' | 'suspended' | 'pending';
    securityLevel: 'low' | 'medium' | 'high' | 'critical';
    lastLogin: string;
    lastLoginIp: string;
    lastLoginDevice: string;
    mfaEnabled: boolean;
    ssoEnabled: boolean;
    permissions: string[];
    createdAt: string;
    updatedAt: string;
    loginCount: number;
    failedLoginAttempts: number;
    isOnline: boolean;
    department?: string;
    position?: string;
    phone?: string;
    location?: string;
  };
  onEdit: (user: any) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, status: string) => void;
  onResetPassword: (id: string) => void;
  onEnableMFA: (id: string) => void;
  onDisableMFA: (id: string) => void;
  onViewAudit: (id: string) => void;
}> = ({ user, onEdit, onDelete, onToggleStatus, onResetPassword, onEnableMFA, onDisableMFA, onViewAudit }) => {
  const [showMenu, setShowMenu] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDeviceIcon = (device: string) => {
    if (device.includes('Mobile')) return <Smartphone size={14} />;
    if (device.includes('Tablet')) return <Tablet size={14} />;
    if (device.includes('Desktop')) return <Monitor size={14} />;
    return <Laptop size={14} />;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
              {user.avatar ? (
                <img src={user.avatar} alt={user.fullName} className="w-12 h-12 rounded-full" />
              ) : (
                <User className="text-gray-500" size={24} />
              )}
            </div>
            {user.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-medium text-gray-900 truncate">{user.fullName}</h3>
              {user.mfaEnabled && <Fingerprint className="text-blue-500" size={14} />}
              {user.ssoEnabled && <Globe className="text-green-500" size={14} />}
            </div>
            
            <p className="text-sm text-gray-500 truncate">{user.email}</p>
            
            <div className="flex items-center space-x-2 mt-2">
              <RoleBadge role={user.role} level={user.roleLevel} />
              <UserStatusBadge status={user.status} />
              <SecurityLevelBadge level={user.securityLevel} />
            </div>
          </div>
        </div>
        
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <MoreVertical size={16} />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 top-6 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-48">
              <button
                onClick={() => {
                  onEdit(user);
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
              >
                <Edit size={14} />
                <span>Düzenle</span>
              </button>
              
              <button
                onClick={() => {
                  onResetPassword(user.id);
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
              >
                <Key size={14} />
                <span>Şifre Sıfırla</span>
              </button>
              
              {user.mfaEnabled ? (
                <button
                  onClick={() => {
                    onDisableMFA(user.id);
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
                >
                  <Fingerprint size={14} />
                  <span>MFA Devre Dışı</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    onEnableMFA(user.id);
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
                >
                  <Fingerprint size={14} />
                  <span>MFA Etkinleştir</span>
                </button>
              )}
              
              <button
                onClick={() => {
                  onViewAudit(user.id);
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
              >
                <Activity size={14} />
                <span>Denetim Geçmişi</span>
              </button>
              
              <button
                onClick={() => {
                  onToggleStatus(user.id, user.status === 'active' ? 'suspended' : 'active');
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
              >
                {user.status === 'active' ? <UserX size={14} /> : <UserCheck size={14} />}
                <span>{user.status === 'active' ? 'Askıya Al' : 'Etkinleştir'}</span>
              </button>
              
              <button
                onClick={() => {
                  onDelete(user.id);
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-red-100 text-red-600 flex items-center space-x-2"
              >
                <Trash2 size={14} />
                <span>Sil</span>
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
          <div>
            <div className="flex items-center space-x-1">
              <Clock size={12} />
              <span>Son Giriş:</span>
            </div>
            <p className="font-medium text-gray-900">{formatDate(user.lastLogin)}</p>
          </div>
          
          <div>
            <div className="flex items-center space-x-1">
              {getDeviceIcon(user.lastLoginDevice)}
              <span>Cihaz:</span>
            </div>
            <p className="font-medium text-gray-900 truncate">{user.lastLoginDevice}</p>
          </div>
          
          <div>
            <div className="flex items-center space-x-1">
              <Wifi size={12} />
              <span>IP:</span>
            </div>
            <p className="font-medium text-gray-900">{user.lastLoginIp}</p>
          </div>
          
          <div>
            <div className="flex items-center space-x-1">
              <BarChart3 size={12} />
              <span>Giriş Sayısı:</span>
            </div>
            <p className="font-medium text-gray-900">{user.loginCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Audit Log Item Component
const AuditLogItem: React.FC<{
  log: {
    id: string;
    userId: string;
    username: string;
    action: string;
    resource: string;
    details: string;
    ipAddress: string;
    userAgent: string;
    timestamp: string;
    status: 'success' | 'failure' | 'warning';
    severity: 'low' | 'medium' | 'high' | 'critical';
  };
}> = ({ log }) => {
  const statusConfig = {
    success: { color: 'text-green-600', icon: <CheckCircle size={14} /> },
    failure: { color: 'text-red-600', icon: <AlertCircle size={14} /> },
    warning: { color: 'text-yellow-600', icon: <AlertTriangle size={14} /> },
  };

  const severityConfig = {
    low: { color: 'bg-green-100 text-green-800' },
    medium: { color: 'bg-yellow-100 text-yellow-800' },
    high: { color: 'bg-orange-100 text-orange-800' },
    critical: { color: 'bg-red-100 text-red-800' },
  };

  const config = statusConfig[log.status];
  const severityConfig_item = severityConfig[log.severity];

  return (
    <div className="p-3 border-b border-gray-200 hover:bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={config.color}>
            {config.icon}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900">{log.username}</span>
              <span className="text-sm text-gray-500">{log.action}</span>
              <span className="text-sm text-gray-500">{log.resource}</span>
            </div>
            
            <p className="text-xs text-gray-500 mt-1">{log.details}</p>
            
            <div className="flex items-center space-x-4 mt-1 text-xs text-gray-400">
              <span>{new Date(log.timestamp).toLocaleString('tr-TR')}</span>
              <span>{log.ipAddress}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${severityConfig_item.color}`}>
                {log.severity === 'low' ? 'Düşük' : log.severity === 'medium' ? 'Orta' : log.severity === 'high' ? 'Yüksek' : 'Kritik'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AuthPage: React.FC = () => {
  // State management
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'permissions' | 'audit' | 'security'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'role' | 'status' | 'lastLogin'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState<{type: 'success' | 'error', message: string} | null>(null);

  // Mock data
  const mockUsers = [
    {
      id: '1',
      username: 'admin',
      email: 'admin@example.com',
      fullName: 'Admin User',
      avatar: null,
      role: 'admin',
      roleLevel: 3,
      status: 'active' as const,
      securityLevel: 'high' as const,
      lastLogin: '2024-01-15T10:30:00Z',
      lastLoginIp: '192.168.1.100',
      lastLoginDevice: 'Desktop - Chrome',
      mfaEnabled: true,
      ssoEnabled: true,
      permissions: ['read', 'write', 'delete', 'admin'],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
      loginCount: 150,
      failedLoginAttempts: 0,
      isOnline: true,
      department: 'IT',
      position: 'System Administrator',
      phone: '+90 555 123 4567',
      location: 'Istanbul, Turkey'
    },
    {
      id: '2',
      username: 'manager',
      email: 'manager@example.com',
      fullName: 'Manager User',
      avatar: null,
      role: 'manager',
      roleLevel: 2,
      status: 'active' as const,
      securityLevel: 'medium' as const,
      lastLogin: '2024-01-15T09:15:00Z',
      lastLoginIp: '192.168.1.101',
      lastLoginDevice: 'Mobile - Safari',
      mfaEnabled: false,
      ssoEnabled: false,
      permissions: ['read', 'write'],
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-15T09:15:00Z',
      loginCount: 75,
      failedLoginAttempts: 2,
      isOnline: false,
      department: 'Sales',
      position: 'Sales Manager',
      phone: '+90 555 123 4568',
      location: 'Ankara, Turkey'
    },
    {
      id: '3',
      username: 'user',
      email: 'user@example.com',
      fullName: 'Regular User',
      avatar: null,
      role: 'user',
      roleLevel: 1,
      status: 'active' as const,
      securityLevel: 'low' as const,
      lastLogin: '2024-01-14T16:45:00Z',
      lastLoginIp: '192.168.1.102',
      lastLoginDevice: 'Tablet - Chrome',
      mfaEnabled: true,
      ssoEnabled: false,
      permissions: ['read'],
      createdAt: '2024-01-03T00:00:00Z',
      updatedAt: '2024-01-14T16:45:00Z',
      loginCount: 45,
      failedLoginAttempts: 1,
      isOnline: true,
      department: 'Marketing',
      position: 'Marketing Specialist',
      phone: '+90 555 123 4569',
      location: 'Izmir, Turkey'
    }
  ];

  const mockRoles = [
    {
      id: '1',
      name: 'admin',
      displayName: 'Administrator',
      level: 3,
      permissions: ['read', 'write', 'delete', 'admin'],
      description: 'Full system access',
      userCount: 1,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      name: 'manager',
      displayName: 'Manager',
      level: 2,
      permissions: ['read', 'write'],
      description: 'Department management access',
      userCount: 1,
      createdAt: '2024-01-02T00:00:00Z'
    },
    {
      id: '3',
      name: 'user',
      displayName: 'User',
      level: 1,
      permissions: ['read'],
      description: 'Basic user access',
      userCount: 1,
      createdAt: '2024-01-03T00:00:00Z'
    }
  ];

  const mockPermissions = [
    {
      id: '1',
      name: 'read',
      displayName: 'Read Access',
      description: 'Can read data',
      category: 'data',
      userCount: 3,
      roleCount: 3
    },
    {
      id: '2',
      name: 'write',
      displayName: 'Write Access',
      description: 'Can create and update data',
      category: 'data',
      userCount: 2,
      roleCount: 2
    },
    {
      id: '3',
      name: 'delete',
      displayName: 'Delete Access',
      description: 'Can delete data',
      category: 'data',
      userCount: 1,
      roleCount: 1
    },
    {
      id: '4',
      name: 'admin',
      displayName: 'Admin Access',
      description: 'Full administrative access',
      category: 'system',
      userCount: 1,
      roleCount: 1
    }
  ];

  const mockAuditLogs = [
    {
      id: '1',
      userId: '1',
      username: 'admin',
      action: 'LOGIN',
      resource: 'auth',
      details: 'Successful login from 192.168.1.100',
      ipAddress: '192.168.1.100',
      userAgent: 'Chrome/120.0.0.0',
      timestamp: '2024-01-15T10:30:00Z',
      status: 'success' as const,
      severity: 'low' as const
    },
    {
      id: '2',
      userId: '2',
      username: 'manager',
      action: 'LOGIN_FAILED',
      resource: 'auth',
      details: 'Failed login attempt - incorrect password',
      ipAddress: '192.168.1.101',
      userAgent: 'Safari/17.0',
      timestamp: '2024-01-15T09:15:00Z',
      status: 'failure' as const,
      severity: 'medium' as const
    },
    {
      id: '3',
      userId: '1',
      username: 'admin',
      action: 'USER_CREATED',
      resource: 'users',
      details: 'Created new user: user@example.com',
      ipAddress: '192.168.1.100',
      userAgent: 'Chrome/120.0.0.0',
      timestamp: '2024-01-14T16:45:00Z',
      status: 'success' as const,
      severity: 'medium' as const
    }
  ];

  // Toast notification
  const showNotification = useCallback((type: 'success' | 'error', message: string) => {
    setShowToast({ type, message });
    setTimeout(() => setShowToast(null), 3000);
  }, []);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUsers(mockUsers);
      setRoles(mockRoles);
      setPermissions(mockPermissions);
      setAuditLogs(mockAuditLogs);
    } catch (error) {
      showNotification('error', 'Veriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort users
  const filteredAndSortedUsers = users
    .filter(user => {
      if (searchQuery) {
        return user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
               user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
               user.username.toLowerCase().includes(searchQuery.toLowerCase());
      }
      if (filterStatus !== 'all') {
        return user.status === filterStatus;
      }
      if (filterRole !== 'all') {
        return user.role === filterRole;
      }
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.fullName.localeCompare(b.fullName);
          break;
        case 'email':
          comparison = a.email.localeCompare(b.email);
          break;
        case 'role':
          comparison = a.role.localeCompare(b.role);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'lastLogin':
          comparison = new Date(a.lastLogin).getTime() - new Date(b.lastLogin).getTime();
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // User operations
  const handleCreateUser = async (userData: any) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newUser = {
        id: Date.now().toString(),
        ...userData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        loginCount: 0,
        failedLoginAttempts: 0,
        isOnline: false,
        mfaEnabled: false,
        ssoEnabled: false,
        status: 'pending' as const,
        securityLevel: 'low' as const
      };
      
      setUsers(prev => [newUser, ...prev]);
      setShowUserModal(false);
      showNotification('success', 'Kullanıcı başarıyla oluşturuldu');
    } catch (error) {
      showNotification('error', 'Kullanıcı oluşturulurken hata oluştu');
    }
  };

  const handleUpdateUser = async (userData: any) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUsers(prev => prev.map(user => 
        user.id === userData.id ? { ...user, ...userData, updatedAt: new Date().toISOString() } : user
      ));
      
      setShowUserModal(false);
      showNotification('success', 'Kullanıcı başarıyla güncellendi');
    } catch (error) {
      showNotification('error', 'Kullanıcı güncellenirken hata oluştu');
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUsers(prev => prev.filter(user => user.id !== id));
      showNotification('success', 'Kullanıcı başarıyla silindi');
    } catch (error) {
      showNotification('error', 'Kullanıcı silinirken hata oluştu');
    }
  };

  const handleToggleUserStatus = async (id: string, status: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setUsers(prev => prev.map(user => 
        user.id === id ? { ...user, status: status as any, updatedAt: new Date().toISOString() } : user
      ));
      
      showNotification('success', 'Kullanıcı durumu güncellendi');
    } catch (error) {
      showNotification('error', 'Kullanıcı durumu güncellenirken hata oluştu');
    }
  };

  const handleResetPassword = async (id: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      showNotification('success', 'Şifre sıfırlama e-postası gönderildi');
    } catch (error) {
      showNotification('error', 'Şifre sıfırlama işlemi başarısız');
    }
  };

  const handleToggleMFA = async (id: string, enable: boolean) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUsers(prev => prev.map(user => 
        user.id === id ? { ...user, mfaEnabled: enable, updatedAt: new Date().toISOString() } : user
      ));
      
      showNotification('success', `MFA ${enable ? 'etkinleştirildi' : 'devre dışı bırakıldı'}`);
    } catch (error) {
      showNotification('error', 'MFA durumu güncellenirken hata oluştu');
    }
  };

  const handleViewAudit = (id: string) => {
    const user = users.find(u => u.id === id);
    if (user) {
      setSelectedUser(user);
      setShowAuditModal(true);
    }
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
            <h1 className="text-xl font-semibold text-gray-900">Kullanıcı Yönetimi</h1>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setSelectedUser(null);
                  setShowUserModal(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <UserPlus size={16} />
                <span>Yeni Kullanıcı</span>
              </button>
              
              <button
                onClick={loadData}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200">
          <div className="flex space-x-8 px-4">
            {[
              { id: 'users', label: 'Kullanıcılar', icon: Users },
              { id: 'roles', label: 'Roller', icon: Shield },
              { id: 'permissions', label: 'İzinler', icon: Lock },
              { id: 'audit', label: 'Denetim', icon: Activity },
              { id: 'security', label: 'Güvenlik', icon: ShieldCheck },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon size={16} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {activeTab === 'users' && (
            <div className="p-4">
              {/* Filters */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="text"
                        placeholder="Kullanıcılarda ara..."
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
                    <option value="active">Aktif</option>
                    <option value="inactive">Pasif</option>
                    <option value="suspended">Askıya Alınmış</option>
                  </select>
                  
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Tüm Roller</option>
                    {roles.map(role => (
                      <option key={role.id} value={role.name}>{role.displayName}</option>
                    ))}
                  </select>
                  
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="name">İsim</option>
                    <option value="email">E-posta</option>
                    <option value="role">Rol</option>
                    <option value="status">Durum</option>
                    <option value="lastLogin">Son Giriş</option>
                  </select>
                  
                  <button
                    onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                    className="p-2 text-gray-500 hover:text-gray-700"
                  >
                    {sortOrder === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {/* Users Grid */}
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredAndSortedUsers.map((user) => (
                    <UserCard
                      key={user.id}
                      user={user}
                      onEdit={(user) => {
                        setSelectedUser(user);
                        setShowUserModal(true);
                      }}
                      onDelete={handleDeleteUser}
                      onToggleStatus={handleToggleUserStatus}
                      onResetPassword={handleResetPassword}
                      onEnableMFA={(id) => handleToggleMFA(id, true)}
                      onDisableMFA={(id) => handleToggleMFA(id, false)}
                      onViewAudit={handleViewAudit}
                    />
                  ))}
                  
                  {filteredAndSortedUsers.length === 0 && (
                    <div className="col-span-full flex items-center justify-center h-64">
                      <div className="text-center">
                        <Users className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Kullanıcı bulunamadı</h3>
                        <p className="mt-1 text-sm text-gray-500">Arama kriterlerinize uygun kullanıcı bulunamadı.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="p-4">
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Denetim Geçmişi</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {auditLogs.map((log) => (
                    <AuditLogItem key={log.id} log={log} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage; 