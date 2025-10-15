import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import AccountingPage from './AccountingPage';
import PayReportsPage from './PayReportsPage';
import './AccountingPageWrapper.css';

/**
 * Wrapper component that provides tab navigation between:
 * 1. Driver Pay (Create new pay stubs)
 * 2. Pay Reports (View/manage existing pay records)
 */
const AccountingPageWrapper = () => {
  const navigate = useNavigate();

  return (
    <div className="accounting-wrapper">
      {/* Content Area */}
      <div className="accounting-content">
        <Routes>
          <Route path="/" element={<PayReportsPage onCreateNew={() => navigate('/accounting/create-driver-pay')} />} />
          <Route path="/create-driver-pay" element={<AccountingPage />} />
        </Routes>
      </div>
    </div>
  );
};

export default AccountingPageWrapper;












