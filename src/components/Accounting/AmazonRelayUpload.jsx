import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { uploadAmazonRelayFile } from '../../api/paySystem';
import './AmazonRelay.css';

const AmazonRelayUpload = ({ onUploadSuccess }) => {
  const { t } = useTranslation();
  
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    work_period_start: '',
    work_period_end: '',
    invoice_date: '',
    payment_date: '',
    invoice_number: '',
    weekly_number: '',
  });
  
  // Default file validation settings
  const fileSizeLimit = 10485760; // 10MB
  const allowedFormats = ['.xlsx', '.xls'];
  
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (!selectedFile) {
      return;
    }
    
    // Validate file size
    if (selectedFile.size > fileSizeLimit) {
      toast.error(`${t('File size must not exceed')} ${fileSizeLimit / 1048576}MB`);
      e.target.value = null;
      return;
    }
    
    // Validate file format
    const fileExtension = '.' + selectedFile.name.split('.').pop().toLowerCase();
    if (!allowedFormats.includes(fileExtension)) {
      toast.error(`${t('Only')} ${allowedFormats.join(', ')} ${t('files are allowed')}`);
      e.target.value = null;
      return;
    }
    
    setFile(selectedFile);
  };
  
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      toast.error(t('Please select a file'));
      return;
    }
    
    if (!formData.work_period_start || !formData.work_period_end) {
      toast.error(t('Work period start and end dates are required'));
      return;
    }
    
    setUploading(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('file', file);
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      const response = await uploadAmazonRelayFile(formDataToSend);
      
      if (response && response.id) {
        toast.success(t('File uploaded successfully!'));
        
        // Reset form
        setFile(null);
        setFormData({
          work_period_start: '',
          work_period_end: '',
          invoice_date: '',
          payment_date: '',
          invoice_number: '',
          weekly_number: '',
        });
        
        // Reset file input
        const fileInput = document.getElementById('amazon-relay-file');
        if (fileInput) fileInput.value = null;
        
        // Notify parent component
        if (onUploadSuccess) {
          onUploadSuccess(response);
        }
      } else {
        toast.error(t('Upload failed. Please try again.'));
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error?.response?.data?.detail || 
                          error?.response?.data?.error || 
                          error?.message || 
                          t('Failed to upload file');
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className="amazon-relay-upload">
      <div className="upload-header">
        <h3>{t('Amazon Relay Payment Upload')}</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="upload-form">
        {/* File Upload */}
        <div className="form-group full-width">
          <label htmlFor="amazon-relay-file">
            {t('Excel File')} <span className="required">*</span>
          </label>
          <input
            id="amazon-relay-file"
            type="file"
            accept={allowedFormats.join(',')}
            onChange={handleFileChange}
            disabled={uploading}
            required
          />
          {file && file.name && (
            <div className="selected-file">
              <small>{t('Selected')}: {file.name}</small>
            </div>
          )}
          <div className="field-hints">
            <small>
              {t('Max size')}: {fileSizeLimit / 1048576}MB. {t('Formats')}: {allowedFormats.join(', ')}
            </small>
          </div>
        </div>
        
        {/* Work Period */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="work-period-start">
              {t('Work Period Start')} <span className="required">*</span>
            </label>
            <input
              id="work-period-start"
              type="date"
              value={formData.work_period_start}
              onChange={(e) => handleInputChange('work_period_start', e.target.value)}
              disabled={uploading}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="work-period-end">
              {t('Work Period End')} <span className="required">*</span>
            </label>
            <input
              id="work-period-end"
              type="date"
              value={formData.work_period_end}
              onChange={(e) => handleInputChange('work_period_end', e.target.value)}
              disabled={uploading}
              required
            />
          </div>
        </div>
        
        {/* Invoice and Payment Dates */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="invoice-date">{t('Invoice Date')}</label>
            <input
              id="invoice-date"
              type="date"
              value={formData.invoice_date}
              onChange={(e) => handleInputChange('invoice_date', e.target.value)}
              disabled={uploading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="payment-date">{t('Payment Date')}</label>
            <input
              id="payment-date"
              type="date"
              value={formData.payment_date}
              onChange={(e) => handleInputChange('payment_date', e.target.value)}
              disabled={uploading}
            />
          </div>
        </div>
        
        {/* Invoice and Weekly Numbers */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="invoice-number">{t('Invoice Number')}</label>
            <input
              id="invoice-number"
              type="text"
              value={formData.invoice_number}
              onChange={(e) => handleInputChange('invoice_number', e.target.value)}
              placeholder="INV-001"
              disabled={uploading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="weekly-number">{t('Weekly Number')}</label>
            <input
              id="weekly-number"
              type="text"
              value={formData.weekly_number}
              onChange={(e) => handleInputChange('weekly_number', e.target.value)}
              placeholder="WK-01"
              disabled={uploading}
            />
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="primary-button" 
            disabled={!file || uploading}
          >
            {uploading ? t('Uploading...') : t('Upload Payment File')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AmazonRelayUpload;
