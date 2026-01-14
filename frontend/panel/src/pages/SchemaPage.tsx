import React from 'react'
import { Table, FileText, Zap, Layers } from 'lucide-react'

const tables = [
  { name: 'company' },
  { name: 'departments' },
  { name: 'users' },
  { name: 'roles' },
  { name: 'menu' },
]
const functions = [
  { name: 'get_user_roles' },
  { name: 'sync_log' },
]
const triggers = [
  { name: 'on_user_insert' },
]

const SchemaPage = () => {
  return (
    <div className="h-full flex bg-[#f8fafb]">
      <aside className="sidebar-sb w-64">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--sb-border)]">
          <Layers className="h-6 w-6 text-blue-600" />
          <span className="font-semibold text-lg text-gray-800">Schema</span>
        </div>
        <nav className="flex-1 overflow-y-auto">
          <div className="px-4 py-2 text-xs text-gray-500 uppercase">Tables</div>
          <ul className="mb-4">
            {tables.map(t => (
              <li key={t.name} className="sidebar-item-sb cursor-pointer">
                <Table className="h-4 w-4 text-gray-400" /> {t.name}
              </li>
            ))}
          </ul>
          <div className="px-4 py-2 text-xs text-gray-500 uppercase">Functions</div>
          <ul className="mb-4">
            {functions.map(f => (
              <li key={f.name} className="sidebar-item-sb cursor-pointer">
                <FileText className="h-4 w-4 text-gray-400" /> {f.name}
              </li>
            ))}
          </ul>
          <div className="px-4 py-2 text-xs text-gray-500 uppercase">Triggers</div>
          <ul>
            {triggers.map(tr => (
              <li key={tr.name} className="sidebar-item-sb cursor-pointer">
                <Zap className="h-4 w-4 text-gray-400" /> {tr.name}
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <main className="flex-1 flex items-center justify-center">
        <div className="bg-white border rounded-lg p-8 text-center max-w-2xl mx-auto">
          <h2 className="font-semibold text-lg mb-2">Schema Visualizer</h2>
          <div className="h-64 flex items-center justify-center text-gray-400 border rounded bg-[var(--sb-muted)] mt-4">
            Tablo ilişkileri ve şema görselleştirmesi burada (örnek/mockup)
          </div>
        </div>
      </main>
    </div>
  )
}

export default SchemaPage 