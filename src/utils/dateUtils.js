/**
 * Shared date utilities for KissanLink
 * Uses explicit integer construction to avoid UTC/DST issues across Node versions
 */

/**
 * Validates if a date is within the allowed booking window
 */
function validateBookingWindow(dateObj, maxDaysAhead = 30) {
  const maxDate = new Date();
  maxDate.setHours(0, 0, 0, 0);
  maxDate.setDate(maxDate.getDate() + maxDaysAhead);
  
  if (dateObj > maxDate) {
    return { valid: false, reason: 'TOO_FAR_AHEAD' };
  }
  return { valid: true };
}

/**
 * Returns Date objects for tomorrow and exactly one week from today
 */
function getQuickDateOptions() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const inOneWeek = new Date(today);
  inOneWeek.setDate(inOneWeek.getDate() + 7);
  
  return { tomorrow, inOneWeek };
}

/**
 * Parse DD-MM-YYYY string into a Date object (noon local time)
 * Returns object with valid flag and reason/date
 */
function parseDate(str, maxDaysAhead = 30) {
  if (!str) return { valid: false, reason: 'INVALID_FORMAT' };
  
  const match = str.trim().match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (!match) return { valid: false, reason: 'INVALID_FORMAT' };
  
  const day   = parseInt(match[1], 10);
  const month = parseInt(match[2], 10) - 1; // 0-indexed
  const year  = parseInt(match[3], 10);
  
  // Use noon local time — avoids UTC midnight DST shift issues
  const d = new Date(year, month, day, 12, 0, 0);
  
  if (isNaN(d.getTime())) return { valid: false, reason: 'INVALID_FORMAT' };
  if (d.getMonth() !== month) return { valid: false, reason: 'INVALID_FORMAT' }; // catches 31-02
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (d < today) return { valid: false, reason: 'PAST_DATE' };
  
  // Task 1: Check if date is too far in the future
  const windowCheck = validateBookingWindow(d, maxDaysAhead);
  if (!windowCheck.valid) return windowCheck;
  
  return { valid: true, date: d };
}

/**
 * Format a Date object as DD-MM-YYYY string
 */
function formatDateForDisplay(date) {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}-${m}-${y}`;
}

/**
 * Safely reconstruct a Date from a stored timestamp number
 */
function dateFromTimestamp(ts) {
  const d = new Date(ts);
  if (isNaN(d.getTime())) return null;
  return d;
}

module.exports = { 
  parseDate, 
  formatDateForDisplay, 
  dateFromTimestamp, 
  validateBookingWindow, 
  getQuickDateOptions 
};