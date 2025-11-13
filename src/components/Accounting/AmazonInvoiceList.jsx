import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { getInvoices } from '../../api/accounting';
import './AmazonRelay.css';

const AmazonInvoiceList = ({ refreshTrigger }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState('all');
  
  useEffect(() => {
    fetchInvoices();
  }, [refreshTrigger, currentPage, itemsPerPage, statusFilter]);
  
  const fetchInvoices = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        page: currentPage,
        per_page: itemsPerPage,
        ordering: '-uploaded_at',
      };
      
      if (statusFilter && statusFilter !== 'all') {
        params.status = statusFilter;
      }
      
      const response = await getInvoices(params);
      
      // Backend returns { success, type, results, count }
      if (response.success && response.type === 'amazon_relay') {
        setInvoices(response.results || []);
        setTotalPages(Math.ceil((response.count || 0) / itemsPerPage));
      } else if (Array.isArray(response.results)) {
        setInvoices(response.results);
        setTotalPages(Math.ceil((response.count || 0) / itemsPerPage));
      } else {
        setInvoices([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      const errorMessage = error?.response?.data?.error || 
                          error?.response?.data?.detail || 
                          error?.message || 
                          t('Failed to load invoices');
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  const getStatusBadgeClass = (status) => {
    if (!status) return 'status-badge';
    
    const statusLower = status.toLowerCase();
    if (statusLower === 'completed') return 'status-badge completed';
    if (statusLower === 'processing') return 'status-badge processing';
    if (statusLower === 'error' || statusLower === 'failed') return 'status-badge error';
    if (statusLower === 'pending') return 'status-badge pending';
    
    return 'status-badge';
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };
  
  const getSummaryBadges = (invoice) => {
    if (!invoice.loads || invoice.loads.length === 0) return null;
    
    const successCount = invoice.loads.filter(l => !l.warning_type).length;
    const mismatchCount = invoice.loads.filter(l => l.warning_type === 'price_mismatch').length;
    const notFoundCount = invoice.loads.filter(l => l.warning_type === 'not_found').length;
    const errorCount = invoice.loads.filter(l => l.warning_type === 'error').length;
    
    return (
      <div className="summary-badges">
        {successCount > 0 && (
          <span className="mini-badge success" title={t('Success')}>
            ✅ {successCount}
          </span>
        )}
        {mismatchCount > 0 && (
          <span className="mini-badge warning" title={t('Price Mismatch')}>
            ⚠️ {mismatchCount}
          </span>
        )}
        {notFoundCount > 0 && (
          <span className="mini-badge error" title={t('Not Found')}>
            ❌ {notFoundCount}
          </span>
        )}
        {errorCount > 0 && (
          <span className="mini-badge error" title={t('Error')}>
            ⚡ {errorCount}
          </span>
        )}
      </div>
    );
  };
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  if (loading && invoices.length === 0) {
    return (
      <div className="amazon-invoice-list">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>{t('Loading invoices...')}</p>
        </div>
      </div>
    );
  }
  
  if (error && invoices.length === 0) {
    return (
      <div className="amazon-invoice-list">
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={fetchInvoices} className="ghost-button">
            {t('Retry')}
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="amazon-invoice-list">
      <div className="list-header">
        <h3>{t('Amazon Relay Invoices')}</h3>
        
        {/* Filters */}
        <div className="filters-section">
          <div className="filter-group">
            <label>{t('Status')}:</label>
            <select 
              value={statusFilter} 
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="filter-select"
            >
              <option value="all">{t('All')}</option>
              <option value="completed">{t('Completed')}</option>
              <option value="processing">{t('Processing')}</option>
              <option value="pending">{t('Pending')}</option>
              <option value="error">{t('Error')}</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>{t('Per page')}:</label>
            <select 
              value={itemsPerPage} 
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="filter-select"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>
      
      {invoices.length === 0 ? (
        <div className="empty-state">
          <svg className="empty-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          <p>{t('No Amazon Relay invoices found')}</p>
          <p className="empty-state-hint">
            {t('Upload an Excel file to create a new invoice record')}
          </p>
        </div>
      ) : (
        <>
          <div className="table-wrapper">
            <table className="data-table amazon-invoice-table">
              <thead>
                <tr>
                  <th>{t('ID')}</th>
                  <th>{t('Uploaded At')}</th>
                  <th>{t('Processed At')}</th>
                  <th>{t('Status')}</th>
                  <th>{t('Total Records')}</th>
                  <th>{t('Matched')}</th>
                  <th>{t('Summary')}</th>
                  <th>{t('Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(invoice => (
                  <tr key={invoice.id}>
                    <td>
                      <strong>#{invoice.id}</strong>
                    </td>
                    <td>{formatDate(invoice.uploaded_at)}</td>
                    <td>{formatDate(invoice.processed_at)}</td>
                    <td>
                      <span className={getStatusBadgeClass(invoice.status)}>
                        {invoice.status || 'N/A'}
                      </span>
                    </td>
                    <td className="text-center">
                      {invoice.total_records || invoice.loads?.length || 0}
                    </td>
                    <td className="text-center">
                      {invoice.matched_records || 0}
                    </td>
                    <td>
                      {getSummaryBadges(invoice)}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-btn view-btn"
                          onClick={() => navigate(`/invoices/amazon/${invoice.id}`)}
                          title={t('View details')}
                        >
                          {t('View')}
                        </button>
                        
                        {invoice.output_file_url && (
                          <a
                            href={invoice.output_file_url}
                            className="action-btn download-btn"
                            target="_blank"
                            rel="noopener noreferrer"
                            title={t('Download comparison file')}
                          >
                            {t('Download')}
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                className="page-button"
                disabled={currentPage === 1}
              >
                {t('Prev')}
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                // Show first page, last page, current page, and pages around current
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`page-button ${currentPage === page ? 'active' : ''}`}
                    >
                      {page}
                    </button>
                  );
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={page} className="page-ellipsis">...</span>;
                }
                return null;
              })}

              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                className="page-button"
                disabled={currentPage === totalPages}
              >
                {t('Next')}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AmazonInvoiceList;
