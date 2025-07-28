import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getIftaRecords, deleteIftaRecord, getFuelTaxRates, deleteFuelTaxRate } from '../../api/ifta';
import { getDrivers } from '../../api/accounting';
import CreateIftaModal from './CreateIftaModal';
import EditIftaModal from './EditIftaModal';
import CreateFuelTaxRatesModal from './CreateFuelTaxRatesModal';
import EditFuelTaxRateModal from './EditFuelTaxRateModal';
import './IftaPage.css';

const IftaPage = () => {
  const { t } = useTranslation();
  const [iftaRecords, setIftaRecords] = useState([]);
  const [fuelTaxRates, setFuelTaxRates] = useState([]);
  const [expandedQuarters, setExpandedQuarters] = useState({});
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFuelTaxRatesModal, setShowFuelTaxRatesModal] = useState(false);
  const [showEditFuelTaxModal, setShowEditFuelTaxModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedFuelTaxRate, setSelectedFuelTaxRate] = useState(null);
  const [activeTab, setActiveTab] = useState('ifta');
  
  // Hierarchical expansion states for IFTA records
  const [expandedYears, setExpandedYears] = useState({});
  const [expandedQuartersInYear, setExpandedQuartersInYear] = useState({});
  const [expandedWeeks, setExpandedWeeks] = useState({});
  const [expandedDrivers, setExpandedDrivers] = useState({});

  const US_STATES = [
    { code: 'AL', name: 'Alabama' },
    { code: 'AK', name: 'Alaska' },
    { code: 'AZ', name: 'Arizona' },
    { code: 'AR', name: 'Arkansas' },
    { code: 'CA', name: 'California' },
    { code: 'CO', name: 'Colorado' },
    { code: 'CT', name: 'Connecticut' },
    { code: 'DE', name: 'Delaware' },
    { code: 'FL', name: 'Florida' },
    { code: 'GA', name: 'Georgia' },
    { code: 'HI', name: 'Hawaii' },
    { code: 'ID', name: 'Idaho' },
    { code: 'IL', name: 'Illinois' },
    { code: 'IN', name: 'Indiana' },
    { code: 'IA', name: 'Iowa' },
    { code: 'KS', name: 'Kansas' },
    { code: 'KY', name: 'Kentucky' },
    { code: 'KY Surcharge', name: 'Kentucky Surcharge' },
    { code: 'LA', name: 'Louisiana' },
    { code: 'ME', name: 'Maine' },
    { code: 'MD', name: 'Maryland' },
    { code: 'MA', name: 'Massachusetts' },
    { code: 'MI', name: 'Michigan' },
    { code: 'MN', name: 'Minnesota' },
    { code: 'MS', name: 'Mississippi' },
    { code: 'MO', name: 'Missouri' },
    { code: 'MT', name: 'Montana' },
    { code: 'NE', name: 'Nebraska' },
    { code: 'NV', name: 'Nevada' },
    { code: 'NH', name: 'New Hampshire' },
    { code: 'NJ', name: 'New Jersey' },
    { code: 'NM', name: 'New Mexico' },
    { code: 'NY', name: 'New York' },
    { code: 'NC', name: 'North Carolina' },
    { code: 'ND', name: 'North Dakota' },
    { code: 'OH', name: 'Ohio' },
    { code: 'OK', name: 'Oklahoma' },
    { code: 'OR', name: 'Oregon' },
    { code: 'PA', name: 'Pennsylvania' },
    { code: 'RI', name: 'Rhode Island' },
    { code: 'SC', name: 'South Carolina' },
    { code: 'SD', name: 'South Dakota' },
    { code: 'TN', name: 'Tennessee' },
    { code: 'TX', name: 'Texas' },
    { code: 'UT', name: 'Utah' },
    { code: 'VT', name: 'Vermont' },
    { code: 'VA', name: 'Virginia' },
    { code: 'WA', name: 'Washington' },
    { code: 'WV', name: 'West Virginia' },
    { code: 'WI', name: 'Wisconsin' },
    { code: 'WY', name: 'Wyoming' },
  ];

  const QUARTERS = [
    { value: 'Quarter 1', label: 'Quarter 1 (Jan-Mar)' },
    { value: 'Quarter 2', label: 'Quarter 2 (Apr-Jun)' },
    { value: 'Quarter 3', label: 'Quarter 3 (Jul-Sep)' },
    { value: 'Quarter 4', label: 'Quarter 4 (Oct-Dec)' },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [iftaData, driversData, fuelTaxData] = await Promise.all([
        getIftaRecords(),
        getDrivers(),
        getFuelTaxRates()
      ]);
      setIftaRecords(iftaData);
      setDrivers(driversData);
      setFuelTaxRates(fuelTaxData);
      setError('');
    } catch (err) {
      setError('Failed to fetch data: ' + err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fuel tax rates quarter-wise grouping
  const getGroupedFuelTaxRates = () => {
    const grouped = {};
    fuelTaxRates.forEach(rate => {
      if (!grouped[rate.quarter]) {
        grouped[rate.quarter] = [];
      }
      grouped[rate.quarter].push(rate);
    });
    return grouped;
  };

  // IFTA Records hierarchical grouping
  const getGroupedIftaRecords = () => {
    const grouped = {};
    
    iftaRecords.forEach(record => {
      const year = record.fuel_tax_rate?.year || new Date().getFullYear();
      const quarter = record.quarter;
      const weeklyNumber = record.weekly_number;
      const driverId = record.driver;
      
      // Initialize year
      if (!grouped[year]) {
        grouped[year] = {
          quarters: {},
          totalMiles: 0,
          totalTax: 0
        };
      }
      
      // Initialize quarter
      if (!grouped[year].quarters[quarter]) {
        grouped[year].quarters[quarter] = {
          weeks: {},
          totalMiles: 0,
          totalTax: 0
        };
      }
      
      // Initialize week
      if (!grouped[year].quarters[quarter].weeks[weeklyNumber]) {
        grouped[year].quarters[quarter].weeks[weeklyNumber] = {
          drivers: {},
          totalMiles: 0,
          totalTax: 0
        };
      }
      
      // Initialize driver
      if (!grouped[year].quarters[quarter].weeks[weeklyNumber].drivers[driverId]) {
        grouped[year].quarters[quarter].weeks[weeklyNumber].drivers[driverId] = {
          records: [],
          totalMiles: 0,
          totalTax: 0
        };
      }
      
      // Add record and calculate totals
      const miles = parseFloat(record.total_miles) || 0;
      const tax = parseFloat(record.tax) || 0;
      
      grouped[year].quarters[quarter].weeks[weeklyNumber].drivers[driverId].records.push(record);
      grouped[year].quarters[quarter].weeks[weeklyNumber].drivers[driverId].totalMiles += miles;
      grouped[year].quarters[quarter].weeks[weeklyNumber].drivers[driverId].totalTax += tax;
      
      // Update week totals
      grouped[year].quarters[quarter].weeks[weeklyNumber].totalMiles += miles;
      grouped[year].quarters[quarter].weeks[weeklyNumber].totalTax += tax;
      
      // Update quarter totals
      grouped[year].quarters[quarter].totalMiles += miles;
      grouped[year].quarters[quarter].totalTax += tax;
      
      // Update year totals
      grouped[year].totalMiles += miles;
      grouped[year].totalTax += tax;
    });
    
    return grouped;
  };

  // Toggle functions for hierarchical expansion
  const toggleYear = (year) => {
    setExpandedYears(prev => ({
      ...prev,
      [year]: !prev[year]
    }));
  };

  const toggleQuarterInYear = (year, quarter) => {
    const key = `${year}-${quarter}`;
    setExpandedQuartersInYear(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleWeek = (year, quarter, weeklyNumber) => {
    const key = `${year}-${quarter}-${weeklyNumber}`;
    setExpandedWeeks(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleDriver = (year, quarter, weeklyNumber, driverId) => {
    const key = `${year}-${quarter}-${weeklyNumber}-${driverId}`;
    setExpandedDrivers(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleQuarter = (quarter) => {
    setExpandedQuarters(prev => ({
      ...prev,
      [quarter]: !prev[quarter]
    }));
  };

  const handleDeleteFuelTaxRate = async (id) => {
    if (window.confirm('Are you sure you want to delete this fuel tax rate?')) {
      try {
        await deleteFuelTaxRate(id);
        setSuccessMessage('Fuel tax rate deleted successfully!');
        fetchData();
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (err) {
        setError('Failed to delete fuel tax rate');
        console.error('Error deleting fuel tax rate:', err);
      }
    }
  };

  const handleEditFuelTaxRate = (rate) => {
    setSelectedFuelTaxRate(rate);
    setShowEditFuelTaxModal(true);
  };

  const handleEditFuelTaxSuccess = () => {
    setShowEditFuelTaxModal(false);
    setSelectedFuelTaxRate(null);
    setSuccessMessage('Fuel tax rate updated successfully!');
    fetchData();
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    setSuccessMessage('IFTA records created successfully!');
    fetchData();
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setSelectedRecord(null);
    setSuccessMessage('IFTA record updated successfully!');
    fetchData();
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleFuelTaxRatesSuccess = () => {
    setShowFuelTaxRatesModal(false);
    setSuccessMessage('Fuel tax rates created successfully!');
    fetchData();
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleEdit = (record) => {
    setSelectedRecord(record);
    setShowEditModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this IFTA record?')) {
      try {
        await deleteIftaRecord(id);
        setSuccessMessage('IFTA record deleted successfully!');
        fetchData();
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (err) {
        setError('Failed to delete IFTA record');
        console.error('Error deleting IFTA record:', err);
      }
    }
  };

  const getStateName = (code) => {
    const state = US_STATES.find(s => s.code === code);
    return state ? state.name : code;
  };

  const getDriverName = (driverId) => {
    const driver = drivers.find(d => d.id === driverId);
    return driver ? `${driver.user.first_name} ${driver.user.last_name}` : 'Unknown';
  };

  const formatAmount = (amount) => {
    if (!amount) return '$0.00';
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  if (loading) {
    return <div className="loading">Loading IFTA records...</div>;
  }

  return (
    <div className="ifta-page">
      <div className="ifta-container">
        <div className="ifta-header">
          <h1 className="ifta-title">IFTA Management</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            {activeTab === 'ifta' && (
              <button 
                className="btn-primary"
                onClick={() => setShowCreateModal(true)}
              >
                Create IFTA Records
              </button>
            )}
            {activeTab === 'fuel-tax-rates' && (
              <button 
                className="btn-primary"
                onClick={() => setShowFuelTaxRatesModal(true)}
              >
                Create Fuel Tax Rates
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs-container">
          <div className="tabs-header">
            <button 
              className={`tab-button ${activeTab === 'ifta' ? 'active' : ''}`}
              onClick={() => setActiveTab('ifta')}
            >
              IFTA Records
            </button>
            <button 
              className={`tab-button ${activeTab === 'fuel-tax-rates' ? 'active' : ''}`}
              onClick={() => setActiveTab('fuel-tax-rates')}
            >
              Fuel Tax Rates
            </button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        {activeTab === 'ifta' ? (
          // IFTA Records Hierarchical View
          <div className="ifta-records-hierarchical">
            {Object.keys(getGroupedIftaRecords()).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                No IFTA records found
              </div>
            ) : (
              Object.keys(getGroupedIftaRecords())
                .sort((a, b) => b - a) // Sort years descending
                .map((year) => {
                  const yearData = getGroupedIftaRecords()[year];
                  return (
                    <div key={year} className="year-group">
                      <div 
                        className="year-header"
                        onClick={() => toggleYear(year)}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '15px',
                          backgroundColor: '#007bff',
                          color: 'white',
                          border: '1px solid #0056b3',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          marginBottom: '10px',
                          transition: 'background-color 0.3s',
                          fontWeight: 'bold'
                        }}
                      >
                        <div>
                          <span style={{ fontSize: '18px', marginRight: '20px' }}>Year {year}</span>
                          <span style={{ fontSize: '14px' }}>
                            Total Miles: {yearData.totalMiles.toFixed(2)} | 
                            Total Tax: {formatAmount(yearData.totalTax)}
                          </span>
                        </div>
                        <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
                          {expandedYears[year] ? '▼' : '▶'}
                        </span>
                      </div>

                      {expandedYears[year] && (
                        <div style={{ marginLeft: '20px', marginBottom: '20px' }}>
                          {Object.keys(yearData.quarters)
                            .sort((a, b) => {
                              const order = { 'Quarter 1': 1, 'Quarter 2': 2, 'Quarter 3': 3, 'Quarter 4': 4 };
                              return order[a] - order[b];
                            })
                            .map((quarter) => {
                              const quarterData = yearData.quarters[quarter];
                              const quarterKey = `${year}-${quarter}`;
                              return (
                                <div key={quarter} className="quarter-group">
                                  <div 
                                    className="quarter-header"
                                    onClick={() => toggleQuarterInYear(year, quarter)}
                                    style={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      padding: '12px',
                                      backgroundColor: '#28a745',
                                      color: 'white',
                                      border: '1px solid #1e7e34',
                                      borderRadius: '6px',
                                      cursor: 'pointer',
                                      marginBottom: '8px',
                                      transition: 'background-color 0.3s'
                                    }}
                                  >
                                    <div>
                                      <span style={{ fontSize: '16px', marginRight: '15px' }}>{quarter}</span>
                                      <span style={{ fontSize: '13px' }}>
                                        Total Miles: {quarterData.totalMiles.toFixed(2)} | 
                                        Total Tax: {formatAmount(quarterData.totalTax)}
                                      </span>
                                    </div>
                                    <span style={{ fontSize: '16px' }}>
                                      {expandedQuartersInYear[quarterKey] ? '▼' : '▶'}
                                    </span>
                                  </div>

                                  {expandedQuartersInYear[quarterKey] && (
                                    <div style={{ marginLeft: '20px', marginBottom: '15px' }}>
                                      {Object.keys(quarterData.weeks)
                                        .sort((a, b) => parseInt(a) - parseInt(b))
                                        .map((weeklyNumber) => {
                                          const weekData = quarterData.weeks[weeklyNumber];
                                          const weekKey = `${year}-${quarter}-${weeklyNumber}`;
                                          return (
                                            <div key={weeklyNumber} className="week-group">
                                              <div 
                                                className="week-header"
                                                onClick={() => toggleWeek(year, quarter, weeklyNumber)}
                                                style={{
                                                  display: 'flex',
                                                  justifyContent: 'space-between',
                                                  alignItems: 'center',
                                                  padding: '10px',
                                                  backgroundColor: '#ffc107',
                                                  color: '#212529',
                                                  border: '1px solid #e0a800',
                                                  borderRadius: '4px',
                                                  cursor: 'pointer',
                                                  marginBottom: '6px',
                                                  transition: 'background-color 0.3s'
                                                }}
                                              >
                                                <div>
                                                  <span style={{ fontSize: '14px', marginRight: '15px', fontWeight: 'bold' }}>
                                                    Week {weeklyNumber}
                                                  </span>
                                                  <span style={{ fontSize: '12px' }}>
                                                    Total Miles: {weekData.totalMiles.toFixed(2)} | 
                                                    Total Tax: {formatAmount(weekData.totalTax)}
                                                  </span>
                                                </div>
                                                <span style={{ fontSize: '14px' }}>
                                                  {expandedWeeks[weekKey] ? '▼' : '▶'}
                                                </span>
                                              </div>

                                              {expandedWeeks[weekKey] && (
                                                <div style={{ marginLeft: '20px', marginBottom: '10px' }}>
                                                  {Object.keys(weekData.drivers).map((driverId) => {
                                                    const driverData = weekData.drivers[driverId];
                                                    const driverKey = `${year}-${quarter}-${weeklyNumber}-${driverId}`;
                                                    return (
                                                      <div key={driverId} className="driver-group">
                                                        <div 
                                                          className="driver-header"
                                                          onClick={() => toggleDriver(year, quarter, weeklyNumber, driverId)}
                                                          style={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            padding: '8px',
                                                            backgroundColor: '#6f42c1',
                                                            color: 'white',
                                                            border: '1px solid #5a32a3',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            marginBottom: '4px',
                                                            transition: 'background-color 0.3s'
                                                          }}
                                                        >
                                                          <div>
                                                            <span style={{ fontSize: '13px', marginRight: '10px' }}>
                                                              {getDriverName(parseInt(driverId))}
                                                            </span>
                                                            <span style={{ fontSize: '11px' }}>
                                                              Total Miles: {driverData.totalMiles.toFixed(2)} | 
                                                              Total Tax: {formatAmount(driverData.totalTax)}
                                                            </span>
                                                          </div>
                                                          <span style={{ fontSize: '12px' }}>
                                                            {expandedDrivers[driverKey] ? '▼' : '▶'}
                                                          </span>
                                                        </div>

                                                        {expandedDrivers[driverKey] && (
                                                          <div style={{ marginLeft: '15px' }}>
                                                            <table className="ifta-records-detail-table" style={{
                                                              width: '100%',
                                                              borderCollapse: 'collapse',
                                                              fontSize: '12px',
                                                              marginBottom: '10px'
                                                            }}>
                                                              <thead>
                                                                <tr style={{ backgroundColor: '#f8f9fa' }}>
                                                                  <th style={{ padding: '6px', border: '1px solid #ddd' }}>State</th>
                                                                  <th style={{ padding: '6px', border: '1px solid #ddd' }}>Miles</th>
                                                                  <th style={{ padding: '6px', border: '1px solid #ddd' }}>Tax Paid Gallon</th>
                                                                  <th style={{ padding: '6px', border: '1px solid #ddd' }}>Tax</th>
                                                                  <th style={{ padding: '6px', border: '1px solid #ddd' }}>Invoice</th>
                                                                  <th style={{ padding: '6px', border: '1px solid #ddd' }}>Actions</th>
                                                                </tr>
                                                              </thead>
                                                              <tbody>
                                                                {driverData.records.map((record) => (
                                                                  <tr key={record.id}>
                                                                    <td style={{ padding: '6px', border: '1px solid #ddd' }}>
                                                                      {record.state} - {getStateName(record.state)}
                                                                    </td>
                                                                    <td style={{ padding: '6px', border: '1px solid #ddd' }}>
                                                                      {record.total_miles}
                                                                    </td>
                                                                    <td style={{ padding: '6px', border: '1px solid #ddd' }}>
                                                                      {record.tax_paid_gallon || '-'}
                                                                    </td>
                                                                    <td style={{ padding: '6px', border: '1px solid #ddd' }}>
                                                                      {formatAmount(record.tax)}
                                                                    </td>
                                                                    <td style={{ padding: '6px', border: '1px solid #ddd' }}>
                                                                      {record.invoice_number}
                                                                    </td>
                                                                    <td style={{ padding: '6px', border: '1px solid #ddd' }}>
                                                                      <div style={{ display: 'flex', gap: '4px' }}>
                                                                        <button 
                                                                          className="btn-secondary"
                                                                          style={{ fontSize: '10px', padding: '2px 6px' }}
                                                                          onClick={() => handleEdit(record)}
                                                                        >
                                                                          Edit
                                                                        </button>
                                                                        <button 
                                                                          className="btn-danger"
                                                                          style={{ fontSize: '10px', padding: '2px 6px' }}
                                                                          onClick={() => handleDelete(record.id)}
                                                                        >
                                                                          Delete
                                                                        </button>
                                                                      </div>
                                                                    </td>
                                                                  </tr>
                                                                ))}
                                                              </tbody>
                                                            </table>
                                                          </div>
                                                        )}
                                                      </div>
                                                    );
                                                  })}
                                                </div>
                                              )}
                                            </div>
                                          );
                                        })}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  );
                })
            )}
          </div>
        ) : (
          // Fuel Tax Rates Table - Quarter-wise grouped
          <div className="fuel-tax-rates">
            {Object.keys(getGroupedFuelTaxRates()).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                No fuel tax rates found
              </div>
            ) : (
              Object.keys(getGroupedFuelTaxRates()).map((quarter) => (
                <div key={quarter} className="quarter-group">
                  <div 
                    className="quarter-header"
                    onClick={() => toggleQuarter(quarter)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '15px',
                      backgroundColor: '#f8f9fa',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      marginBottom: '10px',
                      transition: 'background-color 0.3s'
                    }}
                  >
                    <h3 style={{ margin: 0, color: '#007bff' }}>{quarter}</h3>
                    <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
                      {expandedQuarters[quarter] ? '▼' : '▶'}
                    </span>
                  </div>

                  {expandedQuarters[quarter] && (
                    <table className="fuel-tax-rates-table">
                      <thead>
                        <tr>
                          <th>State</th>
                          <th>Rate</th>
                          <th>MPG</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getGroupedFuelTaxRates()[quarter].map((rate) => (
                          <tr key={rate.id}>
                            <td>{rate.state} - {getStateName(rate.state)}</td>
                            <td>${rate.rate}</td>
                            <td>{rate.mpg}</td>
                            <td>
                              <div className="ifta-actions">
                                <button 
                                  className="btn-secondary"
                                  onClick={() => handleEditFuelTaxRate(rate)}
                                >
                                  Edit
                                </button>
                                <button 
                                  className="btn-danger"
                                  onClick={() => handleDeleteFuelTaxRate(rate.id)}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {showCreateModal && (
          <CreateIftaModal
            drivers={drivers}
            quarters={QUARTERS}
            states={US_STATES}
            onClose={() => setShowCreateModal(false)}
            onSuccess={handleCreateSuccess}
          />
        )}

        {showEditModal && selectedRecord && (
          <EditIftaModal
            record={selectedRecord}
            drivers={drivers}
            quarters={QUARTERS}
            states={US_STATES}
            onClose={() => {
              setShowEditModal(false);
              setSelectedRecord(null);
            }}
            onSuccess={handleEditSuccess}
          />
        )}

        {showFuelTaxRatesModal && (
          <CreateFuelTaxRatesModal
            quarters={QUARTERS}
            states={US_STATES}
            onClose={() => setShowFuelTaxRatesModal(false)}
            onSuccess={handleFuelTaxRatesSuccess}
          />
        )}

        {showEditFuelTaxModal && selectedFuelTaxRate && (
          <EditFuelTaxRateModal
            record={selectedFuelTaxRate}
            quarters={QUARTERS}
            states={US_STATES}
            onClose={() => {
              setShowEditFuelTaxModal(false);
              setSelectedFuelTaxRate(null);
            }}
            onSuccess={handleEditFuelTaxSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default IftaPage;
