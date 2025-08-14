// Data validation utilities

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

export const isValidPAN = (pan: string): boolean => {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan.toUpperCase());
};

export const isValidAadhaar = (aadhaar: string): boolean => {
  const aadhaarRegex = /^[0-9]{12}$/;
  return aadhaarRegex.test(aadhaar.replace(/\D/g, ''));
};

export const isValidIFSC = (ifsc: string): boolean => {
  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  return ifscRegex.test(ifsc.toUpperCase());
};

export const isValidAccountNumber = (accountNumber: string): boolean => {
  // Basic validation - account numbers are typically 9-18 digits
  const accountRegex = /^[0-9]{9,18}$/;
  return accountRegex.test(accountNumber);
};

export const isValidAmount = (amount: number): boolean => {
  return amount > 0 && amount <= 999999999.99;
};

export const isValidDate = (date: string): boolean => {
  const dateObj = new Date(date);
  return dateObj instanceof Date && !isNaN(dateObj.getTime());
};

export const isValidDateRange = (fromDate: string, toDate: string): boolean => {
  if (!isValidDate(fromDate) || !isValidDate(toDate)) {
    return false;
  }
  
  const from = new Date(fromDate);
  const to = new Date(toDate);
  
  return from <= to;
};

export const isValidConsentId = (consentId: string): boolean => {
  // Consent IDs are typically UUIDs or similar format
  const consentIdRegex = /^[a-zA-Z0-9-]{20,50}$/;
  return consentIdRegex.test(consentId);
};

export const isValidTransactionId = (transactionId: string): boolean => {
  // Transaction IDs are typically alphanumeric
  const transactionIdRegex = /^[a-zA-Z0-9]{10,30}$/;
  return transactionIdRegex.test(transactionId);
};

export const isValidPassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export const isValidOTP = (otp: string): boolean => {
  const otpRegex = /^[0-9]{4,6}$/;
  return otpRegex.test(otp);
};

export const isValidURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isValidJSON = (jsonString: string): boolean => {
  try {
    JSON.parse(jsonString);
    return true;
  } catch {
    return false;
  }
};

export const validateRequired = (value: any): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

export const validateMinLength = (value: string, minLength: number): boolean => {
  return value.length >= minLength;
};

export const validateMaxLength = (value: string, maxLength: number): boolean => {
  return value.length <= maxLength;
};

export const validateLength = (value: string, minLength: number, maxLength: number): boolean => {
  return value.length >= minLength && value.length <= maxLength;
};

export const validateMinValue = (value: number, minValue: number): boolean => {
  return value >= minValue;
};

export const validateMaxValue = (value: number, maxValue: number): boolean => {
  return value <= maxValue;
};

export const validateRange = (value: number, minValue: number, maxValue: number): boolean => {
  return value >= minValue && value <= maxValue;
};

// Validation error messages
export const getValidationError = (field: string, type: string): string => {
  const errors: Record<string, Record<string, string>> = {
    email: {
      invalid: 'Please enter a valid email address',
      required: 'Email is required',
    },
    phone: {
      invalid: 'Please enter a valid 10-digit phone number',
      required: 'Phone number is required',
    },
    password: {
      invalid: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
      required: 'Password is required',
    },
    amount: {
      invalid: 'Please enter a valid amount',
      required: 'Amount is required',
    },
    date: {
      invalid: 'Please enter a valid date',
      required: 'Date is required',
    },
    required: {
      invalid: 'This field is required',
    },
  };

  return errors[field]?.[type] || 'Invalid value';
}; 