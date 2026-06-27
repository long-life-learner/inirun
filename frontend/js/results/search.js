// js/results/search.js
// Debounced search input — dispatches 'filterChange' CustomEvent on the element.

/**
 * Wire up a search input with 300ms debounce.
 * @param {HTMLInputElement} input
 * @param {(value: string) => void} onChange
 */
export function initSearch(input, onChange) {
  let timer;
  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => onChange(input.value.trim()), 300);
  });
  // Clear on Escape
  input.addEventListener('keydown', e => {
    if (e.key === 'Escape') { input.value = ''; onChange(''); }
  });
}
