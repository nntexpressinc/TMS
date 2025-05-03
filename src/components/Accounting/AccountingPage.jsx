import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getDrivers, getDriverPayReport } from '../../api/accounting';
import { pdf } from '@react-pdf/renderer';
import PayReportPDF from './PayReportPDF';
import './AccountingPage.css';
import moment from 'moment';

// Yordamchi funksiya
const ensureArray = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === 'object') return [data];
  return [];
};

const AccountingPage = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [selectedDriver, setSelectedDriver] = useState('');
  const [notes, setNotes] = useState('');
  const [drivers, setDrivers] = useState([]);
  const [error, setError] = useState('');

  // Fetch drivers on mount
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const data = await getDrivers();
        setDrivers(ensureArray(data)); // Ma'lumotlarni massivga o'tkazish
      } catch (err) {
        setError(t('Failed to fetch drivers'));
        setDrivers([]); // Xatolik bo'lganda bo'sh massiv o'rnatish
      }
    };
    fetchDrivers();
  }, [t]);

  // Validate form fields
  const validateFields = () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      setError(t('Please select a valid date range'));
      return false;
    }
    if (!selectedDriver) {
      setError(t('Please select a driver'));
      return false;
    }
    setError('');
    return true;
  };

  // Generate report
  const generateReport = async (e) => {
    e.preventDefault();
    if (!validateFields()) return;

    try {
      setLoading(true);
      const requestData = {
        pay_from: dateRange.startDate,
        pay_to: dateRange.endDate,
        driver: Number(selectedDriver),
        notes: notes || '',
      };

      const response = await getDriverPayReport(requestData);
      console.log('Report data received:', response);
      setReportData(response); // Set raw API response
      setError('');
    } catch (err) {
      console.error('Error fetching report:', err);
      setError(t('Failed to generate report'));
    } finally {
      setLoading(false);
    }
  };

  // Download PDF
  const downloadPDF = async () => {
    try {
      if (!reportData) {
        throw new Error('No report data available');
      }
      const blob = await pdf(<PayReportPDF reportData={reportData} />).toBlob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `driver-pay-report-${moment().format('YYYY-MM-DD')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF generation error:', err);
      setError(t('Failed to generate PDF: ') + err.message);
    }
  };

  return (
    <div className="accounting-page">
      {/* Search Section */}
      <div className="search-section">
        <h2 className="section-title">{t('Driver Pay Report')}</h2>
        <form onSubmit={generateReport} className="search-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">{t('Start Date')}</label>
              <input
                type="date"
                id="startDate"
                value={dateRange.startDate}
                onChange={(e) => setDateRange((prev) => ({ ...prev, startDate: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="endDate">{t('End Date')}</label>
              <input
                type="date"
                id="endDate"
                value={dateRange.endDate}
                onChange={(e) => setDateRange((prev) => ({ ...prev, endDate: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="driver">{t('Driver')}</label>
              <select
                id="driver"
                value={selectedDriver}
                onChange={(e) => setSelectedDriver(e.target.value)}
                required
              >
                <option value="">{t('Select driver')}</option>
                {Array.isArray(drivers) && drivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.user?.first_name || ''} {driver.user?.last_name || ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="notes">{t('Notes')}</label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows="4"
                placeholder={t('Enter notes here')}
              />
            </div>
          </div>
          {error && <div className="error-message">{error}</div>}
          <div className="button-group">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? t('Loading...') : t('Generate Report')}
            </button>
            {reportData && (
              <button
                type="button"
                onClick={downloadPDF}
                className="btn btn-secondary"
                disabled={loading}
              >
                {t('Download PDF')}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Report Section */}
      {reportData && (
        <div className="report-section">
          <div className="report-header">
            {/* Company Info */}
            <div className="company-info">
              <h3>{reportData.user_admin?.company_name || t('N/A')}</h3>
              <p>{reportData.user_admin?.address || t('N/A')}</p>
              <p>{reportData.user_admin?.country || t('N/A')}</p>
              <p>{t('Phone')}: {reportData.user_admin?.telephone || t('N/A')}</p>
              {reportData.user_admin?.fax && (
                <p>{t('Fax')}: {reportData.user_admin.fax}</p>
              )}
              <p>{t('Email')}: {reportData.user_admin?.email || t('N/A')}</p>
            </div>

            {/* Driver Info */}
            <div className="driver-info">
              <h4>{t('Driver Information')}</h4>
              <div className="info-grid">
                <div className="info-item">
                  <label>{t('Name')}:</label>
                  <span>
                    {reportData.driver?.first_name || ''} {reportData.driver?.last_name || ''}
                  </span>
                </div>
                <div className="info-item">
                  <label>{t('Contact')}:</label>
                  <span>{reportData.driver?.contact_number || t('N/A')}</span>
                </div>
                <div className="info-item">
                  <label>{t('Address')}:</label>
                  <span>{reportData.driver?.address1 || t('N/A')}</span>
                </div>
              </div>
            </div>

            {/* Report Dates */}
            <div className="report-dates">
              <div className="info-grid">
                <div className="info-item">
                  <label>{t('Report Date')}:</label>
                  <span>
                    {reportData.driver?.report_date
                      ? moment(reportData.driver.report_date).format('YYYY-MM-DD')
                      : t('N/A')}
                  </span>
                </div>
                <div className="info-item">
                  <label>{t('Generation Date')}:</label>
                  <span>
                    {reportData.driver?.generate_date
                      ? moment(reportData.driver.generate_date).format('YYYY-MM-DD')
                      : t('N/A')}
                  </span>
                </div>
                <div className="info-item">
                  <label>{t('Search Period')}:</label>
                  <span>
                    {reportData.driver?.search_from || t('N/A')} -{' '}
                    {reportData.driver?.search_to || t('N/A')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Loads Section */}
          <div className="loads-section">
            <h4>{t('Load Details')}</h4>
            <div className="table-container">
              <table className="loads-table">
                <thead>
                  <tr>
                    <th>{t('Load #')}</th>
                    <th>{t('Pickup')}</th>
                    <th>{t('Delivery')}</th>
                    <th>{t('Rate')}</th>
                    <th>{t('Load Total Pay')}</th>
                    <th>{t('Chargebag')}</th>
                    <th>{t('Notes')}</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.loads && reportData.loads.length > 0 ? (
                    reportData.loads.map((load, index) => (
                      <>
                        <tr key={`load-${index}`}>
                          <td>{load['Load #'] || t('N/A')}</td>
                          <td>{load.Pickup || t('N/A')}</td>
                          <td>{load.Delivery || t('N/A')}</td>
                          <td>{load.Formula || t('N/A')}</td>
                          <td className="total-pay">{load.Result || t('N/A')}</td>
                          <td className="chargebag">
                            {load['Chargebag Deduction'] && (
                              <span className="negative-amount">
                                - {load['Chargebag Deduction']}
                              </span>
                            )}
                          </td>
                          <td>{load.Notes || '-'}</td>
                        </tr>
                        {load['Other Payments'] && load['Other Payments'].length > 0 && (
                          <tr className="other-payments">
                            <td colSpan="7">
                              <div className="other-payments-container">
                                <table className="other-payments-table">
                                  <thead>
                                    <tr>
                                      <th>{t('Payment Type')}</th>
                                      <th>{t('Formula')}</th>
                                      <th>{t('Amount')}</th>
                                      <th>{t('Note')}</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {load['Other Payments'].map((payment, pIndex) => (
                                      <tr key={`payment-${pIndex}`}>
                                        <td>{payment.pay_type}</td>
                                        <td>{payment.formula}</td>
                                        <td className={`payment-amount ${payment.result?.startsWith('-') ? 'negative' : 'positive'}`}>
                                          {payment.result}
                                        </td>
                                        <td>{payment.note || '-'}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                        {t('No loads found for this period')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Expenses and Income Section */}
          <div className="expenses-section">
            {/* Additions Table */}
            <h4>{t('Additions')}</h4>
            <div className="table-container">
              <table className="expenses-table">
                <thead>
                  <tr>
                    <th>{t('Description')}</th>
                    <th>{t('Amount')}</th>
                    <th>{t('Type')}</th>
                    <th>{t('Date')}</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.expenses && reportData.expenses.filter(item => item.Type === 'Income').length > 0 ? (
                    reportData.expenses
                      .filter(item => item.Type === 'Income')
                      .map((expense, index) => (
                        <tr key={index}>
                          <td>{expense.Description || t('N/A')}</td>
                          <td className="positive-amount">+ {expense.Result || t('N/A')}</td>
                          <td>Addition</td>
                          <td>{expense.Date || t('N/A')}</td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                        {t('No additions found for this period')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Deductions Table */}
            <h4 style={{ marginTop: '20px' }}>{t('Deductions')}</h4>
            <div className="table-container">
              <table className="expenses-table">
                <thead>
                  <tr>
                    <th>{t('Description')}</th>
                    <th>{t('Amount')}</th>
                    <th>{t('Type')}</th>
                    <th>{t('Date')}</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.expenses && reportData.expenses.filter(item => item.Type === 'Expense').length > 0 ? (
                    reportData.expenses
                      .filter(item => item.Type === 'Expense')
                      .map((expense, index) => (
                        <tr key={index}>
                          <td>{expense.Description || t('N/A')}</td>
                          <td className="negative-amount">- {expense.Result || t('N/A')}</td>
                          <td>Deduction</td>
                          <td>{expense.Date || t('N/A')}</td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                        {t('No deductions found for this period')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary Section */}
          <div className="summary-section">
            <div className="summary-grid">
              <div className="summary-item">
                <label>{t('Total Load Pays')}:</label>
                <span className="positive-amount">+ {reportData.total_load_pays?.Result || '$0.00'}</span>
              </div>
              <div className="summary-item">
                <label>{t('Total Other Pays')}:</label>
                <span className="positive-amount">+ {reportData.total_other_pays?.Result || '$0.00'}</span>
              </div>
              <div className="summary-item">
                <label>{t('Total Deductions')}:</label>
                <span className="negative-amount">- {reportData.total_expenses?.Result || '$0.00'}</span>
              </div>
              <div className="summary-item">
                <label>{t('Total Additions')}:</label>
                <span className="positive-amount">+ {reportData.total_income?.Result || '$0.00'}</span>
              </div>
              <div className="summary-item">
                <label>{t('Escrow Deduction')}:</label>
                <span className="negative-amount">- {reportData.escrow_deduction?.Result || '$0.00'}</span>
              </div>
              <div className="summary-item total">
                <label>{t('Total Pay')}:</label>
                <span className="final-amount">{reportData.total_pay?.Result || '$0.00'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .other-payments-container {
          padding: 8px 16px;
          background-color: #f9fafb;
          border-left: 4px solid #e5e7eb;
          margin: 16px 0;
        }
        
        .loads-table tr {
          border-bottom: 1px solid #e2e8f0;
        }

        .loads-table tr:not(:last-child) {
          margin-bottom: 16px;
        }
        
        .other-payments-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0 8px;
          margin: 8px 0;
        }
        
        .other-payments-table th,
        .other-payments-table td {
          padding: 12px 8px;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .other-payments-table th {
          background-color: #f7fafc;
          font-weight: 600;
          color: #4a5568;
        }
        
        .payment-amount {
          font-weight: 600;
        }
        
        .payment-amount.positive {
          color: #059669;
        }
        
        .payment-amount.negative {
          color: #dc2626;
        }
        
        .negative-amount {
          color: #dc2626;
        }
        
        .positive-amount {
          color: #059669;
        }
        
        .final-amount {
          font-size: 1.25rem;
          font-weight: 700;
          color: #059669;
        }

        .loads-table {
          border-collapse: separate;
          border-spacing: 0 16px;
        }

        .loads-table tbody tr {
          background: white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .loads-table td {
          padding: 16px 8px;
        }
      `}</style>
    </div>
  );
};

export default AccountingPage;