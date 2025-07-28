import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { createIftaBulk } from '../../api/ifta';

const CreateIftaModal = ({ drivers, quarters, states, onClose, onSuccess, preSelectedDriver }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [permissions, setPermissions] = useState({});
  const [formData, setFormData] = useState({
    quarter: '',
    weekly_number: '',
    driver: preSelectedDriver || '',
    ifta_records: [
      {
        state: '',
        total_miles: '',
        tax_paid_gallon: '',
        invoice_number: ''
      }
    ]
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

  // If preSelectedDriver changes, update formData
  useEffect(() => {
    if (preSelectedDriver) {
      setFormData(prev => ({
        ...prev,
        driver: preSelectedDriver
      }));
    }
  }, [preSelectedDriver]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStateRecordChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      ifta_records: prev.ifta_records.map((record, i) => 
        i === index ? { ...record, [field]: value } : record
      )
    }));
  };

  const addStateRecord = () => {
    setFormData(prev => ({
      ...prev,
      ifta_records: [
        ...prev.ifta_records,
        {
          state: '',
          total_miles: '',
          tax_paid_gallon: '',
          invoice_number: ''
        }
      ]
    }));
  };

  const removeStateRecord = (index) => {
    if (formData.ifta_records.length > 1) {
      setFormData(prev => ({
        ...prev,
        ifta_records: prev.ifta_records.filter((_, i) => i !== index)
      }));
    }
  };

  const validateForm = () => {
    if (!formData.quarter) {
      setError('Please select a quarter');
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
    
    for (let i = 0; i < formData.ifta_records.length; i++) {
      const record = formData.ifta_records[i];
      if (!record.state) {
        setError(`Please select state for record ${i + 1}`);
        return false;
      }

    }
    
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!permissions.ifta_create) {
      setError('You do not have permission to create IFTA records');
      return;
    }
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError('');

      // Convert numeric fields
      const submitData = {
        ...formData,
        weekly_number: parseInt(formData.weekly_number),
        driver: parseInt(formData.driver),
        ifta_records: formData.ifta_records.map(record => ({
          ...record,
          total_miles: parseFloat(record.total_miles),
          tax_paid_gallon: record.tax_paid_gallon ? parseFloat(record.tax_paid_gallon) : null
        }))
      };

      await createIftaBulk(submitData);
      onSuccess();
    } catch (err) {
      setError('Failed to create IFTA records');
      console.error('Error creating IFTA records:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Create IFTA Records</h2>
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

          {!preSelectedDriver && (
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
                    {driver.user.first_name} {driver.user.last_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <h3>State Records</h3>
          
          {formData.ifta_records.map((record, index) => (
            <div key={index} className="state-records">
              <div className="state-record-header">
                <span className="state-record-title">State Record {index + 1}</span>
                {formData.ifta_records.length > 1 && (
                  <button
                    type="button"
                    className="remove-state-btn"
                    onClick={() => removeStateRecord(index)}
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>State *</label>
                  <select
                    value={record.state}
                    onChange={(e) => handleStateRecordChange(index, 'state', e.target.value)}
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

                <div className="form-group">
                  <label>Total Miles</label>
                  <input
                    type="number"
                    step="0.01"
                    value={record.total_miles}
                    onChange={(e) => handleStateRecordChange(index, 'total_miles', e.target.value)}
                    min="0"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tax Paid Gallon</label>
                  <input
                    type="number"
                    step="0.001"
                    value={record.tax_paid_gallon}
                    onChange={(e) => handleStateRecordChange(index, 'tax_paid_gallon', e.target.value)}
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label>Invoice Number</label>
                  <input
                    type="text"
                    value={record.invoice_number}
                    onChange={(e) => handleStateRecordChange(index, 'invoice_number', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            className="add-state-btn"
            onClick={addStateRecord}
          >
            Add State
          </button>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? 'Creating...' : 'Create Records'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateIftaModal;
