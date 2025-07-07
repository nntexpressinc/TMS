import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FaTruck, FaPlus, FaEllipsisV, FaUser, FaTruckMoving, FaUserTie, FaTrailer, FaUsers, FaSearch } from 'react-icons/fa';
import { ApiService } from '../../api/auth';
import './UnitManagement.scss';
import CreateEditUnitModal from './CreateEditUnitModal';

const UnitItem = ({ unit, isActive, onSelect, onEdit, onDelete }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = React.useRef(null);

  const totalDrivers = unit.driver?.length || 0;
  const totalEmployees = unit.employee?.length || 0;
  const totalPeople = totalDrivers + totalEmployees;

  const totalTrucks = unit.truck?.length || 0;
  const totalTrailers = unit.trailer?.length || 0;
  const totalVehicles = totalTrucks + totalTrailers;
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`role-item ${isActive ? 'active' : ''}`} onClick={onSelect}>
      <div className="role-info">
        <h3>{unit.unit_number ? `Unit #${unit.unit_number}` : 'Unassigned Resources'}</h3>
        <div className="unit-details">
          {unit.unit_number && (
            <>
              <span className="detail-item" title="Drivers & Employees">
                <FaUsers /> {totalPeople}
              </span>
              <span className="detail-item" title="Trucks & Trailers">
                <FaTruck /> {totalVehicles}
              </span>
            </>
          )}
        </div>
      </div>
      {unit.unit_number && (
        <div className="role-actions" ref={dropdownRef}>
          <button
            className="menu-btn"
            onClick={e => {
              e.stopPropagation();
              setShowDropdown(!showDropdown);
            }}
          >
            <FaEllipsisV />
          </button>
          {showDropdown && (
            <div className="dropdown-menu">
              <button onClick={e => { e.stopPropagation(); onEdit(); setShowDropdown(false); }}>
                <span className="icon">✏️</span> Edit
              </button>
              <button className="delete" onClick={e => { e.stopPropagation(); onDelete(); setShowDropdown(false); }}>
                <span className="icon">🗑️</span> Delete
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ConfirmUnitChangeModal = ({ isOpen, onClose, item, newUnit, onConfirm }) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content confirm-modal">
        <div className="modal-header">
          <h2>Confirm Unit Change</h2>
        </div>
        <div className="modal-body">
          <p>
            Are you sure you want to change the unit for:
            <br />
            <strong>
              {item.nickname || item.vin || item.email || `${item.first_name} ${item.last_name}` || `ID: ${item.id}`}
            </strong>
          </p>
          <p>
            New unit: <strong>{newUnit ? `Unit #${newUnit.unit_number}` : 'No Unit'}</strong>
          </p>
        </div>
        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button className="confirm-btn" onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
};

const ResourceSection = ({ type, data = [], loading, units, onUpdateUnit }) => {
  const { t } = useTranslation();
  
  const getIcon = (type) => {
    switch(type) {
      case 'trucks': return <FaTruck className="resource-icon" />;
      case 'drivers': return <FaTruckMoving className="resource-icon" />;
      case 'trailers': return <FaTrailer className="resource-icon" />;
      case 'employees': return <FaUserTie className="resource-icon" />;
      default: return null;
    }
  };

  const getResourceInfo = (item, type) => {
    switch(type) {
      case 'drivers':
        return {
          name: `${item.user?.first_name} ${item.user?.last_name}`,
          details: [
            { icon: '📞', value: item.user?.telephone },
            { icon: '📧', value: item.user?.email },
            { icon: '📍', value: `${item.user?.city}, ${item.user?.state}` },
            { icon: '🪪', value: `License: ${item.driver_license_id} (${item.dl_class})` },
            { icon: '📅', value: `Exp: ${new Date(item.driver_license_expiration).toLocaleDateString()}` },
            { icon: '👤', value: `Status: ${item.driver_status || 'N/A'}` },
            { icon: '💼', value: `Type: ${item.driver_type}` }
          ].filter(detail => detail.value && detail.value !== 'null')
        };
      case 'employees':
        return {
          name: `${item.user?.first_name} ${item.user?.last_name}`,
          details: [
            { icon: '📞', value: item.user?.telephone },
            { icon: '📧', value: item.user?.email },
            { icon: '💼', value: item.position }
          ].filter(detail => detail.value && detail.value !== 'null')
        };
      default:
        return {
          name: item.nickname || item.vin || item.email || `${item.first_name} ${item.last_name}` || `ID: ${item.id}`,
          details: [
            { icon: '📞', value: item.phone },
            { icon: '🚛', value: item.make ? `${item.make} ${item.model}` : null },
            { icon: '📍', value: item.address }
          ].filter(detail => detail.value && detail.value !== 'null')
        };
    }
  };

  if (loading) {
    return (
      <div className="section-loading">
        <div className="loader"></div>
        <span>Loading resources...</span>
      </div>
    );
  }

  return (
    <div className="resource-section">
      <table className="users-table">
        <thead>
          <tr>
            <th width="80">ID</th>
            <th>Information</th>
            <th>Contact Details</th>
            <th width="120">Status</th>
            <th width="180">Unit</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => {
            const resourceInfo = getResourceInfo(item, type);
            return (
              <tr key={item.id} className="resource-row">
                <td className="id-column">{item.id}</td>
                <td className="info-column">
                  <div className="resource-info">
                    {getIcon(type)}
                    <div className="info-details">
                      <strong>{resourceInfo.name}</strong>
                      {type === 'drivers' && (
                        <div className="driver-details">
                          <span className="driver-type">{item.driver_type}</span>
                          <span className="driver-status" data-status={item.driver_status?.toLowerCase() || 'inactive'}>
                            {item.driver_status || 'No Status'}
                          </span>
                        </div>
                      )}
                      {type === 'employees' && (
                        <span className="employee-position">{item.position}</span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="details-column">
                  {resourceInfo.details.map((detail, index) => (
                    detail.value && (
                      <div key={index} className="detail-item">
                        <span className="label">{detail.icon}</span>
                        {detail.value}
                      </div>
                    )
                  ))}
                </td>
                <td className="status-column">
                  <span className={`status-badge ${(item.employment_status?.toLowerCase() || 'active')}`}>
                    {item.employment_status || 'Active'}
                  </span>
                </td>
                <td className="unit-column">
                  <select 
                    className="unit-select"
                    value={units.find(u => u[item.resourceType]?.includes(item.id))?.id || ''}
                    onChange={(e) => {
                      const targetUnitId = e.target.value ? Number(e.target.value) : null;
                      const targetUnit = targetUnitId === null ? null : units.find(u => u.id === targetUnitId);
                      onUpdateUnit(item, targetUnit);
                    }}
                  >
                    <option value="">Unassigned</option>
                    {units.map(unit => (
                      <option key={unit.id} value={unit.id}>
                        Unit #{unit.unit_number}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            );
          })}
          {data.length === 0 && (
            <tr>
              <td colSpan="5" className="no-data">
                <div className="empty-state">
                  <span className="empty-icon">📝</span>
                  <p>No {type.slice(0, -1)} assigned yet</p>
                  <small>When you assign {type.slice(0, -1)}s to this unit, they will appear here</small>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const UnitManagementPage = () => {
  const { t } = useTranslation();
  const [units, setUnits] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedUnitId, setSelectedUnitId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [activeTab, setActiveTab] = useState('trucks');
  const [searchQuery, setSearchQuery] = useState('');
  const [unitSearch, setUnitSearch] = useState('');
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    item: null,
    newUnit: null,
    onConfirm: null
  });

  const [allTrucks, setAllTrucks] = useState([]);
  const [allDrivers, setAllDrivers] = useState([]);
  const [allTrailers, setAllTrailers] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);

  const sections = [
    { id: 'trucks', title: 'Trucks', icon: <FaTruck /> },
    { id: 'drivers', title: 'Drivers', icon: <FaTruckMoving /> },
    { id: 'trailers', title: 'Trailers', icon: <FaTrailer /> },
    { id: 'employees', title: 'Employees', icon: <FaUserTie /> }
  ];

  const selectedUnit = useMemo(() => {
    if (selectedUnitId === null) return null;
    return units.find(u => u.id === selectedUnitId);
  }, [selectedUnitId, units]);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [unitsData, teamsData, trucks, drivers, trailers, employees] = await Promise.all([
        ApiService.getData('/unit/'),
        ApiService.getData('/team/'),
        ApiService.getData('/truck/'),
        ApiService.getData('/driver/'),
        ApiService.getData('/trailer/'),
        ApiService.getData('/employee/')
      ]);
      const validUnits = Array.isArray(unitsData) ? unitsData : [];
      setUnits(validUnits);
      setTeams(Array.isArray(teamsData) ? teamsData : []);

      const assignResourceType = (resources, type) => 
          Array.isArray(resources) ? resources.map(r => ({ ...r, resourceType: type })) : [];
      
      setAllTrucks(assignResourceType(trucks, 'truck'));
      setAllDrivers(assignResourceType(drivers, 'driver'));
      setAllTrailers(assignResourceType(trailers, 'trailer'));
      setAllEmployees(assignResourceType(employees, 'employee'));

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleSelectUnit = (unit) => {
    setSelectedUnitId(unit ? unit.id : null);
  };

  const handleCreateUnit = () => {
    setEditingUnit(null);
    setIsModalOpen(true);
  };

  const handleEditUnit = (unit) => {
    setEditingUnit(unit);
    setIsModalOpen(true);
  };

  const handleDeleteUnit = async (unitId) => {
    if (window.confirm(t('Are you sure you want to delete this unit?'))) {
      try {
        await ApiService.deleteData(`/unit/${unitId}/`);
        fetchAll();
        if (selectedUnit && selectedUnit.id === unitId) setSelectedUnitId(null);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleModalSubmit = async (unitData) => {
    try {
      if (editingUnit) {
        await ApiService.putData(`/unit/${editingUnit.id}/`, unitData);
      } else {
        await ApiService.postData('/unit/', unitData);
      }
      setIsModalOpen(false);
      await fetchAll();
    } catch (err) {
      setError(err.message);
    }
  };

  const filterResources = useCallback((resources, query) => {
    if (!query) return resources;

    return resources.filter(item => {
      const searchableFields = [];
      
      if (item.user) {
        searchableFields.push(
          item.user.first_name,
          item.user.last_name,
          item.user.email,
          item.user.telephone,
          item.user.company_name,
          item.user.city,
          item.user.state,
          item.user.country
        );
      }

      switch(item.resourceType) {
        case 'driver':
          searchableFields.push(
            item.driver_license_id,
            item.driver_status,
            item.driver_type,
            item.telegram_username,
            item.employment_status,
            item.mc_number
          );
          break;
        case 'truck':
          searchableFields.push(
            item.vin,
            item.make,
            item.model,
            item.year,
            item.plate_number,
            item.status
          );
          break;
        case 'trailer':
          searchableFields.push(
            item.trailer_number,
            item.type,
            item.status,
            item.vin
          );
          break;
        case 'employee':
          searchableFields.push(
            item.position,
            item.department,
            item.status
          );
          break;
        default: break;
      }
      searchableFields.push(item.id?.toString());
      return searchableFields
        .filter(Boolean)
        .some(field => 
          field.toString().toLowerCase().includes(query.toLowerCase())
        );
    });
  }, []);

  const filteredUnits = useMemo(() => {
    if (!unitSearch) return units;
    const lowercasedFilter = unitSearch.toLowerCase();
    return units.filter(unit => 
      unit.unit_number.toLowerCase().includes(lowercasedFilter)
    );
  }, [unitSearch, units]);

  const { assignedResources, unassignedResources } = useMemo(() => {
    const allAssignedIds = { truck: new Set(), trailer: new Set(), driver: new Set(), employee: new Set() };
    units.forEach(unit => {
        unit.truck?.forEach(id => allAssignedIds.truck.add(id));
        unit.trailer?.forEach(id => allAssignedIds.trailer.add(id));
        unit.driver?.forEach(id => allAssignedIds.driver.add(id));
        unit.employee?.forEach(id => allAssignedIds.employee.add(id));
    });

    const unassigned = {
        trucks: allTrucks.filter(r => !allAssignedIds.truck.has(r.id)),
        trailers: allTrailers.filter(r => !allAssignedIds.trailer.has(r.id)),
        drivers: allDrivers.filter(r => !allAssignedIds.driver.has(r.id)),
        employees: allEmployees.filter(r => !allAssignedIds.employee.has(r.id)),
    };

    let assigned = { trucks: [], trailers: [], drivers: [], employees: [] };
    if (selectedUnit) {
        assigned = {
            trucks: allTrucks.filter(r => selectedUnit.truck?.includes(r.id)),
            trailers: allTrailers.filter(r => selectedUnit.trailer?.includes(r.id)),
            drivers: allDrivers.filter(r => selectedUnit.driver?.includes(r.id)),
            employees: allEmployees.filter(r => selectedUnit.employee?.includes(r.id)),
        };
    }
    
    return { assignedResources: assigned, unassignedResources: unassigned };
  }, [units, allTrucks, allTrailers, allDrivers, allEmployees, selectedUnit]);

  const resources = useMemo(() => {
    const data = selectedUnitId === null ? unassignedResources : assignedResources;
    return {
      trucks: filterResources(data.trucks, searchQuery),
      drivers: filterResources(data.drivers, searchQuery),
      trailers: filterResources(data.trailers, searchQuery),
      employees: filterResources(data.employees, searchQuery)
    };
  }, [selectedUnitId, assignedResources, unassignedResources, filterResources, searchQuery]);

  const getTeamNameById = (teamId) => {
    if (!teamId) return null;
    const team = teams.find(t => t.id === teamId);
    return team ? team.name : null;
  };

  const getResourcesCount = (unit) => {
    if (!unit) return 0;
    return (unit.truck?.length || 0) + 
           (unit.driver?.length || 0) + 
           (unit.trailer?.length || 0) + 
           (unit.employee?.length || 0);
  };

  const handleUpdateUnit = (item, newUnit) => {
    const resourceType = item.resourceType;
    if (!resourceType) {
        setError("Cannot determine resource type.");
        return;
    }

    const sourceUnit = units.find(u => u[resourceType]?.includes(item.id));

    if (sourceUnit?.id === newUnit?.id) return;

    if (newUnit && (resourceType === 'truck' || resourceType === 'trailer')) {
        if (newUnit[resourceType] && newUnit[resourceType].length > 0 && newUnit[resourceType][0] !== item.id) {
            const resourceMap = { truck: allTrucks, trailer: allTrailers };
            const existingResource = resourceMap[resourceType].find(r => r.id === newUnit[resourceType][0]);
            if (!window.confirm(`Unit #${newUnit.unit_number} already has ${resourceType} "${existingResource?.vin || existingResource?.id}". Do you want to replace it?`)) {
                return;
            }
        }
    }

    setConfirmModal({
        isOpen: true,
        item,
        newUnit,
        onConfirm: async () => {
            setLoading(true);
            try {
                if (sourceUnit) {
                    const updatedResources = sourceUnit[resourceType].filter(id => id !== item.id);
                    await ApiService.putData(`/unit/${sourceUnit.id}/`, { ...sourceUnit, [resourceType]: updatedResources });
                }

                if (newUnit) {
                    let targetResources = newUnit[resourceType] ? [...newUnit[resourceType]] : [];
                    if (resourceType === 'truck' || resourceType === 'trailer') {
                        targetResources = [item.id];
                    } else {
                        if (!targetResources.includes(item.id)) {
                            targetResources.push(item.id);
                        }
                    }
                    await ApiService.putData(`/unit/${newUnit.id}/`, { ...newUnit, [resourceType]: targetResources });
                }
                
                await fetchAll();
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
                setConfirmModal({ isOpen: false, item: null, newUnit: null, onConfirm: null });
            }
        }
    });
};

  return (
    <div className="manage-users-container">
      <div className="page-header">
        <div className="header-content">
          <div className="header-left">
            <FaTruck className="header-icon" />
            <div className="header-text">
              <h1>Unit Management</h1>
              <p>Manage your units and their resources</p>
            </div>
          </div>
          <div className="search-box">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('Search in all columns...')}
              className="search-input"
            />
            <FaSearch className="search-icon" />
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <div className="content-wrapper">
        <div className="roles-sidebar">
          <div className="sidebar-header">
            <div className="header-top">
              <h2>Units</h2>
              <button className="create-btn" onClick={handleCreateUnit}>
                <FaPlus /> Create Unit
              </button>
            </div>
            <div className="unit-search-box">
              <input 
                type="text"
                placeholder="Search units..."
                className="search-input"
                value={unitSearch}
                onChange={e => setUnitSearch(e.target.value)}
              />
              <FaSearch className="search-icon" />
            </div>
          </div>
          <div className="roles-list">
            <UnitItem
              unit={{}}
              isActive={selectedUnitId === null}
              onSelect={() => handleSelectUnit(null)}
            />
            {filteredUnits.map(unit => (
              <UnitItem
                key={unit.id}
                unit={unit}
                isActive={selectedUnitId === unit.id}
                onSelect={() => handleSelectUnit(unit)}
                onEdit={() => handleEditUnit(unit)}
                onDelete={() => handleDeleteUnit(unit.id)}
              />
            ))}
          </div>
        </div>
        <div className="users-section">
          <div className="section-header">
            <h2>
              {selectedUnit ? (
                <>
                  <span className="unit-label">Unit:</span>
                  <strong className="unit-number">#{selectedUnit.unit_number}</strong>
                  {selectedUnit.team_id && (
                    <span className="unit-team">
                      <span className="team-label">Team:</span>
                      <strong className="team-name">{getTeamNameById(selectedUnit.team_id)}</strong>
                    </span>
                  )}
                </>
              ) : (
                <span className="unassigned-label">Unassigned Resources</span>
              )}
            </h2>
          </div>
          <div className="section-tabs">
            {sections.map(section => (
              <button
                key={section.id}
                className={`section-tab ${activeTab === section.id ? 'active' : ''}`}
                onClick={() => setActiveTab(section.id)}
              >
                {section.icon}
                <span className="tab-title">{section.title}</span>
                <span className="count-badge">
                  {resources[section.id]?.length || 0}
                </span>
              </button>
            ))}
          </div>
          <div className="section-content">
            <ResourceSection
              type={activeTab}
              data={resources[activeTab] || []}
              loading={loading}
              units={units}
              onUpdateUnit={handleUpdateUnit}
            />
          </div>
        </div>
      </div>
      <CreateEditUnitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        editingUnit={editingUnit}
      />
      <ConfirmUnitChangeModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, item: null, newUnit: null, onConfirm: null })}
        item={confirmModal.item}
        newUnit={confirmModal.newUnit}
        onConfirm={confirmModal.onConfirm}
      />
    </div>
  );
};

export default UnitManagementPage; 