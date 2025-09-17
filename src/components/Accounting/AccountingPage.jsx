import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import { getDrivers, getDriverPayList, getDriverPayReport, uploadPayReportPDF, updateDriverPay, updateDriverPayBasicFields } from '../../api/accounting';
import { getAllLoads } from '../../api/loads';
import { pdf } from '@react-pdf/renderer';
import PayReportPDF from './PayReportPDF';
import CompanyDriverPDF from './CompanyDriverPDF';
import './AccountingPage.css';
import moment from 'moment';

const API_URL = 'https://nnt.nntexpressinc.com';

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
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [weeklyNumber, setWeeklyNumber] = useState('');
  const [loadDriverPay, setLoadDriverPay] = useState([]); 
  const [loadCompanyDriverPay, setLoadCompanyDriverPay] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loads, setLoads] = useState([]);
  const [error, setError] = useState('');
  const [driverPayList, setDriverPayList] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchTimeout = useRef(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Modal state for view/edit
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchDrivers = async () => {
      try {
        const data = await getDrivers();
        if (isMounted) {
          setDrivers(ensureArray(data));
        }
      } catch (err) {
        if (isMounted) {
          setError(t('Failed to fetch drivers'));
          setDrivers([]);
        }
      }
    };

    const fetchLoads = async () => {
      try {
        const data = await getAllLoads();
        if (isMounted) {
          setLoads(ensureArray(data));
        }
      } catch (err) {
        if (isMounted) {
          setLoads([]);
        }
      }
    };

    fetchDrivers();
    fetchLoads();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const fetchDriverPayList = async () => {
      try {
        setLoading(true);
        const params = {};
        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
        }
        const data = await getDriverPayList(params);
        setDriverPayList(ensureArray(data));
      } catch (err) {
        setError(t('Failed to fetch driver pay list'));
        setDriverPayList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDriverPayList();
  }, [searchQuery, refreshTrigger]);

  // Debounced search
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetchDriverPayList();
    }, 500);
    return () => clearTimeout(searchTimeout.current);
  }, [searchQuery]);

  // Open modal for view/edit
  const handleViewEdit = (pay) => {
    setEditData(pay);
    setShowEditModal(true);
    setError('');
  };

  // Close modal
  const handleCloseModal = () => {
    setShowEditModal(false);
    setEditData(null);
    setError('');
  };

  // Handle file upload for file/cd_file
  const handleFileChange = (e, field) => {
    if (!editData) return;
    
    const file = e.target.files[0];
    if (file) {
      // File size validation (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError(t('File size must be less than 10MB'));
        return;
      }
      
      // File type validation
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/png',
        'image/jpeg',
        'image/jpg'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        setError(t('Invalid file type. Please select PDF, DOC, DOCX, PNG, JPG, or JPEG files only.'));
        return;
      }
      
      console.log(`Selecting ${field}:`, file.name, 'Size:', file.size, 'Type:', file.type);
      setEditData({ ...editData, [field]: file });
      
      // Clear any previous error
      setError('');
    }
  };

  // Download file helper
  const handleDownloadFile = (url) => {
    if (!url) return;
    window.open(getFullPdfUrl(url), '_blank');
  };

  // Save edited data (PUT request with file/cd_file if changed)
  const handleSaveEdit = async () => {
    try {
      setLoading(true);
      setError('');
      
      const hasFileUpload = (editData.file instanceof File) || (editData.cd_file instanceof File);

      if (hasFileUpload) {
        const formData = new FormData();
        formData.append('notes', editData.notes || '');
        formData.append('invoice_number', editData.invoice_number || '');
        formData.append('weekly_number', editData.weekly_number || '');
        
        if (editData.file instanceof File) {
          formData.append('file', editData.file);
        }
        
        if (editData.cd_file instanceof File) {
          formData.append('cd_file', editData.cd_file);
        }
        
        await updateDriverPay(editData.id, formData);
      } else {
        const updateData = {
          notes: editData.notes || '',
          invoice_number: editData.invoice_number || '',
          weekly_number: editData.weekly_number || '',
        };
        
        await updateDriverPayBasicFields(editData.id, updateData);
      }
      
      // Trigger refresh by incrementing refreshTrigger
      setRefreshTrigger(prev => prev + 1);
      setShowEditModal(false);
      setEditData(null);
    } catch (err) {
      setError(t('Failed to save changes'));
    } finally {
      setLoading(false);
    }
  };

  const fetchDriverPayList = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      const data = await getDriverPayList(params);
      setDriverPayList(ensureArray(data));
    } catch (err) {
      setError(t('Failed to fetch driver pay list'));
      setDriverPayList([]);
    } finally {
      setLoading(false);
    }
  };

  // Jadval uchun front-endda search filter
  const filteredDriverPayList = useMemo(() => {
    if (!searchQuery.trim()) return driverPayList;
    const query = searchQuery.trim().toLowerCase();
    return driverPayList.filter(pay => {
      const invoice = (pay.invoice_number || '').toLowerCase();
      const weekly = (pay.weekly_number || '').toLowerCase();
      const driverName = ((pay.driver?.user?.first_name || '') + ' ' + (pay.driver?.user?.last_name || '')).toLowerCase();
      return (
        invoice.includes(query) ||
        weekly.includes(query) ||
        driverName.includes(query)
      );
    });
  }, [searchQuery, driverPayList]);

  const validateFields = () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      setError(t('Please select a valid date range'));
      return false;
    }
    if (!selectedDriver) {
      setError(t('Please select a driver'));
      return false;
    }
    if (!invoiceNumber) {
      setError(t('Please enter an invoice number'));
      return false;
    }
    if (!weeklyNumber) {
      setError(t('Please enter a weekly number'));
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
      const requestData = {
        pay_from: dateRange.startDate,
        pay_to: dateRange.endDate,
        driver: Number(selectedDriver),
        notes: notes || '',
        invoice_number: invoiceNumber,
        weekly_number: weeklyNumber,
        load_driver_pay: Array.isArray(loadDriverPay) ? loadDriverPay : [],
        load_company_driver_pay: Array.isArray(loadCompanyDriverPay) ? loadCompanyDriverPay : [],
      };
      
      console.log('Sending report request with data:', {
        ...requestData,
        load_driver_pay_length: requestData.load_driver_pay.length,
        load_company_driver_pay_length: requestData.load_company_driver_pay.length,
      });

      const response = await getDriverPayReport(requestData);
      console.log('Report data received:', response);
      setReportData(response);
      setError('');

      await generateAndUploadPDF(response);

    } catch (err) {
      console.error('Error fetching report:', err);
      setError(t('Failed to generate report'));
    } finally {
      setLoading(false);
    }
  };

  const generateAndUploadPDF = async (reportData) => {
    try {
      // 1. Generate and download Driver Pay PDF
      const driverPayBlob = await pdf(<PayReportPDF reportData={reportData} />).toBlob();
      const driverPayUrl = window.URL.createObjectURL(driverPayBlob);
      const driverPayLink = document.createElement('a');
      driverPayLink.href = driverPayUrl;
      driverPayLink.download = `driver-pay-report-${moment().format('YYYY-MM-DD')}.pdf`;
      document.body.appendChild(driverPayLink);
      driverPayLink.click();
      document.body.removeChild(driverPayLink);
      window.URL.revokeObjectURL(driverPayUrl);
      
      // Upload driver pay PDF to server if pay_id exists
      if (reportData.pay_id) {
        await uploadPayReportPDF(reportData.pay_id, driverPayBlob);
        console.log('Driver Pay PDF successfully uploaded to server');
      }

      // 2. Generate and download Company Driver PDF if data exists
      if (reportData.company_driver_data) {
        const companyDriverBlob = await pdf(
          <CompanyDriverPDF 
            data={reportData.company_driver_data}
            driver={reportData.driver}
            search_from={reportData.driver?.search_from}
            search_to={reportData.driver?.search_to}
          />
        ).toBlob();
        const companyDriverUrl = window.URL.createObjectURL(companyDriverBlob);
        const companyDriverLink = document.createElement('a');
        companyDriverLink.href = companyDriverUrl;
        companyDriverLink.download = `company-driver-report-${moment().format('YYYY-MM-DD')}.pdf`;
        document.body.appendChild(companyDriverLink);
        companyDriverLink.click();
        document.body.removeChild(companyDriverLink);
        window.URL.revokeObjectURL(companyDriverUrl);
        console.log('Company Driver PDF generated and downloaded');
      }

      // Reset form and update list
      fetchDriverPayList();
      setShowCreateForm(false);
      setReportData(null);
      setInvoiceNumber('');
      setWeeklyNumber('');
      setNotes('');
      setSelectedDriver('');
      setDateRange({ startDate: '', endDate: '' });
    } catch (err) {
      console.error('PDF generation/upload error:', err);
      setError(t('Failed to generate/upload PDF: ') + err.message);
    }
  };

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

  const getFullPdfUrl = (fileUrl) => {
    if (!fileUrl) return null;
    if (fileUrl.startsWith('http')) return fileUrl;
    return `${API_URL}${fileUrl}`;
  };

  // Helper to format amount
  const formatAmount = (amount) => {
    if (amount === null || amount === undefined) return '$0.00';
    let num = amount;
    if (typeof num === 'string') {
      num = num.replace('$', '');
      num = parseFloat(num);
    }
    if (isNaN(num)) return '$0.00';
    return '$' + num.toFixed(2);
  };

  // Handle load selection for driver pay
  const handleLoadDriverPayChange = (selectedOptions) => {
    const selectedIds = selectedOptions ? selectedOptions.map(option => option.value) : [];
    console.log('Selected driver pay loads:', selectedIds);
    setLoadDriverPay(selectedIds);
  };

  // Handle load selection for company driver pay
  const handleLoadCompanyDriverPayChange = (selectedOptions) => {
    const selectedIds = selectedOptions ? selectedOptions.map(option => option.value) : [];
    console.log('Selected company driver pay loads:', selectedIds);
    setLoadCompanyDriverPay(selectedIds);
  };

  return (
    <div className="accounting-page">
      {!showCreateForm ? (
        <div className="list-section">
          <div className="section-header-flex">
            <h2 className="section-title">Driver Pay Reports</h2>
            <button
              className="btn btn-gradient-primary"
              onClick={() => setShowCreateForm(true)}
            >
              <span className="btn-icon">➕</span> Create New Report
            </button>
          </div>

          <div className="search-section" style={{ marginBottom: 18 }}>
            <div className="search-row-flex" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="form-group" style={{ width: '100%' }}>
                <label style={{ fontWeight: 500, color: '#2c3e50', marginBottom: 4 }}>Search</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by invoice number, weekly number, or driver name"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    fontSize: 15,
                    background: '#f9fafb',
                    outline: 'none',
                    marginTop: 2
                  }}
                />
              </div>
            </div>
          </div>

          <div className="table-section">
            <div className="table-container" style={{ borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 12px 0 rgba(0,0,0,0.04)' }}>
              <table className="pay-list-table" style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
                <thead style={{ background: '#f3f4f6' }}>
                  <tr>
                    <th style={{ padding: '12px 8px', fontWeight: 600, color: '#374151' }}>Invoice #</th>
                    <th style={{ padding: '12px 8px', fontWeight: 600, color: '#374151' }}>Weekly #</th>
                    <th style={{ padding: '12px 8px', fontWeight: 600, color: '#374151' }}>Driver</th>
                    <th style={{ padding: '12px 8px', fontWeight: 600, color: '#374151' }}>Pay Period</th>
                    <th style={{ padding: '12px 8px', fontWeight: 600, color: '#374151' }}>Amount</th>
                    <th style={{ padding: '12px 8px', fontWeight: 600, color: '#374151' }}>Created At</th>
                    <th style={{ padding: '12px 8px', fontWeight: 600, color: '#374151' }}>File</th>
                    <th style={{ padding: '12px 8px', fontWeight: 600, color: '#374151' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="text-center" style={{ textAlign: 'center', padding: 24 }}>
                        Loading...
                      </td>
                    </tr>
                  ) : filteredDriverPayList.length > 0 ? (
                    filteredDriverPayList.map((pay) => (
                      <tr className="pay-list-row" key={pay.id} style={{ borderBottom: '1px solid #f1f1f1' }}>
                        <td style={{ padding: '10px 8px' }}>{pay.invoice_number || 'N/A'}</td>
                        <td style={{ padding: '10px 8px' }}>{pay.weekly_number || 'N/A'}</td>
                        <td style={{ padding: '10px 8px' }}>{pay.driver?.user?.first_name || ''} {pay.driver?.user?.last_name || ''}</td>
                        <td style={{ padding: '10px 8px' }}>{pay.pay_from && pay.pay_to ? `${moment(pay.pay_from).format('MM/DD/YYYY')} - ${moment(pay.pay_to).format('MM/DD/YYYY')}` : 'N/A'}</td>
                        <td style={{ padding: '10px 8px' }}>{formatAmount(pay.amount)}</td>
                        <td style={{ padding: '10px 8px' }}>{pay.created_at ? moment(pay.created_at).format('MM/DD/YYYY HH:mm') : 'N/A'}</td>
                        <td style={{ padding: '10px 8px' }}>
                          {pay.file ? (
                            <a
                              href={getFullPdfUrl(pay.file)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="file-link"
                              style={{ color: '#2563eb', textDecoration: 'underline', fontWeight: 500 }}
                            >
                              View File
                            </a>
                          ) : (
                            <span className="no-file" style={{ color: '#b91c1c' }}>No file</span>
                          )}
                        </td>
                        <td style={{ padding: '10px 8px' }}>
                          <button
                            className="btn btn-sm btn-primary"
                            style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', fontSize: 14, cursor: 'pointer', fontWeight: 500 }}
                            onClick={() => handleViewEdit(pay)}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center" style={{ textAlign: 'center', padding: 24 }}>
                        No driver pay reports found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="create-form-section">
          <div className="section-header-flex">
            <h2 className="section-title">Create Driver Pay Report</h2>
            <button
              className="btn btn-gradient-secondary"
              onClick={() => {
                setShowCreateForm(false);
                setReportData(null);
                setError('');
              }}
            >
              <span className="btn-icon">←</span> Back to List
            </button>
          </div>

          <div className="search-section">
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
                    <option value="">{t('Select Driver')}</option>
                    {drivers.map((driver) => (
                      <option key={driver.id} value={driver.id}>
                        {driver.user?.first_name} {driver.user?.last_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="invoiceNumber">{t('Invoice Number')}</label>
                  <input
                    type="text"
                    id="invoiceNumber"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="weeklyNumber">{t('Weekly Number')}</label>
                  <input
                    type="text"
                    id="weeklyNumber"
                    value={weeklyNumber}
                    onChange={(e) => setWeeklyNumber(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="notes">{t('Notes')}</label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
              {/* Yangi load_driver_pay va load_company_driver_pay uchun multi-select */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="loadDriverPay">Load Driver Pay (select, optional)</label>
                  <Select
                    isMulti
                    options={loads.map(load => ({
                      value: load.id,
                      label: `Load #${load.load_id || load.id} | Reference: ${load.reference_id || '-'}`
                    }))}
                    value={loadDriverPay.map(id => {
                      const found = loads.find(load => load.id === id);
                      return found ? {
                        value: found.id,
                        label: `Load #${found.load_id || found.id} | Reference: ${found.reference_id || '-'}`
                      } : { value: id, label: `Load #${id}` };
                    })}
                    onChange={handleLoadDriverPayChange}
                    className="modern-multi-select"
                    classNamePrefix="select"
                    placeholder="Select loads..."
                  />
                  <small>You can select multiple loads</small>
                </div>
                <div className="form-group">
                  <label htmlFor="loadCompanyDriverPay">Load Company Driver Pay (select, optional)</label>
                  <Select
                    isMulti
                    options={loads.map(load => ({
                      value: load.id,
                      label: `Load #${load.load_id || load.id} | Reference: ${load.reference_id || '-'}`
                    }))}
                    value={loadCompanyDriverPay.map(id => {
                      const found = loads.find(load => load.id === id);
                      return found ? {
                        value: found.id,
                        label: `Load #${found.load_id || found.id} | Reference: ${found.reference_id || '-'}`
                      } : { value: id, label: `Load #${id}` };
                    })}
                    onChange={handleLoadCompanyDriverPayChange}
                    className="modern-multi-select"
                    classNamePrefix="select"
                    placeholder="Select loads..."
                  />
                  <small>You can select multiple loads</small>
                </div>
              </div>
              {error && <div className="error-message">{error}</div>}
              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {t('Generate Report')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit/View Modal */}
      {showEditModal && editData && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.18)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content" style={{ background: '#fff', padding: '28px 22px', borderRadius: 14, minWidth: 340, maxWidth: 420, width: '100%', position: 'relative', boxShadow: '0 4px 32px 0 rgba(0,0,0,0.10)' }}>
            <h3 style={{ marginBottom: 18, fontWeight: 600, fontSize: 20, color: '#2c3e50', textAlign: 'center' }}>{t('View/Edit Driver Pay Report')}</h3>
            <button onClick={handleCloseModal} style={{ position: 'absolute', top: 10, right: 14, fontSize: 22, border: 'none', background: 'none', cursor: 'pointer', color: '#aaa' }}>&times;</button>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ color: '#4a5568', fontWeight: 500 }}>{t('Driver')}:</span>
                <span style={{ color: '#2c3e50', fontWeight: 500 }}>{editData.driver?.user?.first_name} {editData.driver?.user?.last_name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ color: '#4a5568', fontWeight: 500 }}>{t('Pay Period')}:</span>
                <span style={{ color: '#2c3e50' }}>{editData.pay_from} - {editData.pay_to}</span>
              </div>
              <div style={{ marginBottom: 6 }}>
                <label style={{ color: '#4a5568', fontWeight: 500, marginBottom: 2, display: 'block' }}>{t('Invoice Number')}</label>
                <input type="text" value={editData.invoice_number || ''} onChange={e => setEditData({ ...editData, invoice_number: e.target.value })} style={{ width: '100%', padding: '8px 10px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 14 }} />
              </div>
              <div style={{ marginBottom: 6 }}>
                <label style={{ color: '#4a5568', fontWeight: 500, marginBottom: 2, display: 'block' }}>{t('Weekly Number')}</label>
                <input type="text" value={editData.weekly_number || ''} onChange={e => setEditData({ ...editData, weekly_number: e.target.value })} style={{ width: '100%', padding: '8px 10px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 14 }} />
              </div>
              <div style={{ marginBottom: 6 }}>
                <label style={{ color: '#4a5568', fontWeight: 500, marginBottom: 2, display: 'block' }}>{t('Notes')}</label>
                <textarea value={editData.notes || ''} onChange={e => setEditData({ ...editData, notes: e.target.value })} style={{ width: '100%', padding: '8px 10px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 14, minHeight: 48 }} />
              </div>
              {/* Company Driver Fields */}
              {editData.company_driver_data && (
                <div style={{ background: '#f7fafc', padding: 10, borderRadius: 8, margin: '8px 0' }}>
                  <b style={{ color: '#2c3e50', fontWeight: 600 }}>{t('Company Driver Data')}</b>
                  <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div><b style={{ color: '#4a5568', fontWeight: 500 }}>{t('Total Miles')}:</b> <span style={{ color: '#2c3e50' }}>{editData.company_driver_data.total_miles}</span></div>
                    <div><b style={{ color: '#4a5568', fontWeight: 500 }}>{t('Miles Rate')}:</b> <span style={{ color: '#2c3e50' }}>{editData.company_driver_data.miles_rate}</span></div>
                    <div><b style={{ color: '#4a5568', fontWeight: 500 }}>{t('Company Driver Pay')}:</b> <span style={{ color: '#2c3e50' }}>{editData.company_driver_data.company_driver_pay}</span></div>
                  </div>
                </div>
              )}
              {/* File upload/download */}
              <div style={{ marginBottom: 6 }}>
                <label style={{ color: '#4a5568', fontWeight: 500, marginBottom: 2, display: 'block' }}>{t('File')}</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {editData.file && typeof editData.file === 'string' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 13, color: '#6b7280' }}>Current file:</span>
                      <button 
                        type="button" 
                        onClick={() => handleDownloadFile(editData.file)} 
                        style={{ 
                          background: '#10b981', 
                          color: '#fff', 
                          border: 'none', 
                          borderRadius: 4, 
                          padding: '4px 10px', 
                          fontSize: 13, 
                          cursor: 'pointer',
                          fontWeight: 500
                        }}
                      >
                        {t('Download Current File')}
                      </button>
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <input 
                      type="file" 
                      onChange={e => handleFileChange(e, 'file')} 
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                      style={{ 
                        padding: '6px 8px',
                        border: '1px solid #e2e8f0',
                        borderRadius: 4,
                        fontSize: 13,
                        background: '#f9fafb'
                      }} 
                    />
                    {editData.file instanceof File && (
                      <div style={{ 
                        fontSize: 12, 
                        color: '#10b981', 
                        fontWeight: 500,
                        padding: '4px 8px',
                        background: '#f0fdf4',
                        borderRadius: 4,
                        border: '1px solid #bbf7d0'
                      }}>
                        ✓ New file selected: {editData.file.name}
                      </div>
                    )}
                    <small style={{ fontSize: 11, color: '#6b7280' }}>
                      Supported formats: PDF, DOC, DOCX, PNG, JPG, JPEG
                    </small>
                  </div>
                </div>
              </div>
              {/* <div style={{ marginBottom: 6 }}>
                <label style={{ color: '#4a5568', fontWeight: 500, marginBottom: 2, display: 'block' }}>{t('CD File')}</label>
                {editData.cd_file && typeof editData.cd_file === 'string' && (
                  <button type="button" onClick={() => handleDownloadFile(editData.cd_file)} style={{ marginRight: 10, background: '#4d9ef0', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', fontSize: 13, cursor: 'pointer' }}>{t('Download')}</button>
                )}
                <input type="file" onChange={e => handleFileChange(e, 'cd_file')} style={{ marginTop: 4 }} />
              </div> */}
              {error && (
                <div style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: 6,
                  padding: '8px 12px',
                  marginBottom: 10,
                  fontSize: 13,
                  color: '#dc2626',
                  fontWeight: 500
                }}>
                  {error}
                </div>
              )}
              <div style={{ display: 'flex', gap: 10, marginTop: 10, justifyContent: 'flex-end' }}>
                <button 
                  className="btn btn-primary" 
                  onClick={handleSaveEdit} 
                  disabled={loading}
                  style={{
                    background: loading ? '#9ca3af' : '#2563eb',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '8px 16px',
                    fontSize: 14,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: 500
                  }}
                >
                  {loading ? t('Saving...') : t('Save')}
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={handleCloseModal}
                  style={{
                    background: '#f3f4f6',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: 6,
                    padding: '8px 16px',
                    fontSize: 14,
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                >
                  {t('Cancel')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountingPage;