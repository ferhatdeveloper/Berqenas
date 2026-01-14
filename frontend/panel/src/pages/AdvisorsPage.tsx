import React, { useState } from 'react';
import { AlertCircle, CheckCircle, XCircle, Info, TrendingUp, Shield, Zap, Database } from 'lucide-react';

const AdvisorsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { value: 'all', label: 'Tümü' },
    { value: 'performance', label: 'Performans' },
    { value: 'security', label: 'Güvenlik' },
    { value: 'optimization', label: 'Optimizasyon' },
  ];

  const advisors = [
    {
      id: 1,
      title: 'Veritabanı İndeksleri Eksik',
      description: 'Sık kullanılan sorgular için indeksler oluşturulmalı',
      category: 'performance',
      priority: 'high',
      impact: 'Yüksek',
      recommendation: 'users tablosunda email kolonu için indeks oluşturun',
      status: 'pending',
    },
    {
      id: 2,
      title: 'RLS (Row Level Security) Etkin Değil',
      description: 'Hassas veriler için satır seviyesi güvenlik aktif edilmeli',
      category: 'security',
      priority: 'high',
      impact: 'Kritik',
      recommendation: 'Tüm tablolarda RLS politikaları tanımlayın',
      status: 'completed',
    },
    {
      id: 3,
      title: 'Edge Functions Kullanımı Düşük',
      description: 'Sunucu tarafı işlemler için Edge Functions kullanılabilir',
      category: 'optimization',
      priority: 'medium',
      impact: 'Orta',
      recommendation: 'Karmaşık işlemler için Edge Functions implementasyonu',
      status: 'pending',
    },
    {
      id: 4,
      title: 'Depolama Kullanımı Optimize Edilmeli',
      description: 'Gereksiz dosyalar temizlenmeli ve sıkıştırma kullanılmalı',
      category: 'optimization',
      priority: 'medium',
      impact: 'Orta',
      recommendation: 'Eski dosyaları arşivleyin ve sıkıştırma aktif edin',
      status: 'pending',
    },
    {
      id: 5,
      title: 'API Rate Limiting Eksik',
      description: 'API istekleri için rate limiting konfigürasyonu gerekli',
      category: 'security',
      priority: 'high',
      impact: 'Yüksek',
      recommendation: 'API Gateway\'de rate limiting kuralları tanımlayın',
      status: 'pending',
    },
    {
      id: 6,
      title: 'Backup Stratejisi Geliştirilmeli',
      description: 'Otomatik backup ve disaster recovery planı eksik',
      category: 'security',
      priority: 'high',
      impact: 'Kritik',
      recommendation: 'Günlük otomatik backup ve test restore prosedürleri',
      status: 'completed',
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'pending':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'performance':
        return <TrendingUp className="h-4 w-4" />;
      case 'security':
        return <Shield className="h-4 w-4" />;
      case 'optimization':
        return <Zap className="h-4 w-4" />;
      default:
        return <Database className="h-4 w-4" />;
    }
  };

  const filteredAdvisors = selectedCategory === 'all' 
    ? advisors 
    : advisors.filter(advisor => advisor.category === selectedCategory);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Danışmanlar</h1>
            <p className="text-gray-600 mt-1">Performans ve güvenlik önerileri</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
              <CheckCircle className="h-4 w-4" />
              Tümünü Uygula
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white border-b px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Kritik Öneriler</p>
              <p className="text-xl font-bold text-gray-900">3</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Orta Öncelik</p>
              <p className="text-xl font-bold text-gray-900">2</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Tamamlanan</p>
              <p className="text-xl font-bold text-gray-900">2</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Toplam Öneri</p>
              <p className="text-xl font-bold text-gray-900">6</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Advisors List */}
      <div className="flex-1 bg-gray-50 p-6">
        <div className="space-y-4">
          {filteredAdvisors.map((advisor) => (
            <div key={advisor.id} className="bg-white rounded-lg border p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(advisor.status)}
                    <h3 className="text-lg font-medium text-gray-900">{advisor.title}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(advisor.priority)}`}>
                      {advisor.priority === 'high' ? 'Yüksek' : advisor.priority === 'medium' ? 'Orta' : 'Düşük'}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{advisor.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Kategori</p>
                      <div className="flex items-center gap-2 mt-1">
                        {getCategoryIcon(advisor.category)}
                        <span className="text-sm text-gray-900 capitalize">{advisor.category}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Etki</p>
                      <p className="text-sm text-gray-900 mt-1">{advisor.impact}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Durum</p>
                      <p className="text-sm text-gray-900 mt-1 capitalize">
                        {advisor.status === 'completed' ? 'Tamamlandı' : advisor.status === 'pending' ? 'Bekliyor' : 'Başarısız'}
                      </p>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-blue-900 mb-2">Öneri:</p>
                    <p className="text-sm text-blue-800">{advisor.recommendation}</p>
                  </div>
                </div>
                
                <div className="ml-4 flex flex-col gap-2">
                  {advisor.status === 'pending' && (
                    <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                      Uygula
                    </button>
                  )}
                  <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                    Detaylar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdvisorsPage; 