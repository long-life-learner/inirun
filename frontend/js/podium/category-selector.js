// js/podium/category-selector.js
// Populates the category+gender <select> from API and fires a change.

import { fetchCategories } from '../api/client.js';
import { formatGender }    from '../utils/format.js';
import { EVENT }           from '../config.js';

/**
 * @param {HTMLSelectElement} select
 * @param {(category: string, gender: string) => void} onChange
 */
export async function initCategorySelector(select, onChange) {
  // Add default options from config (graceful if API fails)
  const defaultOpts = EVENT.categories.flatMap(cat =>
    ['M', 'F'].map(g => ({ category: cat, gender: g }))
  );

  let options = defaultOpts;
  try {
    const data = await fetchCategories();
    if (data.length) options = data;
  } catch (_) { /* use defaults */ }

  select.innerHTML = '';
  for (const { category, gender } of options) {
    const opt = document.createElement('option');
    opt.value       = `${category}|${gender}`;
    opt.textContent = `${category} ${formatGender(gender)}`;
    select.appendChild(opt);
  }

  select.addEventListener('change', () => {
    const [cat, gen] = select.value.split('|');
    onChange(cat, gen);
  });

  // Fire initial selection
  if (select.options.length) {
    const [cat, gen] = select.value.split('|');
    onChange(cat, gen);
  }
}
