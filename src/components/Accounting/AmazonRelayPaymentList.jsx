import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { getAmazonRelayPayments, exportAmazonRelayPayment } from '../../api/paySystem';
import './AmazonRelay.css';

const AmazonRelayPaymentList = ({ refreshTrigger }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchPayments();
  }, [refreshTrigger]);
  
  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getAmazonRelayPayments();
      
      // Handle both array and object response formats
      if (Array.isArray(response)) {
        setPayments(response);
      } else if (response && response.results) {
        setPayments(response.results);
      } else if (response && response.data) {
        setPayments(Array.isArray(response.data) ? response.data : [response.data]);
      } else {
        setPayments([]);
      }
    } catch (error) {
      console.error('Error fetching Amazon Relay payments:', error);
      const errorMessage = error?.response?.data?.detail || 
                          error?.message || 
                          t('Failed to load payments');
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  const handleExport = async (payment) => {
    try {
      toast.loading(t('Preparing export...'), { id: 'export' });
      
      const blob = await exportAmazonRelayPayment(payment.id);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `amazon_relay_payment_${payment.id}_${payment.work_period_start}_${payment.work_period_end}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success(t('Export completed'), { id: 'export' });
    } catch (error) {
      console.error('Export error:', error);
      toast.error(t('Export failed'), { id: 'export' });
    }
  };
  
  const getStatusBadgeClass = (status) => {
    if (!status) return 'status-badge';
    
    const statusLower = status.toLowerCase();
    if (statusLower === 'completed') return 'status-badge completed';
    if (statusLower === 'processing') return 'status-badge processing';
    if (statusLower === 'failed') return 'status-badge failed';
    if (statusLower === 'pending') return 'status-badge pending';
    
    return 'status-badge';
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
      <div className="amazon-relay-payment-list">
        <div className="loading-message">{t('Loading payments...')}</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="amazon-relay-payment-list">
        <div className="error-message">{error}</div>
        <button onClick={fetchPayments} className="ghost-button">
          {t('Retry')}
        </button>
      </div>
    );
  }
  
  return (
    <div className="amazon-relay-payment-list">
      <div className="list-header">
        <h3>{t('Amazon Relay Payments')}</h3>
      </div>
      
      {payments.length === 0 ? (
        <div className="empty-state">
          <p>{t('No Amazon Relay payments found')}</p>
          <p className="empty-state-hint">
            {t('Upload an Excel file to create a new payment record')}
          </p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table amazon-relay-table">
            <thead>
              <tr>
                <th>{t('ID')}</th>
                <th>{t('Work Period')}</th>
                <th>{t('Invoice Date')}</th>
                <th>{t('Payment Date')}</th>
                <th>{t('Status')}</th>
                <th>{t('Amount')}</th>
                <th>{t('Loads')}</th>
                <th>{t('Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(payment => {
                const workPeriod = payment.work_period_start && payment.work_period_end
                  ? `${formatDate(payment.work_period_start)} - ${formatDate(payment.work_period_end)}`
                  : payment.work_period || '-';
                
                return (
                  <tr key={payment.id}>
                    <td>{payment.id}</td>
                    <td>{workPeriod}</td>
                    <td>{formatDate(payment.invoice_date)}</td>
                    <td>{formatDate(payment.payment_date)}</td>
                    <td>
                      <span className={getStatusBadgeClass(payment.status)}>
                        {payment.status || 'N/A'}
                      </span>
                    </td>
                    <td className="amount-cell">
                      {formatCurrency(payment.total_amount || payment.amount)}
                    </td>
                    <td>{payment.loads_count || payment.total_loads || 0}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="link-button"
                          onClick={() => navigate(`/accounting/amazon-relay/${payment.id}`)}
                          title={t('View details')}
                        >
                          {t('View')}
                        </button>
                        
                        <button
                          className="link-button"
                          onClick={() => handleExport(payment)}
                          title={t('Export')}
                        >
                          {t('Export')}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AmazonRelayPaymentList;
