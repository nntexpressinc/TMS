import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getDriversSummary, getDriverCompletedLoads, postPaystubAction, createDriverExpense } from '../../api/paySystem';
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

const getOtherPayId = (otherPay) => otherPay?.id ?? otherPay?.other_pay_id ?? otherPay?.uuid ?? otherPay?.pk;

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

const formatLane = (load) => {
  const pickup = load.pickup_location || load.pickup_city || load.pickup_state || 'Unknown';
  const delivery = load.delivery_location || load.delivery_city || load.delivery_state || 'Unknown';
  return (
    <span className="lane-display">
      <span className="lane-pickup">{pickup}</span>
      <span className="lane-arrow">→</span>
      <span className="lane-delivery">{delivery}</span>
    </span>
  );
};

const getLoadStatusStyle = (status) => {
  if (status === 'COMPLETED') {
    return { color: '#059669', fontWeight: '600' }; // Green color for completed
  }
  return {};
};

const AccountingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

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
  const [driverData, setDriverData] = useState({ loads: [], expenses: [], driver: null });
  const [driverLoading, setDriverLoading] = useState(false);
  const [driverError, setDriverError] = useState('');

  const [expandedLoads, setExpandedLoads] = useState([]);
  const [selectedLoadIds, setSelectedLoadIds] = useState([]);
  const [selectedOtherPayIds, setSelectedOtherPayIds] = useState([]);
  const [selectedExpenseIds, setSelectedExpenseIds] = useState([]);

  const [statementNotes, setStatementNotes] = useState('');
  const [fuelAdvance, setFuelAdvance] = useState('');
  const [otherDeductions, setOtherDeductions] = useState('');

  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [lastStub, setLastStub] = useState(null);

  const [persistedHydrated, setPersistedHydrated] = useState(false);
  
  // Expense creation state
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseFormData, setExpenseFormData] = useState({
    description: '',
    amount: '',
    expense_date: new Date().toISOString().slice(0, 10),
    transaction_type: '+'
  });
  
  // CRITICAL: Use refs to prevent infinite loops
  const fetchingDriverRef = useRef(false);
  const abortControllerRef = useRef(null);

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

  const handleOtherPaySelectChange = useCallback((otherPayId, checked) => {
    setSelectedOtherPayIds((prev) => {
      if (checked) {
        return prev.includes(otherPayId) ? prev : [...prev, otherPayId];
      } else {
        return prev.filter((id) => id !== otherPayId);
      }
    });
  }, []);

  const handleExpenseSelectChange = useCallback((expenseId, checked) => {
    setSelectedExpenseIds((prev) => {
      if (checked) {
        return prev.includes(expenseId) ? prev : [...prev, expenseId];
      } else {
        return prev.filter((id) => id !== expenseId);
      }
    });
  }, []);

  const toggleLoadStops = useCallback((rowId) => {
    setExpandedLoads((prev) =>
      prev.includes(rowId) ? prev.filter((id) => id !== rowId) : [...prev, rowId]
    );
  }, []);

  const hydrateDriverData = useCallback((data, driverId) => {
    console.log('=== HYDRATING DRIVER DATA ===');
    console.log('Input data:', data);
    console.log('Input data type:', typeof data);
    console.log('Is array:', Array.isArray(data));
    console.log('Driver ID:', driverId);
    
    if (!data || typeof data !== 'object') {
      console.warn('Invalid data received for hydration:', data);
      return;
    }
    
    const loads = ensureArray(data?.loads).filter(Boolean);
    const expenses = ensureArray(data?.expenses).filter(Boolean);
    console.log('Extracted loads:', loads);
    console.log('Extracted expenses:', expenses);
    console.log('Loads count:', loads.length);
    console.log('Expenses count:', expenses.length);
    
    if (loads.length > 0) {
      console.log('First load sample:', loads[0]);
    }
    if (expenses.length > 0) {
      console.log('First expense sample:', expenses[0]);
    }

    // Update driver data
    const newDriverData = {
      loads,
      expenses,
      driver: data.driver || { id: driverId },
    };
    
    console.log('Setting driver data to:', newDriverData);
    setDriverData(newDriverData);
    
    // Auto-select all loads by default
    const defaultLoadIds = loads.map((load) => getRowId(load)).filter(Boolean);
    console.log('Default load IDs:', defaultLoadIds);
    setSelectedLoadIds(defaultLoadIds);
    
    // Don't auto-select other pays or expenses - let user choose
    setSelectedOtherPayIds([]);
    setSelectedExpenseIds([]);
    
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
    
    console.log('=== HYDRATION COMPLETE ===');
    console.log('Final state - Loads:', loads.length, 'Selected:', defaultLoadIds.length);
    console.log('Final state - Expenses:', expenses.length, 'Selected: 0 (manual selection)');
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

  // FIXED: Fetch driver details function that prevents duplicate calls
  const fetchDriverDetails = useCallback(
    async (driverId, fromDate, toDate) => {
      if (!driverId) {
        console.warn('fetchDriverDetails called without driver ID:', { driverId, fromDate, toDate });
        return;
      }
      
      // Prevent concurrent fetches
      if (fetchingDriverRef.current) {
        console.log('Already fetching, aborting previous request');
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
      }
      
      fetchingDriverRef.current = true;
      abortControllerRef.current = new AbortController();
      
      setDriverLoading(true);
      setDriverError('');
      
      try {
        const params = {};
        
        // Only add date parameters if they are provided
        if (fromDate) {
          params.from_date = fromDate;
        }
        if (toDate) {
          params.to_date = toDate;
        }
        
        console.log('Fetching driver completed loads with params:', { driverId, params });
        
        const response = await getDriverCompletedLoads(driverId, params);
        console.log('Driver completed loads response:', response);
        console.log('Response type:', Array.isArray(response) ? 'Array' : typeof response);
        
        // Handle response - the API returns an object with loads and expenses arrays
        let loadsData = [];
        let expensesData = [];
        
        if (response && typeof response === 'object' && response.loads) {
          // API returns object with loads and expenses properties
          loadsData = ensureArray(response.loads);
          expensesData = ensureArray(response.expenses);
          console.log('Extracted loads from response.loads:', loadsData.length);
          console.log('Extracted expenses from response.expenses:', expensesData.length);
          console.log('Raw expenses data:', response.expenses);
        } else if (Array.isArray(response)) {
          // Fallback: API returns array directly (loads only)
          loadsData = response;
          expensesData = [];
          console.log('Extracted loads from array:', loadsData.length);
          console.log('No expenses found in array response');
        } else if (response && typeof response === 'object') {
          // Single object or other structure
          loadsData = ensureArray(response);
          expensesData = [];
          console.log('Wrapped response in array:', loadsData.length);
        }
        
        console.log('Final loads data:', loadsData);
        console.log('Final expenses data:', expensesData);
        
        // Always hydrate with consistent structure including expenses
        const dataToHydrate = {
          loads: loadsData,
          expenses: expensesData,
          driver: { id: driverId }
        };
        
        hydrateDriverData(dataToHydrate, driverId);
        
      } catch (error) {
        // Ignore abort errors
        if (error.name === 'AbortError') {
          console.log('Fetch aborted');
          return;
        }
        
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
        setSelectedOtherPayIds([]);
      } finally {
        setDriverLoading(false);
        fetchingDriverRef.current = false;
        abortControllerRef.current = null;
      }
    },
    [hydrateDriverData]
  );

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
  }, [summary.company.length, summary.owner.length, persistedHydrated, restorePersistedState]);

  // Initial load of drivers summary - ONLY ONCE
  useEffect(() => {
    fetchDriversSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - run only once on mount

  // FIXED: Fetch driver details when driver or date range changes
  // Using a more controlled approach with cleanup
  useEffect(() => {
    if (!selectedDriverId || !dateRange.from || !dateRange.to) {
      console.log('Skipping fetch - missing params:', { 
        selectedDriverId, 
        from: dateRange.from, 
        to: dateRange.to 
      });
      return;
    }

    console.log('Driver or date changed, scheduling fetch:', { 
      selectedDriverId, 
      from: dateRange.from, 
      to: dateRange.to 
    });
    
    // Debounce the fetch to prevent rapid successive calls
    const timeoutId = setTimeout(() => {
      fetchDriverDetails(selectedDriverId, dateRange.from, dateRange.to);
    }, 300); // Increased debounce time to 300ms
    
    return () => {
      console.log('Cleaning up: clearing timeout and aborting any pending fetch');
      clearTimeout(timeoutId);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [selectedDriverId, dateRange.from, dateRange.to, fetchDriverDetails]);

  // Persist state changes - with debouncing
  useEffect(() => {
    if (selectedDriverId && dateRange.from && dateRange.to) {
      const timeoutId = setTimeout(() => {
        persistState({
          driverId: selectedDriverId,
          from: dateRange.from,
          to: dateRange.to,
        });
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [selectedDriverId, dateRange.from, dateRange.to, persistState]);

  // Debug: Log when lastStub changes
  useEffect(() => {
    console.log('lastStub state changed:', lastStub);
    if (lastStub) {
      console.log('lastStub details:', {
        type: lastStub.type,
        is_preview: lastStub.is_preview,
        timestamp: lastStub.timestamp,
        view_url: lastStub.view_url,
        download_url: lastStub.download_url
      });
    }
  }, [lastStub]);

  const handleDriverSelect = useCallback(
    (driver) => {
      console.log('Driver selected:', driver);
      
      if (selectedDriverId !== driver.id) {
        setSelectedDriverId(driver.id);
        setSelectedDriverMeta(driver);
        setDriverError('');
        setLastStub(null);
        
        // Clear existing data to show loading state
        setDriverData({ loads: [], driver: null });
        setSelectedLoadIds([]);
        setSelectedOtherPayIds([]);
      }
    },
    [selectedDriverId]
  );

  const handleDateChange = useCallback((key, value) => {
    console.log('Date changed:', key, value);
    
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
        setSelectedOtherPayIds([]);
        return;
      }
      const ids = driverData.loads.map((load) => getRowId(load)).filter(Boolean);
      setSelectedLoadIds(ids);
      
      // Don't automatically select other pays when selecting all loads
      // Users should manually select other pays if they want them
    },
    [driverData.loads]
  );

  const handleSelectAllOtherPaysForLoad = useCallback((loadId, checked) => {
    const load = driverData.loads.find((l) => getRowId(l) === loadId);
    if (!load) return;
    
    const otherPayIds = ensureArray(load.other_pays)
      .map((otherPay) => getOtherPayId(otherPay))
      .filter(Boolean);
    
    setSelectedOtherPayIds((prev) => {
      if (checked) {
        // Add all other pay IDs for this load
        const newIds = [...prev];
        otherPayIds.forEach((id) => {
          if (!newIds.includes(id)) {
            newIds.push(id);
          }
        });
        return newIds;
      } else {
        // Remove all other pay IDs for this load
        return prev.filter((id) => !otherPayIds.includes(id));
      }
    });
  }, [driverData.loads]);

  const handleSelectAllExpenses = useCallback((checked) => {
    setSelectedExpenseIds((prev) => {
      if (checked) {
        const allExpenseIds = (driverData.expenses || []).map((expense) => expense.id).filter(Boolean);
        return [...new Set([...prev, ...allExpenseIds])];
      } else {
        return [];
      }
    });
  }, [driverData.expenses]);

  const handleCreateExpense = useCallback((transactionType) => {
    if (!selectedDriverId) {
      setActionError(t('Please select a driver first'));
      return;
    }
    
    setExpenseFormData({
      description: '',
      amount: '',
      expense_date: new Date().toISOString().slice(0, 10),
      transaction_type: transactionType
    });
    setShowExpenseModal(true);
  }, [selectedDriverId, t]);

  const handleExpenseFormChange = useCallback((field, value) => {
    setExpenseFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleExpenseSubmit = async () => {
    if (!expenseFormData.description || !expenseFormData.amount) {
      setActionError(t('Please fill in all required fields'));
      return;
    }

    setActionLoading(true);
    setActionError('');
    
    try {
      const payload = {
        driver: selectedDriverId,
        description: expenseFormData.description,
        amount: parseFloat(expenseFormData.amount),
        expense_date: expenseFormData.expense_date,
        transaction_type: expenseFormData.transaction_type
      };

      await createDriverExpense(payload);
      
      // Refresh the driver data to show the new expense
      await fetchDriverDetails(selectedDriverId, dateRange.from, dateRange.to);
      
      setShowExpenseModal(false);
      
    } catch (error) {
      console.error('Error creating expense:', error);
      const message = error?.response?.data?.detail || error?.message || t('Failed to create expense');
      setActionError(message);
    } finally {
      setActionLoading(false);
    }
  };

  const parseNumberInput = (value) => {
    if (value === '' || value === null || value === undefined) return null;
    const num = parseFloat(value);
    if (Number.isNaN(num)) return null;
    return num;
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

    setActionLoading(true);
    setActionError('');
    setLastStub(null); // Clear previous result before making new request
    
    try {
      // Map type to pay_type for the API
      const payType = type === 'preview' ? 'preview_stub' : 'generate_stub';
      
      const payload = {
        driver_id: selectedDriverId,
        load_ids: selectedLoadIds,
        pay_type: payType,
        from_date: dateRange.from,
        to_date: dateRange.to,
      };

      // Only include other_pays_id if there are selected other pays
      if (selectedOtherPayIds.length > 0) {
        payload.other_pays_id = selectedOtherPayIds;
      }

      // Only include expenses if there are selected expenses
      if (selectedExpenseIds.length > 0) {
        payload.expenses = selectedExpenseIds;
      }

      console.log('Posting paystub action with payload:', payload);
      console.log('Selected other pay IDs:', selectedOtherPayIds);
      console.log('Selected expense IDs:', selectedExpenseIds);

      const response = await postPaystubAction(payload);
      console.log('Paystub action response:', response);
      console.log('Response type:', typeof response);
      console.log('Response keys:', Object.keys(response || {}));
      
      if (response && typeof response === 'object') {
        const newStub = {
          ...response,
          driver_id: selectedDriverId,
          type: payType,
          timestamp: new Date().toISOString(), // Add timestamp to ensure uniqueness
        };
        
        console.log('Setting new stub data:', newStub);
        setLastStub(newStub);
        
        console.log('Paystub generated successfully:', response.pay_type);
      } else {
        console.error('Invalid response format:', response);
        setActionError(t('Invalid response from server'));
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
  const otherPaysSelectedCount = selectedOtherPayIds.length;
  const expensesSelectedCount = selectedExpenseIds.length;
  
  // Calculate total other pays count
  const totalOtherPaysCount = driverData.loads.reduce((total, load) => {
    return total + ensureArray(load.other_pays).length;
  }, 0);
  
  // Calculate total expenses count
  const totalExpensesCount = driverData.expenses?.length || 0;
  
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
          <div className="sidebar-header-title">
            <button 
              className="back-button-icon"
              onClick={() => navigate('/accounting')}
              title={t('Back to Pay Reports')}
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <h1>{t('Driver Pay')}</h1>
          </div>
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

        {/* Loads Section */}
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
                {loadsSelectedCount}/{driverData.loads.length} {t('loads selected')}
                {totalOtherPaysCount > 0 && (
                  <> • {otherPaysSelectedCount}/{totalOtherPaysCount} {t('other pays selected')}</>
                )}
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
                    <th>{t('Lane')}</th>
                    <th>{t('Status')}</th>
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
                    const hasPayPlan = load.description || load.rate || load.total;
                    const hasExpandableContent = hasOtherPays || hasStops || hasPayPlan;
                    
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
                          <td>{formatLane(load)}</td>
                          <td>
                            <span style={getLoadStatusStyle(load.load_status)}>
                              {load.load_status || '--'}
                            </span>
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
                                {/* Pay Plan Section */}
                                <div className="load-details-section pay-plan-section">
                                  <strong className="load-details-section-title">
                                    {t('Pay Plan')}
                                  </strong>
                                  <div className="pay-plan-details">
                                    {load.description && (
                                      <div className="pay-plan-item">
                                        <span className="pay-plan-label">{t('Description')}:</span>
                                        <span className="pay-plan-value">{load.description}</span>
                                      </div>
                                    )}
                                    {load.rate && (
                                      <div className="pay-plan-item">
                                        <span className="pay-plan-label">{t('Rate')}:</span>
                                        <span className="pay-plan-value">{formatCurrency(load.rate)}</span>
                                      </div>
                                    )}
                                    {load.total && (
                                      <div className="pay-plan-item">
                                        <span className="pay-plan-label">{t('Total')}:</span>
                                        <span className="pay-plan-value">{formatCurrency(load.total)}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                {hasOtherPays && (
                                  <div className="load-details-section other-pays-section">
                                    <div className="other-pays-header">
                                      <strong className="load-details-section-title">
                                        {t('Other Pays')}
                                      </strong>
                                      <label className="other-pays-select-all">
                                        <input
                                          type="checkbox"
                                          checked={ensureArray(load.other_pays).length > 0 && 
                                            ensureArray(load.other_pays).every((otherPay) => {
                                              const otherPayId = getOtherPayId(otherPay);
                                              return otherPayId && selectedOtherPayIds.includes(otherPayId);
                                            })}
                                          onChange={(e) => handleSelectAllOtherPaysForLoad(rowId, e.target.checked)}
                                        />
                                        <span>{t('Select all')}</span>
                                      </label>
                                    </div>
                                    <div className="other-pays-list">
                                      {ensureArray(load.other_pays).map((otherPay, index) => {
                                        const otherPayId = getOtherPayId(otherPay);
                                        if (!otherPayId) return null; // Skip if no valid ID
                                        
                                        return (
                                          <div key={otherPayId} className="other-pay-item">
                                            <div className="other-pay-header">
                                              <div className="other-pay-header-left">
                                                <input
                                                  type="checkbox"
                                                  checked={selectedOtherPayIds.includes(otherPayId)}
                                                  onChange={(e) => handleOtherPaySelectChange(otherPayId, e.target.checked)}
                                                  className="other-pay-checkbox"
                                                />
                                                <span className="other-pay-type">
                                                  {otherPay.type || otherPay.pay_type || 'Other Pay'}
                                                </span>
                                              </div>
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
                                        );
                                      })}
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

        {/* Expenses Section */}
        <section className={`data-panel ${driverLoading ? 'loading' : ''}`}>
          {driverLoading && (
            <div className="loading-overlay">
              <div className="loading-spinner"></div>
            </div>
          )}
          <div className="panel-header">
            <div>
              <h2>{t('Expenses')}</h2>
              <p>
                {expensesSelectedCount}/{totalExpensesCount} {t('expenses selected')}
              </p>
            </div>
            <div className="panel-header__action">
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  className="ghost-button"
                  onClick={() => handleCreateExpense('+')}
                  style={{ minWidth: 'auto', padding: '6px 12px', fontSize: '12px' }}
                >
                  {t('Create Addition')}
                </button>
                <button
                  className="ghost-button"
                  onClick={() => handleCreateExpense('-')}
                  style={{ minWidth: 'auto', padding: '6px 12px', fontSize: '12px' }}
                >
                  {t('Create Deduction')}
                </button>
                <label style={{ marginLeft: '8px' }}>
                  <input
                    type="checkbox"
                    checked={totalExpensesCount > 0 && expensesSelectedCount === totalExpensesCount}
                    onChange={(e) => handleSelectAllExpenses(e.target.checked)}
                  />
                  <span>{t('Select all')}</span>
                </label>
              </div>
            </div>
          </div>
          
          {!driverLoading && (!driverData.expenses || driverData.expenses.length === 0) && (
            <div className="panel-status">{t('No expenses to display')}</div>
          )}
          
          {driverData.expenses && driverData.expenses.length > 0 && (
            <div>
              {/* Deductions Section */}
              {driverData.expenses.filter(expense => expense.transaction_type === '-').length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#dc2626', fontWeight: '600' }}>
                    {t('Deductions')}
                  </h4>
                  <div className="table-wrapper">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th />
                          <th>{t('Date')}</th>
                          <th>{t('Description')}</th>
                          <th>{t('Amount')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {driverData.expenses
                          .filter(expense => expense.transaction_type === '-')
                          .map((expense) => (
                            <tr key={expense.id} className="expense-row">
                              <td>
                                <input
                                  type="checkbox"
                                  checked={selectedExpenseIds.includes(expense.id)}
                                  onChange={(e) => handleExpenseSelectChange(expense.id, e.target.checked)}
                                />
                              </td>
                              <td>{expense.expense_date || '--'}</td>
                              <td>{expense.description || '--'}</td>
                              <td className="expense-amount-negative">
                                -{formatCurrency(Math.abs(expense.amount || 0))}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {/* Additions Section */}
              {driverData.expenses.filter(expense => expense.transaction_type === '+').length > 0 && (
                <div>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#059669', fontWeight: '600' }}>
                    {t('Additions')}
                  </h4>
                  <div className="table-wrapper">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th />
                          <th>{t('Date')}</th>
                          <th>{t('Description')}</th>
                          <th>{t('Amount')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {driverData.expenses
                          .filter(expense => expense.transaction_type === '+')
                          .map((expense) => (
                            <tr key={expense.id} className="expense-row">
                              <td>
                                <input
                                  type="checkbox"
                                  checked={selectedExpenseIds.includes(expense.id)}
                                  onChange={(e) => handleExpenseSelectChange(expense.id, e.target.checked)}
                                />
                              </td>
                              <td>{expense.expense_date || '--'}</td>
                              <td>{expense.description || '--'}</td>
                              <td className="expense-amount-positive">
                                +{formatCurrency(Math.abs(expense.amount || 0))}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

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
          <section key={lastStub.timestamp || lastStub.type} className="result-panel">
            <h3>{t('Latest Paystub')} {lastStub.timestamp && (
              <small style={{fontSize: '12px', color: '#6b7280', fontWeight: 'normal'}}>
                ({new Date(lastStub.timestamp).toLocaleTimeString()})
              </small>
            )}</h3>
            <div className="result-grid">
              <div className="result-item">
                <span className="result-label">{t('Type')}</span>
                <span className="result-value">
                  {lastStub.is_preview ? t('Preview Stub') : t('Generated Stub')}
                </span>
              </div>
              {lastStub.total_pay && (
                <div className="result-item">
                  <span className="result-label">{t('Total Pay')}</span>
                  <span className="result-value">{lastStub.total_pay}</span>
                </div>
              )}
              {lastStub.total_deductions && (
                <div className="result-item">
                  <span className="result-label">{t('Total Deductions')}</span>
                  <span className="result-value">{lastStub.total_deductions}</span>
                </div>
              )}
              {lastStub.total_additions && (
                <div className="result-item">
                  <span className="result-label">{t('Total Additions')}</span>
                  <span className="result-value">{lastStub.total_additions}</span>
                </div>
              )}
              {lastStub.view_url && (
                <div className="result-item">
                  <span className="result-label">{t('Actions')}</span>
                  <div className="result-actions">
                    <button
                      className="link-button"
                      onClick={() => window.open(lastStub.view_url, '_blank', 'noopener')}
                    >
                      {t('View')}
                    </button>
                    {lastStub.download_url && (
                      <a
                        className="link-button"
                        href={lastStub.download_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {t('Download')}
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Expense Creation Modal */}
        {showExpenseModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>{t('Create')} {expenseFormData.transaction_type === '+' ? t('Addition') : t('Deduction')}</h3>
                <button
                  className="modal-close"
                  onClick={() => setShowExpenseModal(false)}
                >
                  ×
                </button>
              </div>
              
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-field">
                    <label htmlFor="expense-description">{t('Description')} *</label>
                    <input
                      id="expense-description"
                      type="text"
                      value={expenseFormData.description}
                      onChange={(e) => handleExpenseFormChange('description', e.target.value)}
                      placeholder={t('Enter description')}
                    />
                  </div>
                  
                  <div className="form-field">
                    <label htmlFor="expense-amount">{t('Amount')} *</label>
                    <input
                      id="expense-amount"
                      type="number"
                      step="0.01"
                      value={expenseFormData.amount}
                      onChange={(e) => handleExpenseFormChange('amount', e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div className="form-field">
                    <label htmlFor="expense-date">{t('Date')}</label>
                    <input
                      id="expense-date"
                      type="date"
                      value={expenseFormData.expense_date}
                      onChange={(e) => handleExpenseFormChange('expense_date', e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button
                  className="ghost-button"
                  onClick={() => setShowExpenseModal(false)}
                  disabled={actionLoading}
                >
                  {t('Cancel')}
                </button>
                <button
                  className="primary-button"
                  onClick={handleExpenseSubmit}
                  disabled={actionLoading}
                >
                  {actionLoading ? t('Creating...') : t('Create')} {expenseFormData.transaction_type === '+' ? t('Addition') : t('Deduction')}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AccountingPage;
