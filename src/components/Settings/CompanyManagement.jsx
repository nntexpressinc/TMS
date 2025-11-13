import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
  getCompanies,
  createCompany,
  patchCompany,
  deleteCompany,
} from '../../api/company';
import './CompanyManagement.css';

const CompanyManagement = () => {
  const { t } = useTranslation();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [formData, setFormData] = useState({
    company_name: '',
    company_type: 'other',
    phone: '',
    fax: '',
    address: '',
    city: '',
    state: '',
    zip: '',
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const data = await getCompanies();
      setCompanies(data);
    } catch (error) {
      toast.error(t('Failed to fetch companies'));
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOpenModal = (company = null) => {
    if (company) {
      setEditingCompany(company);
      setFormData({
        company_name: company.company_name || '',
        company_type: company.company_type || 'other',
        phone: company.phone || '',
        fax: company.fax || '',
        address: company.address || '',
        city: company.city || '',
        state: company.state || '',
        zip: company.zip || '',
      });
    } else {
      setEditingCompany(null);
      setFormData({
        company_name: '',
        company_type: 'other',
        phone: '',
        fax: '',
        address: '',
        city: '',
        state: '',
        zip: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCompany(null);
    setFormData({
      company_name: '',
      company_type: 'other',
      phone: '',
      fax: '',
      address: '',
      city: '',
      state: '',
      zip: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.company_name.trim()) {
      toast.error(t('Company name is required'));
      return;
    }

    try {
      if (editingCompany) {
        // Use PATCH for partial updates - only send changed fields
        await patchCompany(editingCompany.id, formData);
        toast.success(t('Company updated successfully'));
      } else {
        await createCompany(formData);
        toast.success(t('Company created successfully'));
      }
      handleCloseModal();
      fetchCompanies();
    } catch (error) {
      const errorMsg =
        error?.response?.data?.error ||
        error?.response?.data?.detail ||
        error?.message ||
        t('Failed to save company');
      toast.error(errorMsg);
      console.error('Error:', error);
    }
  };

  const handleDelete = async (company) => {
    if (
      !window.confirm(
        t('Are you sure you want to delete') + ` "${company.company_name}"?`
      )
    ) {
      return;
    }

    try {
      const result = await deleteCompany(company.id);
      if (result.success) {
        toast.success(t('Company deleted successfully'));
        fetchCompanies();
      } else {
        toast.error(result.error || t('Failed to delete company'));
      }
    } catch (error) {
      const errorMsg =
        error?.response?.data?.error ||
        error?.response?.data?.detail ||
        error?.message ||
        t('Failed to delete company');
      toast.error(errorMsg);
      console.error('Error:', error);
    }
  };

  const getCompanyTypeBadge = (type) => {
    if (type === 'amazon') {
      return <span className="company-badge amazon">Amazon</span>;
    }
    return <span className="company-badge other">Other</span>;
  };

  if (loading) {
    return (
      <div className="company-management">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>{t('Loading companies...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="company-management">
      <div className="company-header">
        <div>
          <h2>{t('Company Management')}</h2>
          <p className="subtitle">{t('Manage companies in your system')}</p>
        </div>
        <button className="btn-create" onClick={() => handleOpenModal()}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 5V15M5 10H15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          {t('Create Company')}
        </button>
      </div>

      {companies.length === 0 ? (
        <div className="empty-state">
          <svg
            width="64"
            height="64"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="8"
              y="16"
              width="48"
              height="40"
              rx="4"
              stroke="#CBD5E0"
              strokeWidth="2"
            />
            <path
              d="M16 24H48M16 32H48M16 40H32"
              stroke="#CBD5E0"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <h3>{t('No companies found')}</h3>
          <p>{t('Create your first company to get started')}</p>
        </div>
      ) : (
        <div className="companies-grid">
          {companies.map((company) => (
            <div key={company.id} className="company-card">
              <div className="company-card-header">
                <div>
                  <h3>{company.company_name}</h3>
                  {getCompanyTypeBadge(company.company_type)}
                </div>
                <div className="company-actions">
                  <button
                    className="btn-icon"
                    onClick={() => handleOpenModal(company)}
                    title={t('Edit')}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      fill="none"
                    >
                      <path
                        d="M12.5 2.5L15.5 5.5L6 15H3V12L12.5 2.5Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <button
                    className="btn-icon btn-delete"
                    onClick={() => handleDelete(company)}
                    title={t('Delete')}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      fill="none"
                    >
                      <path
                        d="M3 5H15M7 8V13M11 8V13M4 5L5 15H13L14 5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="company-details">
                {company.phone && (
                  <div className="detail-item">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <path
                        d="M3 2H6L7 6L5 7C5.5 8.5 7.5 10.5 9 11L10 9L14 10V13C14 13.5523 13.5523 14 13 14C6.92487 14 2 9.07513 2 3C2 2.44772 2.44772 2 3 2Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>{company.phone}</span>
                  </div>
                )}

                {company.fax && (
                  <div className="detail-item">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <rect
                        x="2"
                        y="4"
                        width="12"
                        height="10"
                        rx="1"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M2 7H14M5 10H11"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span>Fax: {company.fax}</span>
                  </div>
                )}

                {company.address && (
                  <div className="detail-item">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <path
                        d="M8 14C8 14 13 10 13 6C13 3.23858 10.7614 1 8 1C5.23858 1 3 3.23858 3 6C3 10 8 14 8 14Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle
                        cx="8"
                        cy="6"
                        r="2"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                    </svg>
                    <span>
                      {company.address}
                      {company.city && `, ${company.city}`}
                      {company.state && `, ${company.state}`}
                      {company.zip && ` ${company.zip}`}
                    </span>
                  </div>
                )}

                {company.created_at && (
                  <div className="detail-item">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <rect
                        x="2"
                        y="3"
                        width="12"
                        height="11"
                        rx="2"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M5 1V4M11 1V4M2 7H14"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span>
                      {t('Created')}:{' '}
                      {new Date(company.created_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {editingCompany ? t('Edit Company') : t('Create Company')}
              </h3>
              <button className="btn-close" onClick={handleCloseModal}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="company_name">
                  {t('Company Name')} <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="company_name"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleInputChange}
                  required
                  placeholder={t('Enter company name')}
                />
              </div>

              <div className="form-group">
                <label htmlFor="company_type">{t('Company Type')}</label>
                <select
                  id="company_type"
                  name="company_type"
                  value={formData.company_type}
                  onChange={handleInputChange}
                >
                  <option value="other">{t('Other')}</option>
                  <option value="amazon">{t('Amazon')}</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="phone">{t('Phone')}</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="(123) 456-7890"
                />
              </div>

              <div className="form-group">
                <label htmlFor="fax">{t('Fax')}</label>
                <input
                  type="tel"
                  id="fax"
                  name="fax"
                  value={formData.fax}
                  onChange={handleInputChange}
                  placeholder="(123) 456-7891"
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">{t('Address')}</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder={t('Enter street address')}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">{t('City')}</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder={t('City')}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="state">{t('State')}</label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="CA"
                    maxLength="2"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="zip">{t('ZIP Code')}</label>
                  <input
                    type="text"
                    id="zip"
                    name="zip"
                    value={formData.zip}
                    onChange={handleInputChange}
                    placeholder="12345"
                    maxLength="10"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={handleCloseModal}
                >
                  {t('Cancel')}
                </button>
                <button type="submit" className="btn-save">
                  {editingCompany ? t('Update') : t('Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyManagement;
