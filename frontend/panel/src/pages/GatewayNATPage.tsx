import { useState } from 'react';
import { Globe, Plus, Power, Trash2, Edit, AlertCircle } from 'lucide-react';

interface PublicService {
    id: number;
    name: string;
    tenant: string;
    internal_ip: string;
    internal_port: number;
    public_port: number;
    status: 'active' | 'inactive';
    protocol: 'tcp' | 'udp';
    description: string;
}

export default function GatewayNATPage() {
    const [services, setServices] = useState<PublicService[]>([
        {
            id: 1,
            name: 'Customer Portal',
            tenant: 'acme',
            internal_ip: '10.60.5.10',
            internal_port: 8080,
            public_port: 80,
            status: 'active',
            protocol: 'tcp',
            description: 'Main customer facing portal'
        },
        {
            id: 2,
            name: 'ERP API',
            tenant: 'techstart',
            internal_ip: '10.60.5.12',
            internal_port: 3000,
            public_port: 443,
            status: 'active',
            protocol: 'tcp',
            description: 'Secure API access'
        },
        {
            id: 3,
            name: 'Legacy Sync',
            tenant: 'acme',
            internal_ip: '10.60.5.11',
            internal_port: 1433,
            public_port: 14330,
            status: 'inactive',
            protocol: 'tcp',
            description: 'Direct DB access (Maintenance)'
        }
    ]);

    const [showAddModal, setShowAddModal] = useState(false);

    return (
        <div className="p-8 bg-gray-900 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Gateway & NAT</h1>
                        <p className="text-gray-400 mt-2">Expose internal services to public internet securely</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition"
                    >
                        <Plus className="w-5 h-5" />
                        Expose Service
                    </button>
                </div>

                {/* Warning Banner */}
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-8 flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-yellow-500 flex-shrink-0" />
                    <div>
                        <h3 className="text-white font-medium">Security Warning</h3>
                        <p className="text-sm text-yellow-200/70 mt-1">
                            Exposing services makes them accessible from the public internet. Ensure proper firewall rules and authentication are in place.
                        </p>
                    </div>
                </div>

                {/* Services Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {services.map((service) => (
                        <div key={service.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-purple-500/10 p-3 rounded-lg">
                                        <Globe className="w-6 h-6 text-purple-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">{service.name}</h3>
                                        <p className="text-sm text-gray-400">{service.tenant}</p>
                                    </div>
                                </div>
                                <div className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${service.status === 'active'
                                        ? 'bg-green-500/10 text-green-400'
                                        : 'bg-gray-500/10 text-gray-400'
                                    }`}>
                                    <div className={`w-2 h-2 rounded-full ${service.status === 'active' ? 'bg-green-400' : 'bg-gray-400'
                                        }`}></div>
                                    {service.status.toUpperCase()}
                                </div>
                            </div>

                            {/* Port Mapping Visualization */}
                            <div className="flex items-center justify-between bg-gray-900/50 rounded-lg p-4 mb-4 font-mono text-sm">
                                <div className="text-center">
                                    <p className="text-gray-500 text-xs mb-1">PUBLIC</p>
                                    <span className="text-blue-400">:{service.public_port}</span>
                                </div>
                                <div className="flex-1 px-4 flex items-center">
                                    <div className="h-[2px] w-full bg-gray-700 relative">
                                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-900 px-2 text-xs text-gray-500">
                                            NAT
                                        </div>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <p className="text-gray-500 text-xs mb-1">INTERNAL ({service.internal_ip})</p>
                                    <span className="text-green-400">:{service.internal_port}</span>
                                </div>
                            </div>

                            <div className="mb-4">
                                <p className="text-sm text-gray-400">{service.description}</p>
                            </div>

                            <div className="flex gap-2 border-t border-gray-700 pt-4">
                                <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition text-sm flex items-center justify-center gap-2">
                                    <Edit className="w-4 h-4" />
                                    Edit
                                </button>
                                <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition">
                                    <Power className={`w-4 h-4 ${service.status === 'active' ? 'text-green-400' : 'text-gray-400'}`} />
                                </button>
                                <button className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded transition">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Add Service Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-gray-800 rounded-lg p-8 max-w-lg w-full border border-gray-700">
                            <h2 className="text-2xl font-bold text-white mb-6">Expose New Service</h2>

                            <form className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Service Name</label>
                                    <input type="text" placeholder="My Web App" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Tenant & Device</label>
                                    <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white">
                                        <option>acme - office-server (10.60.5.10)</option>
                                        <option>techstart - db-server (10.60.5.12)</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Internal Port</label>
                                        <input type="number" placeholder="8080" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Public Port</label>
                                        <input type="number" placeholder="80" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Protocol</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 text-white">
                                            <input type="radio" name="protocol" defaultChecked className="text-blue-500" /> TCP
                                        </label>
                                        <label className="flex items-center gap-2 text-white">
                                            <input type="radio" name="protocol" className="text-blue-500" /> UDP
                                        </label>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg">Cancel</button>
                                    <button type="submit" className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg">Create Rule</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
