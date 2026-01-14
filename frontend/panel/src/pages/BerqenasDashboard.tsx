import { useState, useEffect } from 'react';
import {
    Users,
    Shield,
    Database,
    Activity,
    TrendingUp,
    Server,
    Zap
} from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    change?: string;
    icon: React.ReactNode;
    trend?: 'up' | 'down';
}

function StatCard({ title, value, change, icon, trend }: StatCardProps) {
    return (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-400 text-sm">{title}</p>
                    <p className="text-3xl font-bold text-white mt-2">{value}</p>
                    {change && (
                        <p className={`text-sm mt-2 flex items-center ${trend === 'up' ? 'text-green-400' : 'text-red-400'
                            }`}>
                            <TrendingUp className="w-4 h-4 mr-1" />
                            {change}
                        </p>
                    )}
                </div>
                <div className="bg-blue-500/10 p-3 rounded-lg">
                    {icon}
                </div>
            </div>
        </div>
    );
}

export default function BerqenasDashboard() {
    const [stats, setStats] = useState({
        totalTenants: 0,
        activeVPNs: 0,
        apiRequests: 0,
        syncStatus: 0
    });

    useEffect(() => {
        // TODO: Fetch real data from API
        setStats({
            totalTenants: 12,
            activeVPNs: 8,
            apiRequests: 24567,
            syncStatus: 5
        });
    }, []);

    return (
        <div className="p-8 bg-gray-900 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white">Berqenas Cloud Dashboard</h1>
                    <p className="text-gray-400 mt-2">Multi-tenant cloud platform overview</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Total Tenants"
                        value={stats.totalTenants}
                        change="+2 this week"
                        trend="up"
                        icon={<Users className="w-6 h-6 text-blue-400" />}
                    />
                    <StatCard
                        title="Active VPN Connections"
                        value={stats.activeVPNs}
                        change="8/12 connected"
                        trend="up"
                        icon={<Shield className="w-6 h-6 text-green-400" />}
                    />
                    <StatCard
                        title="API Requests (24h)"
                        value={stats.apiRequests.toLocaleString()}
                        change="+12.5%"
                        trend="up"
                        icon={<Zap className="w-6 h-6 text-yellow-400" />}
                    />
                    <StatCard
                        title="Database Syncs"
                        value={stats.syncStatus}
                        change="Last: 2 min ago"
                        icon={<Database className="w-6 h-6 text-purple-400" />}
                    />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* API Requests Chart */}
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">API Requests (7 days)</h3>
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            {/* TODO: Add Chart.js or Recharts */}
                            <Activity className="w-12 h-12" />
                            <span className="ml-2">Chart placeholder</span>
                        </div>
                    </div>

                    {/* Resource Usage */}
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Resource Usage</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-400">CPU</span>
                                    <span className="text-white">45%</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-400">Memory</span>
                                    <span className="text-white">62%</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '62%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-400">Storage</span>
                                    <span className="text-white">38%</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '38%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-gray-400 text-sm border-b border-gray-700">
                                    <th className="pb-3">Timestamp</th>
                                    <th className="pb-3">Event</th>
                                    <th className="pb-3">Tenant</th>
                                    <th className="pb-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                <tr className="border-b border-gray-700">
                                    <td className="py-3 text-gray-400">2 min ago</td>
                                    <td className="py-3 text-white">Database sync completed</td>
                                    <td className="py-3 text-gray-300">acme</td>
                                    <td className="py-3">
                                        <span className="px-2 py-1 bg-green-500/10 text-green-400 rounded text-xs">Success</span>
                                    </td>
                                </tr>
                                <tr className="border-b border-gray-700">
                                    <td className="py-3 text-gray-400">5 min ago</td>
                                    <td className="py-3 text-white">VPN client connected</td>
                                    <td className="py-3 text-gray-300">techstart</td>
                                    <td className="py-3">
                                        <span className="px-2 py-1 bg-green-500/10 text-green-400 rounded text-xs">Success</span>
                                    </td>
                                </tr>
                                <tr className="border-b border-gray-700">
                                    <td className="py-3 text-gray-400">12 min ago</td>
                                    <td className="py-3 text-white">API generated</td>
                                    <td className="py-3 text-gray-300">contoso</td>
                                    <td className="py-3">
                                        <span className="px-2 py-1 bg-green-500/10 text-green-400 rounded text-xs">Success</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="fixed bottom-8 right-8 flex flex-col gap-3">
                    <button className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-4 shadow-lg transition">
                        <Users className="w-6 h-6" />
                    </button>
                    <button className="bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg transition">
                        <Database className="w-6 h-6" />
                    </button>
                    <button className="bg-purple-500 hover:bg-purple-600 text-white rounded-full p-4 shadow-lg transition">
                        <Server className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    );
}
