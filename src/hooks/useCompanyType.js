import { useState, useEffect } from 'react';
import { ApiService } from '../api/auth';

/**
 * Custom hook to detect and manage user's company type
 * Returns company type ('amazon' or 'other') and loading state
 */
const useCompanyType = () => {
  const [companyType, setCompanyType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [companyData, setCompanyData] = useState(null);

  useEffect(() => {
    const fetchCompanyType = async () => {
      try {
        setLoading(true);
        setError(null);

        // First check if we have user data in localStorage
        const storedUser = localStorage.getItem('user');
        
        if (storedUser) {
          const user = JSON.parse(storedUser);
          
          // If user has company_id, fetch company details
          if (user.company_id || user.company) {
            const companyId = user.company_id || user.company;
            
            try {
              // First, try to get the list of companies (user's own company)
              const companiesResponse = await ApiService.getData('/auth/company/');
              
              if (companiesResponse && companiesResponse.length > 0) {
                // User has a company, use the first one
                const userCompany = companiesResponse[0];
                setCompanyData(userCompany);
                setCompanyType(userCompany.company_type || 'other');
                localStorage.setItem('company_type', userCompany.company_type || 'other');
              } else {
                // Try individual company endpoint as fallback
                try {
                  const companyResponse = await ApiService.getData(`/auth/company/${companyId}/`);
                  setCompanyData(companyResponse);
                  setCompanyType(companyResponse.company_type || 'other');
                  localStorage.setItem('company_type', companyResponse.company_type || 'other');
                } catch (individualError) {
                  console.warn('Could not fetch company details, defaulting to "other"');
                  // Fallback to cached value or default
                  const cachedType = localStorage.getItem('company_type');
                  setCompanyType(cachedType || 'other');
                  if (!cachedType) {
                    localStorage.setItem('company_type', 'other');
                  }
                }
              }
            } catch (companyError) {
              console.warn('Error fetching company, defaulting to "other":', companyError.message);
              // Fallback to cached value or default
              const cachedType = localStorage.getItem('company_type');
              setCompanyType(cachedType || 'other');
              if (!cachedType) {
                localStorage.setItem('company_type', 'other');
              }
            }
          } else {
            // No company assigned, default to 'other'
            console.log('No company_id found for user, defaulting to "other"');
            setCompanyType('other');
            localStorage.setItem('company_type', 'other');
          }
        } else {
          // Try to fetch user data
          const userId = localStorage.getItem('userid');
          if (userId) {
            const userData = await ApiService.getData(`/auth/users/${userId}/`);
            localStorage.setItem('user', JSON.stringify(userData));
            
            if (userData.company_id || userData.company) {
              try {
                // Try to get list of companies first
                const companiesResponse = await ApiService.getData('/auth/company/');
                
                if (companiesResponse && companiesResponse.length > 0) {
                  const userCompany = companiesResponse[0];
                  setCompanyData(userCompany);
                  setCompanyType(userCompany.company_type || 'other');
                  localStorage.setItem('company_type', userCompany.company_type || 'other');
                } else {
                  // Fallback to default
                  console.log('No companies found, defaulting to "other"');
                  setCompanyType('other');
                  localStorage.setItem('company_type', 'other');
                }
              } catch (companyError) {
                console.warn('Could not fetch company, defaulting to "other"');
                const cachedType = localStorage.getItem('company_type');
                setCompanyType(cachedType || 'other');
                if (!cachedType) {
                  localStorage.setItem('company_type', 'other');
                }
              }
            } else {
              console.log('User has no company assigned, defaulting to "other"');
              setCompanyType('other');
              localStorage.setItem('company_type', 'other');
            }
          } else {
            // No user data available, default to 'other'
            console.log('No user ID found, defaulting to "other"');
            setCompanyType('other');
            localStorage.setItem('company_type', 'other');
          }
        }
      } catch (err) {
        console.error('Error detecting company type:', err);
        setError(err);
        // Fallback to cached or default
        const cachedType = localStorage.getItem('company_type');
        setCompanyType(cachedType || 'other');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyType();
  }, []);

  return {
    companyType,
    isAmazon: companyType === 'amazon',
    isOther: companyType === 'other',
    loading,
    error,
    companyData
  };
};

export default useCompanyType;
