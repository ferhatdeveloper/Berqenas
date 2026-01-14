import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  TrashIcon, 
  PencilIcon, 
  PlayIcon, 
  StopIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  BellIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  CogIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowPathIcon,
  BeakerIcon,
  DocumentTextIcon,
  LinkIcon,
  ShieldCheckIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { api } from '../services/api';

interface Integration {
  id: string;
  name: string;
  type: 'slack' | 'discord' | 'email' | 'webhook' | 'telegram' | 'microsoft-teams' | 'custom';
  status: 'active' | 'inactive' | 'error' | 'testing';
  config: {
    url?: string;
    token?: string;
    channel?: string;
    email?: string;
    webhookUrl?: string;
    customHeaders?: Record<string, string>;
    events: string[];
  };
  lastTriggered?: string;
  triggerCount: number;
  errorCount: number;
  createdAt: string;
  updatedAt: string;
}

interface WebhookEvent {
  id: string;
  integrationId: string;
  event: string;
  data: any;
  status: 'success' | 'failed' | 'pending';
  response?: string;
  timestamp: string;
}

const IntegrationsPage: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [webhookEvents, setWebhookEvents] = useState<WebhookEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null);
  const [showSecrets, setShowSecrets] = useState<{ [key: string]: boolean }>({});
  const [activeTab, setActiveTab] = useState<'integrations' | 'events' | 'logs'>('integrations');
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'webhook' as Integration['type'],
    url: '',
    token: '',
    channel: '',
    email: '',
    webhookUrl: '',
    customHeaders: {} as Record<string, string>,
    events: [] as string[]
  });

  const availableEvents = [
    'database.create',
    'database.update', 
    'database.delete',
    'user.login',
    'user.logout',
    'error.occurred',
    'backup.completed',
    'migration.started',
    'migration.completed'
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const integrationsRes = await api.getIntegrations();
      setIntegrations(integrationsRes.integrations || []);
      setWebhookEvents([]); // Events API'si henüz mevcut değil
    } catch (error) {
      console.error('Entegrasyon verileri yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const testIntegration = async (integration: Integration) => {
    try {
      // Test API'si henüz mevcut değil
      console.log('Test ediliyor:', integration.id);
      await loadData();
    } catch (error) {
      console.error('Entegrasyon test edilemedi:', error);
    }
  };

  const toggleIntegration = async (integration: Integration) => {
    try {
      // Status update API'si henüz mevcut değil
      console.log('Durum güncelleniyor:', integration.id);
      await loadData();
    } catch (error) {
      console.error('Entegrasyon durumu güncellenemedi:', error);
    }
  };

  const addIntegration = async () => {
    try {
      await api.createIntegration(formData);
      setShowAddModal(false);
      resetForm();
      await loadData();
    } catch (error) {
      console.error('Entegrasyon eklenemedi:', error);
    }
  };

  const updateIntegration = async () => {
    if (!editingIntegration) return;
    
    try {
      // Update API'si henüz mevcut değil
      console.log('Güncelleniyor:', editingIntegration.id, formData);
      setEditingIntegration(null);
      resetForm();
      await loadData();
    } catch (error) {
      console.error('Entegrasyon güncellenemedi:', error);
    }
  };

  const deleteIntegration = async (id: string) => {
    if (!confirm('Bu entegrasyonu silmek istediğinizden emin misiniz?')) return;
    
    try {
      await api.deleteConnection(id); // Geçici olarak deleteConnection kullanıyoruz
      await loadData();
    } catch (error) {
      console.error('Entegrasyon silinemedi:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'webhook',
      url: '',
      token: '',
      channel: '',
      email: '',
      webhookUrl: '',
      customHeaders: {},
      events: []
    });
  };

  const openEditModal = (integration: Integration) => {
    setEditingIntegration(integration);
    setFormData({
      name: integration.name,
      type: integration.type,
      url: integration.config.url || '',
      token: integration.config.token || '',
      channel: integration.config.channel || '',
      email: integration.config.email || '',
      webhookUrl: integration.config.webhookUrl || '',
      customHeaders: integration.config.customHeaders || {},
      events: integration.config.events || []
    });
  };

  const getIntegrationIcon = (type: Integration['type']) => {
    const iconClass = "w-6 h-6";
    switch (type) {
      case 'slack': return <ChatBubbleLeftRightIcon className={`${iconClass} text-purple-600`} />;
      case 'discord': return <ChatBubbleLeftRightIcon className={`${iconClass} text-indigo-600`} />;
      case 'email': return <EnvelopeIcon className={`${iconClass} text-blue-600`} />;
      case 'webhook': return <LinkIcon className={`${iconClass} text-green-600`} />;
      case 'telegram': return <ChatBubbleLeftRightIcon className={`${iconClass} text-blue-500`} />;
      case 'microsoft-teams': return <ChatBubbleLeftRightIcon className={`${iconClass} text-purple-700`} />;
      case 'custom': return <CogIcon className={`${iconClass} text-gray-600`} />;
      default: return <GlobeAltIcon className={`${iconClass} text-gray-600`} />;
    }
  };

  const getStatusIcon = (status: Integration['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'inactive':
        return <XCircleIcon className="w-5 h-5 text-gray-400" />;
      case 'error':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
      case 'testing':
        return <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      default:
        return <XCircleIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: Integration['status']) => {
    switch (status) {
      case 'active': return 'Aktif';
      case 'inactive': return 'Pasif';
      case 'error': return 'Hata';
      case 'testing': return 'Test Ediliyor';
      default: return 'Bilinmiyor';
    }
  };

  const getIntegrationTypeText = (type: Integration['type']) => {
    switch (type) {
      case 'slack': return 'Slack';
      case 'discord': return 'Discord';
      case 'email': return 'E-posta';
      case 'webhook': return 'Webhook';
      case 'telegram': return 'Telegram';
      case 'microsoft-teams': return 'Microsoft Teams';
      case 'custom': return 'Özel';
      default: return 'Bilinmiyor';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('tr-TR');
  };

  const getEventStatusIcon = (status: WebhookEvent['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircleIcon className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <ClockIcon className="w-4 h-4 text-yellow-500" />;
      default:
        return <XCircleIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Entegrasyonlar</h1>
          <p className="text-gray-600">3. parti servislerle bağlantıları yönetin</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <LinkIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Toplam Entegrasyon</p>
                <p className="text-2xl font-bold text-gray-900">{integrations.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Aktif Entegrasyon</p>
                <p className="text-2xl font-bold text-gray-900">
                  {integrations.filter(i => i.status === 'active').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <BellIcon className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Toplam Tetikleme</p>
                <p className="text-2xl font-bold text-gray-900">
                  {integrations.reduce((sum, i) => sum + i.triggerCount, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Toplam Hata</p>
                <p className="text-2xl font-bold text-gray-900">
                  {integrations.reduce((sum, i) => sum + i.errorCount, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'integrations', label: 'Entegrasyonlar', icon: LinkIcon },
                { id: 'events', label: 'Olaylar', icon: BellIcon },
                { id: 'logs', label: 'Loglar', icon: DocumentTextIcon }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-5 h-5 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'integrations' && (
          <div className="space-y-6">
            {/* Actions */}
            <div className="flex justify-between items-center">
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Yeni Entegrasyon
                </button>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={loadData}
                  disabled={loading}
                  className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <ArrowPathIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Integrations Grid */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {integrations.map((integration) => (
                  <div key={integration.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          {getIntegrationIcon(integration.type)}
                          <div>
                            <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                            <p className="text-sm text-gray-500">{getIntegrationTypeText(integration.type)}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(integration.status)}
                          <span className={`text-sm px-2 py-1 rounded-full ${
                            integration.status === 'active' ? 'bg-green-100 text-green-800' :
                            integration.status === 'error' ? 'bg-red-100 text-red-800' :
                            integration.status === 'testing' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {getStatusText(integration.status)}
                          </span>
                        </div>
                      </div>

                      {/* Config Details */}
                      <div className="space-y-2 mb-4">
                        {integration.config.url && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">URL:</span>
                            <span className="font-mono text-gray-900 truncate max-w-32">{integration.config.url}</span>
                          </div>
                        )}
                        {integration.config.channel && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Kanal:</span>
                            <span className="font-mono text-gray-900">{integration.config.channel}</span>
                          </div>
                        )}
                        {integration.config.email && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">E-posta:</span>
                            <span className="font-mono text-gray-900">{integration.config.email}</span>
                          </div>
                        )}
                        {integration.config.token && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Token:</span>
                            <div className="flex items-center space-x-1">
                              <span className="font-mono text-gray-900">
                                {showSecrets[integration.id] ? integration.config.token : '••••••••'}
                              </span>
                              <button
                                onClick={() => setShowSecrets(prev => ({ ...prev, [integration.id]: !prev[integration.id] }))}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                {showSecrets[integration.id] ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Events */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Olaylar</h4>
                        <div className="flex flex-wrap gap-1">
                          {integration.config.events.map((event) => (
                            <span key={event} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {event}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <span className="text-gray-600">Tetikleme:</span>
                            <span className="ml-1 font-semibold text-blue-600">{integration.triggerCount}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Hata:</span>
                            <span className="ml-1 font-semibold text-red-600">{integration.errorCount}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Son:</span>
                            <span className="ml-1 font-semibold text-gray-600">
                              {integration.lastTriggered ? formatTimestamp(integration.lastTriggered) : 'Hiç'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => testIntegration(integration)}
                          disabled={integration.status === 'testing'}
                          className="flex-1 flex items-center justify-center px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
                        >
                          <BeakerIcon className="w-4 h-4 mr-1" />
                          Test Et
                        </button>
                        <button
                          onClick={() => toggleIntegration(integration)}
                          className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                            integration.status === 'active'
                              ? 'text-red-600 bg-red-100 hover:bg-red-200'
                              : 'text-green-600 bg-green-100 hover:bg-green-200'
                          }`}
                        >
                          {integration.status === 'active' ? <StopIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => openEditModal(integration)}
                          className="flex items-center px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteIntegration(integration.id)}
                          className="flex items-center px-3 py-2 text-sm text-red-600 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Webhook Olayları</h3>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Durum
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Olay
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Entegrasyon
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tarih
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Yanıt
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {webhookEvents.map((event) => (
                      <tr key={event.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getEventStatusIcon(event.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {event.event}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {integrations.find(i => i.id === event.integrationId)?.name || 'Bilinmiyor'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatTimestamp(event.timestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {event.response ? (
                            <span className={`px-2 py-1 rounded text-xs ${
                              event.status === 'success' ? 'bg-green-100 text-green-800' :
                              event.status === 'failed' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {event.response}
                            </span>
                          ) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Entegrasyon Logları</h3>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="space-y-4">
                {webhookEvents.map((event) => (
                  <div key={event.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getEventStatusIcon(event.status)}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{event.event}</p>
                          <p className="text-xs text-gray-500">
                            {integrations.find(i => i.id === event.integrationId)?.name} • {formatTimestamp(event.timestamp)}
                          </p>
                        </div>
                      </div>
                      {event.response && (
                        <span className={`px-2 py-1 rounded text-xs ${
                          event.status === 'success' ? 'bg-green-100 text-green-800' :
                          event.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {event.response}
                        </span>
                      )}
                    </div>
                    {event.data && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                        <pre className="whitespace-pre-wrap">{JSON.stringify(event.data, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Modal */}
        {(showAddModal || editingIntegration) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  {editingIntegration ? 'Entegrasyon Düzenle' : 'Yeni Entegrasyon'}
                </h2>

                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Entegrasyon Adı
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Entegrasyon adını girin"
                    />
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Entegrasyon Türü
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as Integration['type'] }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="webhook">Webhook</option>
                      <option value="slack">Slack</option>
                      <option value="discord">Discord</option>
                      <option value="email">E-posta</option>
                      <option value="telegram">Telegram</option>
                      <option value="microsoft-teams">Microsoft Teams</option>
                      <option value="custom">Özel</option>
                    </select>
                  </div>

                  {/* URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL
                    </label>
                    <input
                      type="url"
                      value={formData.url}
                      onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com/webhook"
                    />
                  </div>

                  {/* Token */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Token/API Key
                    </label>
                    <input
                      type="password"
                      value={formData.token}
                      onChange={(e) => setFormData(prev => ({ ...prev, token: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="••••••••"
                    />
                  </div>

                  {/* Channel/Email */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kanal/E-posta
                      </label>
                      <input
                        type="text"
                        value={formData.channel}
                        onChange={(e) => setFormData(prev => ({ ...prev, channel: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="#genel veya email@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Webhook URL
                      </label>
                      <input
                        type="url"
                        value={formData.webhookUrl}
                        onChange={(e) => setFormData(prev => ({ ...prev, webhookUrl: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://hooks.slack.com/..."
                      />
                    </div>
                  </div>

                  {/* Events */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Olaylar
                    </label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {availableEvents.map((event) => (
                        <label key={event} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.events.includes(event)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData(prev => ({ ...prev, events: [...prev.events, event] }));
                              } else {
                                setFormData(prev => ({ ...prev, events: prev.events.filter(e => e !== event) }));
                              }
                            }}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">{event}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingIntegration(null);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    onClick={editingIntegration ? updateIntegration : addIntegration}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingIntegration ? 'Güncelle' : 'Ekle'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IntegrationsPage; 