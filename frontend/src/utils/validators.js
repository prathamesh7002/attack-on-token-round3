/**
 * Validate email address format.
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return 'Please enter your email';
  }
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email.trim())) {
    return 'Please enter a valid email address';
  }
  return null;
}

/**
 * Validate password requirements (minimum 8 characters).
 */
export function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return 'Please enter a password';
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  return null;
}

/**
 * Validate password confirmation matches.
 */
export function validatePasswordConfirm(password, confirmPassword) {
  if (!confirmPassword) {
    return 'Please confirm your password';
  }
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  return null;
}

/**
 * Validate budget threshold percentages: 0 < warning < high <= 100
 */
export function validateThresholds(warningPct, highPct) {
  const warn = Number(warningPct);
  const high = Number(highPct);

  if (isNaN(warn) || warn <= 0 || warn >= 100) {
    return 'Warning threshold must be between 1% and 99%';
  }
  if (isNaN(high) || high <= 0 || high > 100) {
    return 'High spending threshold must be between 1% and 100%';
  }
  if (warn >= high) {
    return 'Warning threshold must be less than high spending threshold';
  }
  return null;
}
