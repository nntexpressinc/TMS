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
                <select
                  id="dispatchers"
                  name="dispatchers"
                  multiple
                  size="5"
                  value={formData.dispatchers}
                  onChange={handleDispatcherChange}
                >
                  {dispatchers.map(dispatcher => (
                    <option key={dispatcher.id} value={dispatcher.id}>
                      {dispatcher.user?.first_name && dispatcher.user?.last_name
                        ? `${dispatcher.user.first_name} ${dispatcher.user.last_name}`
                        : dispatcher.user?.email || `ID: ${dispatcher.id}`}
                    </option>
                  ))}
                </select>
                <small>{t('Hold Ctrl/Cmd to select multiple')}</small>
              </div>
              
              <div className="form-group">
                <label htmlFor="units">{t('Units')}</label>
                <select
                  id="units"
                  name="units"
                  multiple
                  size="5"
                  value={formData.unit_id}
                  onChange={handleUnitChange}
                >
                  {units.map(unit => (
                    <option key={unit.id} value={unit.id}>
                      {`Unit #${unit.unit_number}`}
                    </option>
                  ))}
                </select>
                <small>{t('Hold Ctrl/Cmd to select multiple')}</small>
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