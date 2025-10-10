import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { getDriversSummary, getDriverCompletedLoads, postPaystubAction } from '../../api/paySystem';
import { testApiConnection } from '../../api/testConnection';
import './AccountingPage.css';

const STORAGE_KEY = 'driverPayPageState';

const ensureArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return [value];
};

const getDriverName = (driver) => {
  if (!driver) return 'Unknown Driver';
  
  // Try different name fields in order of preference
  if (driver.display_name) return driver.display_name;
  if (driver.full_name) return driver.full_name;
  if (driver.name) return driver.name;
  
  // Handle the API response format with first_name and last_name
  if (driver.first_name || driver.last_name) {
    const first = driver.first_name || '';
    const last = driver.last_name || '';
    const combined = `${first} ${last}`.trim();
    if (combined) return combined;
  }
  
  // Try to build name from nested user object
  const firstSources = [driver?.user?.first_name, driver?.profile?.first_name];
  const lastSources = [driver?.user?.last_name, driver?.profile?.last_name];
  
  const first = firstSources.find(name => name && name.trim()) || '';
  const last = lastSources.find(name => name && name.trim()) || '';
  
  const combined = `${first} ${last}`.trim();
  if (combined) return combined;
  
  // Try username
  if (driver?.user?.username) return driver.user.username;
  if (driver.username) return driver.username;
  
  // Fall back to ID
  const id = driver.id ?? driver.driver_id ?? driver?.user_id ?? 'N/A';
  return `Driver #${id}`;
};

const normalizeDriver = (driver) => {
  if (!driver) return null;
  
  // Try to get a valid ID from various possible fields
  const id = driver.id ?? driver.driver_id ?? driver?.user_id ?? driver?.user?.id;
  if (!id) {
    console.warn('Driver missing ID:', driver);
    return null;
  }
  
  // Determine if this is an owner operator based on the driver_type field
  const is_owner = driver.driver_type === 'OWNER_OPERATOR' ||
                  (driver.is_owner ?? 
                  driver?.driver_type === 'owner' ?? 
                  driver?.type === 'owner' ??
                  driver?.is_owner_operator ??
                  false);
  
  return {
    ...driver,
    id,
    is_owner,
    displayName: getDriverName(driver),
  };
};

const partitionDrivers = (payload) => {
  console.log('Partitioning drivers from payload:', payload);
  
  if (!payload) {
    return { company: [], owner: [] };
  }

  const company = [];
  const owner = [];

  const tryAppend = (list) => {
    ensureArray(list).forEach((item) => {
      const driver = normalizeDriver(item);
      if (driver) {
        // Use driver_type field to determine if it's a company driver or owner operator
        if (driver.driver_type === 'COMPANY_DRIVER') {
          company.push(driver);
        } else if (driver.driver_type === 'OWNER_OPERATOR') {
          owner.push(driver);
        } else {
          // Fallback to is_owner logic for compatibility
          if (driver.is_owner) {
            owner.push(driver);
          } else {
            company.push(driver);
          }
        }
      }
    });
  };

  // If payload is an array, treat it as a list of drivers
  if (Array.isArray(payload)) {
    tryAppend(payload);
  } else {
    // Try different possible structures
    tryAppend(payload.company_drivers);
    tryAppend(payload.owner_drivers);
    tryAppend(payload.results);
    tryAppend(payload.drivers);
    
    // If no specific structure found, try all values
    if (!company.length && !owner.length && typeof payload === 'object') {
      Object.values(payload).forEach((value) => {
        if (Array.isArray(value)) {
          tryAppend(value);
        }
      });
    }
  }

  const dedupe = (list) => {
    const seen = new Set();
    return list.filter((driver) => {
      if (seen.has(driver.id)) return false;
      seen.add(driver.id);
      return true;
    });
  };

  const result = {
    company: dedupe(company),
    owner: dedupe(owner),
  };
  
  console.log('Partitioned drivers result:', result);
  return result;
};

