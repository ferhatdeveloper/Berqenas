import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Save,
  History,
  Download,
  Upload,
  Settings,
  Sparkles,
  Copy,
  RotateCcw,
  Database,
  Table,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Code,
  Lightbulb,
  Zap,
  Loader2,
  ChevronDown,
  ChevronUp,
  X,
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff,
} from 'lucide-react';
import { apiService } from '../services/api';

// SQL Syntax Highlighting Component
const SqlHighlighter: React.FC<{ code: string; language?: string }> = ({ code, language = 'sql' }) => {
  const keywords = [
    'SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER',
    'TABLE', 'INDEX', 'VIEW', 'PROCEDURE', 'FUNCTION', 'TRIGGER', 'DATABASE', 'SCHEMA',
    'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'ON', 'GROUP', 'BY', 'ORDER', 'HAVING',
    'UNION', 'ALL', 'DISTINCT', 'AS', 'AND', 'OR', 'NOT', 'IN', 'EXISTS', 'BETWEEN',
    'LIKE', 'IS', 'NULL', 'TRUE', 'FALSE', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
    'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'TOP', 'LIMIT', 'OFFSET', 'ASC', 'DESC'
  ];

  const types = [
    'INT', 'INTEGER', 'BIGINT', 'SMALLINT', 'TINYINT', 'DECIMAL', 'NUMERIC',
    'FLOAT', 'DOUBLE', 'REAL', 'VARCHAR', 'CHAR', 'TEXT', 'LONGTEXT',
    'DATE', 'DATETIME', 'TIMESTAMP', 'TIME', 'YEAR', 'BOOLEAN', 'BOOL',
    'BLOB', 'LONGBLOB', 'JSON', 'UUID'
  ];

  const highlightCode = (code: string) => {
    let highlighted = code;
    
    // Highlight keywords
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      highlighted = highlighted.replace(regex, `<span class="text-blue-600 font-semibold">${keyword}</span>`);
    });
    
    // Highlight types
    types.forEach(type => {
      const regex = new RegExp(`\\b${type}\\b`, 'gi');
      highlighted = highlighted.replace(regex, `<span class="text-purple-600 font-semibold">${type}</span>`);
    });
    
    // Highlight strings
    highlighted = highlighted.replace(/'([^']*)'/g, `<span class="text-green-600">'$1'</span>`);
    highlighted = highlighted.replace(/"([^"]*)"/g, `<span class="text-green-600">"$1"</span>`);
    
    // Highlight numbers
    highlighted = highlighted.replace(/\b(\d+)\b/g, `<span class="text-orange-600">$1</span>`);
    
    // Highlight comments
    highlighted = highlighted.replace(/--.*$/gm, `<span class="text-gray-500 italic">$&</span>`);
    highlighted = highlighted.replace(/\/\*[\s\S]*?\*\//g, `<span class="text-gray-500 italic">$&</span>`);
    
    return highlighted;
  };

  return (
    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
      <code dangerouslySetInnerHTML={{ __html: highlightCode(code) }} />
    </pre>
  );
};

// Query History Item Component
const QueryHistoryItem: React.FC<{
  query: string;
  timestamp: string;
  duration: number;
  success: boolean;
  onSelect: (query: string) => void;
  onDelete: () => void;
}> = ({ query, timestamp, duration, success, onSelect, onDelete }) => (
  <div className="p-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer">
    <div className="flex items-center justify-between">
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          {success ? (
            <CheckCircle size={14} className="text-green-500" />
          ) : (
            <AlertCircle size={14} className="text-red-500" />
          )}
          <span className="text-sm font-medium text-gray-900 truncate">
            {query.substring(0, 100)}{query.length > 100 ? '...' : ''}
          </span>
        </div>
        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
          <span>{timestamp}</span>
          <span>{duration}ms</span>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(query);
          }}
          className="p-1 text-gray-400 hover:text-gray-600"
        >
          <Edit size={14} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 text-gray-400 hover:text-red-600"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  </div>
);

