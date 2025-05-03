import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaTruck, FaPlus, FaEllipsisV, FaUser, FaTruckMoving, FaUserTie, FaTrailer, FaUsers, FaSearch } from 'react-icons/fa';
import { ApiService } from '../../api/auth';
import './UnitManagement.scss';
import CreateEditUnitModal from './CreateEditUnitModal';

const UnitItem = ({ unit, isActive, teamName, resourcesCount, onSelect, onEdit, onDelete }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = React.useRef(null);

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
        <h3>{unit.unit_number !== undefined ? `Unit #${unit.unit_number}` : 'Unassigned Unit'}</h3>
        <div className="unit-details">
          {teamName && (
            <span className="team-name">
              <FaUsers className="icon" /> {teamName}
            </span>
          )}
          <span className="resource-count">
            <FaTruck className="icon" /> {resourcesCount || 0} resources
          </span>
        </div>
      </div>
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
                    value={item.unit_id || ''}
                    onChange={(e) => onUpdateUnit(item, e.target.value ? units.find(u => u.id === Number(e.target.value)) : null)}
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
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [activeTab, setActiveTab] = useState('trucks');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    item: null,
    newUnit: null,
    onConfirm: null
  });

  // Barcha resurslar (id bo'yicha)
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

  // CRUD uchun API chaqiruvlar
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
      setUnits(Array.isArray(unitsData) ? unitsData : []);
      setTeams(Array.isArray(teamsData) ? teamsData : []);
      setAllTrucks(Array.isArray(trucks) ? trucks : []);
      setAllDrivers(Array.isArray(drivers) ? drivers : []);
      setAllTrailers(Array.isArray(trailers) ? trailers : []);
      setAllEmployees(Array.isArray(employees) ? employees : []);

      // Agar tanlangan unit bo'lsa, uni yangilash
      if (selectedUnit) {
        const updatedUnit = await ApiService.getData(`/unit/${selectedUnit.id}/`);
        setSelectedUnit(updatedUnit);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Unit tanlanganda uning to'liq ma'lumotlarini olish
  const handleSelectUnit = async (unit) => {
    if (!unit) {
      setSelectedUnit(null);
      return;
    }
    
    try {
      setLoading(true);
      const unitDetails = await ApiService.getData(`/unit/${unit.id}/`);
      setSelectedUnit(unitDetails);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Modal ochish
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
        if (selectedUnit && selectedUnit.id === unitId) setSelectedUnit(null);
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
      fetchAll();
    } catch (err) {
      setError(err.message);
    }
  };

  // Qidiruv funksiyasi
  const filterResources = (resources, query) => {
    if (!query) return resources;

    return resources.filter(item => {
      const searchableFields = [];
      
      // User ma'lumotlarini qo'shish
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

      // Resurs turiga qarab qo'shimcha maydonlarni qo'shish
      switch(activeTab) {
        case 'drivers':
          searchableFields.push(
            item.driver_license_id,
            item.driver_status,
            item.driver_type,
            item.telegram_username,
            item.employment_status,
            item.mc_number
          );
          break;
        case 'trucks':
          searchableFields.push(
            item.vin,
            item.make,
            item.model,
            item.year,
            item.plate_number,
            item.status
          );
          break;
        case 'trailers':
          searchableFields.push(
            item.trailer_number,
            item.type,
            item.status,
            item.vin
          );
          break;
        case 'employees':
          searchableFields.push(
            item.position,
            item.department,
            item.status
          );
          break;
      }

      // ID ni ham qo'shamiz
      searchableFields.push(item.id?.toString());

      // Barcha maydonlar bo'yicha qidirish
      return searchableFields
        .filter(Boolean) // null va undefined qiymatlarni olib tashlash
        .some(field => 
          field.toString().toLowerCase().includes(query.toLowerCase())
        );
    });
  };

  // Unitga tegishli resurslarni filterlash
  const getUnitResources = (unit) => {
    let resources;
    if (!unit) {
      // Unit #None uchun: unit biriktirilmaganlarni ko'rsat
      resources = {
        trucks: allTrucks.filter(t => !t.unit_id),
        drivers: allDrivers.filter(d => !d.unit_id),
        trailers: allTrailers.filter(t => !t.unit_id),
        employees: allEmployees.filter(e => !e.unit_id)
      };
    } else {
      // Unit tanlangan holatda
      resources = {
        trucks: allTrucks.filter(t => unit.truck?.includes(t.id)),
        drivers: allDrivers.filter(d => unit.driver?.includes(d.id)),
        trailers: allTrailers.filter(t => unit.trailer?.includes(t.id)),
        employees: allEmployees.filter(e => unit.employee?.includes(e.id))
      };
    }

    // Qidiruv natijalarini filterlash
    return {
      trucks: filterResources(resources.trucks, searchQuery),
      drivers: filterResources(resources.drivers, searchQuery),
      trailers: filterResources(resources.trailers, searchQuery),
      employees: filterResources(resources.employees, searchQuery)
    };
  };

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

  const resources = getUnitResources(selectedUnit);

  const handleUpdateUnit = async (item, newUnit) => {
    setConfirmModal({
      isOpen: true,
      item,
      newUnit,
      onConfirm: async () => {
        try {
          const resourceType = activeTab.slice(0, -1); // 'trucks' -> 'truck'
          
          // Joriy resurs turining barcha elementlarini olish
          let currentResources;
          switch(resourceType) {
            case 'driver':
              currentResources = allDrivers;
              break;
            case 'truck':
              currentResources = allTrucks;
              break;
            case 'trailer':
              currentResources = allTrailers;
              break;
            case 'employee':
              currentResources = allEmployees;
              break;
            default:
              currentResources = [];
          }

          // Eski unitdan o'chirish
          if (selectedUnit) {
            const updatedResources = selectedUnit[resourceType]?.filter(id => id !== item.id) || [];
            const updateData = {
              ...selectedUnit,
              [resourceType]: updatedResources
            };

            try {
              await ApiService.putData(`/unit/${selectedUnit.id}/`, updateData);
            } catch (err) {
              console.error('Error updating old unit:', err);
              setError(`Error removing from old unit: ${err.message}`);
              return;
            }
          }

          // Yangi unitga qo'shish
          if (newUnit) {
            const existingResources = newUnit[resourceType] || [];
            if (!existingResources.includes(item.id)) {
              const updatedResources = [...existingResources, item.id];
              const updateData = {
                ...newUnit,
                [resourceType]: updatedResources.filter(id => {
                  // Faqat mavjud ID larni qoldirish
                  const exists = currentResources.some(resource => resource.id === id);
                  if (!exists) {
                    console.warn(`Resource ID ${id} not found in ${resourceType}s list`);
                  }
                  return exists;
                })
              };

              try {
                await ApiService.putData(`/unit/${newUnit.id}/`, updateData);
              } catch (err) {
                console.error('Error updating new unit:', err);
                setError(`Error adding to new unit: ${err.message}`);
                return;
              }
            }
          }

          // Resurs ma'lumotlarini yangilash
          try {
            const updateData = { ...item };
            
            // User obyektini ID ga almashtirish
            if (updateData.user && typeof updateData.user === 'object') {
              updateData.user = updateData.user.id;
            }

            // Unit ID ni yangilash
            updateData.unit_id = newUnit?.id || null;

            await ApiService.putData(`/${activeTab.slice(0, -1)}/${item.id}/`, updateData);
          } catch (err) {
            console.error('Error updating resource:', err);
            setError(`Error updating resource: ${err.message}`);
            return;
          }
          
          setConfirmModal({ isOpen: false, item: null, newUnit: null, onConfirm: null });
          fetchAll();
        } catch (err) {
          console.error('General error:', err);
          setError(err.message);
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
            <h2>Units</h2>
            <button className="create-btn" onClick={handleCreateUnit}>
              <FaPlus /> Create Unit
            </button>
          </div>
          <div className="roles-list">
            <UnitItem
              unit={{ unit_number: undefined }}
              isActive={selectedUnit === null}
              teamName={null}
              resourcesCount={0}
              onSelect={() => handleSelectUnit(null)}
              onEdit={() => {}}
              onDelete={() => {}}
            />
            {units.map(unit => (
              <UnitItem
                key={unit.id}
                unit={unit}
                isActive={selectedUnit?.id === unit.id}
                teamName={getTeamNameById(unit.team_id)}
                resourcesCount={getResourcesCount(unit)}
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