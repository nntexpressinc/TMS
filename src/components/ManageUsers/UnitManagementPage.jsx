import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaTruck, FaPlus, FaUsers, FaEllipsisV } from 'react-icons/fa';
import { ApiService } from '../../api/auth';
import './UnitManagement.scss';

const ConfirmUnitModal = ({ isOpen, onClose, dispatcher, newUnit, onConfirm }) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content confirm-modal">
        <div className="modal-header">
          <h2>{t('Confirm Unit Change')}</h2>
        </div>
        <div className="modal-body">
          <p>
            {t('Are you sure you want to change the unit for dispatcher')}:
            <br />
            <strong>{dispatcher.nickname || `${dispatcher.first_name} ${dispatcher.last_name}`}</strong>
          </p>
          <p>
            {t('New unit')}: <strong>Unit #{newUnit ? newUnit.unit_number : t('None')}</strong>
          </p>
        </div>
        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>
            {t('Cancel')}
          </button>
          <button className="confirm-btn" onClick={onConfirm}>
            {t('Confirm')}
          </button>
        </div>
      </div>
    </div>
  );
};

const UnitItem = ({ unit, isActive, dispatcherCount, onSelect, onEdit, onDelete }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div 
      className={`unit-item ${isActive ? 'active' : ''}`}
      onClick={onSelect}
    >
      <div className="unit-info">
        <h3>Unit #{unit.unit_number || 'None'}</h3>
        <span className="dispatcher-count">
          {dispatcherCount || 0} dispatchers
        </span>
      </div>
      <div className="unit-actions" ref={dropdownRef}>
        <button 
          className="menu-btn"
          onClick={(e) => {
            e.stopPropagation();
            setShowDropdown(!showDropdown);
          }}
        >
          <FaEllipsisV />
        </button>
        {showDropdown && (
          <div className="dropdown-menu">
            <button onClick={(e) => {
              e.stopPropagation();
              onEdit();
              setShowDropdown(false);
            }}>Edit</button>
            <button onClick={(e) => {
              e.stopPropagation();
              onDelete();
              setShowDropdown(false);
            }}>Delete</button>
          </div>
        )}
      </div>
    </div>
  );
};

