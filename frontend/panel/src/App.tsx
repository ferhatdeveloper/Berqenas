import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import BerqenasDashboard from './pages/BerqenasDashboard';
import TenantsPage from './pages/TenantsPage';
import RemoteDatabasesPage from './pages/RemoteDatabasesPage';
import AutoAPIGeneratorPage from './pages/AutoAPIGeneratorPage';
import VPNNetworkPage from './pages/VPNNetworkPage';
import GatewayNATPage from './pages/GatewayNATPage';
import SettingsPage from './pages/SettingsPage';
import {
  LayoutDashboard,
  Users,
  Database,
  Shield,
  Code,
  Globe,
  Settings,
  LogOut
} from 'lucide-react';

function Sidebar() {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Tenants', path: '/tenants' },
    { icon: Database, label: 'Remote Databases', path: '/databases' },
    { icon: Code, label: 'Auto-API', path: '/auto-api' },
    { icon: Shield, label: 'VPN & Network', path: '/vpn' },
    { icon: Globe, label: 'Gateway & NAT', path: '/gateway' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-white">Berqenas</h1>
        <p className="text-xs text-gray-400 mt-1">Cloud Platform</p>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <a
                href={item.path}
                className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition"
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* User */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">A</span>
          </div>
          <div className="flex-1">
            <p className="text-white text-sm font-medium">Admin</p>
            <p className="text-gray-400 text-xs">admin@berqenas.com</p>
          </div>
          <button className="text-gray-400 hover:text-white">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-gray-900">
        <Sidebar />
        <div className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<BerqenasDashboard />} />
            <Route path="/tenants" element={<TenantsPage />} />
            <Route path="/databases" element={<RemoteDatabasesPage />} />
            <Route path="/auto-api" element={<AutoAPIGeneratorPage />} />
            <Route path="/vpn" element={<VPNNetworkPage />} />
            <Route path="/gateway" element={<GatewayNATPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;