import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './ManageUsers.scss';
import { FaInfoCircle } from 'react-icons/fa';

const CreateTeamModal = ({ isOpen, onClose, onCreateTeam, editingTeam, dispatchers, units }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    telegram_token: '',
    telegram_channel_id: '',
    telegram_group_id: '',
    dispatchers: [],
    unit_id: []
  });

  useEffect(() => {
    if (editingTeam) {
      setFormData({
        name: editingTeam.name || '',
        telegram_token: editingTeam.telegram_token || '',
        telegram_channel_id: editingTeam.telegram_channel_id || '',
        telegram_group_id: editingTeam.telegram_group_id || '',
        dispatchers: editingTeam.dispatchers || [],
        unit_id: editingTeam.unit_id || []
      });
    } else {
      setFormData({
        name: '',
        telegram_token: '',
        telegram_channel_id: '',
        telegram_group_id: '',
        dispatchers: [],
        unit_id: []
      });
    }
  }, [editingTeam]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleDispatcherChange = (e) => {
    const options = Array.from(e.target.selectedOptions, option => parseInt(option.value));
    setFormData({
      ...formData,
      dispatchers: options
    });
  };

  const handleUnitChange = (e) => {
    const options = Array.from(e.target.selectedOptions, option => parseInt(option.value));
    setFormData({
      ...formData,
      unit_id: options
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreateTeam(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{editingTeam ? t('Edit Team') : t('Create New Team')}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-section">
              <h3>{t('Team Information')}</h3>
              
              <div className="form-group">
                <label htmlFor="name">{t('Team Name')} *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder={t('Enter team name')}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="telegram_token">{t('Telegram Bot Token')}</label>
                <input
                  type="text"
                  id="telegram_token"
                  name="telegram_token"
                  value={formData.telegram_token}
                  onChange={handleInputChange}
                  placeholder={t('Enter Telegram bot token')}
                />
                <small><FaInfoCircle /> {t('Used for notifications')}</small>
              </div>
              
              <div className="form-group">
                <label htmlFor="telegram_channel_id">{t('Telegram Channel ID')}</label>
                <input
                  type="text"
                  id="telegram_channel_id"
                  name="telegram_channel_id"
                  value={formData.telegram_channel_id}
                  onChange={handleInputChange}
                  placeholder={t('Enter Telegram channel ID (e.g. @channel_name)')}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="telegram_group_id">{t('Telegram Group ID')}</label>
                <input
                  type="text"
                  id="telegram_group_id"
                  name="telegram_group_id"
                  value={formData.telegram_group_id}
                  onChange={handleInputChange}
                  placeholder={t('Enter Telegram group ID (e.g. @group_name)')}
                />
              </div>
            </div>
            
            <div className="form-section">
              <h3>{t('Team Members & Units')}</h3>
              
              <div className="form-group">
                <label htmlFor="dispatchers">{t('Dispatchers')}</label>
                <div className="checkbox-group">
                  {dispatchers.map(dispatcher => {
                    const isSelected = formData.dispatchers.includes(dispatcher.id);
                    const displayName = dispatcher.user?.first_name && dispatcher.user?.last_name
                      ? `${dispatcher.user.first_name} ${dispatcher.user.last_name}`
                      : dispatcher.user?.email || `ID: ${dispatcher.id}`;
                    
                    return (
                      <div key={dispatcher.id} className="checkbox-item">
                        <input
                          type="checkbox"
                          id={`dispatcher-${dispatcher.id}`}
                          checked={isSelected}
                          onChange={(e) => {
                            const newDispatchers = e.target.checked
                              ? [...formData.dispatchers, dispatcher.id]
                              : formData.dispatchers.filter(id => id !== dispatcher.id);
                            setFormData({ ...formData, dispatchers: newDispatchers });
                          }}
                        />
                        <label htmlFor={`dispatcher-${dispatcher.id}`}>
                          {displayName}
                          {dispatcher.nickname && <span className="nickname"> ({dispatcher.nickname})</span>}
                        </label>
                      </div>
                    );
                  })}
                </div>
                {dispatchers.length === 0 && (
                  <small className="empty-message">{t('No dispatchers available')}</small>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="units">{t('Units')}</label>
                <div className="checkbox-group">
                  {units.map(unit => {
                    const isSelected = formData.unit_id.includes(unit.id);
                    const resourceCount = (unit.driver?.length || 0) + (unit.truck?.length || 0) + (unit.trailer?.length || 0);
                    
                    return (
                      <div key={unit.id} className="checkbox-item">
                        <input
                          type="checkbox"
                          id={`unit-${unit.id}`}
                          checked={isSelected}
                          onChange={(e) => {
                            const newUnits = e.target.checked
                              ? [...formData.unit_id, unit.id]
                              : formData.unit_id.filter(id => id !== unit.id);
                            setFormData({ ...formData, unit_id: newUnits });
                          }}
                        />
                        <label htmlFor={`unit-${unit.id}`}>
                          Unit #{unit.unit_number}
                          <span className="resource-count"> ({resourceCount} resources)</span>
                        </label>
                      </div>
                    );
                  })}
                </div>
                {units.length === 0 && (
                  <small className="empty-message">{t('No units available')}</small>
                )}
              </div>
            </div>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={onClose}>
              {t('Cancel')}
            </button>
            <button type="submit" className="save-btn">
              {editingTeam ? t('Update Team') : t('Create Team')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTeamModal; 