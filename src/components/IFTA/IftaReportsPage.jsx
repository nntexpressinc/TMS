import React, { useEffect, useState } from 'react';
import { getIftaReports, createIftaReport, deleteIftaReport, downloadIftaReport } from '../../api/ifta';

const QUARTERS = [
  { value: 'Quarter 1', label: 'Quarter 1 (Jan-Mar)' },
  { value: 'Quarter 2', label: 'Quarter 2 (Apr-Jun)' },
  { value: 'Quarter 3', label: 'Quarter 3 (Jul-Sep)' },
  { value: 'Quarter 4', label: 'Quarter 4 (Oct-Dec)' },
];

// SVG icon components
const DownloadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 3V14M10 14L5 9M10 14L15 9" stroke="#495057" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="3" y="16" width="14" height="2" rx="1" fill="#495057"/>
  </svg>
);
const DeleteIcon = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="7" width="10" height="8" rx="2" stroke="#dc3545" strokeWidth="1.7"/>
    <path d="M8 9V13" stroke="#dc3545" strokeWidth="1.7" strokeLinecap="round"/>
    <path d="M12 9V13" stroke="#dc3545" strokeWidth="1.7" strokeLinecap="round"/>
    <path d="M3 7H17" stroke="#dc3545" strokeWidth="1.7" strokeLinecap="round"/>
    <path d="M8 4H12" stroke="#dc3545" strokeWidth="1.7" strokeLinejoin="round"/>
  </svg>
);

function getFileNameFromUrl(url) {
  if (!url) return '';
  try {
    return decodeURIComponent(url.split('/').pop());
  } catch {
    return url;
  }
}

const IftaReportsPage = ({ showCreateModal, setShowCreateModal }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [permissions, setPermissions] = useState({});

  useEffect(() => {
    fetchReports();
  }, []);

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

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await getIftaReports();
      setReports(data);
      setError('');
    } catch (err) {
      setError('Failed to fetch IFTA reports');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (permissions.ifta_delete && window.confirm('Are you sure you want to delete this report?')) {
      try {
        await deleteIftaReport(id);
        setSuccess('Report deleted successfully!');
        fetchReports();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError('Failed to delete report');
      }
    }
  };

  const handleDownload = async (id, fileName) => {
    try {
      const response = await downloadIftaReport(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || 'ifta_report.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to download report');
    }
  };

  return (
    <div>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      {loading ? (
        <div className="loading">Loading IFTA reports...</div>
      ) : reports.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>No IFTA reports found.</div>
      ) : (
        <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.07)', padding: '0', marginTop: 0 }}>
          <table className="ifta-table" style={{ marginTop: 0, borderCollapse: 'separate', borderSpacing: 0, width: '100%' }}>
            <thead>
              <tr>
                <th style={{ width: 60 }}>ID</th>
                <th style={{ width: 120 }}>Quarter</th>
                <th>Result File</th>
                <th style={{ width: 180 }}>Created At</th>
                <th style={{ width: 70, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id}>
                  <td style={{ textAlign: 'center', fontWeight: 500 }}>{report.id}</td>
                  <td style={{ textAlign: 'center' }}>{report.quorter}</td>
                  <td style={{ textAlign: 'center' }}>
                    {report.result_file_url ? (
                      <a
                        href={report.result_file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#007bff', textDecoration: 'underline', fontWeight: 500 }}
                        title={getFileNameFromUrl(report.result_file_url)}
                        download
                      >
                        {getFileNameFromUrl(report.result_file_url)}
                      </a>
                    ) : (
                      <span style={{ color: '#888' }}>No file</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'center', fontSize: 13 }}>{new Date(report.created_at).toLocaleString()}</td>
                  <td style={{ textAlign: 'center', padding: '4px 0' }}>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                      {permissions.ifta_view && (
                        <button
                          className="btn-secondary"
                          style={{ padding: '4px 7px', minWidth: 0, background: '#f1f3f4', border: 'none', borderRadius: '4px', display: 'flex', alignItems: 'center' }}
                          title="Download"
                          onClick={() => handleDownload(report.id, getFileNameFromUrl(report.result_file_url))}
                          disabled={!report.result_file_url}
                        >
                          <DownloadIcon />
                        </button>
                      )}
                      {permissions.ifta_delete && (
                        <button
                          className="btn-danger"
                          style={{ padding: '4px 7px', minWidth: 0, background: '#fff0f1', border: 'none', borderRadius: '4px', display: 'flex', alignItems: 'center' }}
                          title="Delete"
                          onClick={() => handleDelete(report.id)}
                        >
                          <DeleteIcon />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showCreateModal && permissions.ifta_create && (
        <CreateIftaReportModal
          quarters={QUARTERS}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            setSuccess('IFTA report created successfully!');
            fetchReports();
            setTimeout(() => setSuccess(''), 3000);
          }}
        />
      )}
    </div>
  );
};

const CreateIftaReportModal = ({ quarters, onClose, onSuccess }) => {
  const [quorter, setQuorter] = useState(quarters[0].value);
  const [fuel, setFuel] = useState(null);
  const [mile, setMile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fayl validatsiyasi
  const handleFuelChange = (e) => {
    const file = e.target.files[0];
    if (file && !file.name.toLowerCase().endsWith('.xlsx')) {
      setError('Fuel file must be an Excel file (.xlsx)');
      setFuel(null);
    } else {
      setError('');
      setFuel(file);
    }
  };
  const handleMileChange = (e) => {
    const file = e.target.files[0];
    if (file && !file.name.toLowerCase().endsWith('.csv')) {
      setError('Mile file must be a CSV file (.csv)');
      setMile(null);
    } else {
      setError('');
      setMile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fuel || !mile || !quorter) {
      setError('All fields are required.');
      return;
    }
    if (!(fuel instanceof File) || !(mile instanceof File)) {
      setError('Please select valid files for both Fuel and Mile.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('fuel', fuel, fuel.name);
      formData.append('mile', mile, mile.name);
      formData.append('quorter', quorter);
      await createIftaReport(formData);
      onSuccess();
    } catch (err) {
      let msg = 'Failed to create IFTA report';
      if (err && err.response && err.response.data) {
        msg += ': ' + (typeof err.response.data === 'string' ? err.response.data : JSON.stringify(err.response.data));
      } else if (err && err.message) {
        msg += ': ' + err.message;
      }
      setError(msg);
      console.error('IFTA Report POST error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Create IFTA Report</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Quarter *</label>
              <select value={quorter} onChange={e => setQuorter(e.target.value)} required>
                {quarters.map(q => (
                  <option key={q.value} value={q.value}>{q.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Fuel File (.xlsx) *</label>
              <input type="file" accept=".xlsx" onChange={handleFuelChange} required />
            </div>
            <div className="form-group">
              <label>Mile File (.csv) *</label>
              <input type="file" accept=".csv" onChange={handleMileChange} required />
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="btn-save" disabled={loading}>{loading ? 'Creating...' : 'Create Report'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IftaReportsPage; 