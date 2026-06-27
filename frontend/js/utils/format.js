// js/utils/format.js
// Formatting helpers + XSS guard.

/**
 * Escape HTML special characters. Use when innerHTML is unavoidable.
 * @param {string} str
 */
export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Format a HH:MM:SS time string for display (strips leading zeros only for hours).
 * @param {string|null} t — "00:23:58" or "1:04:22"
 */
export function formatTime(t) {
  if (!t) return '–';
  // Strip leading zero-hour if < 1h
  return t.replace(/^00:/, '');
}

/**
 * Friendly pace display. Backend already returns "4:48/km" — pass-through with null guard.
 * @param {string|null} pace
 */
export function formatPace(pace) {
  return pace || '–';
}

/**
 * Gender code to display string.
 * @param {'M'|'F'|string} g
 */
export function formatGender(g) {
  return g === 'M' ? 'Putra' : g === 'F' ? 'Putri' : g;
}

/**
 * Initials from a name string (max 2 chars), for avatar fallback.
 * @param {string} name
 */
export function initials(name) {
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0].toUpperCase()).join('');
}
