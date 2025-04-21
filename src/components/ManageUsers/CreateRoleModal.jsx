import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaTimes } from 'react-icons/fa';
import './CreateRoleModal.scss';

const permissionGroups = {
  load: ['load_create', 'load_view', 'load_update', 'load_delete'],
  driver: ['driver_create', 'driver_view', 'driver_update', 'driver_delete'],
  truck: ['truck_create', 'truck_view', 'truck_update', 'truck_delete'],
  trailer: ['trailer_create', 'trailer_view', 'trailer_update', 'trailer_delete'],
  user: ['user_create', 'user_view', 'user_update', 'user_delete'],
  accounting: ['accounting_create', 'accounting_view', 'accounting_update', 'accounting_delete'],
  dispatcher: ['dispatcher_create', 'dispatcher_view', 'dispatcher_update', 'dispatcher_delete'],
  stop: ['stop_create', 'stop_view', 'stop_update', 'stop_delete'],
  otherpay: ['otherpay_create', 'otherpay_view', 'otherpay_update', 'otherpay_delete'],
  employee: ['employee_create', 'employee_view', 'employee_update', 'employee_delete'],
  commodity: ['commodity_create', 'commodity_view', 'commodity_update', 'commodity_delete'],
  customerbroker: ['customerbroker_create', 'customerbroker_view', 'customerbroker_update', 'customerbroker_delete'],
  chat: ['chat_create', 'chat_view', 'chat_update', 'chat_delete'],
  userlocation: ['userlocation_create', 'userlocation_view', 'userlocation_update', 'userlocation_delete']
};

const CreateRoleModal = ({ isOpen, onClose, onCreateRole, editingRole }) => {
  const { t } = useTranslation();
  const [roleName, setRoleName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const navbar = document.querySelector('.MuiAppBar-root');
      const sidebar = document.querySelector('.MuiDrawer-root');
      
      if (navbar) navbar.style.filter = 'blur(4px)';
      if (sidebar) sidebar.style.filter = 'blur(4px)';
    } else {
      document.body.style.overflow = 'unset';
      const navbar = document.querySelector('.MuiAppBar-root');
      const sidebar = document.querySelector('.MuiDrawer-root');
      
      if (navbar) navbar.style.filter = 'none';
      if (sidebar) sidebar.style.filter = 'none';
    }

    return () => {
      document.body.style.overflow = 'unset';
      const navbar = document.querySelector('.MuiAppBar-root');
      const sidebar = document.querySelector('.MuiDrawer-root');
      
      if (navbar) navbar.style.filter = 'none';
      if (sidebar) sidebar.style.filter = 'none';
    };
  }, [isOpen]);

  useEffect(() => {
    if (editingRole) {
      setRoleName(editingRole.name);
      const initialPermissions = {};
      Object.values(permissionGroups).flat().forEach(permission => {
        initialPermissions[permission] = editingRole[permission] || false;
      });
      setSelectedPermissions(initialPermissions);
    } else {
      resetForm();
    }
  }, [editingRole]);

  const resetForm = () => {
    setRoleName('');
    const initialPermissions = {};
    Object.values(permissionGroups).flat().forEach(permission => {
      initialPermissions[permission] = false;
    });
    setSelectedPermissions(initialPermissions);
    setError('');
  };

  const handlePermissionChange = (permission) => {
    setSelectedPermissions(prev => ({
      ...prev,
      [permission]: !prev[permission]
    }));
  };

  const handleGroupToggle = (group) => {
    const groupPermissions = permissionGroups[group];
    const areAllSelected = groupPermissions.every(permission => selectedPermissions[permission]);
    
    const updatedPermissions = { ...selectedPermissions };
    groupPermissions.forEach(permission => {
      updatedPermissions[permission] = !areAllSelected;
    });
    
    setSelectedPermissions(updatedPermissions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!roleName.trim()) {
      setError(t('Role name is required'));
      return;
    }

    const allPermissions = {};
    Object.values(permissionGroups).flat().forEach(permission => {
      allPermissions[permission] = false;
    });

    const roleData = {
      name: roleName.trim(),
      ...allPermissions,
      ...selectedPermissions
    };

    try {
      await onCreateRole(roleData);
      resetForm();
    } catch (error) {
      setError(error.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{editingRole ? t('Edit Role') : t('Create New Role')}</h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="roleName">{t('Role Name')}:</label>
            <input
              type="text"
              id="roleName"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder={t('Enter role name')}
            />
          </div>

          <div className="permissions-section">
            <h3>{t('Permissions')}</h3>
            <div className="permissions-container">
              {Object.entries(permissionGroups).map(([group, permissions]) => (
                <div key={group} className="permission-group">
                  <div className="group-header">
                    <h4>{t(group.charAt(0).toUpperCase() + group.slice(1))}</h4>
                    <button
                      type="button"
                      onClick={() => handleGroupToggle(group)}
                      className="toggle-btn"
                    >
                      {permissions.every(p => selectedPermissions[p])
                        ? t('Deselect All')
                        : t('Select All')}
                    </button>
                  </div>
                  <div className="permissions-list">
                    {permissions.map(permission => (
                      <label key={permission} className="permission-item">
                        <input
                          type="checkbox"
                          checked={selectedPermissions[permission] || false}
                          onChange={() => handlePermissionChange(permission)}
                        />
                        {t(permission.split('_').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' '))}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={onClose}>
              {t('Cancel')}
            </button>
            <button type="submit" className="submit-btn">
              {editingRole ? t('Save Changes') : t('Create Role')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRoleModal; 