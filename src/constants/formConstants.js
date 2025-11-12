/**
 * Shared constants for forms across the application
 * This file contains reusable data like US states, status options, etc.
 */

export const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' }
];

export const EMPLOYMENT_STATUSES = [
  { value: 'ACTIVE (DF)', label: 'Active (DF)' },
  { value: 'Terminate', label: 'Terminate' },
  { value: 'Applicant', label: 'Applicant' }
];

export const DRIVER_STATUSES = [
  { value: 'Available', label: 'Available' },
  { value: 'Home', label: 'Home' },
  { value: 'In-Transit', label: 'In-Transit' },
  { value: 'Inactive', label: 'Inactive' },
  { value: 'Shop', label: 'Shop' },
  { value: 'Rest', label: 'Rest' },
  { value: 'Dispatched', label: 'Dispatched' }
];

export const DRIVER_TYPES = [
  { value: 'COMPANY_DRIVER', label: 'Company Driver' },
  { value: 'OWNER_OPERATOR', label: 'Owner Operator' },
  { value: 'LEASE', label: 'Lease' },
  { value: 'RENTAL', label: 'Rental' }
];

export const DL_CLASSES = [
  { value: 'Unknown', label: 'Unknown' },
  { value: 'A', label: 'A' },
  { value: 'B', label: 'B' },
  { value: 'C', label: 'C' },
  { value: 'D', label: 'D' },
  { value: 'E', label: 'E' },
  { value: 'Other', label: 'Other' }
];

export const TEAM_DRIVER_TYPES = [
  { value: 'DRIVER_2', label: 'Driver 2' },
  { value: 'ASSIGNED_DISPATCHER', label: 'Assigned Dispatcher' },
  { value: 'PERCENT_SALARY', label: 'Percent Salary' }
];

export const DISPATCHER_POSITIONS = [
  { value: 'EMPLOYEE', label: 'Employee' },
  { value: 'MANAGER', label: 'Manager' }
];

export const MC_NUMBERS = [
  { value: 'ADMIN OR COMPANY MC', label: 'Admin or Company MC' }
];

export const EMPLOYEE_POSITIONS = [
  { value: 'ACCOUNTING', label: 'Accounting' },
  { value: 'FLEET MANAGMENT', label: 'Fleet Management' },
  { value: 'SAFETY', label: 'Safety' },
  { value: 'HR', label: 'HR' },
  { value: 'UPDATER', label: 'Updater' },
  { value: 'ELD TEAM', label: 'ELD Team' },
  { value: 'OTHER', label: 'Other' }
];

/**
 * Get the full state name from state code
 * @param {string} code - State code (e.g., 'CA')
 * @returns {string} Full state name (e.g., 'CA - California')
 */
export const getStateFullName = (code) => {
  if (!code) return '-';
  const state = US_STATES.find(s => s.code === code);
  return state ? `${state.code} - ${state.name}` : code;
};

/**
 * Get profile photo URL with fallback
 * @param {string} url - Profile photo URL
 * @param {string} name - User's name for fallback avatar
 * @returns {string} Complete photo URL
 */
export const getProfilePhotoUrl = (url, name = 'User') => {
  if (!url) return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
  if (url.startsWith('http')) return url;
  return `https://nnt.nntexpressinc.com${url}`;
};

/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {boolean} Whether email is valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} Whether phone is valid
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^[\d\s\-\(\)\+]+$/;
  return phoneRegex.test(phone);
};

/**
 * Format number safely
 * @param {any} value - Value to format as number
 * @param {number} defaultValue - Default value if parsing fails
 * @returns {number} Parsed number or default
 */
export const safeParseInt = (value, defaultValue = 0) => {
  if (value === null || value === undefined || value === '') return defaultValue;
  const parsed = parseInt(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * Format float number safely
 * @param {any} value - Value to format as float
 * @param {number} defaultValue - Default value if parsing fails
 * @returns {number} Parsed float or default
 */
export const safeParseFloat = (value, defaultValue = 0) => {
  if (value === null || value === undefined || value === '') return defaultValue;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * Clean object by removing null, undefined, and empty string values
 * @param {Object} obj - Object to clean
 * @returns {Object} Cleaned object
 */
export const cleanObject = (obj) => {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      acc[key] = value;
    }
    return acc;
  }, {});
};
