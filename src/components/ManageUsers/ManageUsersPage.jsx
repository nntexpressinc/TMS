import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaUserCog, FaPlus, FaUsers, FaEllipsisV } from 'react-icons/fa';
import { ApiService } from '../../api/auth';
import './ManageUsers.scss';
import CreateRoleModal from './CreateRoleModal';
import defaultAvatar from '../../images/photo_url.jpg';

const ConfirmRoleModal = ({ isOpen, onClose, user, newRole, onConfirm }) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content confirm-modal">
        <div className="modal-header">
          <h2>{t('Confirm Role Change')}</h2>
        </div>
        <div className="modal-body">
          <p>
            {t('Are you sure you want to change the role for user')}:
            <br />
            <strong>{user.email}</strong>
          </p>
          <p>
            {t('New role')}: <strong>{newRole ? newRole.name : t('Default')}</strong>
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

const RoleItem = ({ role, isActive, userCount, onSelect, onEdit, onDelete }) => {
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
      className={`role-item ${isActive ? 'active' : ''}`}
      onClick={onSelect}
    >
      <div className="role-info">
        <h3>{role.name || 'Default'}</h3>
        <span className="user-count">
          {userCount || 0} users
        </span>
      </div>
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

const ManageUsersPage = () => {
  const { t } = useTranslation();
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateRoleModalOpen, setIsCreateRoleModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [editingRole, setEditingRole] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [userCounts, setUserCounts] = useState({});
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    user: null,
    newRole: null
  });

  const fetchData = async () => {
    try {
      setError(null);
      const [rolesData, usersData] = await Promise.all([
        ApiService.getData('/auth/role/'),
        ApiService.getData('/auth/users/')
      ]);

      // Ma'lumotlarni massivga o'tkazish
      const rolesArray = Array.isArray(rolesData) ? rolesData : [];
      const usersArray = Array.isArray(usersData) ? usersData : [];

      // Rollar bo'yicha userlar sonini hisoblash
      const counts = {};
      usersArray.forEach(user => {
        counts[user.role] = (counts[user.role] || 0) + 1;
      });
      setUserCounts(counts);

      setRoles(rolesArray);
      setUsers(usersArray);
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

  const handleCreateRole = async (roleData) => {
    try {
      setError(null);
      
      const processedRoleData = {
        ...roleData,
        load_view: roleData.load_view || roleData.load_create || roleData.load_update || roleData.load_delete,
        driver_view: roleData.driver_view || roleData.driver_create || roleData.driver_update || roleData.driver_delete,
        truck_view: roleData.truck_view || roleData.truck_create || roleData.truck_update || roleData.truck_delete,
        trailer_view: roleData.trailer_view || roleData.trailer_create || roleData.trailer_update || roleData.trailer_delete,
        user_view: roleData.user_view || roleData.user_create || roleData.user_update || roleData.user_delete,
        accounting_view: roleData.accounting_view || roleData.accounting_create || roleData.accounting_update || roleData.accounting_delete,
        dispatcher_view: roleData.dispatcher_view || roleData.dispatcher_create || roleData.dispatcher_update || roleData.dispatcher_delete,
        stop_view: roleData.stop_view || roleData.stop_create || roleData.stop_update || roleData.stop_delete,
        otherpay_view: roleData.otherpay_view || roleData.otherpay_create || roleData.otherpay_update || roleData.otherpay_delete,
        employee_view: roleData.employee_view || roleData.employee_create || roleData.employee_update || roleData.employee_delete,
        commodity_view: roleData.commodity_view || roleData.commodity_create || roleData.commodity_update || roleData.commodity_delete,
        customerbroker_view: roleData.customerbroker_view || roleData.customerbroker_create || roleData.customerbroker_update || roleData.customerbroker_delete,
        chat_view: roleData.chat_view || roleData.chat_create || roleData.chat_update || roleData.chat_delete,
        userlocation_view: roleData.userlocation_view || roleData.userlocation_create || roleData.userlocation_update || roleData.userlocation_delete
      };
      
      if (editingRole) {
        await ApiService.putData(`/auth/permission/${editingRole.permission_id}/`, {
          ...processedRoleData,
          id: editingRole.permission_id
        });
        setEditingRole(null);
      } else {
        const permissionResponse = await ApiService.postData('/auth/permission/', processedRoleData);

        if (permissionResponse && permissionResponse.id) {
          await ApiService.postData('/auth/role/', {
            name: roleData.name,
            permission_id: permissionResponse.id
          });
        } else {
          throw new Error('Permission ID not received');
        }
      }
      
      setIsCreateRoleModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error creating/updating role:', error);
      setError(error.response?.data?.detail || error.message);
    }
  };

  const handleEditRole = async (role) => {
    try {
      const permissionData = await ApiService.getData(`/auth/permission/${role.permission_id}/`);
      setEditingRole({ ...role, ...permissionData });
      setIsCreateRoleModalOpen(true);
    } catch (error) {
      console.error('Error fetching role permissions:', error);
      setError(error.response?.data?.detail || error.message);
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (window.confirm(t('Are you sure you want to delete this role?'))) {
      try {
        setError(null);
        
        const role = roles.find(r => r.id === roleId);
        if (!role) {
          throw new Error('Role not found');
        }

        await ApiService.deleteData(`/auth/role/${roleId}/`);
        
        if (role.permission_id) {
          await ApiService.deleteData(`/auth/permission/${role.permission_id}/`);
        }

        fetchData();
      } catch (error) {
        console.error('Error deleting role:', error);
        setError(error.response?.data?.detail || error.message);
      }
    }
  };

  const handleUpdateUserRole = async (userId, newRoleId) => {
    const user = users.find(u => u.id === userId);
    const newRole = roles.find(r => r.id === newRoleId);
    
    setConfirmModal({
      isOpen: true,
      user,
      newRole,
      onConfirm: async () => {
        try {
          setError(null);
          
          // Only send minimal required data for role update
          const userData = {
            role: newRoleId || null
          };

          // Only include company_id if it exists in the original user data
          if (user.company_id) {
            userData.company_id = user.company_id;
          }

          console.log('Sending update request with data:', userData);
          
          await ApiService.putData(`/auth/users/${userId}/`, userData);
          
          setConfirmModal({ isOpen: false, user: null, newRole: null });
          await fetchData(); // Refresh data after update
          
        } catch (error) {
          console.error('Error updating user role:', error);
          const errorMessage = error.response?.data
            ? Object.entries(error.response.data)
                .map(([key, value]) => `${key}: ${value.join(', ')}`)
                .join('\n')
            : error.message;
          setError(`Failed to update user role: ${errorMessage}`);
          setConfirmModal({ isOpen: false, user: null, newRole: null });
        }
      }
    });
  };

  const handleCloseModal = () => {
    setIsCreateRoleModalOpen(false);
    setEditingRole(null);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  const getUsersByRole = (roleId) => {
    if (roleId === null) {
      // Default role uchun (role=null yoki role=0 bo'lgan userlar)
      return users.filter(user => !user.role || user.role === 0);
    }
    return users.filter(user => user.role === roleId);
  };

  // Update this function to use the correct backend URL
  const getProfilePhotoUrl = (photoPath) => {
    if (!photoPath) return defaultAvatar;
    
    // If the path is already a full URL, return it as is
    if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
      return photoPath;
    }
    
    // Use the BASE_URL from auth.js
    return `https://api1.biznes-armiya.uz${photoPath}`;
  };

  return (
    <div className="manage-users-container">
      <div className="page-header">
        <FaUserCog className="header-icon" />
        <h1>{t('Manage Users')}</h1>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <div className="content-wrapper">
        <div className="roles-sidebar">
          <div className="sidebar-header">
            <h2>{t('Roles')}</h2>
            <button 
              className="create-btn"
              onClick={() => setIsCreateRoleModalOpen(true)}
            >
              <FaPlus />
              {t('Create Role')}
            </button>
          </div>

          <div className="roles-list">
            <RoleItem 
              role={{ name: 'Default' }}
              isActive={selectedRole === null}
              userCount={userCounts[0]}
              onSelect={() => setSelectedRole(null)}
              onEdit={() => {}}
              onDelete={() => {}}
            />

            {roles.map(role => (
              <RoleItem 
                key={role.id}
                role={role}
                isActive={selectedRole?.id === role.id}
                userCount={userCounts[role.id]}
                onSelect={() => setSelectedRole(role)}
                onEdit={() => handleEditRole(role)}
                onDelete={() => handleDeleteRole(role.id)}
              />
            ))}
          </div>
        </div>

        <div className="users-section">
          <div className="section-header">
            <h2>
              {selectedRole ? (
                <span>Users with role: <strong>{selectedRole.name}</strong></span>
              ) : (
                'Users without role'
              )}
            </h2>
          </div>

          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>User Info</th>
                  <th>Contact Details</th>
                  <th>Location</th>
                  <th>Company Details</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {getUsersByRole(selectedRole?.id || null).map(user => (
                  <tr key={user.id} className="user-row">
                    <td className="user-info-cell">
                      <div className="user-info">
                        <div className="user-avatar">
                          <img 
                            src={getProfilePhotoUrl(user.profile_photo)}
                            alt={user.first_name || 'User avatar'} 
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = defaultAvatar;
                            }}
                          />
                        </div>
                        <div className="user-details">
                          <h3>{user.first_name && user.last_name 
                            ? `${user.first_name} ${user.last_name}`
                            : user.email}</h3>
                          <p className="email">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="contact-details">
                      <div className="detail-group">
                        <span className="label">Phone:</span>
                        <span className="value">{user.telephone || '-'}</span>
                      </div>
                      {user.ext && (
                        <div className="detail-group">
                          <span className="label">Ext:</span>
                          <span className="value">{user.ext}</span>
                        </div>
                      )}
                      {user.fax && (
                        <div className="detail-group">
                          <span className="label">Fax:</span>
                          <span className="value">{user.fax}</span>
                        </div>
                      )}
                    </td>
                    <td className="location-details">
                      {user.address && (
                        <div className="detail-group">
                          <span className="label">Address:</span>
                          <span className="value">{user.address}</span>
                        </div>
                      )}
                      <div className="detail-group">
                        <span className="label">City:</span>
                        <span className="value">{user.city || '-'}</span>
                      </div>
                      <div className="detail-group">
                        <span className="label">State:</span>
                        <span className="value">{user.state || '-'}</span>
                      </div>
                      {user.postal_zip && (
                        <div className="detail-group">
                          <span className="label">Postal Code:</span>
                          <span className="value">{user.postal_zip}</span>
                        </div>
                      )}
                      <div className="detail-group">
                        <span className="label">Country:</span>
                        <span className="value">{user.country || '-'}</span>
                      </div>
                    </td>
                    <td className="company-details">
                      {user.company_name && (
                        <div className="detail-group">
                          <span className="label">Company:</span>
                          <span className="value company-name">{user.company_name}</span>
                        </div>
                      )}
                    </td>
                    <td className="role-select">
                      <select 
                        value={user.role || 0}
                        onChange={(e) => handleUpdateUserRole(user.id, Number(e.target.value))}
                      >
                        <option value={0}>Default</option>
                        {roles.map(role => (
                          <option key={role.id} value={role.id}>
                            {role.name}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <CreateRoleModal
        isOpen={isCreateRoleModalOpen}
        onClose={handleCloseModal}
        onCreateRole={handleCreateRole}
        editingRole={editingRole}
      />

      <ConfirmRoleModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, user: null, newRole: null })}
        user={confirmModal.user}
        newRole={confirmModal.newRole}
        onConfirm={confirmModal.onConfirm}
      />
    </div>
  );
};

export default ManageUsersPage; 