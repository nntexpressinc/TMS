import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { createInvoice } from '../../../api/accounting';
import Select from 'react-select';
import { getAllLoads } from '../../../api/loads';
import { getUninvoicedCompletedLoads } from '../../../api/loads';
import './InvoicesPage.css';
const API_URL = 'https://nnt.nntexpressinc.com/api';


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
  const [loads, setLoads] = useState([]);
  const [loadsCount, setLoadsCount] = useState(0);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        invoice_date: formData.invoice_date ? new Date(formData.invoice_date).toISOString() : null,
        notes: formData.notes || '',
        loads: selectedLoads.map(s => s.value)
      };

      const response = await createInvoice(payload);
      
      // Backend returns { success, type, message, data }
      if (response && response.success) {
        toast.success(response.message || t('Invoice created successfully'));
        navigate('/invoices');
      } else {
        toast.error(response.error || t('Failed to create invoice'));
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      const errorMessage = error?.response?.data?.error || 
                          error?.response?.data?.detail || 
                          error?.message || 
                          t('Failed to create invoice');
      toast.error(errorMessage);
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
    const fetchLoads = async () => {
      if (!formData.invoice_date) return;

      try {
        setLoadsLoading(true);
        const date = formData.invoice_date.split("T")[0];
        const data = await getUninvoicedCompletedLoads(date, loadsPage, loadsPageSize);

        setLoads(data.results);
        setLoadsCount(data.count);
        setLoadsTotalPages(Math.ceil(data.count / loadsPageSize));
        setNextPage(data.next);
        setPrevPage(data.previous);

        // 🔥 Select uchun variantlar tayyorlash
        setLoadOptions(
          data.results.map((load) => ({
            value: load.id,
            load_id: load.load_id, // 🔥 qidirishda ishlatish uchun
            label: (
              <span>
                <span style={{ color: "blue", fontWeight: "bold" }}>Load ID:</span> {load.load_id}{" "}
                <span style={{ color: "green", fontWeight: "bold" }}>| Load Status:</span> {load.load_status}{" "}
                <span style={{ color: "orange", fontWeight: "bold" }}>| Invoice Status:</span> {load.invoice_status}
              </span>
            ),
          }))
        );


      } catch (error) {
        console.error("Error fetching loads:", error);
      } finally {
        setLoadsLoading(false);
      }
    };

    fetchLoads();
  }, [formData.invoice_date, loadsPage, loadsPageSize]);


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
            <label style={{ display: "block", fontWeight: "600", marginBottom: "6px" }}>
              {t("Invoice Date")}
            </label>
            <input
              type="date"
              name="invoice_date"
              value={formData.invoice_date}
              onChange={handleInputChange}
              required
              className="form-control"
              style={{ maxWidth: "250px" }}
            />
          </div>


          {/* <div className="form-group">
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
          </div> */}

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
              filterOption={(option, inputValue) =>
                option.data.load_id.toLowerCase().includes(inputValue.toLowerCase())
              }
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
              className="cancel-button"
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
