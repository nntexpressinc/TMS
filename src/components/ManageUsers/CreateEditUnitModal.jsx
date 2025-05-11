import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaTimes } from 'react-icons/fa';
import './ManageUsers.scss';
import { ApiService } from '../../api/auth';

const CreateEditUnitModal = ({ isOpen, onClose, onSubmit, editingUnit }) => {
  const { t } = useTranslation();
  const [unitNumber, setUnitNumber] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchTeams();
    }
  }, [isOpen]);

  useEffect(() => {
    if (editingUnit) {
      setUnitNumber(editingUnit.unit_number || '');
      setSelectedTeam(editingUnit.team_id || '');
    } else {
      setUnitNumber('');
      setSelectedTeam('');
    }
  }, [editingUnit, isOpen]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const teamsData = await ApiService.getData('/team/');
      setTeams(teamsData);
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!unitNumber) return;
    
    const unitData = { 
      unit_number: unitNumber,
      team_id: selectedTeam || null
    };
    
    onSubmit(unitData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{editingUnit ? t('Edit Unit') : t('Create Unit')}</h2>
          <button className="close-btn" onClick={onClose}><FaTimes /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-section">
              <h3>{t('Unit Information')}</h3>
              
              <div className="form-group">
                <label htmlFor="unit_number">{t('Unit Number')} *</label>
                <input
                  type="number"
                  id="unit_number"
                  value={unitNumber}
                  onChange={e => setUnitNumber(e.target.value)}
                  required
                  placeholder={t('Enter unit number')}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="team_id">{t('Team')}</label>
                <select
                  id="team_id"
                  value={selectedTeam}
                  onChange={e => setSelectedTeam(e.target.value)}
                >
                  <option value="">{t('All Team')}</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
                {loading && <small>{t('Loading teams...')}</small>}
              </div>
            </div>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={onClose}>
              {t('Cancel')}
            </button>
            <button type="submit" className="save-btn">
              {editingUnit ? t('Save Changes') : t('Create Unit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEditUnitModal; 