const ResourceSection = ({ title, data = [], loading, error, units, selectedUnit, onUpdateUnit }) => {
  if (loading) return <div className="section-loading">Loading...</div>;
  if (error) return <div className="section-error">{error}</div>;

  return (
    <div className="resource-section">
      <table className="resource-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Info</th>
            <th>Details</th>
            <th>Status</th>
            <th>Unit</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>
                {item.vin && (
                  <div 
                    className="link-style"
                    onClick={() => window.location.href = `/truck/${item.id}`}
                  >
                    VIN: {item.vin}
                  </div>
                )}
                {item.email && (
                  <div 
                    className="link-style"
                    onClick={() => window.location.href = `/driver/${item.id}`}
                  >
                    Email: {item.email}
                  </div>
                )}
                {item.nickname && (
                  <div 
                    className="link-style"
                    onClick={() => window.location.href = `/dispatcher/${item.id}`}
                  >
                    {item.nickname}
                  </div>
                )}
              </td>
              <td>
                {item.phone && <div>Phone: {item.phone}</div>}
                {item.make && <div>{item.make} {item.model}</div>}
              </td>
              <td>
                <span className={`status-badge ${item.status?.toLowerCase() || 'active'}`}>
                  {item.status || 'Active'}
                </span>
              </td>
              <td>
                <select 
                  className="unit-select"
                  value={selectedUnit?.id || ''}
                  onChange={(e) => onUpdateUnit(item.id, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="">No Unit</option>
                  {units.map(unit => (
                    <option key={unit.id} value={unit.id}>
                      Unit #{unit.unit_number}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const UnitManagementPage = () => {
  const { t } = useTranslation();
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [activeSection, setActiveSection] = useState('dispatchers');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sectionData, setSectionData] = useState({
    dispatchers: [],
    trucks: [],
    trailers: [],
    drivers: [],
    employees: []
  });
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    dispatcher: null,
    newUnit: null
  });

  const fetchUnitData = async () => {
    try {
      setLoading(true);
      setError(null);
      const unitsData = await ApiService.getData('/unit/');
      setUnits(unitsData);
      
      if (selectedUnit) {
        let endpoint;
        switch(activeSection) {
          case 'dispatchers':
            endpoint = '/dispatcher/';
            break;
          case 'trucks':
            endpoint = '/truck/';
            break;
          case 'trailers':
            endpoint = '/trailer/';
            break;
          case 'drivers':
            endpoint = '/driver/';
            break;
          case 'employees':
            endpoint = '/employee/';
            break;
          default:
            endpoint = '/dispatcher/';
        }
        
        const data = await ApiService.getData(endpoint);
        const filteredData = data.filter(item => {
          if (selectedUnit === null) {
            return !item.unit;
          }
          return item.unit?.id === selectedUnit.id;
        });
        
        setSectionData(prev => ({
          ...prev,
          [activeSection]: filteredData
        }));
      } else {
        const dispatcherData = await ApiService.getData('/dispatcher/');
        const filteredDispatchers = dispatcherData.filter(d => !d.unit);
        setSectionData(prev => ({
          ...prev,
          dispatchers: filteredDispatchers
        }));
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnitData();
  }, [selectedUnit, activeSection]);

  const sections = [
    { id: 'dispatchers', title: 'Dispatchers' },
    { id: 'trucks', title: 'Trucks' },
    { id: 'trailers', title: 'Trailers' },
    { id: 'drivers', title: 'Drivers' },
    { id: 'employees', title: 'Employees' }
  ];

  const handleUpdateDispatcherUnit = async (dispatcherId, newUnitId) => {
    const dispatcher = sectionData.dispatchers.find(d => d.id === dispatcherId);
    const newUnit = units.find(u => u.id === newUnitId);
    
    setConfirmModal({
      isOpen: true,
      dispatcher,
      newUnit,
      onConfirm: async () => {
        try {
          setError(null);
          
          await ApiService.putData(`/dispatcher/${dispatcherId}/`, {
            unit: newUnitId || null
          });
          
          setConfirmModal({ isOpen: false, dispatcher: null, newUnit: null });
          await fetchUnitData();
          
        } catch (error) {
          console.error('Error updating dispatcher unit:', error);
          setError(error.response?.data?.detail || error.message);
          setConfirmModal({ isOpen: false, dispatcher: null, newUnit: null });
        }
      }
    });
  };

  const handleEditUnit = (unit) => {
    window.location.href = `/unit/${unit.id}/edit`;
  };

  const handleDeleteUnit = async (unitId) => {
    if (window.confirm(t('Are you sure you want to delete this unit?'))) {
      try {
        await ApiService.deleteData(`/unit/${unitId}/`);
        await fetchUnitData();
      } catch (error) {
        setError(error.response?.data?.detail || error.message);
      }
    }
  };

  return (
    <div className="unit-management-container">
      <div className="page-header">
        <FaTruck className="header-icon" />
        <h1>{t('Unit Management')}</h1>
      </div>

      <div className="content-wrapper">
        <div className="units-sidebar">
          <div className="sidebar-header">
            <h2>{t('Units')}</h2>
            <button className="create-btn" onClick={() => window.location.href = '/unit/create'}>
              <FaPlus />
              {t('Create Unit')}
            </button>
          </div>

          <div className="units-list">
            <UnitItem 
              unit={{ unit_number: 'None' }}
              isActive={selectedUnit === null}
              dispatcherCount={units.reduce((acc, unit) => acc + (unit.dispatcher?.length || 0), 0)}
              onSelect={() => setSelectedUnit(null)}
              onEdit={() => {}}
              onDelete={() => {}}
            />
            {units.map(unit => (
              <UnitItem 
                key={unit.id}
                unit={unit}
                isActive={selectedUnit?.id === unit.id}
                dispatcherCount={unit.dispatcher?.length || 0}
                onSelect={() => setSelectedUnit(unit)}
                onEdit={() => handleEditUnit(unit)}
                onDelete={() => handleDeleteUnit(unit.id)}
              />
            ))}
          </div>
        </div>

        <div className="main-content">
          <div className="section-tabs">
            {sections.map(section => (
              <button
                key={section.id}
                className={`section-tab ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => setActiveSection(section.id)}
              >
                {section.title}
                {selectedUnit && selectedUnit[section.id]?.length > 0 && (
                  <span className="count-badge">
                    {selectedUnit[section.id].length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="section-content">
            {error && <div className="error-message">{error}</div>}
            <ResourceSection
              title={activeSection}
              data={sectionData[activeSection]}
              loading={loading}
              error={error}
              units={units}
              selectedUnit={selectedUnit}
              onUpdateUnit={handleUpdateDispatcherUnit}
            />
          </div>
        </div>
      </div>

      <ConfirmUnitModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, dispatcher: null, newUnit: null })}
        dispatcher={confirmModal.dispatcher}
        newUnit={confirmModal.newUnit}
        onConfirm={confirmModal.onConfirm}
      />
    </div>
  );
};

export default UnitManagementPage; 