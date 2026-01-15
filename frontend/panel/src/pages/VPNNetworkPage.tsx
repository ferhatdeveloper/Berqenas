import { useEffect, useState } from 'react';
import { Shield, Plus, Wifi, WifiOff, Download, QrCode, Trash2 } from 'lucide-react';
import { api } from '../services/api';

interface VPNClient {
    id: number;
    tenant: string;
    device_name: string;
    ip_address: string;
    status: 'connected' | 'disconnected';
    last_seen: string;
    data_sent: string;
    data_received: string;
}

export default function VPNNetworkPage() {
    const [clients, setClients] = useState<VPNClient[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedClient, setSelectedClient] = useState<VPNClient | null>(null);

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            setLoading(true);
            const data = await api.network.clients();
            setClients(data);
            if (data.length > 0) setSelectedClient(data[0]);
        } catch (error) {
            console.error('Failed to fetch VPN clients:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (client: VPNClient) => {
        try {
            const blob = await api.network.downloadConfig(client.tenant, client.id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${client.device_name}.conf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Download failed:', error);
        }
    };

    return (
        <div className="p-8 bg-gray-900 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">VPN & Network</h1>
                        <p className="text-gray-400 mt-2">Manage WireGuard VPN connections</p>
                    </div>
                    <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition">
                        <Plus className="w-5 h-5" />
                        Add VPN Client
                    </button>
                </div>

                {/* Split View */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Client List */}
                    <div className="lg:col-span-1 bg-gray-800 rounded-lg border border-gray-700 p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">VPN Clients</h2>
                        <div className="space-y-2">
                            {clients.map((client) => (
                                <button
                                    key={client.id}
                                    onClick={() => setSelectedClient(client)}
                                    className={`w-full text-left p-4 rounded-lg transition ${selectedClient?.id === client.id
                                        ? 'bg-blue-500/20 border-2 border-blue-500'
                                        : 'bg-gray-700/50 border-2 border-transparent hover:border-gray-600'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-white font-medium">{client.device_name}</span>
                                        {client.status === 'connected' ? (
                                            <Wifi className="w-4 h-4 text-green-400" />
                                        ) : (
                                            <WifiOff className="w-4 h-4 text-gray-400" />
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${client.status === 'connected' ? 'bg-green-400' : 'bg-gray-400'
                                            }`}></span>
                                        <code className="text-xs text-gray-400">{client.ip_address}</code>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">{client.tenant}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right: Client Details */}
                    {selectedClient && (
                        <div className="lg:col-span-2 bg-gray-800 rounded-lg border border-gray-700 p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">{selectedClient.device_name}</h2>
                                    <p className="text-gray-400 mt-1">Tenant: {selectedClient.tenant}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded transition">
                                        <QrCode className="w-5 h-5" />
                                    </button>
                                    <button className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded transition">
                                        <Download className="w-5 h-5" />
                                    </button>
                                    <button className="bg-red-500/10 hover:bg-red-500/20 text-red-400 p-2 rounded transition">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Connection Status */}
                            <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
                                <div className="flex items-center gap-3 mb-3">
                                    <Shield className={`w-6 h-6 ${selectedClient.status === 'connected' ? 'text-green-400' : 'text-gray-400'
                                        }`} />
                                    <div>
                                        <p className="text-white font-medium">
                                            {selectedClient.status === 'connected' ? 'Connected' : 'Disconnected'}
                                        </p>
                                        <p className="text-sm text-gray-400">Last seen: {selectedClient.last_seen}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Connection Info */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-gray-700/50 rounded-lg p-4">
                                    <p className="text-gray-400 text-sm mb-1">IP Address</p>
                                    <code className="text-white font-mono">{selectedClient.ip_address}</code>
                                </div>
                                <div className="bg-gray-700/50 rounded-lg p-4">
                                    <p className="text-gray-400 text-sm mb-1">Status</p>
                                    <span className={`inline-flex items-center gap-2 px-2 py-1 rounded text-sm ${selectedClient.status === 'connected'
                                        ? 'bg-green-500/10 text-green-400'
                                        : 'bg-gray-500/10 text-gray-400'
                                        }`}>
                                        <div className={`w-2 h-2 rounded-full ${selectedClient.status === 'connected' ? 'bg-green-400' : 'bg-gray-400'
                                            }`}></div>
                                        {selectedClient.status}
                                    </span>
                                </div>
                            </div>

                            {/* Traffic Stats */}
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-4">Traffic Statistics</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-700/50 rounded-lg p-4">
                                        <p className="text-gray-400 text-sm mb-1">Data Sent</p>
                                        <p className="text-2xl font-bold text-white">{selectedClient.data_sent}</p>
                                    </div>
                                    <div className="bg-gray-700/50 rounded-lg p-4">
                                        <p className="text-gray-400 text-sm mb-1">Data Received</p>
                                        <p className="text-2xl font-bold text-white">{selectedClient.data_received}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => handleDownload(selectedClient)}
                                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition">
                                    Download Config
                                </button>
                                <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition">
                                    Show QR Code
                                </button>
                                {selectedClient.status === 'connected' && (
                                    <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition">
                                        Disconnect
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
}
