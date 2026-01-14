import { useState, useEffect } from 'react';
import {
    Plus,
    Database,
    RefreshCw,
    Settings,
    CheckCircle,
    XCircle,
    Clock,
    Zap,
    Table as TableIcon
} from 'lucide-react';

interface RemoteDatabase {
    id: number;
    name: string;
    database_type: 'postgresql' | 'mssql';
    wireguard_ip: string;
    connection_status: 'connected' | 'disconnected' | 'error';
    last_sync: string;
    sync_mode: 'full' | 'incremental' | 'realtime';
    table_count: number;
    api_enabled: boolean;
    public_endpoint?: string;
}

export default function RemoteDatabasesPage() {
    const [databases, setDatabases] = useState<RemoteDatabase[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        // TODO: Fetch from API
        setDatabases([
            {
                id: 1,
                name: 'customer_erp',
                database_type: 'mssql',
                wireguard_ip: '10.60.5.10',
                connection_status: 'connected',
                last_sync: '2 minutes ago',
                sync_mode: 'incremental',
                table_count: 8,
                api_enabled: true,
                public_endpoint: 'https://api.berqenas.com/remote/1'
            },
            {
                id: 2,
                name: 'legacy_crm',
                database_type: 'postgresql',
                wireguard_ip: '10.60.5.12',
                connection_status: 'connected',
                last_sync: '15 minutes ago',
                sync_mode: 'full',
                table_count: 12,
                api_enabled: false
            }
        ]);
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'connected': return 'text-green-400 bg-green-500/10';
            case 'disconnected': return 'text-gray-400 bg-gray-500/10';
            case 'error': return 'text-red-400 bg-red-500/10';
            default: return 'text-gray-400 bg-gray-500/10';
        }
    };

    const getSyncModeColor = (mode: string) => {
        switch (mode) {
            case 'realtime': return 'text-purple-400 bg-purple-500/10';
            case 'incremental': return 'text-blue-400 bg-blue-500/10';
            case 'full': return 'text-orange-400 bg-orange-500/10';
            default: return 'text-gray-400 bg-gray-500/10';
        }
    };

    return (
        <div className="p-8 bg-gray-900 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Remote Databases</h1>
                        <p className="text-gray-400 mt-2">Connect on-premise databases via WireGuard</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition"
                    >
                        <Plus className="w-5 h-5" />
                        Add Remote Database
                    </button>
                </div>

                {/* Database Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {databases.map((db) => (
                        <div key={db.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-500/10 p-3 rounded-lg">
                                        <Database className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">{db.name}</h3>
                                        <span className={`inline-block px-2 py-1 rounded text-xs mt-1 ${db.database_type === 'postgresql'
                                                ? 'bg-blue-500/10 text-blue-400'
                                                : 'bg-orange-500/10 text-orange-400'
                                            }`}>
                                            {db.database_type.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                                <button className="text-gray-400 hover:text-white">
                                    <Settings className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Connection Info */}
                            <div className="space-y-3 mb-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-400 text-sm">WireGuard IP</span>
                                    <div className="flex items-center gap-2">
                                        <code className="text-white bg-gray-700 px-2 py-1 rounded text-sm">{db.wireguard_ip}</code>
                                        <button className="text-gray-400 hover:text-white text-xs">Copy</button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-gray-400 text-sm">Connection</span>
                                    <span className={`flex items-center gap-2 px-2 py-1 rounded text-xs ${getStatusColor(db.connection_status)}`}>
                                        {db.connection_status === 'connected' ? (
                                            <CheckCircle className="w-3 h-3" />
                                        ) : (
                                            <XCircle className="w-3 h-3" />
                                        )}
                                        {db.connection_status}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-gray-400 text-sm">Last Sync</span>
                                    <span className="text-white text-sm flex items-center gap-1">
                                        <Clock className="w-3 h-3 text-gray-400" />
                                        {db.last_sync}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-gray-400 text-sm">Sync Mode</span>
                                    <span className={`px-2 py-1 rounded text-xs ${getSyncModeColor(db.sync_mode)}`}>
                                        {db.sync_mode}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-gray-400 text-sm">Tables</span>
                                    <span className="text-white text-sm flex items-center gap-1">
                                        <TableIcon className="w-3 h-3 text-gray-400" />
                                        {db.table_count}
                                    </span>
                                </div>
                            </div>

                            {/* API Status */}
                            {db.api_enabled && db.public_endpoint && (
                                <div className="bg-gray-700/50 rounded-lg p-3 mb-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Zap className="w-4 h-4 text-green-400" />
                                        <span className="text-sm font-medium text-green-400">API Enabled</span>
                                    </div>
                                    <code className="text-xs text-gray-300 break-all">{db.public_endpoint}</code>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-2">
                                <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition text-sm flex items-center justify-center gap-2">
                                    <RefreshCw className="w-4 h-4" />
                                    Sync Now
                                </button>
                                <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition text-sm">
                                    Generate API
                                </button>
                                <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition">
                                    <Settings className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Add Database Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-gray-800 rounded-lg p-8 max-w-lg w-full border border-gray-700 max-h-[90vh] overflow-y-auto">
                            <h2 className="text-2xl font-bold text-white mb-6">Add Remote Database</h2>

                            <form className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Database Name</label>
                                    <input
                                        type="text"
                                        placeholder="customer_erp"
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Database Type</label>
                                    <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option>MSSQL</option>
                                        <option>PostgreSQL</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">WireGuard IP</label>
                                    <input
                                        type="text"
                                        placeholder="10.60.5.10"
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">IP address from VPN subnet</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Host</label>
                                        <input
                                            type="text"
                                            placeholder="10.60.5.10"
                                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Port</label>
                                        <input
                                            type="number"
                                            placeholder="1433"
                                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Database Name</label>
                                    <input
                                        type="text"
                                        placeholder="ERP_Production"
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                                    <input
                                        type="text"
                                        placeholder="berqenas_readonly"
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                                    <input
                                        type="password"
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Schema</label>
                                    <input
                                        type="text"
                                        placeholder="dbo"
                                        defaultValue="dbo"
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
                                    >
                                        Test Connection
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition"
                                    >
                                        Add
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
