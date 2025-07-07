import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FaUserCog, FaPlus, FaUsers, FaEllipsisV, FaTruck, FaSearch } from 'react-icons/fa';
import { ApiService } from '../../api/auth';
import './ManageUsers.scss';
import CreateTeamModal from './CreateTeamModal';
import defaultAvatar from '../../images/photo_url.jpg';

const ConfirmModal = ({ isOpen, onClose, item, itemType, newTeam, onConfirm }) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  const getItemName = () => {
    if (itemType === 'dispatcher') {
      return item?.user?.email || item?.id;
    } else if (itemType === 'unit') {
      return `Unit #${item?.unit_number}` || item?.id;
    }
    return item?.id;
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content confirm-modal">
        <div className="modal-header">
          <h2>{t('Confirm Team Change')}</h2>
        </div>
        <div className="modal-body">
          <p>
            {t(`Are you sure you want to change the team for ${itemType}`)}:
            <br />
            <strong>{getItemName()}</strong>
          </p>
          <p>
            {t('New team')}: <strong>{newTeam ? newTeam.name : t('Unassigned')}</strong>
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

const TeamItem = ({ team, isActive, dispatcherCount, unitCount, onSelect, onEdit, onDelete }) => {
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

  const isAllTeam = !team?.id;

  return (
    <div 
      className={`role-item ${isActive ? 'active' : ''}`}
      onClick={onSelect}
    >
      <div className="role-info">
        <h3>{team?.name || 'Unassigned'}</h3>
        <div className="item-counts">
          <span className="user-count" title="Dispatchers">
            <FaUsers className="count-icon" /> {dispatcherCount || 0} 
            <span className="unit-count" style={{ visibility: 'hidden' }} title="Units">1111</span>
            <FaTruck className="count-icon" /> {unitCount || 0}
          </span>
         
        </div>
      </div>
      {!isAllTeam && (
        <div className="role-actions" ref={dropdownRef}>
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
               <button onClick={(e) => { e.stopPropagation(); onEdit(); setShowDropdown(false); }}>
                <span className="icon">✏️</span> Edit
              </button>
              <button className="delete" onClick={(e) => { e.stopPropagation(); onDelete(); setShowDropdown(false); }}>
                <span className="icon">🗑️</span> Delete
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const TeamManagementPage = () => {
  const { t } = useTranslation();
  const [teams, setTeams] = useState([]);
  const [dispatchers, setDispatchers] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [editingTeam, setEditingTeam] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [activeTab, setActiveTab] = useState('dispatchers');
  const [teamSearch, setTeamSearch] = useState('');
  const [resourceSearch, setResourceSearch] = useState('');
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    item: null,
    itemType: null,
    newTeam: null,
    onConfirm: null
  });

  const fetchData = async () => {
    try {
      setError(null);
      const [teamsData, dispatchersData, unitsData] = await Promise.all([
        ApiService.getData('/team/'),
        ApiService.getData('/dispatcher/'),
        ApiService.getData('/unit/')
      ]);

      setTeams(Array.isArray(teamsData) ? teamsData : []);
      setDispatchers(Array.isArray(dispatchersData) ? dispatchersData : []);
      setUnits(Array.isArray(unitsData) ? unitsData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getDispatchersByTeam = useCallback((teamId) => {
    if (teamId === null) {
      return dispatchers.filter(d => !teams.some(team => team.dispatchers?.includes(d.id)));
    }
    const team = teams.find(t => t.id === teamId);
    return team ? dispatchers.filter(d => team.dispatchers?.includes(d.id)) : [];
  }, [dispatchers, teams]);

  const getUnitsByTeam = useCallback((teamId) => {
    if (teamId === null) {
      return units.filter(u => !teams.some(team => team.unit_id?.includes(u.id)));
    }
    const team = teams.find(t => t.id === teamId);
    return team ? units.filter(u => team.unit_id?.includes(u.id)) : [];
  }, [units, teams]);

  const filterResources = useCallback((resources, query, type) => {
    if (!query) return resources;
    const lowercasedQuery = query.toLowerCase();
    
    return resources.filter(item => {
      if (type === 'dispatchers') {
        const user = item.user;
        return (user?.first_name?.toLowerCase().includes(lowercasedQuery) ||
                user?.last_name?.toLowerCase().includes(lowercasedQuery) ||
                user?.email?.toLowerCase().includes(lowercasedQuery));
      }
      if (type === 'units') {
        return item.unit_number?.toLowerCase().includes(lowercasedQuery);
      }
      return false;
    });
  }, []);

  const filteredTeams = useMemo(() => {
    if (!teamSearch) return teams;
    const lowercasedQuery = teamSearch.toLowerCase();
    return teams.filter(team => team.name.toLowerCase().includes(lowercasedQuery));
  }, [teamSearch, teams]);

  const displayedDispatchers = useMemo(() => 
    filterResources(getDispatchersByTeam(selectedTeam?.id ?? null), resourceSearch, 'dispatchers'),
    [getDispatchersByTeam, selectedTeam, resourceSearch, filterResources]
  );
  
  const displayedUnits = useMemo(() =>
    filterResources(getUnitsByTeam(selectedTeam?.id ?? null), resourceSearch, 'units'),
    [getUnitsByTeam, selectedTeam, resourceSearch, filterResources]
  );

  const handleCreateTeam = async (teamData) => {
    try {
      setError(null);
      
      if (editingTeam) {
        await ApiService.putData(`/team/${editingTeam.id}/`, teamData);
        setEditingTeam(null);
      } else {
        await ApiService.postData('/team/', teamData);
      }
      
      setIsCreateTeamModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error creating/updating team:', error);
      setError(error.response?.data?.detail || error.message);
    }
  };

  const handleEditTeam = (team) => {
    setEditingTeam(team);
    setIsCreateTeamModalOpen(true);
  };

  const handleDeleteTeam = async (teamId) => {
    if (window.confirm(t('Are you sure you want to delete this team?'))) {
      try {
        setError(null);
        await ApiService.deleteData(`/team/${teamId}/`);
        fetchData();
      } catch (error) {
        console.error('Error deleting team:', error);
        setError(error.response?.data?.detail || error.message);
      }
    }
  };

  const handleUpdateTeamMembership = async (item, itemType, newTeamId) => {
    const newTeam = newTeamId ? teams.find(t => t.id === parseInt(newTeamId)) : null;
    const sourceTeam = teams.find(t => t[itemType === 'dispatcher' ? 'dispatchers' : 'unit_id']?.includes(item.id));

    if (sourceTeam?.id === newTeam?.id) return;

    setConfirmModal({
      isOpen: true,
      item,
      itemType,
      newTeam,
      onConfirm: async () => {
        try {
          setError(null);
          
          const idField = itemType === 'dispatcher' ? 'dispatchers' : 'unit_id';

          if (sourceTeam) {
            const updatedIds = sourceTeam[idField].filter(id => id !== item.id);
            await ApiService.putData(`/team/${sourceTeam.id}/`, { ...sourceTeam, [idField]: updatedIds });
          }
          
          if (newTeam) {
            const updatedIds = [...(newTeam[idField] || [])];
            if (!updatedIds.includes(item.id)) {
              updatedIds.push(item.id);
            }
            await ApiService.putData(`/team/${newTeam.id}/`, { ...newTeam, [idField]: updatedIds });
          }
          
          await fetchData();
        } catch (error) {
          console.error(`Error updating ${itemType} team:`, error);
          setError(`Failed to update ${itemType} team: ${error.message}`);
        } finally {
          setConfirmModal({ isOpen: false, item: null, itemType: null, newTeam: null, onConfirm: null });
        }
      }
    });
  };

  const handleCloseModal = () => {
    setIsCreateTeamModalOpen(false);
    setEditingTeam(null);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  const getProfilePhotoUrl = (photoPath) => {
    if (!photoPath) return defaultAvatar;
    
    if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
      return photoPath;
    }
    
    return `https://api1.biznes-armiya.uz${photoPath}`;
  };

  const getUnitNames = (unitIds) => {
    if (!unitIds || !unitIds.length) return 'No units';
    
    return unitIds.map(id => {
      const unit = units.find(u => u.id === id);
      return unit ? `Unit #${unit.unit_number}` : `ID: ${id}`;
    }).join(', ');
  };

  return (
    <div className="manage-users-container">
      <div className="page-header">
        <div className="header-content">
          <div className="header-left">
            <FaUserCog className="header-icon" />
            <div className="header-text">
              <h1>{t('Team Management')}</h1>
              <p>Manage teams and their members</p>
            </div>
          </div>
          <div className="search-box">
            <input
              type="text"
              value={resourceSearch}
              onChange={(e) => setResourceSearch(e.target.value)}
              placeholder="Search dispatchers or units..."
              className="search-input"
            />
            <FaSearch className="search-icon" />
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <div className="content-wrapper">
        <div className="roles-sidebar">
          <div className="sidebar-header">
            <div className="header-top">
              <h2>{t('Teams')}</h2>
              <button 
                className="create-btn"
                onClick={() => setIsCreateTeamModalOpen(true)}
              >
                <FaPlus />
                {t('Create Team')}
              </button>
            </div>
            <div className="unit-search-box">
              <input
                  type="text"
                  placeholder="Search teams..."
                  className="search-input"
                  value={teamSearch}
                  onChange={(e) => setTeamSearch(e.target.value)}
              />
              <FaSearch className="search-icon" />
            </div>
          </div>

          <div className="roles-list">
            <TeamItem 
              team={{ name: 'Unassigned' }}
              isActive={selectedTeam === null}
              dispatcherCount={getDispatchersByTeam(null).length}
              unitCount={getUnitsByTeam(null).length}
              onSelect={() => setSelectedTeam(null)}
              onEdit={() => {}}
              onDelete={() => {}}
            />

            {filteredTeams.map(team => (
              <TeamItem 
                key={team.id}
                team={team}
                isActive={selectedTeam?.id === team.id}
                dispatcherCount={team.dispatchers?.length || 0}
                unitCount={team.unit_id?.length || 0}
                onSelect={() => setSelectedTeam(team)}
                onEdit={() => handleEditTeam(team)}
                onDelete={() => handleDeleteTeam(team.id)}
              />
            ))}
          </div>
        </div>

        <div className="users-section">
          <div className="section-header">
            <h2>
              {selectedTeam ? (
                <span>Team: <strong>{selectedTeam.name}</strong></span>
              ) : (
                'Unassigned Resources'
              )}
            </h2>
          </div>

          <div className="section-tabs">
            <button 
              className={`tab-button ${activeTab === 'dispatchers' ? 'active' : ''}`}
              onClick={() => setActiveTab('dispatchers')}
            >
              <FaUsers className="tab-icon" />
              <span>Dispatchers</span>
              <span className="count-badge">{displayedDispatchers.length}</span>
            </button>
            <button 
              className={`tab-button ${activeTab === 'units' ? 'active' : ''}`}
              onClick={() => setActiveTab('units')}
            >
              <FaTruck className="tab-icon" />
              <span>Units</span>
              <span className="count-badge">{displayedUnits.length}</span>
            </button>
          </div>

          {activeTab === 'dispatchers' && (
            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Dispatcher Info</th>
                    <th>Contact Details</th>
                    <th>Location</th>
                    <th>Team Details</th>
                    <th>Team</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedDispatchers.map(dispatcher => (
                    <tr key={dispatcher.id} className="user-row">
                      <td className="user-info-cell">
                        <div className="user-info">
                          <div className="user-avatar">
                            <img 
                              src={getProfilePhotoUrl(dispatcher.user?.profile_photo)}
                              alt={dispatcher.user?.first_name || 'Dispatcher avatar'} 
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = defaultAvatar;
                              }}
                            />
                          </div>
                          <div className="user-details">
                            <h3>{dispatcher.user?.first_name && dispatcher.user?.last_name 
                              ? `${dispatcher.user.first_name} ${dispatcher.user.last_name}`
                              : dispatcher.user?.email || `ID: ${dispatcher.id}`}</h3>
                            <p className="email">{dispatcher.user?.email || 'No email'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="contact-details">
                        <div className="detail-group">
                          <span className="label">Phone:</span>
                          <span className="value">{dispatcher.user?.telephone || '-'}</span>
                        </div>
                      </td>
                      <td className="location-details">
                        <div className="detail-group">
                          <span className="label">City:</span>
                          <span className="value">{dispatcher.user?.city || '-'}</span>
                        </div>
                        <div className="detail-group">
                          <span className="label">State:</span>
                          <span className="value">{dispatcher.user?.state || '-'}</span>
                        </div>
                        <div className="detail-group">
                          <span className="label">Country:</span>
                          <span className="value">{dispatcher.user?.country || '-'}</span>
                        </div>
                      </td>
                      <td className="team-details">
                        {selectedTeam && (
                          <>
                            <div className="detail-group">
                              <span className="label">Team:</span>
                              <span className="value team-name">{selectedTeam.name}</span>
                            </div>
                            <div className="detail-group">
                              <span className="label">Units:</span>
                              <span className="value">{getUnitNames(selectedTeam.unit_id)}</span>
                            </div>
                          </>
                        )}
                      </td>
                      <td className="team-select">
                        <select 
                          value={teams.find(t => t.dispatchers?.includes(dispatcher.id))?.id || ''}
                          onChange={(e) => handleUpdateTeamMembership(dispatcher, 'dispatcher', e.target.value)}
                        >
                          <option value="">Unassigned</option>
                          {teams.map(team => (
                            <option key={team.id} value={team.id}>
                              {team.name}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                  {displayedDispatchers.length === 0 && (
                    <tr>
                      <td colSpan="5" className="empty-message">
                        No dispatchers found in this team
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'units' && (
            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Unit Info</th>
                    <th>Details</th>
                    <th>Status</th>
                    <th>Team</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedUnits.map(unit => (
                    <tr key={unit.id} className="user-row">
                      <td className="user-info-cell">
                        <div className="user-info">
                          <div className="unit-icon">
                            <FaTruck size={24} />
                          </div>
                          <div className="user-details">
                            <h3>Unit #{unit.unit_number}</h3>
                            <p className="unit-id">ID: {unit.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="unit-details">
                        <div className="detail-group">
                          <span className="label">Trucks:</span>
                          <span className="value">{unit.truck?.length || 0}</span>
                        </div>
                        <div className="detail-group">
                          <span className="label">Drivers:</span>
                          <span className="value">{unit.driver?.length || 0}</span>
                        </div>
                        <div className="detail-group">
                          <span className="label">Dispatchers:</span>
                          <span className="value">{unit.dispatcher?.length || 0}</span>
                        </div>
                      </td>
                      <td className="unit-status">
                        <span className={`status-badge ${unit.status || 'active'}`}>
                          {unit.status || 'Active'}
                        </span>
                      </td>
                      <td className="team-select">
                        <select 
                          value={teams.find(t => t.unit_id?.includes(unit.id))?.id || ''}
                          onChange={(e) => handleUpdateTeamMembership(unit, 'unit', e.target.value)}
                        >
                          <option value="">Unassigned</option>
                          {teams.map(team => (
                            <option key={team.id} value={team.id}>
                              {team.name}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                  {displayedUnits.length === 0 && (
                    <tr>
                      <td colSpan="4" className="empty-message">
                        No units found in this team
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <CreateTeamModal
        isOpen={isCreateTeamModalOpen}
        onClose={handleCloseModal}
        onCreateTeam={handleCreateTeam}
        editingTeam={editingTeam}
        dispatchers={dispatchers}
        units={units}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, item: null, itemType: null, newTeam: null, onConfirm: null })}
        item={confirmModal.item}
        itemType={confirmModal.itemType}
        newTeam={confirmModal.newTeam}
        onConfirm={confirmModal.onConfirm}
      />
    </div>
  );
};

export default TeamManagementPage; 