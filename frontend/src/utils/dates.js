/**
 * Return current month in YYYY-MM format.
 */
export function getCurrentMonth() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Return today's date in YYYY-MM-DD format.
 */
export function getTodayDate() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format a YYYY-MM string to friendly human name (e.g. "October 2026")
 */
export function formatMonthName(monthStr) {
  if (!monthStr || typeof monthStr !== 'string' || !monthStr.includes('-')) {
    return monthStr || '';
  }
  const [yearStr, monthNumStr] = monthStr.split('-');
  const year = parseInt(yearStr, 10);
  const monthIndex = parseInt(monthNumStr, 10) - 1;
  const date = new Date(year, monthIndex, 1);
  return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

/**
 * Compute previous month string (YYYY-MM)
 */
export function getPreviousMonth(monthStr) {
  const [yearStr, monthNumStr] = (monthStr || getCurrentMonth()).split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(monthNumStr, 10) - 1;
  if (month < 1) {
    month = 12;
    year -= 1;
  }
  return `${year}-${String(month).padStart(2, '0')}`;
}

/**
 * Compute next month string (YYYY-MM)
 */
export function getNextMonth(monthStr) {
  const [yearStr, monthNumStr] = (monthStr || getCurrentMonth()).split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(monthNumStr, 10) + 1;
  if (month > 12) {
    month = 1;
    year += 1;
  }
  return `${year}-${String(month).padStart(2, '0')}`;
}

/**
 * Format date string (YYYY-MM-DD) into readable street-friendly label
 * e.g. "Today", "Yesterday", or "17 Oct"
 */
export function formatFriendlyDate(dateStr) {
  if (!dateStr) return '';
  const today = getTodayDate();
  if (dateStr === today) return 'Today';

  const d = new Date();
  d.setDate(d.getDate() - 1);
  const yesterday = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  if (dateStr === yesterday) return 'Yesterday';

  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const dateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    return dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }
  return dateStr;
}