const getRowId = (item) => item?.id ?? item?.load_id ?? item?.uuid ?? item?.pk ?? item?.statement_id;

const formatCurrency = (value) => {
  const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]+/g, '')) : Number(value);
  if (Number.isNaN(num) || !Number.isFinite(num)) {
    return '$0.00';
  }
  return `$${num.toFixed(2)}`;
};

const formatMiles = (value) => {
  if (value === null || value === undefined || value === '') return '--';
  const miles = Number(value);
  if (Number.isNaN(miles)) return String(value);
  return `${miles.toFixed(0)} mi`;
};

const formatDateInput = (value) => (value ? value.slice(0, 10) : '');

const AccountingPage = () => {
  const { t } = useTranslation();

  console.log('AccountingPage render started');

  const [summary, setSummary] = useState({ company: [], owner: [] });
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState('');

  const [sidebarView, setSidebarView] = useState('company');
  const [driverSearch, setDriverSearch] = useState('');

  const [selectedDriverId, setSelectedDriverId] = useState(null);
  const [selectedDriverMeta, setSelectedDriverMeta] = useState(null);

  // Set default date range to current week
  const getDefaultDateRange = () => {
    const today = new Date();
    const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const lastDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));
    
    return {
      from: firstDayOfWeek.toISOString().split('T')[0],
      to: lastDayOfWeek.toISOString().split('T')[0]
    };
  };

  const [dateRange, setDateRange] = useState(getDefaultDateRange());
  const [driverData, setDriverData] = useState({ loads: [], driver: null });
  const [driverLoading, setDriverLoading] = useState(false);
  const [driverError, setDriverError] = useState('');

  const [expandedLoads, setExpandedLoads] = useState([]);
  const [selectedLoadIds, setSelectedLoadIds] = useState([]);

  const [statementNotes, setStatementNotes] = useState('');
  const [fuelAdvance, setFuelAdvance] = useState('');
  const [otherDeductions, setOtherDeductions] = useState('');

  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [lastStub, setLastStub] = useState(null);

  const [persistedHydrated, setPersistedHydrated] = useState(false);
  
  // Debug state
  const [debugMode, setDebugMode] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  
  // Use refs to track fetch state and prevent duplicate calls
  const fetchingDriverRef = useRef(false);
  const lastFetchParamsRef = useRef(null);

  const filteredDrivers = useMemo(() => {
    const list = sidebarView === 'owner' ? summary.owner : summary.company;
    if (!driverSearch.trim()) return list;
    const term = driverSearch.trim().toLowerCase();
    return list.filter((driver) => getDriverName(driver).toLowerCase().includes(term));
  }, [sidebarView, summary.owner, summary.company, driverSearch]);

  const persistState = useCallback((state) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.warn('Could not persist driver pay state', err);
    }
  }, []);

  const restorePersistedState = useCallback(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (err) {
      console.warn('Failed to parse persisted driver pay state', err);
      return null;
    }
  }, []);

  const handleLoadSelectChange = useCallback((loadId, checked) => {
    setSelectedLoadIds((prev) => {
      if (checked) {
        return prev.includes(loadId) ? prev : [...prev, loadId];
      } else {
        return prev.filter((id) => id !== loadId);
      }
    });
  }, []);

  const toggleLoadStops = useCallback((rowId) => {
    setExpandedLoads((prev) =>
      prev.includes(rowId) ? prev.filter((id) => id !== rowId) : [...prev, rowId]
    );
  }, []);

  const hydrateDriverData = useCallback((data, driverId) => {
    console.log('Hydrating driver data:', data);
    
    if (!data || typeof data !== 'object') {
      console.warn('Invalid data received for hydration:', data);
      return;
    }
    
    const loads = ensureArray(data?.loads).filter(Boolean);

    // Update driver data
    setDriverData({
      loads,
      driver: data.driver || { id: driverId },
    });
    
    // Auto-select all loads by default
    const defaultLoadIds = loads.map((load) => getRowId(load)).filter(Boolean);
    setSelectedLoadIds(defaultLoadIds);
    
    // Set form data from response only if they exist
    if (data.statement_notes !== undefined) {
      setStatementNotes(data.statement_notes || '');
    }
    if (data.fuel_advance !== undefined) {
      setFuelAdvance(data.fuel_advance ? String(data.fuel_advance) : '');
    }
    if (data.other_deductions !== undefined) {
      setOtherDeductions(data.other_deductions ? String(data.other_deductions) : '');
    }
    
    console.log('Driver data hydrated successfully:', { 
      loads: loads.length, 
      selectedLoadIds: defaultLoadIds.length
    });
  }, []);

  const fetchDriversSummary = useCallback(async () => {
    setSummaryLoading(true);
    setSummaryError('');
    try {
      const response = await getDriversSummary();
      console.log('Drivers summary response:', response);
      
      const normalized = partitionDrivers(response);
      setSummary(normalized);
      
    } catch (error) {
      console.error('Error in fetchDriversSummary:', error);
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message ||
        t('Unable to load driver summary');
      setSummaryError(message);
    } finally {
      setSummaryLoading(false);
    }
  }, [t]);

  // Handle state restoration when summary data is loaded
  useEffect(() => {
    if (summary.company.length > 0 || summary.owner.length > 0) {
      if (!persistedHydrated) {
        const saved = restorePersistedState();
        const fullList = [...summary.company, ...summary.owner];

        if (saved && saved.driverId) {
          const found = fullList.find((driver) => driver.id === saved.driverId);
          if (found) {
            setSidebarView(found.is_owner ? 'owner' : 'company');
            setSelectedDriverId(found.id);
            setSelectedDriverMeta(found);
            if (saved.from && saved.to) {
              setDateRange({
                from: saved.from,
                to: saved.to,
              });
            }
          }
        }

        const shouldForceCompany = summary.company.length > 0 && summary.owner.length === 0;
        const shouldForceOwner = summary.owner.length > 0 && summary.company.length === 0;

        setSidebarView((prev) => {
          if (shouldForceCompany) return 'company';
          if (shouldForceOwner) return 'owner';
          return prev || 'company';
        });

        setPersistedHydrated(true);
      }
    }
  }, [summary.company.length, summary.owner.length, persistedHydrated]);

  const fetchDriverDetails = useCallback(
    async (driverId, fromDate, toDate) => {
      if (!driverId || !fromDate || !toDate) {
        console.warn('fetchDriverDetails called without required params:', { driverId, fromDate, toDate });
        return;
      }
      
      // Check if we're already fetching or if params haven't changed
      const currentParams = `${driverId}-${fromDate}-${toDate}`;
      if (fetchingDriverRef.current || lastFetchParamsRef.current === currentParams) {
        console.log('Skipping duplicate fetch for params:', currentParams);
        return;
      }
      
      fetchingDriverRef.current = true;
      lastFetchParamsRef.current = currentParams;
      
      setDriverLoading(true);
      setDriverError('');
      
      try {
        const params = {
          from_date: fromDate,
          to_date: toDate
        };
        
        console.log('Fetching driver completed loads with params:', { driverId, params });
        
        const response = await getDriverCompletedLoads(driverId, params);
        console.log('Driver completed loads response:', response);
        
        // Handle response - check if response is array or object with loads
        let loadsData = [];
        if (Array.isArray(response)) {
          loadsData = response;
        } else if (response && response.loads) {
          loadsData = response.loads;
        } else if (response) {
          loadsData = ensureArray(response);
        }
        
        // Always hydrate with consistent structure
        const dataToHydrate = {
          loads: loadsData,
          driver: { id: driverId },
          ...response
        };
        
        hydrateDriverData(dataToHydrate, driverId);
        
      } catch (error) {
        console.error('Error in fetchDriverDetails:', error);
        const message =
          error?.response?.data?.detail ||
          error?.response?.data?.message ||
          error?.message ||
          'Unable to load driver pay data';
        setDriverError(message);
        
        // Set empty data structure on error
        setDriverData({ loads: [], driver: { id: driverId } });
        setSelectedLoadIds([]);
      } finally {
        setDriverLoading(false);
        fetchingDriverRef.current = false;
      }
    },
    []
  );

  // Initial load of drivers summary
  useEffect(() => {
    fetchDriversSummary();
  }, []); // Run only once on mount

  // Fetch driver details when driver or date range changes
  useEffect(() => {
    if (selectedDriverId && dateRange.from && dateRange.to) {
      // Add a small delay to prevent rapid successive calls
      const timeoutId = setTimeout(() => {
        fetchDriverDetails(selectedDriverId, dateRange.from, dateRange.to);
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [selectedDriverId, dateRange.from, dateRange.to]);

  // Persist state changes
  useEffect(() => {
    if (selectedDriverId && dateRange.from && dateRange.to) {
      persistState({
        driverId: selectedDriverId,
        from: dateRange.from,
        to: dateRange.to,
      });
    }
  }, [selectedDriverId, dateRange.from, dateRange.to]);

  const handleDriverSelect = useCallback(
    (driver) => {
      console.log('Driver selected:', driver);
      
      if (selectedDriverId !== driver.id) {
        // Clear the last fetch params to allow refetch
        lastFetchParamsRef.current = null;
        
        setSelectedDriverId(driver.id);
        setSelectedDriverMeta(driver);
        setDriverError('');
        setLastStub(null);
        
        // Clear existing data to show loading state
        setDriverData({ loads: [], driver: null });
        setSelectedLoadIds([]);
      }
    },
    [selectedDriverId]
  );

  const handleDateChange = useCallback((key, value) => {
    // Clear the last fetch params to allow refetch
    lastFetchParamsRef.current = null;
    
    setDateRange((prev) => ({
      ...prev,
      [key]: value,
    }));
    setLastStub(null);
  }, []);

  const handleSelectAllLoads = useCallback(
    (checked) => {
      if (!checked) {
        setSelectedLoadIds([]);
        return;
      }
      const ids = driverData.loads.map((load) => getRowId(load)).filter(Boolean);
      setSelectedLoadIds(ids);
    },
    [driverData.loads]
  );

  const parseNumberInput = (value) => {
    if (value === '' || value === null || value === undefined) return null;
    const num = parseFloat(value);
    if (Number.isNaN(num)) return null;
    return num;
  };

  const runDebugTest = async () => {
    try {
      console.log('Running debug test...');
      const results = await testApiConnection();
      setDebugInfo(results);
      console.log('Debug test results:', results);
    } catch (error) {
      console.error('Debug test failed:', error);
      setDebugInfo({ error: error.message });
    }
  };

  const handleStubAction = async (type) => {
    if (!selectedDriverId) {
      setActionError(t('Please select a driver before continuing'));
      return;
    }

    if (!selectedLoadIds.length) {
      setActionError(t('Please select at least one load'));
      return;
    }

    if (dateRange.from && !dateRange.to) {
      setActionError(t('Please select an end date to finish the range'));
      return;
    }

    if (dateRange.to && !dateRange.from) {
      setActionError(t('Please select a start date to finish the range'));
      return;
    }

    setActionLoading(true);
    setActionError('');
    try {
      const payload = {
        type,
        driver_id: selectedDriverId,
        load_ids: selectedLoadIds,
        notes: statementNotes,
        from_date: dateRange.from || undefined,
        to_date: dateRange.to || undefined,
        fuel_advance: parseNumberInput(fuelAdvance),
        other_deductions: parseNumberInput(otherDeductions),
      };

      console.log('Posting paystub action with payload:', payload);

      const response = await postPaystubAction(payload);
      console.log('Paystub action response:', response);
      
      setLastStub({
        ...response,
        driver_id: selectedDriverId,
        type,
      });

      if (type === 'preview' && response?.view_url) {
        window.open(response.view_url, '_blank', 'noopener');
      }
    } catch (error) {
      console.error('Error in handleStubAction:', error);
      const responseData = error?.response?.data;
      const serverErrors =
        responseData && typeof responseData === 'object'
          ? Object.entries(responseData)
              .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
              .join(' | ')
          : null;
      const message =
        serverErrors ||
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message ||
        t('Unable to process paystub request');
      setActionError(message);
    } finally {
      setActionLoading(false);
    }
  };

  const loadsSelectedCount = selectedLoadIds.length;
  const allLoadsSelected =
    driverData.loads.length > 0 && loadsSelectedCount === driverData.loads.length;

  const renderStops = (stops) => {
    const list = ensureArray(stops).filter(Boolean);
    if (!list.length) {
      return <div className="stops-empty">{t('No stops returned')}</div>;
    }
    return (
      <div className="stops-list">
        {list.map((stop, index) => (
          <div key={index} className="stop-row">
            <div className="stop-row__title">
              {stop.type || stop.stop_type || t('Stop')} {stop.sequence || index + 1}
            </div>
            <div className="stop-row__meta">
              {stop.location_name || stop.customer || ''}
              {(stop.city || stop.state) && (
                <span>
                  {' '}
                  • {stop.city || ''}
                  {stop.state ? `, ${stop.state}` : ''}
                </span>
              )}
            </div>
            {stop.date && <div className="stop-row__date">{stop.date}</div>}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="driver-pay-page">
      <div className="driver-pay-page__sidebar">
        <div className="sidebar-header">
          <h1>{t('Driver Pay')}</h1>
          <div className="sidebar-toggle">
            <button
              className={sidebarView === 'company' ? 'active' : ''}
              onClick={() => setSidebarView('company')}
            >
              {t('Company Drivers')}
            </button>
            <button
              className={sidebarView === 'owner' ? 'active' : ''}
              onClick={() => setSidebarView('owner')}
            >
              {t('Owner Operators')}
            </button>
          </div>
          <input
            type="search"
            className="sidebar-search"
            placeholder={t('Search drivers')}
            value={driverSearch}
            onChange={(e) => setDriverSearch(e.target.value)}
            disabled={summaryLoading}
          />
        </div>
        <div className="sidebar-list">
          {summaryLoading && <div className="sidebar-status">{t('Loading drivers...')}</div>}
          {summaryError && <div className="sidebar-error">{summaryError}</div>}
          {!summaryLoading && !summaryError && filteredDrivers.length === 0 && (
            <div className="sidebar-status">{t('No drivers found')}</div>
          )}
          {!summaryLoading && !summaryError && filteredDrivers.map((driver) => (
            <button
              key={driver.id}
              className={`driver-pill ${
                selectedDriverId === driver.id ? 'driver-pill--active' : ''
              }`}
              onClick={() => handleDriverSelect(driver)}
            >
              <span className="driver-pill__name">{getDriverName(driver)}</span>
              {driver.unit_number && (
                <span className="driver-pill__meta">{driver.unit_number}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="driver-pay-page__main">
        <div className="main-header">
          <div>
            <div className="main-header__eyebrow">{t('Selected Driver')}</div>
            <div className="main-header__title">
              {selectedDriverMeta ? getDriverName(selectedDriverMeta) : t('Pick a driver')}
            </div>
          </div>
          <div className="date-range">
            <div className="date-field">
              <label htmlFor="from-date">{t('From')}</label>
              <input
                id="from-date"
                type="date"
                value={formatDateInput(dateRange.from)}
                onChange={(e) => handleDateChange('from', e.target.value)}
              />
            </div>
            <div className="date-field">
              <label htmlFor="to-date">{t('To')}</label>
              <input
                id="to-date"
                type="date"
                value={formatDateInput(dateRange.to)}
                onChange={(e) => handleDateChange('to', e.target.value)}
              />
            </div>
          </div>
        </div>

        {driverError && <div className="inline-error">{driverError}</div>}

        {/* Debug Panel */}
        <div className="debug-panel">
          <div style={{ marginBottom: '10px' }}>
            <button onClick={() => setDebugMode(!debugMode)}>
              {debugMode ? 'Hide Debug' : 'Show Debug'}
            </button>
            {debugMode && (
              <button onClick={runDebugTest}>
                Test API Connection
              </button>
            )}
          </div>
          {debugMode && (
            <div>
              <div><strong>Selected Driver ID:</strong> {selectedDriverId || 'None'}</div>
              <div><strong>Selected Driver Meta:</strong> {selectedDriverMeta ? getDriverName(selectedDriverMeta) : 'None'}</div>
              <div><strong>Date Range:</strong> {dateRange.from || 'Not set'} to {dateRange.to || 'Not set'}</div>
              <div><strong>Summary Status:</strong> Loading: {summaryLoading ? 'Yes' : 'No'}, Error: {summaryError || 'None'}</div>
              <div><strong>Driver Data Status:</strong> Loading: {driverLoading ? 'Yes' : 'No'}, Loads: {driverData.loads.length}</div>
              <div><strong>Filtered Drivers Count:</strong> Company: {summary.company.length}, Owner: {summary.owner.length}, Current View: {filteredDrivers.length}</div>
              <div><strong>Persisted Hydrated:</strong> {persistedHydrated ? 'Yes' : 'No'}</div>
              <div><strong>Fetching Driver:</strong> {fetchingDriverRef.current ? 'Yes' : 'No'}</div>
              <div><strong>Last Fetch Params:</strong> {lastFetchParamsRef.current || 'None'}</div>
              {debugInfo && (
                <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f5f5f5' }}>
                  <strong>API Test Results:</strong>
                  <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="data-panels">
          <section className={`data-panel ${driverLoading ? 'loading' : ''}`}>
            {driverLoading && (
              <div className="loading-overlay">
                <div className="loading-spinner"></div>
              </div>
            )}
            <div className="panel-header">
              <div>
                <h2>{t('Loads')}</h2>
                <p>
                  {loadsSelectedCount}/{driverData.loads.length} {t('selected')}
                </p>
              </div>
              <div className="panel-header__action">
                <label>
                  <input
                    type="checkbox"
                    checked={allLoadsSelected}
                    onChange={(e) => handleSelectAllLoads(e.target.checked)}
                  />
                  <span>{t('Select all')}</span>
                </label>
              </div>
            </div>
            {!driverLoading && driverData.loads.length === 0 && (
              <div className="panel-status">{t('No loads to display')}</div>
            )}
            {driverData.loads.length > 0 && (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th />
                      <th>{t('Load #')}</th>
                      <th>{t('Customer')}</th>
                      <th>{t('Pickup')}</th>
                      <th>{t('Delivery')}</th>
                      <th>{t('Pay')}</th>
                      <th>{t('Miles')}</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {driverData.loads.map((load) => {
                      const rowId = getRowId(load);
                      const expanded = expandedLoads.includes(rowId);
                      const hasOtherPays = ensureArray(load.other_pays).length > 0;
                      const hasStops = ensureArray(load.stops).length > 0;
                      const hasExpandableContent = hasOtherPays || hasStops;
                      
                      return (
                        <React.Fragment key={rowId}>
                          <tr>
                            <td>
                              <input
                                type="checkbox"
                                checked={selectedLoadIds.includes(rowId)}
                                onChange={(e) => handleLoadSelectChange(rowId, e.target.checked)}
                              />
                            </td>
                            <td>{load.load_id || load.reference || rowId}</td>
                            <td>{load.customer_broker_name || load.customer || load.customer_name || '--'}</td>
                            <td>
                              {load.pickup_location ||
                                load.pickup_city ||
                                load.pickup_state ||
                                (load.pickup_date ? new Date(load.pickup_date).toLocaleDateString() : '--')}
                            </td>
                            <td>
                              {load.delivery_location ||
                                load.delivery_city ||
                                load.delivery_state ||
                                (load.delivery_date ? new Date(load.delivery_date).toLocaleDateString() : '--')}
                            </td>
                            <td>{formatCurrency(load.driver_pay ?? load.pay_total ?? load.pay)}</td>
                            <td>{formatMiles(load.total_miles ?? load.miles)}</td>
                            <td>
                              {hasExpandableContent && (
                                <button
                                  className="link-button"
                                  onClick={() => toggleLoadStops(rowId)}
                                >
                                  {expanded ? t('Hide details') : t('View details')}
                                </button>
                              )}
                            </td>
                          </tr>
                          {expanded && hasExpandableContent && (
                            <tr className="stops-row">
                              <td />
                              <td colSpan={7}>
                                <div className="load-details-content">
                                  {hasOtherPays && (
                                    <div className="load-details-section other-pays-section">
                                      <strong className="load-details-section-title">
                                        {t('Other Pays')}
                                      </strong>
                                      <div className="other-pays-list">
                                        {ensureArray(load.other_pays).map((otherPay, index) => (
                                          <div key={index} className="other-pay-item">
                                            <div className="other-pay-header">
                                              <span className="other-pay-type">
                                                {otherPay.type || otherPay.pay_type || 'Other Pay'}
                                              </span>
                                              <span className="other-pay-amount">
                                                {formatCurrency(otherPay.amount || otherPay.pay_amount)}
                                              </span>
                                            </div>
                                            {(otherPay.note || otherPay.description) && (
                                              <div className="other-pay-note">
                                                {otherPay.note || otherPay.description}
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  {hasStops && (
                                    <div className="load-details-section">
                                      {hasOtherPays && <div className="section-divider" />}
                                      <strong className="load-details-section-title">
                                        {t('Stops')}
                                      </strong>
                                      {renderStops(load.stops)}
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        <section className="form-panel">
          <h2>{t('Statement Details')}</h2>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="statement-notes">{t('Statement Notes')}</label>
              <textarea
                id="statement-notes"
                rows={4}
                value={statementNotes}
                onChange={(e) => setStatementNotes(e.target.value)}
                placeholder={t('Enter statement notes')}
              />
            </div>
            <div className="form-field">
              <label htmlFor="fuel-advance">{t('Fuel Advance')}</label>
              <input
                id="fuel-advance"
                type="number"
                value={fuelAdvance}
                onChange={(e) => setFuelAdvance(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="form-field">
              <label htmlFor="other-deductions">{t('Other Deductions')}</label>
              <input
                id="other-deductions"
                type="number"
                value={otherDeductions}
                onChange={(e) => setOtherDeductions(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>
        </section>

        {actionError && <div className="inline-error">{actionError}</div>}

        <div className="action-bar">
          <button
            className="ghost-button"
            onClick={() => handleStubAction('preview')}
            disabled={actionLoading}
          >
            {actionLoading ? t('Preparing preview...') : t('Preview Stub')}
          </button>
          <button
            className="primary-button"
            onClick={() => handleStubAction('generate')}
            disabled={actionLoading}
          >
            {actionLoading ? t('Generating stub...') : t('Generate Stub')}
          </button>
        </div>

        {lastStub && (
          <section className="result-panel">
            <h3>{t('Latest Paystub')}</h3>
            <div className="result-grid">
              <div className="result-item">
                <span className="result-label">{t('Type')}</span>
                <span className="result-value">{lastStub.type}</span>
              </div>
              {lastStub.statement_id && (
                <div className="result-item">
                  <span className="result-label">{t('Statement ID')}</span>
                  <span className="result-value">{lastStub.statement_id}</span>
                </div>
              )}
              {lastStub.view_url && (
                <div className="result-item">
                  <span className="result-label">{t('View')}</span>
                  <button
                    className="link-button"
                    onClick={() => window.open(lastStub.view_url, '_blank', 'noopener')}
                  >
                    {t('View Paystub')}
                  </button>
                </div>
              )}
              {lastStub.download_url && (
                <div className="result-item">
                  <span className="result-label">{t('Download')}</span>
                  <a
                    className="link-button"
                    href={lastStub.download_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t('Download Paystub')}
                  </a>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default AccountingPage;