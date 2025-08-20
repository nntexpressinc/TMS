import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { getInvoiceById } from '../../../api/accounting';
import './InvoicesPage.css';

const InvoiceViewPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchInvoice = useCallback(async () => {
    try {
      const invoiceData = await getInvoiceById(id);
      setInvoice(invoiceData);
    } catch (error) {
      console.error('Error fetching invoice:', error);
      toast.error(t('Failed to fetch invoice details'));
      navigate('/invoices');
    } finally {
      setLoading(false);
    }
  }, [id, t, navigate]);

  useEffect(() => {
    fetchInvoice();
  }, [fetchInvoice]);

  if (loading) {
    return <div className="loading">{t("Loading...")}</div>;
  }

  if (!invoice) {
    return <div className="error">{t("Invoice not found")}</div>;
  }

  return (
    <div className="accounting-container">
      <div className="header-section">
        <h2>{t("Invoice Details")}</h2>
        <button
          className="back-button"
          onClick={() => navigate('/invoices')}
        >
          {t("Back to List")}
        </button>
      </div>

      <div className="detail-section">
        <div className="detail-group">
          <label>{t("Invoice ID")}:</label>
          <span>{invoice.id}</span>
        </div>

        <div className="detail-group">
          <label>{t("Invoice Date")}:</label>
          <span>{new Date(invoice.invoice_date).toLocaleString()}</span>
        </div>

        <div className="detail-group">
          <label>{t("Status")}:</label>
          <span className={`status-badge ${invoice.status.toLowerCase()}`}>
            {invoice.status}
          </span>
        </div>

        <div className="detail-group">
          <label>{t("Notes")}:</label>
          <span>{invoice.notes || t("No notes")}</span>
        </div>

        <div className="detail-group">
          <label>{t("Created Date")}:</label>
          <span>{new Date(invoice.created_date).toLocaleString()}</span>
        </div>

        <div className="detail-group">
          <label>{t("Updated Date")}:</label>
          <span>{new Date(invoice.updated_date).toLocaleString()}</span>
        </div>

        {invoice.loads && invoice.loads.length > 0 && (
          <div className="detail-group loads-section">
            <label>{t("Associated Loads")}:</label>
            <table>
              <thead>
                <tr>
                  <th>{t("Load ID")}</th>
                </tr>
              </thead>
              <tbody>
                {invoice.loads.map(loadId => (
                  <tr key={loadId}>
                    <td>
                      <button
                        className="link-button"
                        onClick={() => navigate(`/loads/view/${loadId}`)}
                      >
                        {loadId}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {invoice.zip_file && (
          <div className="detail-group">
            <label>{t("ZIP File")}:</label>
            <a
              href={invoice.zip_file}
              className="download-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("Download ZIP")}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceViewPage;
