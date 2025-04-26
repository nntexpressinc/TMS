import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaTimes } from 'react-icons/fa';
import './CreateRoleModal.scss';

const CreateEditUnitModal = ({ isOpen, onClose, onSubmit, editingUnit }) => {
  const { t } = useTranslation();
  const [unitNumber, setUnitNumber] = useState('');

  useEffect(() => {
    if (editingUnit) {
      setUnitNumber(editingUnit.unit_number || '');
    } else {
      setUnitNumber('');
    }
  }, [editingUnit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!unitNumber) return;
    onSubmit({ unit_number: unitNumber });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{editingUnit ? t('Edit Unit') : t('Create Unit')}</h2>
          <button className="close-btn" onClick={onClose}><FaTimes /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('Unit Number')}</label>
            <input
              type="number"
              value={unitNumber}
              onChange={e => setUnitNumber(e.target.value)}
              required
            />
          </div>
          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={onClose}>{t('Cancel')}</button>
            <button type="submit" className="submit-btn">{editingUnit ? t('Save Changes') : t('Create')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEditUnitModal; 