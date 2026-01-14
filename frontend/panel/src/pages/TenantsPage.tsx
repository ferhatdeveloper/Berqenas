import { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Database,
    Shield,
    Trash2,
    Edit,
    MoreVertical,
    HardDrive,
    Activity
} from 'lucide-react';
import { api } from '../services/api';

interface Tenant {
    id: number;
    name: string;
    database_type: 'postgresql' | 'mssql';
    status: 'active' | 'inactive';
    vpn_enabled: boolean;
    public_api_enabled: boolean;
    disk_quota_gb: number;
    disk_used_gb: number;
    api_calls_24h: number;
    created_at: string;
}

export default function TenantsPage() {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        fetchTenants();
    }, []);

    const fetchTenants = async () => {
        try {
            setLoading(true);
            const data = await api.tenants.list();
            setTenants(data);
        } catch (error) {
            console.error('Failed to fetch tenants:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTenant = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        try {
            await api.tenants.create(data);
            setShowCreateModal(false);
            fetchTenants();
        } catch (error) {
            console.error('Failed to create tenant:', error);
        }
    };

    const filteredTenants = tenants.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 bg-gray-900 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Tenants</h1>
                        <p className="text-gray-400 mt-2">Manage your multi-tenant databases</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition"
                    >
                        <Plus className="w-5 h-5" />
                        Create Tenant
                    </button>
                </div>

                {/* Search & Filters */}
                <div className="mb-6 flex gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search tenants..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <select className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>All Status</option>
                        <option>Active</option>
                        <option>Inactive</option>
                    </select>
                    <select className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>All Types</option>
                        <option>PostgreSQL</option>
                        <option>MSSQL</option>
                    </select>
                </div>

                {/* Tenant Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTenants.map((tenant) => (
                        <div key={tenant.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition">
                            {/* Card Header */}
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-white">{tenant.name}</h3>
                                    <span className={`inline-block px-2 py-1 rounded text-xs mt-2 ${tenant.database_type === 'postgresql'
                                        ? 'bg-blue-500/10 text-blue-400'
                                        : 'bg-orange-500/10 text-orange-400'
                                        }`}>
                                        {tenant.database_type.toUpperCase()}
                                    </span>
                                </div>
                                <button className="text-gray-400 hover:text-white">
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Status Indicators */}
                            <div className="flex gap-2 mb-4">
                                <span className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${tenant.status === 'active'
                                    ? 'bg-green-500/10 text-green-400'
                                    : 'bg-red-500/10 text-red-400'
                                    }`}>
                                    <div className={`w-2 h-2 rounded-full ${tenant.status === 'active' ? 'bg-green-400' : 'bg-red-400'
                                        }`}></div>
                                    {tenant.status}
                                </span>
                                {tenant.vpn_enabled && (
                                    <span className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-purple-500/10 text-purple-400">
                                        <Shield className="w-3 h-3" />
                                        VPN
                                    </span>
                                )}
                                {tenant.public_api_enabled && (
                                    <span className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-blue-500/10 text-blue-400">
                                        <Activity className="w-3 h-3" />
                                        API
                                    </span>
                                )}
                            </div>

                            {/* Stats */}
                            <div className="space-y-3 mb-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-400">Disk Usage</span>
                                        <span className="text-white">{tenant.disk_used_gb}GB / {tenant.disk_quota_gb}GB</span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-2">
                                        <div
                                            className="bg-blue-500 h-2 rounded-full"
                                            style={{ width: `${(tenant.disk_used_gb / tenant.disk_quota_gb) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">API Calls (24h)</span>
                                    <span className="text-white">{tenant.api_calls_24h.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-4 border-t border-gray-700">
                                <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition text-sm">
                                    View Details
                                </button>
                                <button className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded transition">
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button className="bg-red-500/10 hover:bg-red-500/20 text-red-400 p-2 rounded transition">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Create Tenant Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full border border-gray-700">
                            <h2 className="text-2xl font-bold text-white mb-6">Create Tenant</h2>

                            <form className="space-y-4" onSubmit={handleCreateTenant}>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Tenant Name</label>
                                    <input
                                        type="text"
                                        placeholder="acme"
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Database Type</label>
                                    <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option>PostgreSQL</option>
                                        <option>MSSQL</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Disk Quota (GB)</label>
                                    <input
                                        type="range"
                                        min="1"
                                        max="100"
                                        defaultValue="5"
                                        className="w-full"
                                    />
                                    <div className="flex justify-between text-sm text-gray-400 mt-1">
                                        <span>1 GB</span>
                                        <span>100 GB</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Max Connections</label>
                                    <input
                                        type="number"
                                        defaultValue="20"
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-300">Enable VPN</span>
                                    <button type="button" className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-600">
                                        <span className="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-300">Enable Public API</span>
                                    <button type="button" className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-500">
                                        <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                                    </button>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
                                    >
                                        Create
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
