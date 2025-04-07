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

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const data = await getDrivers();
        setDrivers(data);
      } catch (error) {
        setError(t('Failed to fetch drivers'));
      }
    };
    fetchDrivers();
  }, [t]);

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

  const generateReport = async (e) => {
    e.preventDefault();
    if (!validateFields()) return;

    try {
      setLoading(true);
      const data = {
        pay_from: dateRange.startDate,
        pay_to: dateRange.endDate,
        driver: Number(selectedDriver),
        notes: notes || '',
      };

      const response = await getDriverPayReport(data);
      setReportData(response);
      setError('');
    } catch (error) {
      setError(t('Failed to generate report'));
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    try {
      console.log('PDF yaratish jarayoni boshlandi');
      const blob = await pdf(<PayReportPDF reportData={reportData} />).toBlob();
      console.log('PDF blob yaratildi:', blob);
      
      const url = window.URL.createObjectURL(blob);
      console.log('URL yaratildi:', url);
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `driver-pay-report-${moment().format('YYYY-MM-DD')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      console.log('PDF yuklab olish jarayoni yakunlandi');
    } catch (error) {
      console.error('PDF yaratishda xatolik:', error);
      setError(t('Failed to generate PDF: ') + error.message);
    }
  };

  return (
    <div className="accounting-page">
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

      {reportData && (
        <div className="report-section">
          <div className="report-header">
            <div className="company-info">
              <h3>{reportData.company_info.name}</h3>
              <p>{reportData.company_info.address}</p>
              <p>{reportData.company_info.location}</p>
              <p>{t('Phone')}: {reportData.company_info.phone}</p>
              {reportData.company_info.fax && <p>{t('Fax')}: {reportData.company_info.fax}</p>}
            </div>

            <div className="driver-info">
              <h4>{t('Driver Information')}</h4>
              <div className="info-grid">
                <div className="info-item">
                  <label>{t('Name')}:</label>
                  <span>{reportData.driver_details.first_name} {reportData.driver_details.last_name}</span>
                </div>
                <div className="info-item">
                  <label>{t('Contact')}:</label>
                  <span>{reportData.driver_details.contact_number || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <label>{t('Address')}:</label>
                  <span>{reportData.driver_details.address1 || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="report-dates">
              <div className="info-grid">
                <div className="info-item">
                  <label>{t('Report Date')}:</label>
                  <span>{moment(reportData.driver_details.report_date).format('YYYY-MM-DD')}</span>
                </div>
                <div className="info-item">
                  <label>{t('Generation Date')}:</label>
                  <span>{moment(reportData.driver_details.generate_date).format('YYYY-MM-DD')}</span>
                </div>
                <div className="info-item">
                  <label>{t('Search Period')}:</label>
                  <span>{reportData.driver_details.search_from} - {reportData.driver_details.search_to}</span>
                </div>
              </div>
            </div>
          </div>

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
                  {reportData.loads?.map((load, index) => (
                    <tr key={index}>
                      <td>{load.load_number}</td>
                      <td>
                        <div className="load-details">
                          <span className="date">{load.pickup.date}</span>
                          <span className="location">{load.pickup.location}</span>
                        </div>
                      </td>
                      <td>
                        <div className="load-details">
                          <span className="date">{load.delivery.date}</span>
                          <span className="location">{load.delivery.location}</span>
                        </div>
                      </td>
                      <td className="rate">
                        <div className="rate-details">
                          <span className="amount">${load.rate.amount.toFixed(2)}</span>
                          <span className="calculation">* {load.rate.percentage}%</span>
                          <span className="total">${load.rate.total.toFixed(2)}</span>
                        </div>
                      </td>
                      <td>{load.notes}</td>
                      <td className="total-pay">${load.total_pay.toFixed(2)}</td>
                    </tr>
                  ))}
                  {(!reportData.loads || reportData.loads.length === 0) && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                        {t('No loads found for this period')}
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="summary-row">
                    <td colSpan="5">{t('Total Pay')}:</td>
                    <td className="grand-total">${reportData.total_pay.toFixed(2)} USD</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountingPage;