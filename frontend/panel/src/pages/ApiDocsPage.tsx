import React, { useState } from 'react';
import { BookOpen, Code, Copy, ExternalLink, ChevronDown, ChevronRight, Play } from 'lucide-react';

const ApiDocsPage = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState('auth');
  const [expandedSections, setExpandedSections] = useState<string[]>(['auth']);

  const apiSections = [
    {
      id: 'auth',
      title: 'Authentication',
      description: 'Kullanıcı kimlik doğrulama ve yetkilendirme',
      endpoints: [
        {
          method: 'POST',
          path: '/auth/signup',
          title: 'Kullanıcı Kaydı',
          description: 'Yeni kullanıcı hesabı oluşturur',
          parameters: [
            { name: 'email', type: 'string', required: true, description: 'E-posta adresi' },
            { name: 'password', type: 'string', required: true, description: 'Şifre (min 8 karakter)' },
            { name: 'name', type: 'string', required: true, description: 'Ad soyad' },
          ],
          response: {
            success: {
              code: 201,
              body: `{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "created_at": "2024-01-15T14:30:00Z"
  },
  "token": "jwt_token_here"
}`,
            },
            error: {
              code: 400,
              body: `{
  "error": "Validation failed",
  "details": {
    "email": ["Invalid email format"],
    "password": ["Password too short"]
  }
}`,
            },
          },
        },
        {
          method: 'POST',
          path: '/auth/login',
          title: 'Kullanıcı Girişi',
          description: 'Mevcut kullanıcı ile giriş yapar',
          parameters: [
            { name: 'email', type: 'string', required: true, description: 'E-posta adresi' },
            { name: 'password', type: 'string', required: true, description: 'Şifre' },
          ],
          response: {
            success: {
              code: 200,
              body: `{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "jwt_token_here"
}`,
            },
            error: {
              code: 401,
              body: `{
  "error": "Invalid credentials"
}`,
            },
          },
        },
      ],
    },
    {
      id: 'database',
      title: 'Database',
      description: 'Veritabanı işlemleri ve sorgular',
      endpoints: [
        {
          method: 'GET',
          path: '/database/tables',
          title: 'Tabloları Listele',
          description: 'Veritabanındaki tüm tabloları listeler',
          parameters: [],
          response: {
            success: {
              code: 200,
              body: `{
  "tables": [
    {
      "name": "users",
      "columns": 8,
      "rows": 1250,
      "size": "1.2 MB"
    }
  ]
}`,
            },
          },
        },
        {
          method: 'GET',
          path: '/database/tables/{table_name}/data',
          title: 'Tablo Verilerini Getir',
          description: 'Belirtilen tablonun verilerini sayfalı olarak getirir',
          parameters: [
            { name: 'table_name', type: 'string', required: true, description: 'Tablo adı' },
            { name: 'page', type: 'integer', required: false, description: 'Sayfa numarası (varsayılan: 1)' },
            { name: 'limit', type: 'integer', required: false, description: 'Sayfa başına kayıt (varsayılan: 50)' },
            { name: 'order_by', type: 'string', required: false, description: 'Sıralama kolonu' },
            { name: 'order', type: 'string', required: false, description: 'Sıralama yönü (asc/desc)' },
          ],
          response: {
            success: {
              code: 200,
              body: `{
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "created_at": "2024-01-15T14:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1250,
    "pages": 25
  }
}`,
            },
          },
        },
      ],
    },
    {
      id: 'storage',
      title: 'Storage',
      description: 'Dosya yükleme ve depolama işlemleri',
      endpoints: [
        {
          method: 'POST',
          path: '/storage/upload',
          title: 'Dosya Yükle',
          description: 'Yeni dosya yükler',
          parameters: [
            { name: 'file', type: 'file', required: true, description: 'Yüklenecek dosya' },
            { name: 'bucket', type: 'string', required: false, description: 'Bucket adı (varsayılan: default)' },
            { name: 'path', type: 'string', required: false, description: 'Dosya yolu' },
          ],
          response: {
            success: {
              code: 200,
              body: `{
  "file": {
    "id": "uuid",
    "name": "document.pdf",
    "size": 1024000,
    "url": "https://storage.example.com/files/document.pdf",
    "created_at": "2024-01-15T14:30:00Z"
  }
}`,
            },
            error: {
              code: 400,
              body: `{
  "error": "File too large",
  "max_size": "10MB"
}`,
            },
          },
        },
      ],
    },
  ];

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="h-full flex">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-gray-900">API Dokümantasyonu</h1>
          <p className="text-sm text-gray-600 mt-1">GraphCore API endpoint'leri</p>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <nav className="p-4">
            {apiSections.map((section) => (
              <div key={section.id} className="mb-4">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="flex items-center justify-between w-full text-left p-3 rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <h3 className="font-medium text-gray-900">{section.title}</h3>
                    <p className="text-sm text-gray-500">{section.description}</p>
                  </div>
                  {expandedSections.includes(section.id) ? (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  )}
                </button>
                
                {expandedSections.includes(section.id) && (
                  <div className="ml-4 mt-2 space-y-2">
                    {section.endpoints.map((endpoint, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedEndpoint(`${section.id}-${index}`)}
                        className={`flex items-center gap-2 w-full text-left p-2 rounded text-sm ${
                          selectedEndpoint === `${section.id}-${index}`
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          endpoint.method === 'GET' ? 'bg-green-100 text-green-700' :
                          endpoint.method === 'POST' ? 'bg-blue-100 text-blue-700' :
                          endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {endpoint.method}
                        </span>
                        <span className="truncate">{endpoint.path}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-50 overflow-y-auto">
        {selectedEndpoint && (() => {
          const [sectionId, endpointIndex] = selectedEndpoint.split('-');
          const section = apiSections.find(s => s.id === sectionId);
          const endpoint = section?.endpoints[parseInt(endpointIndex)];
          
          if (!endpoint) return null;

          return (
            <div className="p-6">
              <div className="bg-white rounded-lg border">
                <div className="p-6 border-b">
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`px-3 py-1 rounded text-sm font-medium ${
                      endpoint.method === 'GET' ? 'bg-green-100 text-green-700' :
                      endpoint.method === 'POST' ? 'bg-blue-100 text-blue-700' :
                      endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {endpoint.method}
                    </span>
                    <code className="text-lg font-mono text-gray-900">{endpoint.path}</code>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">{endpoint.title}</h2>
                  <p className="text-gray-600">{endpoint.description}</p>
                </div>

                <div className="p-6">
                  {/* Parameters */}
                  {endpoint.parameters.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Parametreler</h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parametre</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tip</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Zorunlu</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Açıklama</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {endpoint.parameters.map((param, index) => (
                              <tr key={index}>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{param.name}</td>
                                <td className="px-4 py-3 text-sm text-gray-500">{param.type}</td>
                                <td className="px-4 py-3 text-sm text-gray-500">
                                  {param.required ? 'Evet' : 'Hayır'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500">{param.description}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Response Examples */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Başarılı Yanıt</h3>
                      <div className="bg-gray-900 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-green-400 text-sm">Status: {endpoint.response.success.code}</span>
                          <button
                            onClick={() => copyToClipboard(endpoint.response.success.body)}
                            className="text-gray-400 hover:text-white"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                        <pre className="text-gray-300 text-sm overflow-x-auto">
                          <code>{endpoint.response.success.body}</code>
                        </pre>
                      </div>
                    </div>

                                         {'error' in endpoint.response && endpoint.response.error && (
                       <div>
                         <h3 className="text-lg font-semibold text-gray-900 mb-4">Hata Yanıtı</h3>
                         <div className="bg-gray-900 rounded-lg p-4">
                           <div className="flex items-center justify-between mb-2">
                             <span className="text-red-400 text-sm">Status: {endpoint.response.error!.code}</span>
                             <button
                               onClick={() => copyToClipboard(endpoint.response.error!.body)}
                               className="text-gray-400 hover:text-white"
                             >
                               <Copy className="h-4 w-4" />
                             </button>
                           </div>
                           <pre className="text-gray-300 text-sm overflow-x-auto">
                             <code>{endpoint.response.error.body}</code>
                           </pre>
                         </div>
                       </div>
                     )}
                  </div>

                  {/* Try it out */}
                  <div className="mt-8 pt-6 border-t">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Et</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <span className={`px-3 py-1 rounded text-sm font-medium ${
                          endpoint.method === 'GET' ? 'bg-green-100 text-green-700' :
                          endpoint.method === 'POST' ? 'bg-blue-100 text-blue-700' :
                          endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {endpoint.method}
                        </span>
                        <code className="text-sm font-mono text-gray-900">{endpoint.path}</code>
                      </div>
                      <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                        <Play className="h-4 w-4" />
                        Test Et
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default ApiDocsPage; 