// AI Suggestion Component
const AiSuggestion: React.FC<{
  suggestion: string;
  onApply: (suggestion: string) => void;
  onDismiss: () => void;
}> = ({ suggestion, onApply, onDismiss }) => (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
    <div className="flex items-start space-x-3">
      <Sparkles className="text-blue-600 mt-1" size={16} />
      <div className="flex-1">
        <h4 className="text-sm font-medium text-blue-900 mb-2">AI Önerisi</h4>
        <div className="bg-white border border-blue-200 rounded p-3 mb-3">
          <code className="text-sm text-gray-800">{suggestion}</code>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onApply(suggestion)}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            Uygula
          </button>
          <button
            onClick={onDismiss}
            className="px-3 py-1 text-blue-600 text-sm hover:text-blue-800"
          >
            Reddet
          </button>
        </div>
      </div>
    </div>
  </div>
);

// Result Table Component
const ResultTable: React.FC<{ data: any[]; columns: string[] }> = ({ data, columns }) => (
  <div className="overflow-x-auto">
    <table className="w-full border border-gray-200">
      <thead className="bg-gray-50">
        <tr>
          {columns.map((column, index) => (
            <th key={index} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {data.map((row, rowIndex) => (
          <tr key={rowIndex} className="hover:bg-gray-50">
            {columns.map((column, colIndex) => (
              <td key={colIndex} className="px-4 py-2 text-sm text-gray-900 border-b border-gray-100">
                {row[column] !== null && row[column] !== undefined ? String(row[column]) : 'NULL'}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const SqlEditorPage: React.FC = () => {
  // State management
  const [sqlQuery, setSqlQuery] = useState('');
  const [queryHistory, setQueryHistory] = useState<Array<{
    id: string;
    query: string;
    timestamp: string;
    duration: number;
    success: boolean;
    result?: any;
    error?: string;
  }>>([]);
  const [currentResult, setCurrentResult] = useState<any>(null);
  const [currentError, setCurrentError] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAiSuggestion, setShowAiSuggestion] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [autoComplete, setAutoComplete] = useState<string[]>([]);
  const [showAutoComplete, setShowAutoComplete] = useState(false);
  const [autoCompletePosition, setAutoCompletePosition] = useState({ x: 0, y: 0 });
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState<number | null>(null);
  const [savedQueries, setSavedQueries] = useState<Array<{
    id: string;
    name: string;
    query: string;
    description?: string;
    createdAt: string;
  }>>([]);
  const [showSaveQuery, setShowSaveQuery] = useState(false);
  const [saveQueryName, setSaveQueryName] = useState('');
  const [saveQueryDescription, setSaveQueryDescription] = useState('');
  const [showSavedQueries, setShowSavedQueries] = useState(false);
  const [showToast, setShowToast] = useState<{type: 'success' | 'error', message: string} | null>(null);

  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autoCompleteRef = useRef<HTMLDivElement>(null);

  // SQL Keywords for autocomplete
  const sqlKeywords = [
    'SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER',
    'TABLE', 'INDEX', 'VIEW', 'PROCEDURE', 'FUNCTION', 'TRIGGER', 'DATABASE', 'SCHEMA',
    'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'ON', 'GROUP', 'BY', 'ORDER', 'HAVING',
    'UNION', 'ALL', 'DISTINCT', 'AS', 'AND', 'OR', 'NOT', 'IN', 'EXISTS', 'BETWEEN',
    'LIKE', 'IS', 'NULL', 'TRUE', 'FALSE', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
    'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'TOP', 'LIMIT', 'OFFSET', 'ASC', 'DESC',
    'INT', 'INTEGER', 'BIGINT', 'SMALLINT', 'TINYINT', 'DECIMAL', 'NUMERIC',
    'FLOAT', 'DOUBLE', 'REAL', 'VARCHAR', 'CHAR', 'TEXT', 'LONGTEXT',
    'DATE', 'DATETIME', 'TIMESTAMP', 'TIME', 'YEAR', 'BOOLEAN', 'BOOL',
    'BLOB', 'LONGBLOB', 'JSON', 'UUID'
  ];

  // Toast notification
  const showNotification = useCallback((type: 'success' | 'error', message: string) => {
    setShowToast({ type, message });
    setTimeout(() => setShowToast(null), 3000);
  }, []);

  // Load saved queries on mount
  useEffect(() => {
    loadSavedQueries();
  }, []);

  // Load query history on mount
  useEffect(() => {
    loadQueryHistory();
  }, []);

  // Load saved queries from localStorage
  const loadSavedQueries = () => {
    try {
      const saved = localStorage.getItem('savedQueries');
      if (saved) {
        setSavedQueries(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading saved queries:', error);
    }
  };

  // Load query history from localStorage
  const loadQueryHistory = () => {
    try {
      const history = localStorage.getItem('queryHistory');
      if (history) {
        setQueryHistory(JSON.parse(history));
      }
    } catch (error) {
      console.error('Error loading query history:', error);
    }
  };

  // Save query history to localStorage
  const saveQueryHistory = (history: typeof queryHistory) => {
    try {
      localStorage.setItem('queryHistory', JSON.stringify(history.slice(-100))); // Keep last 100 queries
    } catch (error) {
      console.error('Error saving query history:', error);
    }
  };

  // Execute SQL query
  const executeQuery = async () => {
    if (!sqlQuery.trim()) {
      showNotification('error', 'Lütfen bir SQL sorgusu girin');
      return;
    }

    setIsExecuting(true);
    setCurrentResult(null);
    setCurrentError(null);

    const startTime = Date.now();

    try {
      // Simulate API call - replace with actual API service
      const response = await fetch('/api/sql/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: sqlQuery }),
      });

      const result = await response.json();
      const duration = Date.now() - startTime;

      if (result.success) {
        setCurrentResult(result.data);
        setCurrentError(null);
        
        // Add to history
        const historyItem = {
          id: Date.now().toString(),
          query: sqlQuery,
          timestamp: new Date().toLocaleString('tr-TR'),
          duration,
          success: true,
          result: result.data,
        };
        
        const newHistory = [historyItem, ...queryHistory];
        setQueryHistory(newHistory);
        saveQueryHistory(newHistory);
        
        showNotification('success', `Sorgu başarıyla çalıştırıldı (${duration}ms)`);
      } else {
        setCurrentError(result.error || 'Sorgu çalıştırılamadı');
        setCurrentResult(null);
        
        // Add to history with error
        const historyItem = {
          id: Date.now().toString(),
          query: sqlQuery,
          timestamp: new Date().toLocaleString('tr-TR'),
          duration,
          success: false,
          error: result.error,
        };
        
        const newHistory = [historyItem, ...queryHistory];
        setQueryHistory(newHistory);
        saveQueryHistory(newHistory);
        
        showNotification('error', result.error || 'Sorgu çalıştırılamadı');
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
      
      setCurrentError(errorMessage);
      setCurrentResult(null);
      
      // Add to history with error
      const historyItem = {
        id: Date.now().toString(),
        query: sqlQuery,
        timestamp: new Date().toLocaleString('tr-TR'),
        duration,
        success: false,
        error: errorMessage,
      };
      
      const newHistory = [historyItem, ...queryHistory];
      setQueryHistory(newHistory);
      saveQueryHistory(newHistory);
      
      showNotification('error', 'Sorgu çalıştırılırken hata oluştu');
    } finally {
      setIsExecuting(false);
    }
  };

  // AI-powered query suggestion
  const getAiSuggestion = async () => {
    if (!sqlQuery.trim()) {
      showNotification('error', 'Lütfen önce bir sorgu girin');
      return;
    }

    try {
      // Simulate AI API call
      const response = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: sqlQuery }),
      });

      const result = await response.json();
      
      if (result.success && result.data) {
        setAiSuggestion(result.data.suggestion);
        setShowAiSuggestion(true);
      } else {
        showNotification('error', 'AI önerisi alınamadı');
      }
    } catch (error) {
      showNotification('error', 'AI önerisi alınırken hata oluştu');
    }
  };

  // Apply AI suggestion
  const applyAiSuggestion = () => {
    setSqlQuery(aiSuggestion);
    setShowAiSuggestion(false);
    showNotification('success', 'AI önerisi uygulandı');
  };

  // Save query
  const saveQuery = () => {
    if (!saveQueryName.trim()) {
      showNotification('error', 'Lütfen sorgu için bir isim girin');
      return;
    }

    const newQuery = {
      id: Date.now().toString(),
      name: saveQueryName,
      query: sqlQuery,
      description: saveQueryDescription,
      createdAt: new Date().toISOString(),
    };

    const newSavedQueries = [newQuery, ...savedQueries];
    setSavedQueries(newSavedQueries);
    
    try {
      localStorage.setItem('savedQueries', JSON.stringify(newSavedQueries));
    } catch (error) {
      console.error('Error saving query:', error);
    }

    setShowSaveQuery(false);
    setSaveQueryName('');
    setSaveQueryDescription('');
    showNotification('success', 'Sorgu kaydedildi');
  };

  // Load saved query
  const loadSavedQuery = (query: string) => {
    setSqlQuery(query);
    setShowSavedQueries(false);
    showNotification('success', 'Sorgu yüklendi');
  };

  // Delete saved query
  const deleteSavedQuery = (id: string) => {
    const newSavedQueries = savedQueries.filter(q => q.id !== id);
    setSavedQueries(newSavedQueries);
    
    try {
      localStorage.setItem('savedQueries', JSON.stringify(newSavedQueries));
    } catch (error) {
      console.error('Error deleting saved query:', error);
    }
    
    showNotification('success', 'Sorgu silindi');
  };

  // Delete query history item
  const deleteHistoryItem = (id: string) => {
    const newHistory = queryHistory.filter(item => item.id !== id);
    setQueryHistory(newHistory);
    saveQueryHistory(newHistory);
    showNotification('success', 'Geçmiş öğesi silindi');
  };

  // Auto-complete functionality
  const handleSqlChange = (value: string) => {
    setSqlQuery(value);
    
    // Simple autocomplete logic
    const words = value.split(' ');
    const currentWord = words[words.length - 1] || '';
    
    if (currentWord.length > 0) {
      const suggestions = sqlKeywords.filter(keyword => 
        keyword.toLowerCase().startsWith(currentWord.toLowerCase())
      );
      
      if (suggestions.length > 0) {
        setAutoComplete(suggestions);
        setShowAutoComplete(true);
      } else {
        setShowAutoComplete(false);
      }
    } else {
      setShowAutoComplete(false);
    }
  };

  // Apply autocomplete suggestion
  const applyAutoComplete = (suggestion: string) => {
    const words = sqlQuery.split(' ');
    words[words.length - 1] = suggestion;
    setSqlQuery(words.join(' '));
    setShowAutoComplete(false);
    
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'Enter':
            e.preventDefault();
            executeQuery();
            break;
          case 's':
            e.preventDefault();
            setShowSaveQuery(true);
            break;
          case 'h':
            e.preventDefault();
            setShowHistory(!showHistory);
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [sqlQuery, showHistory]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Toast Notification */}
      {showToast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          showToast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            {showToast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            <span>{showToast.message}</span>
            <button onClick={() => setShowToast(null)} className="ml-2">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Left Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">SQL Editörü</h2>
          
          <div className="space-y-2">
            <button
              onClick={executeQuery}
              disabled={isExecuting || !sqlQuery.trim()}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {isExecuting ? <Loader2 className="animate-spin" size={16} /> : <Play size={16} />}
              <span>Çalıştır (Ctrl+Enter)</span>
            </button>
            
            <button
              onClick={() => setShowSaveQuery(true)}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center justify-center space-x-2"
            >
              <Save size={16} />
              <span>Kaydet (Ctrl+S)</span>
            </button>
            
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center justify-center space-x-2"
            >
              <History size={16} />
              <span>Geçmiş (Ctrl+H)</span>
            </button>
            
            <button
              onClick={getAiSuggestion}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center space-x-2"
            >
              <Sparkles size={16} />
              <span>AI Önerisi</span>
            </button>
          </div>
        </div>

        {/* History Panel */}
        {showHistory && (
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Sorgu Geçmişi</h3>
              <div className="space-y-2">
                {queryHistory.map((item, index) => (
                  <QueryHistoryItem
                    key={item.id}
                    query={item.query}
                    timestamp={item.timestamp}
                    duration={item.duration}
                    success={item.success}
                    onSelect={(query) => setSqlQuery(query)}
                    onDelete={() => deleteHistoryItem(item.id)}
                  />
                ))}
                {queryHistory.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">Henüz sorgu geçmişi yok</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Saved Queries Panel */}
        {showSavedQueries && (
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Kaydedilen Sorgular</h3>
              <div className="space-y-2">
                {savedQueries.map((query) => (
                  <div key={query.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">{query.name}</h4>
                        {query.description && (
                          <p className="text-xs text-gray-500 mt-1">{query.description}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">{query.createdAt}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => loadSavedQuery(query.query)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => deleteSavedQuery(query.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {savedQueries.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">Henüz kaydedilen sorgu yok</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* SQL Editor */}
        <div className="flex-1 p-4">
          <div className="bg-white rounded-lg border border-gray-200 h-full flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">SQL Sorgusu</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSqlQuery('')}
                    className="p-2 text-gray-400 hover:text-gray-600"
                    title="Temizle"
                  >
                    <RotateCcw size={16} />
                  </button>
                  <button
                    onClick={() => navigator.clipboard.writeText(sqlQuery)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                    title="Kopyala"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex-1 p-4 relative">
              <textarea
                ref={textareaRef}
                value={sqlQuery}
                onChange={(e) => handleSqlChange(e.target.value)}
                placeholder="SQL sorgunuzu buraya yazın..."
                className="w-full h-full resize-none border-0 focus:ring-0 focus:outline-none font-mono text-sm"
                style={{ fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace' }}
              />
              
              {/* Auto-complete dropdown */}
              {showAutoComplete && autoComplete.length > 0 && (
                <div
                  ref={autoCompleteRef}
                  className="absolute bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10"
                  style={{
                    top: '2rem',
                    left: '1rem',
                    minWidth: '200px'
                  }}
                >
                  {autoComplete.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => applyAutoComplete(suggestion)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-100 text-sm"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Suggestion */}
        {showAiSuggestion && (
          <div className="px-4 pb-4">
            <AiSuggestion
              suggestion={aiSuggestion}
              onApply={applyAiSuggestion}
              onDismiss={() => setShowAiSuggestion(false)}
            />
          </div>
        )}

        {/* Results */}
        {currentResult && (
          <div className="p-4 border-t border-gray-200">
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Sonuçlar</h3>
              </div>
              <div className="p-4">
                {Array.isArray(currentResult) && currentResult.length > 0 ? (
                  <ResultTable
                    data={currentResult}
                    columns={Object.keys(currentResult[0])}
                  />
                ) : (
                  <p className="text-gray-500">Sonuç bulunamadı</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {currentError && (
          <div className="p-4 border-t border-gray-200">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="text-red-500" size={16} />
                <h3 className="text-sm font-medium text-red-900">Hata</h3>
              </div>
              <p className="mt-2 text-sm text-red-700">{currentError}</p>
            </div>
          </div>
        )}
      </div>

      {/* Save Query Modal */}
      {showSaveQuery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Sorguyu Kaydet</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">İsim</label>
                <input
                  type="text"
                  value={saveQueryName}
                  onChange={(e) => setSaveQueryName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Sorgu ismi"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                <textarea
                  value={saveQueryDescription}
                  onChange={(e) => setSaveQueryDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Sorgu açıklaması (opsiyonel)"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowSaveQuery(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                İptal
              </button>
              <button
                onClick={saveQuery}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SqlEditorPage; 