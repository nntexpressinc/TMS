import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DriverService } from '../../../api/driver';
import './CreateDriverForm.scss';

const CreateDriverForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    license_number: '',
    license_expiry: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    profile_photo: null,
    documents: [],
    status: 'active',
    notes: '',
    role: 2  // Haydovchi uchun default role ID = 2
  });

  const [previewUrls, setPreviewUrls] = useState({
    profile_photo: null,
    documents: []
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    
    if (name === 'profile_photo') {
      const file = files[0];
      if (file) {
        setFormData(prev => ({
          ...prev,
          profile_photo: file
        }));
        setPreviewUrls(prev => ({
          ...prev,
          profile_photo: URL.createObjectURL(file)
        }));
      }
    } else if (name === 'documents') {
      const newFiles = Array.from(files);
      setFormData(prev => ({
        ...prev,
        documents: [...prev.documents, ...newFiles]
      }));
      
      const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => ({
        ...prev,
        documents: [...prev.documents, ...newPreviewUrls]
      }));
    }
  };

  const removeDocument = (index) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
    
    setPreviewUrls(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const errors = [];
    if (!formData.first_name) errors.push('First name is required');
    if (!formData.last_name) errors.push('Last name is required');
    if (!formData.email) errors.push('Email is required');
    if (!formData.phone) errors.push('Phone number is required');
    if (!formData.license_number) errors.push('License number is required');
    if (!formData.license_expiry) errors.push('License expiry date is required');
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    const errors = validateForm();
    if (errors.length > 0) {
      setError(errors.join('\n'));
      return;
    }

    try {
      setLoading(true);
      const dataToSend = {
        ...formData,
        role: 2  // Haydovchi uchun role ID ni aniq belgilaymiz
      };
      await DriverService.createDriver(dataToSend);
      navigate('/drivers');
    } catch (err) {
      console.error('Registration error:', err.response?.data);
      setError(err.response?.data?.detail || 
               Object.values(err.response?.data || {}).flat().join('\n') ||
               'Error creating driver');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-driver-form">
      <h2>Create New Driver</h2>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="first_name">First Name *</label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="last_name">Last Name *</label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="license_number">License Number *</label>
            <input
              type="text"
              id="license_number"
              name="license_number"
              value={formData.license_number}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="license_expiry">License Expiry Date *</label>
            <input
              type="date"
              id="license_expiry"
              name="license_expiry"
              value={formData.license_expiry}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">Address</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="city">City</label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="state">State</label>
            <input
              type="text"
              id="state"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="zip_code">ZIP Code</label>
            <input
              type="text"
              id="zip_code"
              name="zip_code"
              value={formData.zip_code}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="profile_photo">Profile Photo</label>
            <input
              type="file"
              id="profile_photo"
              name="profile_photo"
              accept="image/*"
              onChange={handleFileChange}
            />
            {previewUrls.profile_photo && (
              <div className="image-preview">
                <img src={previewUrls.profile_photo} alt="Profile preview" />
              </div>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="documents">Documents</label>
            <input
              type="file"
              id="documents"
              name="documents"
              multiple
              onChange={handleFileChange}
            />
            <div className="documents-preview">
              {previewUrls.documents.map((url, index) => (
                <div key={index} className="document-item">
                  <img src={url} alt={`Document ${index + 1}`} />
                  <button
                    type="button"
                    onClick={() => removeDocument(index)}
                    className="remove-document"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on_trip">On Trip</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows="4"
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/drivers')}
            className="cancel-btn"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Driver'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateDriverForm; 