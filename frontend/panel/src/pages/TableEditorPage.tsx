import React, { useState, useEffect, useCallback } from 'react';
import {
  Database,
  Table,
  Plus,
  Search,
  Filter,
  Eye,
  EyeOff,
  Star,
  StarOff,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  Trash2,
  Copy,
  ArrowUpDown,
  RefreshCw,
  Info,
  Lock,
  FileText,
  Download,
  Upload,
  Settings,
  X,
  Edit,
  Shield,
  Activity,
  Check,
  AlertCircle,
  Share2,
  Loader2,
} from 'lucide-react';
import { apiService, TableInfo, ColumnInfo, TableData } from '../services/api';

// Toast notification component
const Toast: React.FC<{ type: 'success' | 'error'; message: string; onClose: () => void }> = ({ type, message, onClose }) => (
  <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
    type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
  }`}>
    <div className="flex items-center space-x-2">
      {type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
      <span>{message}</span>
      <button onClick={onClose} className="ml-2">
        <X size={16} />
      </button>
    </div>
  </div>
);

// Loading spinner component
const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
    <span className="ml-2 text-gray-600">Yükleniyor...</span>
  </div>
);

const TableEditorPage: React.FC = () => {
  // State management
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [tableData, setTableData] = useState<TableData | null>(null);
  const [columns, setColumns] = useState<ColumnInfo[]>([]);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [showRowDetail, setShowRowDetail] = useState<number | null>(null);
  const [showRowDetailModal, setShowRowDetailModal] = useState<number | null>(null);
  const [showInsertModal, setShowInsertModal] = useState(false);
  const [showCreateTable, setShowCreateTable] = useState(false);
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editRowData, setEditRowData] = useState<any>(null);
  const [favoriteTables, setFavoriteTables] = useState<string[]>([]);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [contextMenuRow, setContextMenuRow] = useState<any>(null);
  const [showToast, setShowToast] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [showAI, setShowAI] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [showShare, setShowShare] = useState(false);
  
  // Loading states
  const [loadingTables, setLoadingTables] = useState(true);
  const [loadingTableData, setLoadingTableData] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  
  // Pagination and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [sortBy, setSortBy] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState('');

  // Toast notification
  const showNotification = useCallback((type: 'success' | 'error', message: string) => {
    setShowToast({ type, message });
    setTimeout(() => setShowToast(null), 3000);
  }, []);

  // Load tables on component mount
  useEffect(() => {
    loadTables();
  }, []);

  // Load table data when selected table changes
  useEffect(() => {
    if (selectedTable) {
      loadTableData();
    }
  }, [selectedTable, currentPage, pageSize, filters, sortBy, sortOrder]);

  // API Functions
  const loadTables = async () => {
    setLoadingTables(true);
    try {
      const response = await apiService.getTables();
      if (response.success && response.data) {
        setTables(response.data);
        if (response.data.length > 0 && !selectedTable) {
          setSelectedTable(response.data[0].name);
        }
      } else {
        showNotification('error', response.error || 'Tablolar yüklenemedi');
      }
    } catch (error) {
      showNotification('error', 'Tablolar yüklenirken hata oluştu');
    } finally {
      setLoadingTables(false);
    }
  };

  const loadTableData = async () => {
    if (!selectedTable) return;
    
    setLoadingTableData(true);
    try {
      const response = await apiService.getTableData(
        selectedTable,
        currentPage,
        pageSize,
        filters,
        sortBy,
        sortOrder
      );
      
      if (response.success && response.data) {
        setTableData(response.data);
        setColumns(response.data.columns);
      } else {
        showNotification('error', response.error || 'Tablo verisi yüklenemedi');
      }
    } catch (error) {
      showNotification('error', 'Tablo verisi yüklenirken hata oluştu');
    } finally {
      setLoadingTableData(false);
    }
  };

  const handleTableSelect = async (tableName: string) => {
    setSelectedTable(tableName);
    setCurrentPage(1);
    setFilters({});
    setSortBy('');
    setSortOrder('asc');
    setSelectedRows([]);
  };

  // Row operations
  const handleInsertRow = async (rowData: Record<string, any>) => {
    if (!selectedTable) return;
    
    setLoadingAction(true);
    try {
      const response = await apiService.insertRow({
        tableName: selectedTable,
        data: rowData
      });
      
      if (response.success) {
        showNotification('success', 'Satır başarıyla eklendi');
        loadTableData(); // Reload data
        setShowInsertModal(false);
      } else {
        showNotification('error', response.error || 'Satır eklenemedi');
      }
    } catch (error) {
      showNotification('error', 'Satır eklenirken hata oluştu');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleUpdateRow = async (rowId: string, rowData: Record<string, any>) => {
    if (!selectedTable) return;
    
    setLoadingAction(true);
    try {
      const response = await apiService.updateRow({
        tableName: selectedTable,
        rowId,
        data: rowData
      });
      
      if (response.success) {
        showNotification('success', 'Satır başarıyla güncellendi');
        loadTableData(); // Reload data
        setEditingRow(null);
        setEditRowData(null);
      } else {
        showNotification('error', response.error || 'Satır güncellenemedi');
      }
    } catch (error) {
      showNotification('error', 'Satır güncellenirken hata oluştu');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDeleteRow = async (rowId: string) => {
    if (!selectedTable) return;
    
    if (!confirm('Bu satırı silmek istediğinizden emin misiniz?')) return;
    
    setLoadingAction(true);
    try {
      const response = await apiService.deleteRow({
        tableName: selectedTable,
        rowId
      });
      
      if (response.success) {
        showNotification('success', 'Satır başarıyla silindi');
        loadTableData(); // Reload data
      } else {
        showNotification('error', response.error || 'Satır silinemedi');
      }
    } catch (error) {
      showNotification('error', 'Satır silinirken hata oluştu');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedTable || selectedRows.length === 0) return;
    
    if (!confirm(`${selectedRows.length} satırı silmek istediğinizden emin misiniz?`)) return;
    
    setLoadingAction(true);
    try {
      const rowIds = selectedRows.map(i => tableData?.rows[i]?.id).filter(Boolean);
      const response = await apiService.deleteRows(selectedTable, rowIds);
      
      if (response.success) {
        showNotification('success', `${selectedRows.length} satır başarıyla silindi`);
        setSelectedRows([]);
        loadTableData(); // Reload data
      } else {
        showNotification('error', response.error || 'Satırlar silinemedi');
      }
    } catch (error) {
      showNotification('error', 'Satırlar silinirken hata oluştu');
    } finally {
      setLoadingAction(false);
    }
  };

  // Column operations
  const handleAddColumn = async (columnData: { name: string; type: string; nullable?: boolean; default_value?: string }) => {
    if (!selectedTable) return;
    
    setLoadingAction(true);
    try {
      const response = await apiService.addColumn({
        tableName: selectedTable,
        column: columnData
      });
      
      if (response.success) {
        showNotification('success', 'Kolon başarıyla eklendi');
        loadTableData(); // Reload data to get updated schema
      } else {
        showNotification('error', response.error || 'Kolon eklenemedi');
      }
    } catch (error) {
      showNotification('error', 'Kolon eklenirken hata oluştu');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDropColumn = async (columnName: string) => {
    if (!selectedTable) return;
    
    if (!confirm(`"${columnName}" kolonunu silmek istediğinizden emin misiniz?`)) return;
    
    setLoadingAction(true);
    try {
      const response = await apiService.dropColumn(selectedTable, columnName);
      
      if (response.success) {
        showNotification('success', 'Kolon başarıyla silindi');
        loadTableData(); // Reload data to get updated schema
      } else {
        showNotification('error', response.error || 'Kolon silinemedi');
      }
    } catch (error) {
      showNotification('error', 'Kolon silinirken hata oluştu');
    } finally {
      setLoadingAction(false);
    }
  };

  // Export/Import operations
  const handleExportData = async (format: 'csv' | 'json' | 'excel' = 'csv') => {
    if (!selectedTable) return;
    
    setLoadingAction(true);
    try {
      const response = await apiService.exportTableData(selectedTable, format, filters);
      
      if (response.success && response.data) {
        // Create download link
        const link = document.createElement('a');
        link.href = response.data.downloadUrl;
        link.download = `${selectedTable}_export.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showNotification('success', `Veri ${format.toUpperCase()} formatında dışa aktarıldı`);
      } else {
        showNotification('error', response.error || 'Veri dışa aktarılamadı');
      }
    } catch (error) {
      showNotification('error', 'Veri dışa aktarılırken hata oluştu');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleImportData = async (file: File) => {
    if (!selectedTable) return;
    
    setLoadingAction(true);
    try {
      const response = await apiService.importTableData(selectedTable, file);
      
      if (response.success && response.data) {
        showNotification('success', `${response.data.importedRows} satır başarıyla içe aktarıldı`);
        if (response.data.errors.length > 0) {
          showNotification('error', `${response.data.errors.length} hata oluştu`);
        }
        loadTableData(); // Reload data
      } else {
        showNotification('error', response.error || 'Veri içe aktarılamadı');
      }
    } catch (error) {
      showNotification('error', 'Veri içe aktarılırken hata oluştu');
    } finally {
      setLoadingAction(false);
    }
  };

  // Search functionality
  const handleSearch = async () => {
    if (!selectedTable || !searchQuery.trim()) {
      loadTableData();
      return;
    }
    
    setLoadingTableData(true);
    try {
      const response = await apiService.searchTable(selectedTable, searchQuery);
      
      if (response.success && response.data) {
        setTableData(response.data);
        setColumns(response.data.columns);
      } else {
        showNotification('error', response.error || 'Arama yapılamadı');
      }
    } catch (error) {
      showNotification('error', 'Arama yapılırken hata oluştu');
    } finally {
      setLoadingTableData(false);
    }
  };

  // UI Helper functions
  const toggleFavorite = (name: string) => {
    setFavoriteTables(fav => fav.includes(name) ? fav.filter(f => f !== name) : [...fav, name]);
    showNotification('success', `${name} ${favoriteTables.includes(name) ? 'favorilerden çıkarıldı' : 'favorilere eklendi'}`);
  };

  const toggleColumn = (name: string) => {
    setColumns(cols => cols.map(col => col.name === name ? { ...col, visible: !col.visible } : col));
    showNotification('success', `${name} kolonu ${columns.find(c => c.name === name)?.visible ? 'gizlendi' : 'gösterildi'}`);
  };

  const toggleSelectAll = () => {
    if (!tableData) return;
    
    if (selectedRows.length === tableData.rows.length) {
      setSelectedRows([]);
      showNotification('success', 'Tüm seçimler kaldırıldı');
    } else {
      setSelectedRows(tableData.rows.map((_, i) => i));
      showNotification('success', `${tableData.rows.length} satır seçildi`);
    }
  };

  const toggleRow = (i: number) => {
    setSelectedRows(rows => rows.includes(i) ? rows.filter(r => r !== i) : [...rows, i]);
  };

  const handleRowDetail = (i: number) => {
    setShowRowDetail(showRowDetail === i ? null : i);
  };

  const openRowDetailModal = (i: number) => {
    setShowRowDetailModal(i);
  };

  const startEditRow = (i: number) => {
    if (!tableData) return;
    setEditingRow(i);
    setEditRowData({ ...tableData.rows[i] });
  };

  const cancelEditRow = () => {
    setEditingRow(null);
    setEditRowData(null);
  };

  const saveEditRow = () => {
    if (!editRowData || editingRow === null || !tableData) return;
    
    const rowId = tableData.rows[editingRow].id;
    handleUpdateRow(rowId, editRowData);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            if (editingRow !== null) saveEditRow();
            break;
          case 'z':
            e.preventDefault();
            if (editingRow !== null) cancelEditRow();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editingRow, editRowData]);

  // Loading state
  if (loadingTables) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Toast Notification */}
      {showToast && (
        <Toast
          type={showToast.type}
          message={showToast.message}
          onClose={() => setShowToast(null)}
        />
      )}

      {/* Left Sidebar - Tables */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Tablolar</h2>
            <button
              onClick={() => setShowCreateTable(true)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              title="Yeni Tablo Oluştur"
            >
              <Plus size={16} />
            </button>
          </div>
          
          {/* Search Tables */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Tablolarda ara..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Tables List */}
        <div className="flex-1 overflow-y-auto">
          {tables.map((table) => (
            <div
              key={table.name}
              className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                selectedTable === table.name ? 'bg-blue-50 border-blue-200' : ''
              }`}
              onClick={() => handleTableSelect(table.name)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Table size={16} className="text-gray-500" />
                  <span className="text-sm font-medium text-gray-900">{table.name}</span>
                  {table.locked && <Lock size={12} className="text-gray-400" />}
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(table.name);
                    }}
                    className="p-1 text-gray-400 hover:text-yellow-500"
                  >
                    {favoriteTables.includes(table.name) ? <Star size={12} className="text-yellow-500" /> : <StarOff size={12} />}
                  </button>
                  <span className="text-xs text-gray-500">{table.rowCount}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {selectedTable ? (
          <>
            {/* Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h1 className="text-xl font-semibold text-gray-900">{selectedTable}</h1>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span>{tableData?.total || 0} satır</span>
                    <span>•</span>
                    <span>{columns.length} kolon</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowInsertModal(true)}
                    disabled={loadingAction}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                  >
                    <Plus size={16} />
                    <span>Yeni Satır</span>
                  </button>
                  
                  <button
                    onClick={() => handleExportData('csv')}
                    disabled={loadingAction}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 flex items-center space-x-2"
                  >
                    <Download size={16} />
                    <span>Dışa Aktar</span>
                  </button>
                  
                  <button
                    onClick={loadTableData}
                    disabled={loadingTableData}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                  >
                    <RefreshCw size={16} className={loadingTableData ? 'animate-spin' : ''} />
                  </button>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="Tabloda ara..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <button
                  onClick={() => setFilters({})}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
                >
                  <Filter size={16} />
                </button>
              </div>
            </div>

            {/* Table Content */}
            <div className="flex-1 overflow-auto">
              {loadingTableData ? (
                <LoadingSpinner />
              ) : tableData ? (
                <div className="bg-white">
                  {/* Table Header */}
                  <div className="sticky top-0 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center p-4">
                      <input
                        type="checkbox"
                        checked={selectedRows.length === tableData.rows.length && tableData.rows.length > 0}
                        onChange={toggleSelectAll}
                        className="mr-3"
                      />
                      
                      {selectedRows.length > 0 && (
                        <div className="flex items-center space-x-2 ml-4">
                          <span className="text-sm text-gray-600">{selectedRows.length} seçili</span>
                          <button
                            onClick={handleBulkDelete}
                            disabled={loadingAction}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Table Data */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            #
                          </th>
                          {columns.map((column) => (
                            <th key={column.name} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              <div className="flex items-center space-x-2">
                                <span>{column.name}</span>
                                <button
                                  onClick={() => setSortBy(column.name)}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  <ArrowUpDown size={12} />
                                </button>
                              </div>
                            </th>
                          ))}
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            İşlemler
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {tableData.rows.map((row, rowIndex) => (
                          <tr key={row.id || rowIndex} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap">
                              <input
                                type="checkbox"
                                checked={selectedRows.includes(rowIndex)}
                                onChange={() => toggleRow(rowIndex)}
                                className="mr-2"
                              />
                              {rowIndex + 1}
                            </td>
                            {columns.map((column) => (
                              <td key={column.name} className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                {editingRow === rowIndex ? (
                                  <input
                                    type="text"
                                    value={editRowData?.[column.name] || ''}
                                    onChange={(e) => setEditRowData(prev => ({ ...prev, [column.name]: e.target.value }))}
                                    className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                  />
                                ) : (
                                  <span>{row[column.name]}</span>
                                )}
                              </td>
                            ))}
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center space-x-2">
                                {editingRow === rowIndex ? (
                                  <>
                                    <button
                                      onClick={saveEditRow}
                                      disabled={loadingAction}
                                      className="text-green-600 hover:text-green-800"
                                    >
                                      <Check size={14} />
                                    </button>
                                    <button
                                      onClick={cancelEditRow}
                                      className="text-gray-600 hover:text-gray-800"
                                    >
                                      <X size={14} />
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => startEditRow(rowIndex)}
                                      className="text-blue-600 hover:text-blue-800"
                                    >
                                      <Edit size={14} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteRow(row.id)}
                                      disabled={loadingAction}
                                      className="text-red-600 hover:text-red-800"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {tableData.total > pageSize && (
                    <div className="px-4 py-3 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                          {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, tableData.total)} / {tableData.total} satır
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                          >
                            Önceki
                          </button>
                          <span className="px-3 py-1 text-sm text-gray-700">
                            Sayfa {currentPage} / {Math.ceil(tableData.total / pageSize)}
                          </span>
                          <button
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            disabled={currentPage >= Math.ceil(tableData.total / pageSize)}
                            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                          >
                            Sonraki
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Table className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Veri bulunamadı</h3>
                    <p className="mt-1 text-sm text-gray-500">Seçili tabloda veri bulunmuyor.</p>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Database className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Tablo seçilmedi</h3>
              <p className="mt-1 text-sm text-gray-500">Görüntülemek için bir tablo seçin.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TableEditorPage; 