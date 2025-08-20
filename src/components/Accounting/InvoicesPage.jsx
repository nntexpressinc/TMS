import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaPlus } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { getInvoices } from '../../api/accounting';
import './invoices/InvoicesPage.css';

const InvoicesPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
      const needClientFilter = fromDate || toDate;

        let response;
        if (needClientFilter) {
          // Fetch full list and filter client-side by date range
          response = await getInvoices();
        } else {
          response = await getInvoices({
            page: currentPage,
            per_page: itemsPerPage
          });
        }

        let list = response.results || response;

        // If client-side filtering is required (date range), filter locally
        if (needClientFilter) {
          list = (Array.isArray(list) ? list : list.results || [])
            .filter(inv => {
              if (needClientFilter && inv.invoice_date) {
                const invDate = new Date(inv.invoice_date);
                if (fromDate) {
                  const from = new Date(fromDate);
                  from.setHours(0,0,0,0);
                  if (invDate < from) return false;
                }
                if (toDate) {
                  const to = new Date(toDate);
                  to.setHours(23,59,59,999);
                  if (invDate > to) return false;
                }
              }

              return true;
            });

          // Paginate client-side
          const total = list.length;
          setTotalPages(Math.max(1, Math.ceil(total / itemsPerPage)));
          const start = ((currentPage || 1) - 1) * itemsPerPage;
          const end = start + itemsPerPage;
          const paged = list.slice(start, end);
          setInvoices(paged);
        } else {
          setInvoices(list);
          setTotalPages(Math.max(1, Math.ceil((response.count || list.length) / itemsPerPage)));
        }
      } catch (error) {
        console.error('Error fetching invoices:', error);
        // Avoid calling t() inside catch if i18n isn't initialized yet
        try {
          toast.error(t ? t('Failed to fetch invoices') : 'Failed to fetch invoices');
        } catch (_) {
          toast.error('Failed to fetch invoices');
        }
        // Ensure UI doesn't stay stuck in loading and shows empty state
        setInvoices([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [currentPage, itemsPerPage, fromDate, toDate]);

  

  const handleFromDateChange = (e) => {
    setFromDate(e.target.value);
    setCurrentPage(1);
  };

  const handleToDateChange = (e) => {
    setToDate(e.target.value);
    setCurrentPage(1);
  };

  const clearDates = () => {
    setFromDate('');
    setToDate('');
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="accounting-container">
      <div className="header-section">
        <h2>{t("Invoices")}</h2>
        <button
          className="add-button"
          onClick={() => navigate('/invoices/create')}
        >
          <FaPlus /> {t("Create New Invoice")}
        </button>
      </div>

      <div className="search-section">
        <div className="date-filters">
          <div className="date-group">
            <label>{t('From')}</label>
            <input type="date" value={fromDate} onChange={handleFromDateChange} className="date-input" />
          </div>
          <div className="date-group">
            <label>{t('To')}</label>
            <input type="date" value={toDate} onChange={handleToDateChange} className="date-input" />
          </div>
          <button className="clear-dates" onClick={clearDates}>{t('Clear')}</button>
        </div>
      </div>

      <div className="table-section">
        {loading ? (
          <p className="loading">{t("Loading...")}</p>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>{t("ID")}</th>
                  <th>{t("Invoice Date")}</th>
                  <th>{t("Load Count")}</th>
                  <th>{t("Loads")}</th>
                    <th>{t("Notes")}</th>
                  <th>{t("Status")}</th>
                  <th>{t("ZIP File")}</th>
                  <th>{t("Created Date")}</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td>{invoice.id}</td>
                    <td>{invoice.invoice_date ? new Date(invoice.invoice_date).toLocaleString() : '-'}</td>
                    <td>{Array.isArray(invoice.loads) ? invoice.loads.length : 0}</td>
                    <td>
                      <div className={`load-chips ${Array.isArray(invoice.loads) && invoice.loads.length > 12 ? 'scrollable' : ''}`}>
                        {Array.isArray(invoice.loads) && invoice.loads.length > 0 ? (
                          invoice.loads.map((loadId) => (
                            <button
                              key={loadId}
                              className="load-chip"
                              onClick={() => navigate(`/loads/view/${loadId}`)}
                              title={t('Open load')}
                            >
                              {loadId}
                            </button>
                          ))
                        ) : (
                          <span className="muted">-</span>
                        )}
                      </div>
                    </td>
                    <td title={invoice.notes || ''}>
                      {invoice.notes ? (invoice.notes.length > 80 ? `${invoice.notes.slice(0,80)}…` : invoice.notes) : '-'}
                    </td>
                    <td>
                      <span className={`status-badge ${(invoice.status || '').toLowerCase()}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td>
                      {invoice.zip_file ? (
                        <a
                          href={invoice.zip_file}
                          className="action-button download"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {t('Download ZIP')}
                        </a>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                    <td>{invoice.created_date ? new Date(invoice.created_date).toLocaleString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="pagination" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  className="page-button"
                  disabled={currentPage === 1}
                >
                  Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`page-button ${currentPage === page ? 'active' : ''}`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  className="page-button"
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>

                <div style={{ marginLeft: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <label style={{ fontSize: 14, color: '#374151' }}>Per page:</label>
                  <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} style={{ padding: '6px 8px', borderRadius: 6 }}>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default InvoicesPage;
