import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { getInvoiceById, downloadAmazonRelayExport, triggerFileDownload } from '../../api/accounting';
import './AmazonRelay.css';

const AmazonInvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'load_id', direction: 'asc' });
  
  useEffect(() => {
    if (id) {
      fetchInvoiceDetails();
    }
  }, [id]);
  
  const fetchInvoiceDetails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getInvoiceById(id);
      
      // Backend returns invoice data (type is included in response)
      if (response) {
        setInvoice(response);
      } else {
        setError(t('Invoice not found'));
      }
    } catch (error) {
      console.error('Error fetching invoice details:', error);
      const errorMessage = error?.response?.data?.error || 
                          error?.response?.data?.detail || 
                          error?.message || 
                          t('Failed to load invoice details');
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate statistics
  const statistics = useMemo(() => {
    if (!invoice || !invoice.loads) return null;
    
    const loads = invoice.loads;
    const warnings = invoice.warnings || [];
    
    const successLoads = loads.filter(l => !l.warning_type);
    const mismatchLoads = loads.filter(l => l.warning_type === 'price_mismatch');
    const notFoundLoads = loads.filter(l => l.warning_type === 'not_found');
    const errorLoads = loads.filter(l => l.warning_type === 'error');
    
    const totalInvoiceAmount = loads.reduce((sum, l) => sum + parseFloat(l.invoice_amount || 0), 0);
    const totalSystemAmount = loads.reduce((sum, l) => sum + parseFloat(l.system_amount || 0), 0);
    
    return {
      successCount: successLoads.length,
      mismatchCount: mismatchLoads.length,
      notFoundCount: notFoundLoads.length,
      errorCount: errorLoads.length,
      totalCount: loads.length,
      matchedCount: successLoads.length,
      totalInvoiceAmount,
      totalSystemAmount,
      difference: totalInvoiceAmount - totalSystemAmount
    };
  }, [invoice]);
  
  // Filter loads based on active tab and search
  const filteredLoads = useMemo(() => {
    if (!invoice || !invoice.loads) return [];
    
    let filtered = [...invoice.loads];
    
    // Filter by tab
    if (activeTab === 'success') {
      filtered = filtered.filter(l => !l.warning_type);
    } else if (activeTab === 'mismatch') {
      filtered = filtered.filter(l => l.warning_type === 'price_mismatch');
    } else if (activeTab === 'not_found') {
      filtered = filtered.filter(l => l.warning_type === 'not_found');
    } else if (activeTab === 'error') {
      filtered = filtered.filter(l => l.warning_type === 'error');
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(l => 
        l.load_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.po_load_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      
      // Handle numeric sorting for amounts
      if (sortConfig.key === 'invoice_amount' || sortConfig.key === 'system_amount' || sortConfig.key === 'difference') {
        aVal = parseFloat(aVal || 0);
        bVal = parseFloat(bVal || 0);
      }
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    
    return filtered;
  }, [invoice, activeTab, searchTerm, sortConfig]);
  
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };
  
  const formatCurrency = (value) => {
    const num = parseFloat(value);
    if (isNaN(num)) return '-';
    return `$${num.toFixed(2)}`;
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };
  
  const getStatusBadge = (warning_type) => {
    if (!warning_type) {
      return <span className="status-badge success">✅ {t('Success')}</span>;
    }
    if (warning_type === 'price_mismatch') {
      return <span className="status-badge warning">⚠️ {t('Price Mismatch')}</span>;
    }
    if (warning_type === 'not_found') {
      return <span className="status-badge error">❌ {t('Not Found')}</span>;
    }
    if (warning_type === 'error') {
      return <span className="status-badge error">❌ {t('Error')}</span>;
    }
    return <span className="status-badge">{warning_type}</span>;
  };
  
  const calculateDifference = (load) => {
    const invoiceAmount = parseFloat(load.invoice_amount || 0);
    const systemAmount = parseFloat(load.system_amount || 0);
    return invoiceAmount - systemAmount;
  };
  
  const handleDownload = async (url, filename, isExport = false) => {
    if (!url && !isExport) {
      toast.error(t('Download URL not available'));
      return;
    }
    
    try {
      if (isExport) {
        // Download export Excel using API
        toast.loading(t('Preparing download...'));
        const blob = await downloadAmazonRelayExport(id);
        toast.dismiss();
        triggerFileDownload(blob, filename);
        toast.success(t('File downloaded successfully'));
      } else {
        // Direct download from URL
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      toast.dismiss();
      console.error('Download error:', error);
      toast.error(t('Failed to download file'));
    }
  };
  
  if (loading) {
    return (
      <div className="amazon-invoice-detail">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>{t('Loading invoice details...')}</p>
        </div>
      </div>
    );
  }
  
  if (error || !invoice) {
    return (
      <div className="amazon-invoice-detail">
        <div className="error-container">
          <p className="error-message">{error || t('Invoice not found')}</p>
          <button onClick={() => navigate('/invoices')} className="ghost-button">
            {t('Back to Invoices')}
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="amazon-invoice-detail">
      {/* Header */}
      <div className="detail-header">
        <button 
          className="back-button"
          onClick={() => navigate('/invoices')}
        >
          ← {t('Back')}
        </button>
        <h2>{t('Amazon Relay Invoice Processing Results')}</h2>
      </div>
      
      {/* Summary Cards - Compact */}
      {statistics && (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{ 
            flex: '1', 
            minWidth: '200px',
            padding: '16px 20px', 
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
            borderRadius: '12px',
            border: '2px solid #10b981',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{ fontSize: '32px' }}>✅</div>
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: '600', color: 'rgba(255,255,255,0.9)', letterSpacing: '0.5px' }}>
                {t('Successfully Matched')}
              </div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: 'white', marginTop: '4px' }}>
                {statistics.successCount} {t('loads')}
              </div>
            </div>
          </div>
          
          <div style={{ 
            flex: '1',
            minWidth: '200px', 
            padding: '16px 20px', 
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', 
            borderRadius: '12px',
            border: '2px solid #f59e0b',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{ fontSize: '32px' }}>⚠️</div>
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: '600', color: 'rgba(255,255,255,0.9)', letterSpacing: '0.5px' }}>
                {t('Price Mismatch')}
              </div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: 'white', marginTop: '4px' }}>
                {statistics.mismatchCount} {t('loads')}
              </div>
            </div>
          </div>
          
          <div style={{ 
            flex: '1',
            minWidth: '200px', 
            padding: '16px 20px', 
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', 
            borderRadius: '12px',
            border: '2px solid #ef4444',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{ fontSize: '32px' }}>❌</div>
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: '600', color: 'rgba(255,255,255,0.9)', letterSpacing: '0.5px' }}>
                {t('Not Found')}
              </div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: 'white', marginTop: '4px' }}>
                {statistics.notFoundCount} {t('loads')}
              </div>
            </div>
          </div>
          
          <div style={{ 
            flex: '1',
            minWidth: '200px', 
            padding: '16px 20px', 
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', 
            borderRadius: '12px',
            border: '2px solid #6366f1',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{ fontSize: '32px' }}>⚡</div>
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: '600', color: 'rgba(255,255,255,0.9)', letterSpacing: '0.5px' }}>
                {t('Errors')}
              </div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: 'white', marginTop: '4px' }}>
                {statistics.errorCount} {t('loads')}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Invoice Info - Compact */}
      <div style={{ 
        background: 'white', 
        border: '1px solid #e5e7eb', 
        borderRadius: '12px', 
        padding: '20px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', display: 'block', marginBottom: '4px' }}>
              {t('Uploaded At')}:
            </span>
            <span style={{ fontSize: '14px', color: '#111827', fontWeight: '600' }}>
              {formatDate(invoice.uploaded_at)}
            </span>
          </div>
          <div>
            <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', display: 'block', marginBottom: '4px' }}>
              {t('Processed At')}:
            </span>
            <span style={{ fontSize: '14px', color: '#111827', fontWeight: '600' }}>
              {formatDate(invoice.processed_at)}
            </span>
          </div>
          <div>
            <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', display: 'block', marginBottom: '4px' }}>
              {t('Status')}:
            </span>
            <span className={`status-badge ${invoice.status?.toLowerCase()}`} style={{ display: 'inline-block' }}>
              {invoice.status}
            </span>
          </div>
          <div>
            <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', display: 'block', marginBottom: '4px' }}>
              {t('Total Records')}:
            </span>
            <span style={{ fontSize: '14px', color: '#111827', fontWeight: '600' }}>
              {statistics?.totalCount || 0}
            </span>
          </div>
          {invoice.invoice_number && (
            <div>
              <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', display: 'block', marginBottom: '4px' }}>
                {t('Invoice Number')}:
              </span>
              <span style={{ fontSize: '14px', color: '#111827', fontWeight: '600' }}>
                {invoice.invoice_number}
              </span>
            </div>
          )}
          {invoice.weekly_number && (
            <div>
              <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', display: 'block', marginBottom: '4px' }}>
                {t('Weekly Number')}:
              </span>
              <span style={{ fontSize: '14px', color: '#111827', fontWeight: '600' }}>
                {invoice.weekly_number}
              </span>
            </div>
          )}
        </div>
      </div>
      
      {/* Download Buttons */}
      <div className="download-section">
        <h3>{t('Download Files')}</h3>
        <div className="download-buttons">
          <button 
            className="download-btn primary"
            onClick={() => handleDownload(invoice.uploaded_file_url, `original_invoice_${id}.xlsx`, false)}
            disabled={!invoice.uploaded_file_url}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            {t('Download Original Excel')}
          </button>
          
          <button 
            className="download-btn secondary"
            onClick={() => handleDownload(null, `comparison_report_${id}.xlsx`, true)}
            disabled={!invoice.id}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            {t('Download Comparison Report')}
          </button>
        </div>
      </div>
      
      {/* Tabs and Results */}
      <div className="results-section">
        <div className="results-header">
          <h3>{t('Processing Results')}</h3>
          
          {/* Search */}
          <div className="search-box">
            <input
              type="text"
              placeholder={t('Search by Load ID or Reference ID...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {/* Tabs */}
        <div className="tabs-container">
          <button 
            className={`tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            {t('All Loads')} ({invoice.loads?.length || 0})
          </button>
          <button 
            className={`tab ${activeTab === 'success' ? 'active' : ''}`}
            onClick={() => setActiveTab('success')}
          >
            {t('Success')} ({statistics?.successCount || 0})
          </button>
          <button 
            className={`tab ${activeTab === 'mismatch' ? 'active' : ''}`}
            onClick={() => setActiveTab('mismatch')}
          >
            {t('Price Mismatch')} ({statistics?.mismatchCount || 0})
          </button>
          <button 
            className={`tab ${activeTab === 'not_found' ? 'active' : ''}`}
            onClick={() => setActiveTab('not_found')}
          >
            {t('Not Found')} ({statistics?.notFoundCount || 0})
          </button>
          <button 
            className={`tab ${activeTab === 'error' ? 'active' : ''}`}
            onClick={() => setActiveTab('error')}
          >
            {t('Errors')} ({statistics?.errorCount || 0})
          </button>
        </div>
        
        {/* Results Table */}
        <div className="table-wrapper">
          <table className="results-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('load_id')} className="sortable">
                  {t('Load ID')}
                  {sortConfig.key === 'load_id' && (
                    <span className="sort-indicator">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th onClick={() => handleSort('system_amount')} className="sortable amount-col">
                  {t('System Amount')}
                  {sortConfig.key === 'system_amount' && (
                    <span className="sort-indicator">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th onClick={() => handleSort('invoice_amount')} className="sortable amount-col">
                  {t('Amazon Amount')}
                  {sortConfig.key === 'invoice_amount' && (
                    <span className="sort-indicator">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th onClick={() => handleSort('difference')} className="sortable amount-col">
                  {t('Difference')}
                  {sortConfig.key === 'difference' && (
                    <span className="sort-indicator">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th>{t('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredLoads.length === 0 ? (
                <tr>
                  <td colSpan="5" className="no-results">
                    {t('No loads found matching your filters')}
                  </td>
                </tr>
              ) : (
                filteredLoads.map((load, index) => {
                  const difference = calculateDifference(load);
                  const rowClass = load.warning_type ? `row-${load.warning_type}` : 'row-success';
                  
                  return (
                    <tr key={load.id || index} className={rowClass}>
                      <td className="load-id-cell">
                        {load.id ? (
                          <button
                            className="load-id-link"
                            onClick={() => navigate(`/loads/view/${load.id}`)}
                            title={t('Open load')}
                          >
                            {load.load_id || load.id}
                          </button>
                        ) : (
                          load.load_id || load.po_load_id || '-'
                        )}
                      </td>
                      <td className="amount-cell">{formatCurrency(load.system_amount)}</td>
                      <td className="amount-cell">{formatCurrency(load.invoice_amount)}</td>
                      <td className={`amount-cell ${difference > 0 ? 'positive-diff' : difference < 0 ? 'negative-diff' : ''}`}>
                        {difference !== 0 && (difference > 0 ? '+' : '')}{formatCurrency(Math.abs(difference))}
                      </td>
                      <td>{getStatusBadge(load.warning_type)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Summary Totals */}
        {statistics && (
          <div className="results-summary">
            <div className="summary-item">
              <span>{t('Total Amazon Amount')}:</span>
              <strong>{formatCurrency(statistics.totalInvoiceAmount)}</strong>
            </div>
            <div className="summary-item">
              <span>{t('Total System Amount')}:</span>
              <strong>{formatCurrency(statistics.totalSystemAmount)}</strong>
            </div>
            <div className={`summary-item ${statistics.difference !== 0 ? 'highlight' : ''}`}>
              <span>{t('Total Difference')}:</span>
              <strong className={statistics.difference > 0 ? 'positive' : statistics.difference < 0 ? 'negative' : ''}>
                {statistics.difference !== 0 && (statistics.difference > 0 ? '+' : '')}{formatCurrency(Math.abs(statistics.difference))}
              </strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AmazonInvoiceDetail;
