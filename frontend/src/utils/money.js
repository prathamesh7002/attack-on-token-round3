import { API_AMOUNT_UNIT, API_RESPONSE_AMOUNT_UNIT } from '../config/api';

/**
 * Format a rupee number into Indian Rupee currency string (e.g. ₹16,500 or ₹450.50).
 * UI components always pass rupee numbers.
 */
export function formatRupees(amount, options = {}) {
  const numeric = typeof amount === 'number' ? amount : Number(amount) || 0;
  const showDecimals = options.showDecimals ?? (numeric % 1 !== 0);

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: showDecimals ? 2 : 0,
    minimumFractionDigits: showDecimals ? 2 : 0,
  }).format(numeric);
}

/**
 * Validate a user-entered amount:
 * Must be a positive number with at most 2 decimal places.
 */
export function validateAmount(val) {
  if (val === undefined || val === null || val === '') {
    return { valid: false, error: 'Please enter an amount' };
  }
  const str = String(val).trim();
  const num = Number(str);
  if (isNaN(num) || num <= 0) {
    return { valid: false, error: 'Please enter an amount greater than 0' };
  }
  // Check decimal places
  const parts = str.split('.');
  if (parts.length > 2 || (parts[1] && parts[1].length > 2)) {
    return { valid: false, error: 'Amount cannot have more than 2 decimal places' };
  }
  return { valid: true, error: null, value: num };
}

/**
 * Convert rupee amount from UI into API request unit ('rupees' | 'paise')
 */
export function toApiAmount(amountInRupees) {
  const num = Number(amountInRupees) || 0;
  if (API_AMOUNT_UNIT === 'paise') {
    return Math.round(num * 100);
  }
  return num;
}

/**
 * Convert backend response amount into rupee number for UI consumption
 */
export function fromApiAmount(amountFromApi) {
  if (amountFromApi === undefined || amountFromApi === null) return 0;
  const num = Number(amountFromApi) || 0;
  if (API_RESPONSE_AMOUNT_UNIT === 'paise') {
    return num / 100;
  }
  return num;
}
