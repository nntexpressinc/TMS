import { isValidEmail, isValidPhone } from '../constants/formConstants';

/**
 * Validate user form data
 * @param {Object} userData - User data to validate
 * @param {boolean} isCreating - Whether this is for creation (password required)
 * @returns {Object} { isValid, errors }
 */
export const validateUserForm = (userData, isCreating = true) => {
  const errors = {};

  // Required fields
  if (!userData.first_name || !userData.first_name.trim()) {
    errors.first_name = 'First name is required';
  }

  if (!userData.last_name || !userData.last_name.trim()) {
    errors.last_name = 'Last name is required';
  }

  if (!userData.email || !userData.email.trim()) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(userData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (userData.telephone && !isValidPhone(userData.telephone)) {
    errors.telephone = 'Please enter a valid phone number';
  }

  // Password validation (only for creation)
  if (isCreating) {
    if (!userData.password || !userData.password.trim()) {
      errors.password = 'Password is required';
    } else if (userData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate driver specific data
 * @param {Object} driverData - Driver data to validate
 * @returns {Object} { isValid, errors }
 */
export const validateDriverForm = (driverData) => {
  const errors = {};

  if (!driverData.driver_license_id || !driverData.driver_license_id.trim()) {
    errors.driver_license_id = 'Driver license ID is required';
  }

  if (!driverData.birth_date) {
    errors.birth_date = 'Birth date is required';
  } else {
    const birthDate = new Date(driverData.birth_date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    
    if (age < 18) {
      errors.birth_date = 'Driver must be at least 18 years old';
    } else if (age > 100) {
      errors.birth_date = 'Please enter a valid birth date';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Build form error message from validation errors
 * @param {Object} errors - Validation errors object
 * @returns {string} Combined error message
 */
export const buildErrorMessage = (errors) => {
  if (!errors || Object.keys(errors).length === 0) {
    return '';
  }

  return Object.entries(errors)
    .map(([field, message]) => `${field}: ${message}`)
    .join('\n');
};

/**
 * Prepare user data for API submission
 * @param {Object} userData - Raw user data
 * @param {File|null} profilePhotoFile - Profile photo file
 * @returns {FormData} Prepared form data
 */
export const prepareUserFormData = (userData, profilePhotoFile = null) => {
  const formData = new FormData();

  // Add all user fields
  const fields = [
    'email', 'company_name', 'first_name', 'last_name', 'telephone',
    'city', 'address', 'country', 'state', 'postal_zip', 'fax', 'role'
  ];

  fields.forEach(field => {
    const value = userData[field];
    if (value !== null && value !== undefined && value !== '') {
      formData.append(field, value);
    }
  });

  // Handle ext field (integer)
  if (userData.ext && userData.ext.trim() !== '') {
    const extValue = parseInt(userData.ext);
    if (!isNaN(extValue)) {
      formData.append('ext', extValue);
    }
  }

  // Handle password fields (only for creation)
  if (userData.password) {
    formData.append('password', userData.password);
    formData.append('password2', userData.password);
  }

  // Add profile photo if exists
  if (profilePhotoFile) {
    formData.append('profile_photo', profilePhotoFile);
  }

  return formData;
};

/**
 * Clean data for update (remove null/undefined/empty values)
 * @param {Object} data - Data to clean
 * @param {Array<string>} allowedFields - List of allowed fields
 * @returns {Object} Cleaned data
 */
export const cleanDataForUpdate = (data, allowedFields) => {
  const cleanData = {};
  
  allowedFields.forEach(field => {
    const value = data[field];
    if (value !== undefined && value !== null && value !== '') {
      cleanData[field] = value;
    }
  });

  return cleanData;
};
