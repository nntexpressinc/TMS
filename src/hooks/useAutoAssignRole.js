import { useEffect, useState } from 'react';
import { ApiService } from '../api/auth';
import { toast } from 'react-hot-toast';

/**
 * Custom hook to automatically fetch and assign user role based on entity type
 * @param {string} roleType - Type of role to assign ('dispatcher', 'driver', 'employee')
 * @param {Function} setUserData - Function to update user data state
 * @returns {Object} { roles, loading, error }
 */
export const useAutoAssignRole = (roleType, setUserData) => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAndAssignRole = async () => {
      try {
        setLoading(true);
        const response = await ApiService.getData('/auth/role/');
        setRoles(response);

        // Automatically find and assign the appropriate role
        const targetRole = response.find(
          role => role.name && role.name.toLowerCase() === roleType.toLowerCase()
        );

        if (targetRole) {
          setUserData(prev => ({
            ...prev,
            role: targetRole.id
          }));
        } else {
          console.warn(`Role "${roleType}" not found in available roles`);
          toast.warning(`${roleType} role not found. Please contact administrator.`);
        }
      } catch (err) {
        console.error('Error fetching roles:', err);
        setError('Failed to fetch roles');
        toast.error('Failed to fetch roles');
      } finally {
        setLoading(false);
      }
    };

    fetchAndAssignRole();
  }, [roleType, setUserData]);

  return { roles, loading, error };
};
