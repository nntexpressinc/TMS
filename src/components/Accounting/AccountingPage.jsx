import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getDrivers, getDriverPayReport } from '../../api/accounting';
import { pdf } from '@react-pdf/renderer';
import PayReportPDF from './PayReportPDF';
import './AccountingPage.css';
import moment from 'moment';

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
        setDrivers(data);
      } catch (err) {
        setError(t('Failed to fetch drivers'));
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
                {drivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.first_name} {driver.last_name}
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
                    <th>{t('Notes')}</th>
                    <th>{t('Total Pay')}</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.loads && reportData.loads.length > 0 ? (
                    reportData.loads.map((load, index) => (
                      <tr key={index}>
                        <td>{load['Load #'] || t('N/A')}</td>
                        <td>{load.Pickup || t('N/A')}</td>
                        <td>{load.Delivery || t('N/A')}</td>
                        <td>{load.Rate || t('N/A')}</td>
                        <td>{load.Notes || '-'}</td>
                        <td className="total-pay">{load['Total Pay'] || t('N/A')}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                        {t('No loads found for this period')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Expenses Section */}
          <div className="expenses-section">
            <h4>{t('Expenses and Income')}</h4>
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
                  {reportData.expenses && reportData.expenses.length > 0 ? (
                    reportData.expenses.map((expense, index) => (
                      <tr key={index}>
                        <td>{expense.Description || t('N/A')}</td>
                        <td>{expense.Amount || t('N/A')}</td>
                        <td>{expense.Type || t('N/A')}</td>
                        <td>{expense.Date || t('N/A')}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                        {t('No expenses found for this period')}
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
                <label>{t('Total Expenses')}:</label>
                <span>{reportData.total_expenses || t('N/A')}</span>
              </div>
              <div className="summary-item">
                <label>{t('Total Income')}:</label>
                <span>{reportData.total_income || t('N/A')}</span>
              </div>
              <div className="summary-item">
                <label>{t('Escrow Deduction')}:</label>
                <span>{reportData.escrow_deduction || t('N/A')}</span>
              </div>
              <div className="summary-item total">
                <label>{t('Total Pay')}:</label>
                <span>{reportData.total_pay || t('N/A')}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountingPage;