import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import './PayReportsPage.css';

// Import API functions (you'll need to add these to your paySystem.js)
import {
  getDriverPayRecords,
  getDriverPayRecord,
  createDriverPayRecord,
  patchDriverPayRecord,
  deleteDriverPayRecord,
  downloadDriverPayPDF
} from '../../api/paySystem';

const formatCurrency = (value) => {
  const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]+/g, '')) : Number(value);
  if (Number.isNaN(num) || !Number.isFinite(num)) {
    return '$0.00';
  }
  return `$${num.toFixed(2)}`;
};

const formatDate = (dateString) => {
  if (!dateString) return '--';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const PayReportsPage = ({ onCreateNew }) => {
  const { t } = useTranslation();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDriver, setFilterDriver] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  
  // Edit form states
  const [editFormData, setEditFormData] = useState({
    notes: '',
    amount: '',
    invoice_number: '',
    weekly_number: ''
  });

  // Fetch records
  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filterDriver) params.driver_id = filterDriver;
      if (filterDateFrom) params.pay_from = filterDateFrom;
      if (filterDateTo) params.pay_to = filterDateTo;

      const response = await getDriverPayRecords(params);
      console.log('Pay records response:', response);
      setRecords(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error('Error fetching pay records:', err);
      setError(err?.response?.data?.detail || err?.message || 'Failed to load pay records');
    } finally {
      setLoading(false);
    }
  }, [filterDriver, filterDateFrom, filterDateTo]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Filtered records based on search
  const filteredRecords = useMemo(() => {
    if (!searchTerm.trim()) return records;
    
    const term = searchTerm.toLowerCase();
    return records.filter(record => 
      record.driver_name?.toLowerCase().includes(term) ||
      record.invoice_number?.toLowerCase().includes(term) ||
      record.weekly_number?.toLowerCase().includes(term)
    );
  }, [records, searchTerm]);

  // Handle delete
  const handleDeleteClick = (record) => {
    setSelectedRecord(record);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedRecord) return;

    setDeleteLoading(true);
    try {
      await deleteDriverPayRecord(selectedRecord.id);
      setRecords(prev => prev.filter(r => r.id !== selectedRecord.id));
      setShowDeleteModal(false);
      setSelectedRecord(null);
    } catch (err) {
      console.error('Error deleting record:', err);
      alert(err?.response?.data?.detail || err?.message || 'Failed to delete record');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle edit
  const handleEditClick = async (record) => {
    setSelectedRecord(record);
    setEditFormData({
      notes: record.notes || '',
      amount: record.amount || '',
      invoice_number: record.invoice_number || '',
      weekly_number: record.weekly_number || ''
    });
    setShowEditModal(true);
  };

  const handleEditChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const confirmEdit = async () => {
    if (!selectedRecord) return;

    setEditLoading(true);
    try {
      // Use PATCH for partial updates
      const updateData = {
        notes: editFormData.notes,
        amount: parseFloat(editFormData.amount) || 0,
        invoice_number: editFormData.invoice_number,
        weekly_number: editFormData.weekly_number
      };
      
      const updatedRecord = await patchDriverPayRecord(selectedRecord.id, updateData);
      
      setRecords(prev => prev.map(r => r.id === selectedRecord.id ? { ...r, ...updatedRecord } : r));
      setShowEditModal(false);
      setSelectedRecord(null);
    } catch (err) {
      console.error('Error updating record:', err);
      alert(err?.response?.data?.detail || err?.message || 'Failed to update record');
    } finally {
      setEditLoading(false);
    }
  };

  // Handle view details
  const handleViewDetails = async (record) => {
    setLoading(true);
    try {
      const detailedRecord = await getDriverPayRecord(record.id);
      setSelectedRecord(detailedRecord);
      setShowDetailsModal(true);
    } catch (err) {
      console.error('Error fetching record details:', err);
      alert(err?.response?.data?.detail || err?.message || 'Failed to load record details');
    } finally {
      setLoading(false);
    }
  };

  // Handle download PDF
  const handleDownloadPDF = async (record) => {
    try {
      const response = await downloadDriverPayPDF(record.id);
      if (response.file_url) {
        window.open(response.file_url, '_blank');
      }
    } catch (err) {
      console.error('Error downloading PDF:', err);
      alert(err?.response?.data?.detail || err?.message || 'Failed to download PDF');
    }
  };

  // Navigate to create new driver pay
  const handleCreateNew = () => {
    if (onCreateNew) {
      onCreateNew();
    }
  };

  return (
    <div className="pay-reports-page">
      <div className="pay-reports-header">
        <div className="pay-reports-header__left">
          <h1>{t('Pay Reports')}</h1>
          <p className="pay-reports-subtitle">{t('View and manage driver payment records')}</p>
        </div>
        <button className="create-pay-button" onClick={handleCreateNew}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          {t('Create Driver Pay')}
        </button>
      </div>

      {/* Filters Section */}
      <div className="pay-reports-filters">
        <div className="filter-group">
          <input
            type="search"
            className="filter-search"
            placeholder={t('Search by driver, invoice, or week...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <input
            type="date"
            className="filter-date"
            placeholder={t('From date')}
            value={filterDateFrom}
            onChange={(e) => setFilterDateFrom(e.target.value)}
          />
          <span className="filter-separator">—</span>
          <input
            type="date"
            className="filter-date"
            placeholder={t('To date')}
            value={filterDateTo}
            onChange={(e) => setFilterDateTo(e.target.value)}
          />
        </div>
        <button className="filter-reset" onClick={() => {
          setSearchTerm('');
          setFilterDriver('');
          setFilterDateFrom('');
          setFilterDateTo('');
        }}>
          {t('Clear Filters')}
        </button>
      </div>

      {error && <div className="pay-reports-error">{error}</div>}

      {/* Records Table */}
      <div className="pay-reports-content">
        {loading && <div className="pay-reports-loading">
          <div className="spinner"></div>
          <p>{t('Loading pay records...')}</p>
        </div>}

        {!loading && filteredRecords.length === 0 && (
          <div className="pay-reports-empty">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
              <rect x="12" y="16" width="40" height="32" rx="2" stroke="#D1D5DB" strokeWidth="2"/>
              <path d="M12 24H52" stroke="#D1D5DB" strokeWidth="2"/>
              <circle cx="20" cy="20" r="2" fill="#D1D5DB"/>
              <circle cx="26" cy="20" r="2" fill="#D1D5DB"/>
            </svg>
            <h3>{t('No pay records found')}</h3>
            <p>{t('Create your first driver pay record using the "Create Driver Pay" button above')}</p>
          </div>
        )}

        {!loading && filteredRecords.length > 0 && (
          <div className="pay-reports-table-wrapper">
            <table className="pay-reports-table">
              <thead>
                <tr>
                  <th>{t('Invoice #')}</th>
                  <th>{t('Driver')}</th>
                  <th>{t('Pay Period')}</th>
                  <th>{t('Week #')}</th>
                  <th>{t('Amount')}</th>
                  <th>{t('Miles')}</th>
                  <th>{t('Rate/Mile')}</th>
                  <th>{t('Created')}</th>
                  <th>{t('Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record.id}>
                    <td className="invoice-cell">
                      <span className="invoice-badge">{record.invoice_number || '--'}</span>
                    </td>
                    <td>
                      <div className="driver-cell">
                        <div className="driver-avatar">
                          {record.driver_name?.charAt(0) || 'D'}
                        </div>
                        <span className="driver-name">{record.driver_name || 'Unknown Driver'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="date-range-cell">
                        <span>{formatDate(record.pay_from)}</span>
                        <span className="date-separator">→</span>
                        <span>{formatDate(record.pay_to)}</span>
                      </div>
                    </td>
                    <td>
                      <span className="week-badge">{record.weekly_number || '--'}</span>
                    </td>
                    <td className="amount-cell">{formatCurrency(record.amount)}</td>
                    <td>{record.total_miles ? `${Math.round(record.total_miles)} mi` : '--'}</td>
                    <td>{record.miles_rate ? formatCurrency(record.miles_rate) : '--'}</td>
                    <td className="date-cell">{formatDate(record.created_at)}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-button action-button--view"
                          onClick={() => handleViewDetails(record)}
                          title={t('View Details')}
                        >
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M1 10s3-6 9-6 9 6 9 6-3 6-9 6-9-6-9-6z" stroke="currentColor" strokeWidth="2"/>
                            <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                        </button>
                        <button
                          className="action-button action-button--edit"
                          onClick={() => handleEditClick(record)}
                          title={t('Edit')}
                        >
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M14 2l4 4-10 10H4v-4L14 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        {record.file && (
                          <button
                            className="action-button action-button--download"
                            onClick={() => handleDownloadPDF(record)}
                            title={t('Download PDF')}
                          >
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                              <path d="M10 14V3M10 14L7 11M10 14L13 11M3 16h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                          </button>
                        )}
                        <button
                          className="action-button action-button--delete"
                          onClick={() => handleDeleteClick(record)}
                          title={t('Delete')}
                        >
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M4 5h12M8 5V3h4v2M6 5v12h8V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => !deleteLoading && setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t('Confirm Delete')}</h3>
              <button
                className="modal-close"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>{t('Are you sure you want to delete this pay record?')}</p>
              {selectedRecord && (
                <div className="delete-record-details">
                  <p><strong>{t('Driver')}:</strong> {selectedRecord.driver_name}</p>
                  <p><strong>{t('Invoice')}:</strong> {selectedRecord.invoice_number}</p>
                  <p><strong>{t('Amount')}:</strong> {formatCurrency(selectedRecord.amount)}</p>
                </div>
              )}
              <p className="warning-text">{t('This action cannot be undone.')}</p>
            </div>
            <div className="modal-footer">
              <button
                className="modal-button modal-button--cancel"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
              >
                {t('Cancel')}
              </button>
              <button
                className="modal-button modal-button--delete"
                onClick={confirmDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? t('Deleting...') : t('Delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedRecord && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content modal-content--large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t('Pay Record Details')}</h3>
              <button className="modal-close" onClick={() => setShowDetailsModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="details-grid">
                <div className="detail-section">
                  <h4>{t('Driver Information')}</h4>
                  <div className="detail-item">
                    <span className="detail-label">{t('Name')}:</span>
                    <span className="detail-value">{selectedRecord.driver_name}</span>
                  </div>
                  {selectedRecord.driver_info && (
                    <>
                      <div className="detail-item">
                        <span className="detail-label">{t('Email')}:</span>
                        <span className="detail-value">{selectedRecord.driver_info.email || '--'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">{t('Phone')}:</span>
                        <span className="detail-value">{selectedRecord.driver_info.phone || '--'}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="detail-section">
                  <h4>{t('Payment Details')}</h4>
                  <div className="detail-item">
                    <span className="detail-label">{t('Invoice Number')}:</span>
                    <span className="detail-value">{selectedRecord.invoice_number || '--'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">{t('Weekly Number')}:</span>
                    <span className="detail-value">{selectedRecord.weekly_number || '--'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">{t('Pay Period')}:</span>
                    <span className="detail-value">
                      {formatDate(selectedRecord.pay_from)} - {formatDate(selectedRecord.pay_to)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">{t('Amount')}:</span>
                    <span className="detail-value detail-value--highlight">
                      {formatCurrency(selectedRecord.amount)}
                    </span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>{t('Mileage')}</h4>
                  <div className="detail-item">
                    <span className="detail-label">{t('Total Miles')}:</span>
                    <span className="detail-value">
                      {selectedRecord.total_miles ? `${Math.round(selectedRecord.total_miles)} mi` : '--'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">{t('Rate per Mile')}:</span>
                    <span className="detail-value">
                      {selectedRecord.miles_rate ? formatCurrency(selectedRecord.miles_rate) : '--'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">{t('Pay Percentage')}:</span>
                    <span className="detail-value">{selectedRecord.pay_percentage || '--'}</span>
                  </div>
                </div>

                {selectedRecord.notes && (
                  <div className="detail-section detail-section--full">
                    <h4>{t('Notes')}</h4>
                    <p className="detail-notes">{selectedRecord.notes}</p>
                  </div>
                )}

                {selectedRecord.load_ids && selectedRecord.load_ids.length > 0 && (
                  <div className="detail-section detail-section--full">
                    <h4>{t('Associated Loads')}</h4>
                    <div className="load-ids">
                      {selectedRecord.load_ids.map((loadId) => (
                        <span key={loadId} className="load-id-badge">{loadId}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              {selectedRecord.file && (
                <button
                  className="modal-button modal-button--primary"
                  onClick={() => handleDownloadPDF(selectedRecord)}
                >
                  {t('Download PDF')}
                </button>
              )}
              <button
                className="modal-button modal-button--cancel"
                onClick={() => setShowDetailsModal(false)}
              >
                {t('Close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedRecord && (
        <div className="modal-overlay" onClick={() => !editLoading && setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t('Edit Pay Record')}</h3>
              <button
                className="modal-close"
                onClick={() => setShowEditModal(false)}
                disabled={editLoading}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="edit-form">
                <div className="form-field">
                  <label>{t('Invoice Number')}</label>
                  <input
                    type="text"
                    value={editFormData.invoice_number}
                    onChange={(e) => handleEditChange('invoice_number', e.target.value)}
                    placeholder={t('Enter invoice number')}
                  />
                </div>
                <div className="form-field">
                  <label>{t('Weekly Number')}</label>
                  <input
                    type="text"
                    value={editFormData.weekly_number}
                    onChange={(e) => handleEditChange('weekly_number', e.target.value)}
                    placeholder={t('Enter weekly number')}
                  />
                </div>
                <div className="form-field">
                  <label>{t('Amount')}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editFormData.amount}
                    onChange={(e) => handleEditChange('amount', e.target.value)}
                    placeholder={t('Enter amount')}
                  />
                </div>
                <div className="form-field">
                  <label>{t('Notes')}</label>
                  <textarea
                    value={editFormData.notes}
                    onChange={(e) => handleEditChange('notes', e.target.value)}
                    placeholder={t('Enter notes (optional)')}
                    rows="3"
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="modal-button modal-button--cancel"
                onClick={() => setShowEditModal(false)}
                disabled={editLoading}
              >
                {t('Cancel')}
              </button>
              <button
                className="modal-button modal-button--primary"
                onClick={confirmEdit}
                disabled={editLoading}
              >
                {editLoading ? t('Updating...') : t('Update')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayReportsPage;












