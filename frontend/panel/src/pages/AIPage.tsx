import React, { useState, useEffect, useRef } from 'react';
import { 
  SparklesIcon,
  DocumentTextIcon,
  CodeBracketIcon,
  ClipboardDocumentIcon,
  ArrowPathIcon,
  PlayIcon,
  StopIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  TrashIcon,
  StarIcon,
  BookmarkIcon,
  ShareIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline';
import { api } from '../services/api';

interface AISuggestion {
  id: string;
  type: 'sql' | 'snippet' | 'diff' | 'completion';
  title: string;
  description: string;
  content: string;
  language: string;
  tags: string[];
  usage: number;
  rating: number;
  createdAt: string;
  isFavorite: boolean;
}

interface AIConversation {
  id: string;
  title: string;
  messages: {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    sql?: string;
    result?: any;
  }[];
  createdAt: string;
  updatedAt: string;
}

const AIPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'snippets' | 'suggestions' | 'history'>('chat');
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [currentConversation, setCurrentConversation] = useState<AIConversation | null>(null);
  const [userInput, setUserInput] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<AISuggestion | null>(null);
  const [showSnippetModal, setShowSnippetModal] = useState(false);
  const [snippetForm, setSnippetForm] = useState({
    title: '',
    description: '',
    content: '',
    language: 'sql',
    tags: [] as string[]
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [currentConversation]);

  const loadData = async () => {
    setLoading(true);
    try {
      // AI API'leri henüz mevcut değil, mock data kullanıyoruz
      const mockConversations: AIConversation[] = [];
      const mockSuggestions: AISuggestion[] = [];
      
      setConversations(mockConversations);
      setSuggestions(mockSuggestions);
      
      if (mockConversations.length > 0) {
        setCurrentConversation(mockConversations[0]);
      }
    } catch (error) {
      console.error('AI verileri yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!userInput.trim() || !currentConversation) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: userInput,
      timestamp: new Date().toISOString()
    };

    // Kullanıcı mesajını ekle
    const updatedConversation = {
      ...currentConversation,
      messages: [...currentConversation.messages, userMessage]
    };
    setCurrentConversation(updatedConversation);
    setUserInput('');
    setIsGenerating(true);

    try {
      // AI chat API'si henüz mevcut değil
      console.log('AI chat:', userInput, currentConversation.id);

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: 'Bu özellik henüz geliştirilme aşamasındadır.',
        timestamp: new Date().toISOString(),
        sql: undefined,
        result: undefined
      };

      const finalConversation = {
        ...updatedConversation,
        messages: [...updatedConversation.messages, assistantMessage]
      };
      setCurrentConversation(finalConversation);

      // Konuşmayı güncelle - API henüz mevcut değil
      console.log('Konuşma güncelleniyor:', finalConversation);
    } catch (error) {
      console.error('AI yanıtı alınamadı:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const createNewConversation = async () => {
    try {
      const newConversation: AIConversation = {
        id: Date.now().toString(),
        title: 'Yeni Konuşma',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // API henüz mevcut değil
      console.log('Yeni konuşma oluşturuluyor:', newConversation);
      setConversations(prev => [newConversation, ...prev]);
      setCurrentConversation(newConversation);
    } catch (error) {
      console.error('Yeni konuşma oluşturulamadı:', error);
    }
  };

  const deleteConversation = async (id: string) => {
    if (!confirm('Bu konuşmayı silmek istediğinizden emin misiniz?')) return;

    try {
      // API henüz mevcut değil
      console.log('Konuşma siliniyor:', id);
      setConversations(prev => prev.filter(c => c.id !== id));
      
      if (currentConversation?.id === id) {
        setCurrentConversation(conversations[1] || null);
      }
    } catch (error) {
      console.error('Konuşma silinemedi:', error);
    }
  };

  const saveSnippet = async () => {
    try {
      // API henüz mevcut değil
      console.log('Snippet kaydediliyor:', snippetForm);
      setShowSnippetModal(false);
      setSnippetForm({
        title: '',
        description: '',
        content: '',
        language: 'sql',
        tags: []
      });
      await loadData();
    } catch (error) {
      console.error('Snippet kaydedilemedi:', error);
    }
  };

  const toggleFavorite = async (suggestionId: string) => {
    try {
      // API henüz mevcut değil
      console.log('Favori durumu güncelleniyor:', suggestionId);
      setSuggestions(prev => prev.map(s => 
        s.id === suggestionId ? { ...s, isFavorite: !s.isFavorite } : s
      ));
    } catch (error) {
      console.error('Favori durumu güncellenemedi:', error);
    }
  };

  const executeSQL = async (sql: string) => {
    try {
      // API henüz mevcut değil
      console.log('SQL çalıştırılıyor:', sql);
      return { success: true, data: [] };
    } catch (error) {
      console.error('SQL çalıştırılamadı:', error);
      return null;
    }
  };

  const getMessageIcon = (role: 'user' | 'assistant') => {
    return role === 'user' ? (
      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
        <span className="text-white text-sm font-medium">U</span>
      </div>
    ) : (
      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
        <SparklesIcon className="w-5 h-5 text-white" />
      </div>
    );
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Asistan</h1>
          <p className="text-gray-600">Doğal dilden SQL, kod önerileri ve akıllı yardım</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'chat', label: 'AI Sohbet', icon: ChatBubbleLeftRightIcon },
                { id: 'snippets', label: 'Kod Parçaları', icon: CodeBracketIcon },
                { id: 'suggestions', label: 'Öneriler', icon: LightBulbIcon },
                { id: 'history', label: 'Geçmiş', icon: DocumentTextIcon }
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
        {activeTab === 'chat' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Conversations Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Konuşmalar</h3>
                    <button
                      onClick={createNewConversation}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <PlusIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        currentConversation?.id === conversation.id
                          ? 'bg-blue-50 border border-blue-200'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setCurrentConversation(conversation)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {conversation.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {conversation.messages.length} mesaj
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteConversation(conversation.id);
                          }}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Chat Area */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow h-[600px] flex flex-col">
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {currentConversation?.title || 'Yeni Konuşma'}
                  </h3>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {currentConversation?.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex space-x-3 ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {message.role === 'assistant' && getMessageIcon(message.role)}
                      <div
                        className={`max-w-3xl rounded-lg p-3 ${
                          message.role === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        {message.sql && (
                          <div className="mt-3 p-2 bg-gray-800 text-green-400 rounded text-xs font-mono">
                            {message.sql}
                          </div>
                        )}
                        {message.result && (
                          <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                            <pre className="whitespace-pre-wrap">{JSON.stringify(message.result, null, 2)}</pre>
                          </div>
                        )}
                        <p className="text-xs mt-2 opacity-70">
                          {formatTimestamp(message.timestamp)}
                        </p>
                      </div>
                      {message.role === 'user' && getMessageIcon(message.role)}
                    </div>
                  ))}
                  {isGenerating && (
                    <div className="flex space-x-3 justify-start">
                      {getMessageIcon('assistant')}
                      <div className="bg-gray-100 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Doğal dilde sorgunuzu yazın..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isGenerating}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!userInput.trim() || isGenerating}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      <SparklesIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'snippets' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Kod Parçaları</h3>
              <button
                onClick={() => setShowSnippetModal(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Yeni Snippet
              </button>
            </div>

            {/* Snippets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suggestions.filter(s => s.type === 'snippet').map((snippet) => (
                <div key={snippet.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">{snippet.title}</h4>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleFavorite(snippet.id)}
                          className={`p-1 rounded ${
                            snippet.isFavorite ? 'text-yellow-500' : 'text-gray-400'
                          } hover:text-yellow-500 transition-colors`}
                        >
                          <StarIcon className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                          <ShareIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{snippet.description}</p>
                    <div className="bg-gray-50 rounded p-3 mb-3">
                      <pre className="text-xs text-gray-800 overflow-x-auto">{snippet.content}</pre>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{snippet.language.toUpperCase()}</span>
                      <span>{snippet.usage} kullanım</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'suggestions' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">AI Önerileri</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suggestions.filter(s => s.type !== 'snippet').map((suggestion) => (
                <div key={suggestion.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">{suggestion.title}</h4>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleFavorite(suggestion.id)}
                          className={`p-1 rounded ${
                            suggestion.isFavorite ? 'text-yellow-500' : 'text-gray-400'
                          } hover:text-yellow-500 transition-colors`}
                        >
                          <StarIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
                    <div className="bg-gray-50 rounded p-3 mb-3">
                      <pre className="text-xs text-gray-800 overflow-x-auto">{suggestion.content}</pre>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-1">
                        {suggestion.tags.map((tag) => (
                          <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <span>★ {suggestion.rating}</span>
                        <span>•</span>
                        <span>{suggestion.usage} kullanım</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">AI Geçmişi</h3>
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <div className="space-y-4">
                  {conversations.map((conversation) => (
                    <div key={conversation.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{conversation.title}</h4>
                          <p className="text-sm text-gray-500">
                            {conversation.messages.length} mesaj • 
                            {new Date(conversation.updatedAt).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                            <ArrowDownTrayIcon className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                            <ShareIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Snippet Modal */}
        {showSnippetModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Yeni Kod Parçası</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Başlık
                    </label>
                    <input
                      type="text"
                      value={snippetForm.title}
                      onChange={(e) => setSnippetForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Snippet başlığı"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Açıklama
                    </label>
                    <textarea
                      value={snippetForm.description}
                      onChange={(e) => setSnippetForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Snippet açıklaması"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kod
                    </label>
                    <textarea
                      value={snippetForm.content}
                      onChange={(e) => setSnippetForm(prev => ({ ...prev, content: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                      rows={8}
                      placeholder="Kod parçasını buraya yazın..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dil
                      </label>
                      <select
                        value={snippetForm.language}
                        onChange={(e) => setSnippetForm(prev => ({ ...prev, language: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="sql">SQL</option>
                        <option value="javascript">JavaScript</option>
                        <option value="typescript">TypeScript</option>
                        <option value="python">Python</option>
                        <option value="go">Go</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Etiketler
                      </label>
                      <input
                        type="text"
                        value={snippetForm.tags.join(', ')}
                        onChange={(e) => setSnippetForm(prev => ({ 
                          ...prev, 
                          tags: e.target.value.split(',').map(t => t.trim()).filter(t => t)
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="etiket1, etiket2, etiket3"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowSnippetModal(false)}
                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    onClick={saveSnippet}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Kaydet
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

export default AIPage; 