import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { createInvoice } from '../../../api/accounting';
import Select from 'react-select';
import { getAllLoads } from '../../../api/loads';
import './InvoicesPage.css';

const InvoiceCreatePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    invoice_date: '',
    status: '',
    notes: '',
    loads: []
  });
  const [loadOptions, setLoadOptions] = useState([]);
  const [selectedLoads, setSelectedLoads] = useState([]);
  const [loadsLoading, setLoadsLoading] = useState(false);
  const [loadsPage, setLoadsPage] = useState(1);
  const [loadsPageSize, setLoadsPageSize] = useState(25);
  const [loadsTotalPages, setLoadsTotalPages] = useState(1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        invoice_date: formData.invoice_date ? new Date(formData.invoice_date).toISOString() : null,
        status: formData.status,
        notes: formData.notes || '',
        loads: selectedLoads.map(s => s.value)
      };

      await createInvoice(payload);
      toast.success(t('Invoice created successfully'));
      navigate('/invoices');
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error(t('Failed to create invoice'));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    let mounted = true;
    const fetchLoads = async () => {
      try {
        setLoadsLoading(true);
        const data = await getAllLoads({ page: loadsPage, page_size: loadsPageSize });
        if (!mounted) return;
        // data may be paginated { results, count, next, previous }
        const arr = Array.isArray(data) ? data : (data.results || []);
        if (data && typeof data.count === 'number') {
          setLoadsTotalPages(Math.max(1, Math.ceil(data.count / loadsPageSize)));
        }
        const opts = arr.map(l => ({
          // value should be the numeric database id the backend expects
          value: Number(l.id),
          label: `Load #${l.load_id || l.load_number || l.id}`
        }));
        setLoadOptions(opts);
      } catch (err) {
  console.error('Failed to fetch loads page:', err);
  setLoadOptions([]);
      } finally {
        setLoadsLoading(false);
      }
    };
    fetchLoads();
    return () => { mounted = false; };
  }, [loadsPage, loadsPageSize]);

  const handleLoadsChange = (selected) => {
    setSelectedLoads(selected || []);
  };

  return (
    <div className="accounting-container">
      <div className="header-section">
        <h2>{t("Create New Invoice")}</h2>
      </div>

      <div className="form-section">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t("Invoice Date")}:</label>
            <input
              type="datetime-local"
              name="invoice_date"
              value={formData.invoice_date}
              onChange={handleInputChange}
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label>{t("Status")}:</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              required
              className="form-control"
            >
              <option value="">{t("Select Status")}</option>
              <option value="PENDING">{t("Pending")}</option>
              <option value="COMPLETED">{t("Completed")}</option>
              <option value="CANCELLED">{t("Cancelled")}</option>
            </select>
          </div>

          <div className="form-group">
            <label>{t("Notes")}:</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              className="form-control"
              rows="4"
            />
          </div>

          <div className="form-group">
            <label>{t("Loads")}:</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
              <select value={loadsPageSize} onChange={(e) => { setLoadsPageSize(Number(e.target.value)); setLoadsPage(1); }} style={{ padding: 8, borderRadius: 6 }}>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <button type="button" onClick={() => setLoadsPage(p => Math.max(1, p - 1))} className="btn btn-sm">Prev</button>
                <span style={{ fontSize: 13 }}>{t('Page')} {loadsPage} / {loadsTotalPages}</span>
                <button type="button" onClick={() => setLoadsPage(p => Math.min(loadsTotalPages, p + 1))} className="btn btn-sm">Next</button>
              </div>
            </div>
            <Select
              isMulti
              options={loadOptions}
              value={selectedLoads}
              onChange={handleLoadsChange}
              className="modern-multi-select"
              classNamePrefix="select"
              placeholder={t('Select loads...')}
              isLoading={loadsLoading}
              noOptionsMessage={() => loadsLoading ? t('Loading loads...') : t('No loads available')}
              styles={{
                menuList: (provided) => ({
                  ...provided,
                  maxHeight: 240,
                  overflowY: 'auto'
                })
              }}
            />
          </div>

          <div className="button-group">
            <button
              type="button"
              className="cancel-button"
              onClick={() => navigate('/invoices')}
            >
              {t("Cancel")}
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={loading}
            >
              {loading ? t("Creating...") : t("Create Invoice")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceCreatePage;
