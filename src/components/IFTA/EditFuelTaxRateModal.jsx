import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { updateFuelTaxRate } from '../../api/ifta';

const EditFuelTaxRateModal = ({ record, quarters, states, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    quarter: '',
    state: '',
    rate: '',
    mpg: ''
  });

  useEffect(() => {
    if (record) {
      setFormData({
        quarter: record.quarter || '',
        state: record.state || '',
        rate: record.rate || '',
        mpg: record.mpg || ''
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
    if (!formData.rate) {
      setError('Please enter rate');
      return false;
    }
    if (!formData.mpg) {
      setError('Please enter MPG');
      return false;
    }
    
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError('');

      // Convert numeric fields
      const submitData = {
        ...formData,
        rate: parseFloat(formData.rate),
        mpg: parseFloat(formData.mpg)
      };

      const response = await updateFuelTaxRate(record.id, submitData);
      onSuccess();
    } catch (err) {
      setError('Failed to update fuel tax rate');
      console.error('Error updating fuel tax rate:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Edit Fuel Tax Rate</h2>
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
              <label>Rate (per gallon) *</label>
              <input
                type="number"
                step="0.001"
                name="rate"
                value={formData.rate}
                onChange={handleInputChange}
                required
                min="0"
                placeholder="0.000"
              />
            </div>

            <div className="form-group">
              <label>MPG (Miles per Gallon) *</label>
              <input
                type="number"
                step="0.1"
                name="mpg"
                value={formData.mpg}
                onChange={handleInputChange}
                required
                min="0"
                placeholder="0.0"
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? 'Updating...' : 'Update Rate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditFuelTaxRateModal;
