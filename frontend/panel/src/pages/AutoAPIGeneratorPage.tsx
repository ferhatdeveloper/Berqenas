import { useState } from 'react';
import {
    Database,
    ArrowRight,
    CheckCircle,
    Code,
    Copy,
    ExternalLink
} from 'lucide-react';

interface Table {
    name: string;
    columns: number;
    primary_keys: string[];
    selected: boolean;
}

export default function AutoAPIGeneratorPage() {
    const [step, setStep] = useState(1);
    const [selectedDB, setSelectedDB] = useState('');
    const [tables, setTables] = useState<Table[]>([
        { name: 'customers', columns: 12, primary_keys: ['customer_id'], selected: true },
        { name: 'orders', columns: 15, primary_keys: ['order_id'], selected: true },
        { name: 'products', columns: 10, primary_keys: ['product_id'], selected: true },
        { name: 'invoices', columns: 18, primary_keys: ['invoice_id'], selected: false },
    ]);
    const [generating, setGenerating] = useState(false);
    const [generated, setGenerated] = useState(false);

    const toggleTable = (tableName: string) => {
        setTables(tables.map(t =>
            t.name === tableName ? { ...t, selected: !t.selected } : t
        ));
    };

    const handleGenerate = () => {
        setGenerating(true);
        setTimeout(() => {
            setGenerating(false);
            setGenerated(true);
        }, 3000);
    };

    return (
        <div className="p-8 bg-gray-900 min-h-screen">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white">Auto-API Generator</h1>
                    <p className="text-gray-400 mt-2">Generate REST APIs from database tables automatically</p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-between mb-12">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center flex-1">
                            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${step >= s ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-600 text-gray-400'
                                }`}>
                                {step > s ? <CheckCircle className="w-6 h-6" /> : s}
                            </div>
                            <div className="ml-3">
                                <p className={`text-sm font-medium ${step >= s ? 'text-white' : 'text-gray-400'}`}>
                                    Step {s}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {s === 1 && 'Select Database'}
                                    {s === 2 && 'Select Tables'}
                                    {s === 3 && 'Generate API'}
                                </p>
                            </div>
                            {s < 3 && (
                                <ArrowRight className="w-5 h-5 text-gray-600 mx-4" />
                            )}
                        </div>
                    ))}
                </div>

                {/* Step Content */}
                <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
                    {/* Step 1: Select Database */}
                    {step === 1 && (
                        <div>
                            <h2 className="text-xl font-bold text-white mb-6">Select Remote Database</h2>
                            <div className="space-y-3">
                                {['customer_erp', 'legacy_crm', 'warehouse_db'].map((db) => (
                                    <button
                                        key={db}
                                        onClick={() => setSelectedDB(db)}
                                        className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition ${selectedDB === db
                                                ? 'border-blue-500 bg-blue-500/10'
                                                : 'border-gray-700 hover:border-gray-600'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Database className="w-5 h-5 text-blue-400" />
                                            <span className="text-white font-medium">{db}</span>
                                        </div>
                                        {selectedDB === db && (
                                            <CheckCircle className="w-5 h-5 text-blue-400" />
                                        )}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setStep(2)}
                                disabled={!selectedDB}
                                className="mt-6 w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition"
                            >
                                Continue
                            </button>
                        </div>
                    )}

                    {/* Step 2: Select Tables */}
                    {step === 2 && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-white">Select Tables</h2>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setTables(tables.map(t => ({ ...t, selected: true })))}
                                        className="text-sm text-blue-400 hover:text-blue-300"
                                    >
                                        Select All
                                    </button>
                                    <span className="text-gray-600">|</span>
                                    <button
                                        onClick={() => setTables(tables.map(t => ({ ...t, selected: false })))}
                                        className="text-sm text-blue-400 hover:text-blue-300"
                                    >
                                        Deselect All
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3 mb-6">
                                {tables.map((table) => (
                                    <div
                                        key={table.name}
                                        onClick={() => toggleTable(table.name)}
                                        className={`p-4 rounded-lg border-2 cursor-pointer transition ${table.selected
                                                ? 'border-blue-500 bg-blue-500/10'
                                                : 'border-gray-700 hover:border-gray-600'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-white font-medium">{table.name}</h3>
                                                <p className="text-sm text-gray-400 mt-1">
                                                    {table.columns} columns • PK: {table.primary_keys.join(', ')}
                                                </p>
                                            </div>
                                            {table.selected && (
                                                <CheckCircle className="w-5 h-5 text-blue-400" />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep(1)}
                                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={() => setStep(3)}
                                    disabled={!tables.some(t => t.selected)}
                                    className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition"
                                >
                                    Continue
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Generate */}
                    {step === 3 && !generated && (
                        <div>
                            <h2 className="text-xl font-bold text-white mb-6">Configure & Generate</h2>

                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Output Directory</label>
                                    <input
                                        type="text"
                                        defaultValue="./generated_api/customer_erp"
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">API Prefix</label>
                                    <input
                                        type="text"
                                        defaultValue="/api/v1"
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-300">Enable Public Access</span>
                                    <button type="button" className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-500">
                                        <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                                    </button>
                                </div>
                            </div>

                            <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
                                <p className="text-sm text-gray-300 mb-2">Selected tables: {tables.filter(t => t.selected).length}</p>
                                <p className="text-sm text-gray-300">Estimated endpoints: {tables.filter(t => t.selected).length * 5}</p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep(2)}
                                    disabled={generating}
                                    className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white px-6 py-3 rounded-lg transition"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleGenerate}
                                    disabled={generating}
                                    className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg transition flex items-center justify-center gap-2"
                                >
                                    {generating ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Code className="w-5 h-5" />
                                            Generate API
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Generated APIs */}
                    {generated && (
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <CheckCircle className="w-8 h-8 text-green-400" />
                                <div>
                                    <h2 className="text-xl font-bold text-white">API Generated Successfully!</h2>
                                    <p className="text-gray-400">15 endpoints created</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {tables.filter(t => t.selected).flatMap(table => [
                                    { method: 'GET', endpoint: `/api/v1/${table.name}`, desc: 'List all' },
                                    { method: 'GET', endpoint: `/api/v1/${table.name}/{id}`, desc: 'Get by ID' },
                                    { method: 'POST', endpoint: `/api/v1/${table.name}`, desc: 'Create' },
                                    { method: 'PUT', endpoint: `/api/v1/${table.name}/{id}`, desc: 'Update' },
                                    { method: 'DELETE', endpoint: `/api/v1/${table.name}/{id}`, desc: 'Delete' },
                                ]).map((endpoint, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <span className={`px-2 py-1 rounded text-xs font-mono ${endpoint.method === 'GET' ? 'bg-blue-500/20 text-blue-400' :
                                                    endpoint.method === 'POST' ? 'bg-green-500/20 text-green-400' :
                                                        endpoint.method === 'PUT' ? 'bg-yellow-500/20 text-yellow-400' :
                                                            'bg-red-500/20 text-red-400'
                                                }`}>
                                                {endpoint.method}
                                            </span>
                                            <code className="text-sm text-gray-300">{endpoint.endpoint}</code>
                                            <span className="text-xs text-gray-500">{endpoint.desc}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="text-gray-400 hover:text-white">
                                                <Copy className="w-4 h-4" />
                                            </button>
                                            <button className="text-gray-400 hover:text-white">
                                                <ExternalLink className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => {
                                    setStep(1);
                                    setGenerated(false);
                                    setSelectedDB('');
                                }}
                                className="mt-6 w-full bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition"
                            >
                                Generate Another API
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
