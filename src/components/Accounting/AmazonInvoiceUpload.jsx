import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { uploadInvoiceFile } from '../../api/accounting';
import './AmazonRelay.css';

const AmazonInvoiceUpload = ({ onUploadSuccess }) => {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);
  
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [formData, setFormData] = useState({
    work_period_start: '',
    work_period_end: '',
    invoice_date: '',
    payment_date: '',
    invoice_number: '',
    weekly_number: ''
  });
  
  // File validation settings
  const fileSizeLimit = 10485760; // 10MB
  const allowedFormats = ['.xlsx', '.xls'];
  
  const validateFile = (selectedFile) => {
    if (!selectedFile) {
      return { valid: false, error: t('No file selected') };
    }
    
    // Validate file size
    if (selectedFile.size > fileSizeLimit) {
      return { 
        valid: false, 
        error: `${t('File size must not exceed')} ${fileSizeLimit / 1048576}MB` 
      };
    }
    
    // Validate file format
    const fileExtension = '.' + selectedFile.name.split('.').pop().toLowerCase();
    if (!allowedFormats.includes(fileExtension)) {
      return { 
        valid: false, 
        error: `${t('Only')} ${allowedFormats.join(', ')} ${t('files are allowed')}` 
      };
    }
    
    return { valid: true };
  };
  
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    const validation = validateFile(selectedFile);
    if (!validation.valid) {
      toast.error(validation.error);
      e.target.value = null;
      return;
    }
    
    setFile(selectedFile);
  };
  
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const validation = validateFile(droppedFile);
      
      if (!validation.valid) {
        toast.error(validation.error);
        return;
      }
      
      setFile(droppedFile);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      toast.error(t('Please select a file'));
      return;
    }
    
    setUploading(true);
    
    try {
      const submitData = new FormData();
      submitData.append('file', file);
      
      // Add optional fields if provided
      if (formData.work_period_start) submitData.append('work_period_start', formData.work_period_start);
      if (formData.work_period_end) submitData.append('work_period_end', formData.work_period_end);
      if (formData.invoice_date) submitData.append('invoice_date', formData.invoice_date);
      if (formData.payment_date) submitData.append('payment_date', formData.payment_date);
      if (formData.invoice_number) submitData.append('invoice_number', formData.invoice_number);
      if (formData.weekly_number) submitData.append('weekly_number', formData.weekly_number);
      
      const response = await uploadInvoiceFile(submitData);
      
      // Backend returns { success, type, message, data }
      if (response && response.success) {
        const invoiceData = response.data;
        toast.success(response.message || t('Invoice uploaded successfully!'));
        
        // Reset form
        setFile(null);
        setFormData({
          work_period_start: '',
          work_period_end: '',
          invoice_date: '',
          payment_date: '',
          invoice_number: '',
          weekly_number: ''
        });
        if (fileInputRef.current) {
          fileInputRef.current.value = null;
        }
        
        // Notify parent component with invoice data
        if (onUploadSuccess) {
          onUploadSuccess(invoiceData);
        }
      } else {
        toast.error(response.error || t('Upload failed. Please try again.'));
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error?.response?.data?.error || 
                          error?.response?.data?.detail || 
                          error?.message || 
                          t('Failed to upload file');
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };
  
  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  return (
    <div className="amazon-relay-upload">
      <div className="upload-header">
        <h3>{t('Amazon Relay Invoice Upload')}</h3>
        <p className="upload-subtitle">{t('Upload Excel invoice file for processing and comparison')}</p>
      </div>
      
      <form onSubmit={handleSubmit} className="upload-form">
        {/* Drag & Drop Zone */}
        <div 
          className={`drag-drop-zone ${dragActive ? 'drag-active' : ''} ${file ? 'has-file' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleBrowseClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={allowedFormats.join(',')}
            onChange={handleFileChange}
            disabled={uploading}
            style={{ display: 'none' }}
          />
          
          <div className="drag-drop-content">
            {file ? (
              <>
                <svg className="file-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                <p className="file-name">{file.name}</p>
                <p className="file-size">{(file.size / 1024).toFixed(2)} KB</p>
                <button 
                  type="button" 
                  className="change-file-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = null;
                    }
                  }}
                  disabled={uploading}
                >
                  {t('Change File')}
                </button>
              </>
            ) : (
              <>
                <svg className="upload-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                <p className="drag-text">{t('Drag & drop your Excel file here')}</p>
                <p className="or-text">{t('or')}</p>
                <button type="button" className="browse-btn" disabled={uploading}>
                  {t('Browse Files')}
                </button>
                <p className="file-hints">
                  {t('Supported formats')}: {allowedFormats.join(', ')} • {t('Max size')}: {fileSizeLimit / 1048576}MB
                </p>
              </>
            )}
          </div>
        </div>
        
        {/* Additional Fields */}
        <div className="additional-fields" style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          <div className="form-field">
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: '#374151' }}>
              {t('Work Period Start')}
            </label>
            <input
              type="date"
              name="work_period_start"
              value={formData.work_period_start}
              onChange={handleInputChange}
              disabled={uploading}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
            />
          </div>
          
          <div className="form-field">
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: '#374151' }}>
              {t('Work Period End')}
            </label>
            <input
              type="date"
              name="work_period_end"
              value={formData.work_period_end}
              onChange={handleInputChange}
              disabled={uploading}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
            />
          </div>
          
          <div className="form-field">
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: '#374151' }}>
              {t('Invoice Date')}
            </label>
            <input
              type="date"
              name="invoice_date"
              value={formData.invoice_date}
              onChange={handleInputChange}
              disabled={uploading}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
            />
          </div>
          
          <div className="form-field">
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: '#374151' }}>
              {t('Payment Date')}
            </label>
            <input
              type="date"
              name="payment_date"
              value={formData.payment_date}
              onChange={handleInputChange}
              disabled={uploading}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
            />
          </div>
          
          <div className="form-field">
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: '#374151' }}>
              {t('Invoice Number')}
            </label>
            <input
              type="text"
              name="invoice_number"
              value={formData.invoice_number}
              onChange={handleInputChange}
              placeholder="INV-2025-001"
              disabled={uploading}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
            />
          </div>
          
          <div className="form-field">
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: '#374151' }}>
              {t('Weekly Number')}
            </label>
            <input
              type="text"
              name="weekly_number"
              value={formData.weekly_number}
              onChange={handleInputChange}
              placeholder="WK-01"
              disabled={uploading}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
            />
          </div>
        </div>
        
        {/* Upload Button */}
        <div className="form-actions">
          <button 
            type="submit" 
            className="primary-button upload-submit-btn" 
            disabled={!file || uploading}
          >
            {uploading ? (
              <>
                <span className="spinner"></span>
                {t('Processing...')}
              </>
            ) : (
              <>
                <svg className="upload-btn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                {t('Upload & Process')}
              </>
            )}
          </button>
        </div>
      </form>
      
      {/* Info Section */}
      <div className="upload-info">
        <h4>{t('Supported File Formats')}</h4>
        <ul>
          <li>
            <strong>{t('Old Format')}:</strong> {t('Trip ID, Load ID, Gross Pay')}
          </li>
          <li>
            <strong>{t('New Format')}:</strong> {t('PO/Load, Invoice Amount')}
          </li>
        </ul>
        <p className="info-note">
          {t('The system automatically detects and processes both formats')}
        </p>
      </div>
    </div>
  );
};

export default AmazonInvoiceUpload;
