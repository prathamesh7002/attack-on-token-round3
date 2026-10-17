// API configuration and global constants
export const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || import.meta.env.VITE_USE_MOCK === true;

// Unit handling configuration:
// API_AMOUNT_UNIT: what the backend expects on requests ('rupees' | 'paise')
// API_RESPONSE_AMOUNT_UNIT: what the backend returns on responses ('rupees' | 'paise')
// Default both to 'rupees' as specified in requirements.
export const API_AMOUNT_UNIT = 'rupees';
export const API_RESPONSE_AMOUNT_UNIT = 'rupees';

// Storage keys
export const TOKEN_STORAGE_KEY = 'streetledger_access_token';
export const VENDOR_STORAGE_KEY = 'streetledger_current_vendor';
export const LAST_CATEGORY_KEY = 'streetledger_last_category';
