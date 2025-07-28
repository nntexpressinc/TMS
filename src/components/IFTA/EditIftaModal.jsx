import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { updateIftaRecord } from '../../api/ifta';

const EditIftaModal = ({ record, drivers, quarters, states, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [permissions, setPermissions] = useState({});
  const [formData, setFormData] = useState({
    quarter: '',
    state: '',
    total_miles: '',
    tax_paid_gallon: '',
    invoice_number: '',
    weekly_number: '',
    driver: ''
  });

  // Read permissions from localStorage
  useEffect(() => {
    const permissionsEnc = localStorage.getItem("permissionsEnc");
    if (permissionsEnc) {
      try {
        const decoded = JSON.parse(decodeURIComponent(escape(atob(permissionsEnc))));
        setPermissions(decoded);
      } catch (e) {
        setPermissions({});
      }
    } else {
      setPermissions({});
    }
  }, []);

  useEffect(() => {
    if (record) {
      setFormData({
        quarter: record.quarter || '',
        state: record.state || '',
        total_miles: record.total_miles || '',
        tax_paid_gallon: record.tax_paid_gallon || '',
        invoice_number: record.invoice_number || '',
        weekly_number: record.weekly_number || '',
        driver: record.driver || ''
      });
    }
  }, [record]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.quarter) {
      setError('Please select a quarter');
      return false;
    }
    if (!formData.state) {
      setError('Please select a state');
      return false;
    }
    if (!formData.weekly_number) {
      setError('Please enter weekly number');
      return false;
    }
    if (!formData.driver) {
      setError('Please select a driver');
      return false;
    }
    
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!permissions.ifta_update) {
      setError('You do not have permission to update IFTA records');
      return;
    }
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError('');

      // Convert numeric fields
      const submitData = {
        ...formData,
        total_miles: parseFloat(formData.total_miles),
        tax_paid_gallon: formData.tax_paid_gallon ? parseFloat(formData.tax_paid_gallon) : null,
        weekly_number: parseInt(formData.weekly_number),
        driver: parseInt(formData.driver)
      };

      await updateIftaRecord(record.id, submitData);
      onSuccess();
    } catch (err) {
      setError('Failed to update IFTA record');
      console.error('Error updating IFTA record:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Edit IFTA Record</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Quarter *</label>
              <select
                name="quarter"
                value={formData.quarter}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Quarter</option>
                {quarters.map(quarter => (
                  <option key={quarter.value} value={quarter.value}>
                    {quarter.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>State *</label>
              <select
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                required
              >
                <option value="">Select State</option>
                {states.map(state => (
                  <option key={state.code} value={state.code}>
                    {state.code} - {state.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Driver *</label>
              <select
                name="driver"
                value={formData.driver}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Driver</option>
                {drivers.map(driver => (
                  <option key={driver.id} value={driver.id}>
                    {driver.user?.first_name} {driver.user?.last_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Weekly Number *</label>
              <input
                type="number"
                name="weekly_number"
                value={formData.weekly_number}
                onChange={handleInputChange}
                required
                min="1"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Total Miles</label>
              <input
                type="number"
                step="0.01"
                name="total_miles"
                value={formData.total_miles}
                onChange={handleInputChange}
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Tax Paid Gallon</label>
              <input
                type="number"
                step="0.001"
                name="tax_paid_gallon"
                value={formData.tax_paid_gallon}
                onChange={handleInputChange}
                min="0"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Invoice Number</label>
            <input
              type="text"
              name="invoice_number"
              value={formData.invoice_number}
              onChange={handleInputChange}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? 'Updating...' : 'Update Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditIftaModal;
