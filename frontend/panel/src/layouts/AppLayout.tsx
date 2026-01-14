import React, { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Database,
  Table,
  Code,
  Users,
  Cloud,
  Zap,
  BarChart3,
  Settings,
  Lock,
  FileText,
  Layers,
  ChevronRight,
  List,
  BookOpen,
  LogOut,
  AlertCircle,
  FileText as FileTextIcon,
  Activity,
  Folder,
  Sliders,
  Brain,
  BarChart,
  GitBranch,
} from 'lucide-react'

const menu = [
  {
    category: 'Project',
    items: [
      { to: '/dashboard', icon: <BarChart className="h-5 w-5" />, label: 'Dashboard' },
      { to: '/tables', icon: <Table className="h-5 w-5" />, label: 'Table Editor' },
      { to: '/sql', icon: <Code className="h-5 w-5" />, label: 'SQL Editor' },
      { to: '/schema', icon: <Layers className="h-5 w-5" />, label: 'Schema' },
      { to: '/database', icon: <Database className="h-5 w-5" />, label: 'Database' },
      { to: '/connections', icon: <Database className="h-5 w-5" />, label: 'Connections' },
      { to: '/migration', icon: <GitBranch className="h-5 w-5" />, label: 'Migration' },
    ],
  },
  {
    category: 'Platform',
    items: [
      { to: '/auth', icon: <Users className="h-5 w-5" />, label: 'Authentication' },
      { to: '/storage', icon: <Cloud className="h-5 w-5" />, label: 'Storage' },
      { to: '/functions', icon: <Zap className="h-5 w-5" />, label: 'Edge Functions' },
      { to: '/realtime', icon: <Activity className="h-5 w-5" />, label: 'Realtime' },
    ],
  },
  {
    category: 'Tools',
    items: [
      { to: '/ai', icon: <Brain className="h-5 w-5" />, label: 'AI Assistant' },
      { to: '/advisors', icon: <AlertCircle className="h-5 w-5" />, label: 'Advisors' },
      { to: '/reports', icon: <BarChart3 className="h-5 w-5" />, label: 'Reports', submenu: [
        { to: '/reports/usage', label: 'Usage Report' },
        { to: '/reports/audit', label: 'Audit Log' },
      ] },
      { to: '/logs', icon: <FileTextIcon className="h-5 w-5" />, label: 'Logs' },
      { to: '/api-docs', icon: <BookOpen className="h-5 w-5" />, label: 'API Docs' },
      { to: '/integrations', icon: <Folder className="h-5 w-5" />, label: 'Integrations' },
    ],
  },
  {
    category: 'Project',
    items: [
      { to: '/settings', icon: <Settings className="h-5 w-5" />, label: 'Project Settings' },
    ],
  },
]

const AppLayout = () => {
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null)
  const navigate = useNavigate()
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="h-screen flex bg-[#f8fafb]">
      {/* Sidebar */}
      <aside className="w-56 border-r bg-white flex flex-col py-4 space-y-2">
        <div className="mb-4 flex flex-col items-center justify-center">
          <NavLink to="/tables">
            <Database className="h-7 w-7 text-blue-600" />
          </NavLink>
          <span className="mt-2 text-2xl font-extrabold tracking-tight text-blue-700 drop-shadow-sm select-none" style={{fontFamily: 'Montserrat, Inter, Arial'}}>GraphCore</span>
        </div>
        <nav className="flex flex-col gap-2 flex-1">
          {menu.map((section, idx) => (
            <div key={section.category} className="mb-2">
              <div className="px-4 py-1 text-xs text-gray-400 uppercase tracking-wider select-none">
                {section.category}
              </div>
              {section.items.map(item => (
                <div key={item.to} className="relative group">
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-2 rounded-lg transition text-sm font-medium ${isActive ? 'bg-gray-100 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`
                    }
                    onMouseEnter={() => setHoveredMenu(item.label)}
                    onMouseLeave={() => setHoveredMenu(null)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                    {item.submenu && <ChevronRight className="h-4 w-4 ml-auto text-gray-400" />}
                  </NavLink>
                  {/* Alt menü */}
                  {item.submenu && hoveredMenu === item.label && (
                    <div className="absolute left-full top-0 mt-0 ml-1 bg-white border rounded shadow-lg min-w-[180px] z-20 animate-fade-in">
                      {item.submenu.map(sub => (
                        <NavLink
                          key={sub.to}
                          to={sub.to}
                          className={({ isActive }) =>
                            `block px-4 py-2 text-sm rounded transition ${isActive ? 'bg-gray-100 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`
                          }
                        >
                          {sub.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </nav>
        <div className="mt-auto mb-2 px-4">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-400"
          >
            <Lock className="h-5 w-5" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout 