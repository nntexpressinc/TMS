import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { createFuelTaxRatesBulk } from '../../api/ifta';

const CreateFuelTaxRatesModal = ({ quarters, states, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [permissions, setPermissions] = useState({});
  const [formData, setFormData] = useState({
    quarter: '',
    rates: {}
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

  const handleQuarterChange = (e) => {
    setFormData(prev => ({
      ...prev,
      quarter: e.target.value
    }));
  };

  const handleRateChange = (stateCode, field, value) => {
    setFormData(prev => ({
      ...prev,
      rates: {
        ...prev.rates,
        [stateCode]: {
          ...prev.rates[stateCode],
          [field]: value
        }
      }
    }));
  };

  const validateForm = () => {
    if (!formData.quarter) {
      setError('Please select a quarter');
      return false;
    }

    const statesWithData = Object.keys(formData.rates);
    if (statesWithData.length === 0) {
      setError('Please add at least one state with rate and MPG data');
      return false;
    }

    for (let stateCode of statesWithData) {
      const stateData = formData.rates[stateCode];
      if (!stateData.rate || !stateData.mpg) {
        setError(`Please fill both rate and MPG for ${stateCode}`);
        return false;
      }
      if (isNaN(stateData.rate) || isNaN(stateData.mpg)) {
        setError(`Rate and MPG must be valid numbers for ${stateCode}`);
        return false;
      }
    }

    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!permissions.ifta_create) {
      setError('You do not have permission to create fuel tax rates');
      return;
    }
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError('');

      // Prepare data in correct format for backend
      const submitData = {
        quarter: formData.quarter,
        rates: [formData.rates] // Array with object inside
      };

      console.log('Submitting fuel tax rates:', submitData);
      await createFuelTaxRatesBulk(submitData);
      onSuccess();
    } catch (err) {
      setError('Failed to create fuel tax rates: ' + (err.response?.data?.detail || err.message));
      console.error('Error creating fuel tax rates:', err);
    } finally {
      setLoading(false);
    }
  };

  const addAllStates = () => {
    const newRates = {};
    states.forEach(state => {
      newRates[state.code] = { rate: '', mpg: '' };
    });
    setFormData(prev => ({
      ...prev,
      rates: newRates
    }));
  };

  const addState = (stateCode) => {
    setFormData(prev => ({
      ...prev,
      rates: {
        ...prev.rates,
        [stateCode]: { rate: '', mpg: '' }
      }
    }));
  };

  const removeState = (stateCode) => {
    setFormData(prev => {
      const newRates = { ...prev.rates };
      delete newRates[stateCode];
      return {
        ...prev,
        rates: newRates
      };
    });
  };

  const getAvailableStates = () => {
    return states.filter(state => !formData.rates[state.code]);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '800px', maxHeight: '90vh' }}>
        <div className="modal-header">
          <h2 className="modal-title">Create Fuel Tax Rates</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Quarter *</label>
            <select
              value={formData.quarter}
              onChange={handleQuarterChange}
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

          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={addAllStates}
            >
              Add All States
            </button>
            {getAvailableStates().length > 0 && (
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    addState(e.target.value);
                    e.target.value = '';
                  }
                }}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              >
                <option value="">Add Individual State</option>
                {getAvailableStates().map(state => (
                  <option key={state.code} value={state.code}>
                    {state.code} - {state.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <h3>State Rates</h3>
            {Object.keys(formData.rates).length === 0 ? (
              <p style={{ textAlign: 'center', color: '#666', margin: '20px 0' }}>
                No states added yet. Use the buttons above to add states.
              </p>
            ) : (
              Object.keys(formData.rates).map(stateCode => {
                const state = states.find(s => s.code === stateCode);
                const stateName = state ? state.name : stateCode;
                
                return (
                  <div key={stateCode} className="state-records">
                    <div className="state-record-header">
                      <span className="state-record-title">
                        {stateCode} - {stateName}
                      </span>
                      <button
                        type="button"
                        className="remove-state-btn"
                        onClick={() => removeState(stateCode)}
                      >
                        Remove
                      </button>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Rate *</label>
                        <input
                          type="number"
                          step="0.001"
                          value={formData.rates[stateCode]?.rate || ''}
                          onChange={(e) => handleRateChange(stateCode, 'rate', e.target.value)}
                          required
                          min="0"
                          placeholder="e.g. 0.285"
                        />
                      </div>

                      <div className="form-group">
                        <label>MPG *</label>
                        <input
                          type="number"
                          step="0.1"
                          value={formData.rates[stateCode]?.mpg || ''}
                          onChange={(e) => handleRateChange(stateCode, 'mpg', e.target.value)}
                          required
                          min="0"
                          placeholder="e.g. 7.5"
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? 'Creating...' : 'Create Rates'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFuelTaxRatesModal;
