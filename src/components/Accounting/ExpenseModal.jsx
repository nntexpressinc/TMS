import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './ExpenseModal.css';

const ExpenseModal = ({ isOpen, onClose, onSubmit, driverId }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    transaction_type: '+',
    description: '',
    amount: '',
    expense_date: new Date().toISOString().split('T')[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.description.trim()) {
      setError(t('Description is required'));
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError(t('Amount must be greater than 0'));
      return;
    }
    if (!formData.expense_date) {
      setError(t('Date is required'));
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        driver: driverId,
        amount: parseFloat(formData.amount),
        invoice_status: 'Unpaid'
      };
      
      await onSubmit(payload);
      
      // Reset form
      setFormData({
        transaction_type: '+',
        description: '',
        amount: '',
        expense_date: new Date().toISOString().split('T')[0],
      });
      onClose();
    } catch (err) {
      setError(err.message || t('Failed to create expense'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="expense-modal-overlay" onClick={onClose}>
      <div className="expense-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="expense-modal-header">
          <h2>{t('Create New Expense')}</h2>
          <button className="expense-modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="expense-modal-form">
          <div className="form-group">
            <label htmlFor="transaction_type">{t('Type')} *</label>
            <select
              id="transaction_type"
              name="transaction_type"
              value={formData.transaction_type}
              onChange={handleChange}
              required
            >
              <option value="+">{t('Income (+)')}</option>
              <option value="-">{t('Expense (-)')}</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">{t('Description')} *</label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder={t('Enter description')}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="amount">{t('Amount')} *</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="expense_date">{t('Date')} *</label>
            <input
              type="date"
              id="expense_date"
              name="expense_date"
              value={formData.expense_date}
              onChange={handleChange}
              required
            />
          </div>

          {error && <div className="expense-modal-error">{error}</div>}

          <div className="expense-modal-actions">
            <button
              type="button"
              className="expense-modal-cancel"
              onClick={onClose}
              disabled={isSubmitting}
            >
              {t('Cancel')}
            </button>
            <button
              type="submit"
              className="expense-modal-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? t('Creating...') : t('Create Expense')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseModal;