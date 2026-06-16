/**
 * Shared date utilities for KissanLink
 * Uses explicit integer construction to avoid UTC/DST issues across Node versions
 */

/**
 * Parse DD-MM-YYYY string into a Date object (noon local time)
 * Returns null if invalid or in the past
 */
function parseDate(str) {
  if (!str) return null;
  const match = str.trim().match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (!match) return null;
  const day   = parseInt(match[1], 10);
  const month = parseInt(match[2], 10) - 1; // 0-indexed
  const year  = parseInt(match[3], 10);
  // Use noon local time — avoids UTC midnight DST shift issues
  const d = new Date(year, month, day, 12, 0, 0);
  if (isNaN(d.getTime())) return null;
  if (d.getMonth() !== month) return null; // catches invalid days e.g. 31-02
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (d < today) return null;
  return d;
}

/**
 * Format a Date object as DD-MM-YYYY string
 */
function formatDate(date) {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}-${m}-${y}`;
}

/**
 * Safely reconstruct a Date from a stored timestamp number
 * Avoids re-parsing ISO strings which can produce Invalid Date in some envs
 */
function dateFromTimestamp(ts) {
  const d = new Date(ts);
  if (isNaN(d.getTime())) return null;
  return d;
}

module.exports = { parseDate, formatDate, dateFromTimestamp };
