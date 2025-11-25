import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getIftaRecords, deleteIftaRecord, getFuelTaxRates, deleteFuelTaxRate, getDrivers } from '../../api/ifta';
import CreateIftaModal from './CreateIftaModal';
import EditIftaModal from './EditIftaModal';
import CreateFuelTaxRatesModal from './CreateFuelTaxRatesModal';
import './IftaPage.css';
import { useLocation } from 'react-router-dom';
import IftaReportsPage from './IftaReportsPage';
import PulseDotsLoader from '../loader/PulseDotsLoader';

const IftaPage = () => {
  // const { t } = useTranslation(); // Translation not used yet
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
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [activeTab, setActiveTab] = useState('ifta');
  const [permissions, setPermissions] = useState({});
  
  // Hierarchical expansion states for IFTA records
  const [expandedYears, setExpandedYears] = useState({});
  const [expandedQuartersInYear, setExpandedQuartersInYear] = useState({});
  const [expandedWeeks, setExpandedWeeks] = useState({});
  const [expandedDrivers, setExpandedDrivers] = useState({});

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const driverId = queryParams.get('driverId');

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
    { value: 'Quarter 1', label: 'Quarter 1' },
    { value: 'Quarter 2', label: 'Quarter 2' },
    { value: 'Quarter 3', label: 'Quarter 3' },
    { value: 'Quarter 4', label: 'Quarter 4' },
  ];

  const [showCreateIftaReportModal, setShowCreateIftaReportModal] = useState(false);

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

  // Calculate driver totals organized by year, quarter, and week
  const calculateDriverTotals = (targetDriverId) => {
    const driverData = {
      years: {},
      totalMiles: 0,
      totalTax: 0
    };

    iftaRecords.forEach(record => {
      const recordDriverId = record.driver;
      if (recordDriverId === parseInt(targetDriverId)) {
        const year = record.fuel_tax_rate?.year || new Date().getFullYear();
        const quarter = record.quarter;
        const weeklyNumber = record.weekly_number;
        const miles = parseFloat(record.total_miles) || 0;
        const tax = parseFloat(record.tax) || 0;

        // Initialize year if not exists
        if (!driverData.years[year]) {
          driverData.years[year] = {
            quarters: {},
            totalMiles: 0,
            totalTax: 0
          };
        }

        // Initialize quarter if not exists
        if (!driverData.years[year].quarters[quarter]) {
          driverData.years[year].quarters[quarter] = {
            weeks: {},
            totalMiles: 0,
            totalTax: 0
          };
        }

        // Initialize week if not exists
        if (!driverData.years[year].quarters[quarter].weeks[weeklyNumber]) {
          driverData.years[year].quarters[quarter].weeks[weeklyNumber] = {
            totalMiles: 0,
            totalTax: 0
          };
        }

        // Add to totals
        driverData.years[year].quarters[quarter].weeks[weeklyNumber].totalMiles += miles;
        driverData.years[year].quarters[quarter].weeks[weeklyNumber].totalTax += tax;
        driverData.years[year].quarters[quarter].totalMiles += miles;
        driverData.years[year].quarters[quarter].totalTax += tax;
        driverData.years[year].totalMiles += miles;
        driverData.years[year].totalTax += tax;
        driverData.totalMiles += miles;
        driverData.totalTax += tax;
      }
    });

    return driverData;
  };

  const toggleQuarter = (quarter) => {
    setExpandedQuarters(prev => ({
      ...prev,
      [quarter]: !prev[quarter]
    }));
  };

  const handleDeleteFuelTaxRate = async (id) => {
    if (permissions.ifta_delete && window.confirm('Are you sure you want to delete this fuel tax rate?')) {
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
    if (permissions.ifta_update) {
      setSelectedRecord(record);
      setShowEditModal(true);
    }
  };

  const handleDelete = async (id) => {
    if (permissions.ifta_delete && window.confirm('Are you sure you want to delete this IFTA record?')) {
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
    // {driverData?.user?.first_name} {driverData?.user?.last_name}
    return driver ? `${driver.user?.first_name} ${driver.user?.last_name}` : 'Unknown';
  };

  const formatAmount = (amount) => {
    if (!amount) return '$0.00';
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  const filteredIftaRecords = driverId
    ? iftaRecords.filter(record => String(record.driver) === String(driverId))
    : iftaRecords;

  if (loading) {
    return (
      <div className="loading" style={{ minHeight: '40vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <PulseDotsLoader size="lg" ariaLabel="Loading IFTA records" />
      </div>
    );
  }

  return (
    <div className="ifta-page">
      <div className="ifta-container">
        <div className="ifta-header">
          <h1 className="ifta-title">
            {driverId ? "Driver IFTA Records" : "IFTA Management"}
          </h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            {activeTab === 'ifta' && permissions.ifta_create && (
              <button 
                className="btn-primary"
                onClick={() => setShowCreateModal(true)}
              >
                Create IFTA Records
              </button>
            )}
            {activeTab === 'fuel-tax-rates' && permissions.ifta_create && (
              <button 
                className="btn-primary"
                onClick={() => setShowFuelTaxRatesModal(true)}
              >
                Create Fuel Tax Rates
              </button>
            )}
            {activeTab === 'ifta-reports' && permissions.ifta_create && (
              <button
                className="btn-primary"
                onClick={() => setShowCreateIftaReportModal(true)}
              >
                Create IFTA Report
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
            <button
              className={`tab-button ${activeTab === 'ifta-reports' ? 'active' : ''}`}
              onClick={() => setActiveTab('ifta-reports')}
            >
              Ifta Reports
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
                {driverId ? 'No IFTA records found for this driver.' : 'No IFTA records found.'}
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
                          backgroundColor: 'white',
                          color: 'black',
                          border: '2px solid #007bff',
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
                                      backgroundColor: 'white',
                                      color: 'black',
                                      border: '2px solid #28a745',
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
                                                  backgroundColor: 'white',
                                                  color: 'black',
                                                  border: '2px solid #ffc107',
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
                                                    const driverTotals = calculateDriverTotals(driverId);
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
                                                            backgroundColor: 'white',
                                                            color: 'black',
                                                            border: '2px solid #6f42c1',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            marginBottom: '4px',
                                                            transition: 'background-color 0.3s'
                                                          }}
                                                        >
                                                          <div>
                                                            <span style={{ fontSize: '13px', marginRight: '10px', fontWeight: 'bold' }}>
                                                              {getDriverName(parseInt(driverId))}
                                                            </span>
                                                            <div style={{ fontSize: '10px', marginTop: '4px' }}>
                                                              <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>
                                                                Current Week Total: Miles {driverData.totalMiles.toFixed(2)} | Tax {formatAmount(driverData.totalTax)}
                                                              </div>
                                                              <div style={{ fontSize: '9px' }}>
                                                                <strong>All Years:</strong> {Object.keys(driverTotals.years).map(y => 
                                                                  `${y} (${driverTotals.years[y].totalMiles.toFixed(0)}mi, ${formatAmount(driverTotals.years[y].totalTax)})`
                                                                ).join(', ')}
                                                              </div>
                                                              <div style={{ fontSize: '9px' }}>
                                                                <strong>All Quarters:</strong> {Object.keys(driverTotals.years).map(y => 
                                                                  Object.keys(driverTotals.years[y].quarters).map(q => 
                                                                    `${q}-${y} (${driverTotals.years[y].quarters[q].totalMiles.toFixed(0)}mi, ${formatAmount(driverTotals.years[y].quarters[q].totalTax)})`
                                                                  )
                                                                ).flat().join(', ')}
                                                              </div>
                                                              <div style={{ fontSize: '11px' }}>
                                                                <strong>All Weeks:</strong>
                                                                <div style={{ 
                                                                  display: 'flex', 
                                                                  gap: '30px', 
                                                                  marginTop: '6px',
                                                                  width: '100%'
                                                                }}>
                                                                  {(() => {
                                                                    // Get all weeks data
                                                                    const allWeeks = Object.keys(driverTotals.years).map(y => 
                                                                      Object.keys(driverTotals.years[y].quarters).map(q => 
                                                                        Object.keys(driverTotals.years[y].quarters[q].weeks).map(w => ({
                                                                          week: parseInt(w),
                                                                          quarter: q,
                                                                          year: parseInt(y),
                                                                          miles: driverTotals.years[y].quarters[q].weeks[w].totalMiles,
                                                                          tax: driverTotals.years[y].quarters[q].weeks[w].totalTax
                                                                        }))
                                                                      )
                                                                    ).flat().flat().sort((a, b) => {
                                                                      // Sort by year first, then quarter, then week
                                                                      if (a.year !== b.year) return a.year - b.year;
                                                                      
                                                                      // Extract quarter numbers for sorting
                                                                      const getQuarterNum = (quarter) => parseInt(quarter.replace('Quarter ', ''));
                                                                      const quarterA = getQuarterNum(a.quarter);
                                                                      const quarterB = getQuarterNum(b.quarter);
                                                                      
                                                                      if (quarterA !== quarterB) return quarterA - quarterB;
                                                                      return a.week - b.week;
                                                                    });
                                                                    
                                                                    // Split into 3 groups
                                                                    const chunkSize = Math.ceil(allWeeks.length / 4);
                                                                    const chunks = [];
                                                                    for (let i = 0; i < allWeeks.length; i += chunkSize) {
                                                                      chunks.push(allWeeks.slice(i, i + chunkSize));
                                                                    }
                                                                    
                                                                    return chunks.map((chunk, index) => (
                                                                      <table key={index} style={{ 
                                                                        width: 'calc(25% - 4px)',
                                                                        borderCollapse: 'collapse', 
                                                                        fontSize: '10px',
                                                                        border: '1px solid #ddd'
                                                                      }}>
                                                                        <thead>
                                                                          <tr style={{ backgroundColor: '#f0f8ff' }}>
                                                                            <th style={{ padding: '4px 6px', border: '1px solid #ddd', fontWeight: 'bold', fontSize: '10px' }}>Week</th>
                                                                            <th style={{ padding: '4px 6px', border: '1px solid #ddd', fontWeight: 'bold', fontSize: '10px' }}>Quarter</th>
                                                                            <th style={{ padding: '4px 6px', border: '1px solid #ddd', fontWeight: 'bold', fontSize: '10px' }}>Year</th>
                                                                            <th style={{ padding: '4px 6px', border: '1px solid #ddd', fontWeight: 'bold', fontSize: '10px' }}>Miles</th>
                                                                            <th style={{ padding: '4px 6px', border: '1px solid #ddd', fontWeight: 'bold', fontSize: '10px' }}>Tax</th>
                                                                          </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                          {chunk.map((weekData, rowIndex) => (
                                                                            <tr key={`${weekData.year}-${weekData.quarter}-${weekData.week}`}>
                                                                              <td style={{ padding: '4px 6px', border: '1px solid #ddd', textAlign: 'center', fontSize: '10px' }}>W{weekData.week}</td>
                                                                              <td style={{ padding: '4px 6px', border: '1px solid #ddd', textAlign: 'center', fontSize: '10px' }}>{weekData.quarter}</td>
                                                                              <td style={{ padding: '4px 6px', border: '1px solid #ddd', textAlign: 'center', fontSize: '10px' }}>{weekData.year}</td>
                                                                              <td style={{ padding: '4px 6px', border: '1px solid #ddd', textAlign: 'right', fontSize: '10px' }}>
                                                                                {weekData.miles.toFixed(0)}mi
                                                                              </td>
                                                                              <td style={{ padding: '4px 6px', border: '1px solid #ddd', textAlign: 'right', fontSize: '10px' }}>
                                                                                {formatAmount(weekData.tax)}
                                                                              </td>
                                                                            </tr>
                                                                          ))}
                                                                        </tbody>
                                                                      </table>
                                                                    ));
                                                                  })()}
                                                                </div>
                                                              </div>
                                                            </div>
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
                                                                        {permissions.ifta_update && (
                                                                          <button 
                                                                            className="btn-secondary"
                                                                            style={{ fontSize: '10px', padding: '2px 6px' }}
                                                                            onClick={() => handleEdit(record)}
                                                                          >
                                                                            Edit
                                                                          </button>
                                                                        )}
                                                                        {permissions.ifta_delete && (
                                                                          <button 
                                                                            className="btn-danger"
                                                                            style={{ fontSize: '10px', padding: '2px 6px' }}
                                                                            onClick={() => handleDelete(record.id)}
                                                                          >
                                                                            Delete
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
        ) : activeTab === 'fuel-tax-rates' ? (
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
                                {permissions.ifta_update && (
                                  <button 
                                    className="btn-secondary"
                                    onClick={() => {
                                      console.log('Edit fuel tax rate:', rate.id);
                                    }}
                                  >
                                    Edit
                                  </button>
                                )}
                                {permissions.ifta_delete && (
                                  <button 
                                    className="btn-danger"
                                    onClick={() => handleDeleteFuelTaxRate(rate.id)}
                                  >
                                    Delete
                                  </button>
                                )}
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
        ) : (
          <IftaReportsPage showCreateModal={showCreateIftaReportModal} setShowCreateModal={setShowCreateIftaReportModal} />
        )}

        {showCreateModal && permissions.ifta_create && (
          <CreateIftaModal
            drivers={drivers}
            quarters={QUARTERS}
            states={US_STATES}
            onClose={() => setShowCreateModal(false)}
            onSuccess={handleCreateSuccess}
          />
        )}

        {showEditModal && selectedRecord && permissions.ifta_update && (
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

        {showFuelTaxRatesModal && permissions.ifta_create && (
          <CreateFuelTaxRatesModal
            quarters={QUARTERS}
            states={US_STATES}
            onClose={() => setShowFuelTaxRatesModal(false)}
            onSuccess={handleFuelTaxRatesSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default IftaPage;
