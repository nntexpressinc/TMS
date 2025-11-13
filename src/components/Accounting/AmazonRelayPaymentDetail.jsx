import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { getAmazonRelayPayment, updateAmazonRelayPayment } from '../../api/paySystem';
import './AmazonRelay.css';

const AmazonRelayPaymentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // Default settings
  const approvalRequired = true; // Always show approval controls
  const autoApproveThreshold = 5000; // Default threshold
  
  const [payment, setPayment] = useState(null);
  const [loads, setLoads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (id) {
      fetchPaymentDetails();
    }
  }, [id]);
  
  const fetchPaymentDetails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getAmazonRelayPayment(id);
      
      if (response) {
        setPayment(response);
        setLoads(response.loads || []);
      } else {
        setError(t('Payment not found'));
      }
    } catch (error) {
      console.error('Error fetching payment details:', error);
      const errorMessage = error?.response?.data?.detail || 
                          error?.message || 
                          t('Failed to load payment details');
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  const handleApprovalToggle = async (loadId, currentStatus) => {
    const updatedLoads = loads.map(load =>
      load.id === loadId ? { ...load, approved: !currentStatus } : load
    );
    setLoads(updatedLoads);
    
    await saveApprovals(updatedLoads);
  };
  
  const handleBulkApprove = async (threshold) => {
    const updatedLoads = loads.map(load => {
      // Parse amount - try different field names
      const amount = parseFloat(load.final_amount || load.amount || load.invoice_amount || 0);
      
      return {
        ...load,
        approved: amount <= threshold
      };
    });
    
    setLoads(updatedLoads);
    await saveApprovals(updatedLoads);
  };
  
  const saveApprovals = async (updatedLoads) => {
    setSaving(true);
    
    try {
      const payload = {
        loads: updatedLoads.map(load => ({
          load_id: load.load_id || load.po_load_id || load.id,
          approved: load.approved
        }))
      };
      
      const response = await updateAmazonRelayPayment(id, payload);
      
      if (response) {
        setPayment(response);
        setLoads(response.loads || updatedLoads);
        toast.success(t('Approvals updated successfully'));
      }
    } catch (error) {
      console.error('Failed to update approvals:', error);
      toast.error(t('Failed to update approvals'));
      // Revert changes on error
      fetchPaymentDetails();
    } finally {
      setSaving(false);
    }
  };
  
  const calculateTotals = () => {
    let approvedTotal = 0;
    let unapprovedTotal = 0;
    let approvedCount = 0;
    let unapprovedCount = 0;
    
    loads.forEach(load => {
      const amount = parseFloat(load.final_amount || load.amount || load.invoice_amount || 0);
      if (load.approved) {
        approvedTotal += amount;
        approvedCount++;
      } else {
        unapprovedTotal += amount;
        unapprovedCount++;
      }
    });
    
    return { 
      approvedTotal, 
      unapprovedTotal, 
      grandTotal: approvedTotal + unapprovedTotal,
      approvedCount,
      unapprovedCount
    };
  };
  
  const formatCurrency = (value) => {
    const num = parseFloat(value);
    if (isNaN(num)) return '$0.00';
    return `$${num.toFixed(2)}`;
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };
  
  if (loading) {
    return (
      <div className="amazon-relay-payment-detail">
        <div className="loading-message">{t('Loading payment details...')}</div>
      </div>
    );
  }
  
  if (error || !payment) {
    return (
      <div className="amazon-relay-payment-detail">
        <div className="error-message">{error || t('Payment not found')}</div>
        <button onClick={() => navigate('/accounting')} className="ghost-button">
          {t('Back to Accounting')}
        </button>
      </div>
    );
  }
  
  const { approvedTotal, unapprovedTotal, grandTotal, approvedCount, unapprovedCount } = calculateTotals();
  const workPeriod = payment.work_period_start && payment.work_period_end
    ? `${formatDate(payment.work_period_start)} - ${formatDate(payment.work_period_end)}`
    : payment.work_period || '-';
  
  return (
    <div className="amazon-relay-payment-detail">
      <div className="detail-header">
        <button 
          className="back-button"
          onClick={() => navigate('/accounting')}
        >
          ← {t('Back')}
        </button>
        <h2>{t('Amazon Relay Payment Details')}</h2>
      </div>
      
      {/* Payment Summary */}
      <div className="payment-summary">
        <div className="summary-card">
          <h3>{t('Work Period')}</h3>
          <p>{workPeriod}</p>
        </div>
        
        <div className="summary-card">
          <h3>{t('Total Amount')}</h3>
          <p className="amount">{formatCurrency(payment.total_amount || payment.amount)}</p>
        </div>
        
        <div className="summary-card">
          <h3>{t('Status')}</h3>
          <p className={`status ${payment.status ? payment.status.toLowerCase() : ''}`}>
            {payment.status || 'N/A'}
          </p>
        </div>
        
        <div className="summary-card">
          <h3>{t('Loads')}</h3>
          <p>{payment.loads_updated || loads.length}</p>
        </div>
      </div>
      
      {/* Approval Controls */}
      {approvalRequired && (
        <div className="approval-controls">
          <h3>{t('Approval Controls')}</h3>
          
          <div className="bulk-actions">
            <button 
              onClick={() => handleBulkApprove(autoApproveThreshold)}
              className="ghost-button"
              disabled={saving}
            >
              {t('Auto-Approve')} (≤ ${autoApproveThreshold.toFixed(2)})
            </button>
            
            <button 
              onClick={() => handleBulkApprove(99999999)}
              className="ghost-button"
              disabled={saving}
            >
              {t('Approve All')}
            </button>
            
            <button 
              onClick={() => handleBulkApprove(0)}
              className="ghost-button"
              disabled={saving}
            >
              {t('Reject All')}
            </button>
          </div>
          
          <div className="totals-breakdown">
            <div className="total-item approved">
              <span>{t('Approved')}:</span>
              <strong>{formatCurrency(approvedTotal)} ({approvedCount} {t('loads')})</strong>
            </div>
            
            <div className="total-item unapproved">
              <span>{t('Unapproved')}:</span>
              <strong>{formatCurrency(unapprovedTotal)} ({unapprovedCount} {t('loads')})</strong>
            </div>
            
            <div className="total-item grand">
              <span>{t('Total')}:</span>
              <strong>{formatCurrency(grandTotal)} ({loads.length} {t('loads')})</strong>
            </div>
          </div>
        </div>
      )}
      
      {/* Loads Table */}
      <div className="loads-section">
        <h3>{t('Loads')} ({loads.length})</h3>
        
        {loads.length === 0 ? (
          <div className="empty-state">
            <p>{t('No loads found for this payment')}</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table loads-table">
              <thead>
                <tr>
                  <th>{t('PO/Load ID')}</th>
                  <th>{t('Route')}</th>
                  <th>{t('Distance')}</th>
                  <th>{t('Invoice Amount')}</th>
                  <th>{t('Total Pay')}</th>
                  <th>{t('Final Amount')}</th>
                  {approvalRequired && <th>{t('Approved')}</th>}
                </tr>
              </thead>
              <tbody>
                {loads.map(load => {
                  const finalAmount = parseFloat(load.final_amount || load.amount || load.invoice_amount || 0);
                  const invoiceAmount = parseFloat(load.invoice_amount || 0);
                  const totalPay = parseFloat(load.total_pay || 0);
                  const isFallback = !load.approved && totalPay > 0;
                  
                  return (
                    <tr 
                      key={load.id} 
                      className={load.approved ? 'approved-row' : 'unapproved-row'}
                    >
                      <td>{load.po_load_id || load.load_id || load.id}</td>
                      <td>{load.route || '-'}</td>
                      <td>{load.distance ? `${load.distance} mi` : '-'}</td>
                      <td>{formatCurrency(invoiceAmount)}</td>
                      <td>{formatCurrency(totalPay)}</td>
                      <td>
                        <strong>
                          {formatCurrency(finalAmount)}
                        </strong>
                        {isFallback && (
                          <span className="fallback-indicator" title={t('Using Total Pay as fallback')}>
                            *
                          </span>
                        )}
                      </td>
                      {approvalRequired && (
                        <td>
                          <label className="switch">
                            <input
                              type="checkbox"
                              checked={load.approved || false}
                              onChange={() => handleApprovalToggle(load.id, load.approved)}
                              disabled={saving}
                            />
                            <span className="slider"></span>
                          </label>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="total-row">
                  <td colSpan={5}><strong>{t('TOTAL')}</strong></td>
                  <td><strong>{formatCurrency(grandTotal)}</strong></td>
                  {approvalRequired && <td></td>}
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
      
      {saving && (
        <div className="saving-indicator">
          <div className="loading-spinner"></div>
          <span>{t('Saving changes...')}</span>
        </div>
      )}
    </div>
  );
};

export default AmazonRelayPaymentDetail;
