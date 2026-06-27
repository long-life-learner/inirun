// js/results/table-render.js
// Renders result rows using <template> + cloneNode + textContent only (no innerHTML with data).

import { formatTime, formatPace, formatGender } from '../utils/format.js';

/**
 * Convert time string (HH:MM:SS or H:MM:SS) to seconds for sorting.
 */
function parseTimeToSeconds(timeStr) {
  if (!timeStr) return Infinity;
  const parts = timeStr.split(':').map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return Infinity;
}

/** @param {HTMLTableSectionElement} tbody */
export function showTableSkeleton(tbody, rows = 8) {
  tbody.innerHTML = '';
  for (let i = 0; i < rows; i++) {
    const tr = document.createElement('tr');
    tr.className = 'table-skeleton';
    tr.innerHTML = `
      <td><div class="skel-cell skeleton" style="width:40px"></div></td>
      <td><div class="skel-cell skeleton" style="width:52px"></div></td>
      <td><div class="skel-cell skeleton" style="width:160px"></div></td>
      <td><div class="skel-cell skeleton" style="width:60px"></div></td>
      <td><div class="skel-cell skeleton" style="width:48px"></div></td>
      <td><div class="skel-cell skeleton" style="width:80px"></div></td>
      <td><div class="skel-cell skeleton" style="width:64px"></div></td>`;
    tbody.appendChild(tr);
  }
}

/**
 * Render results into tbody.
 * @param {HTMLTableSectionElement} tbody
 * @param {import('../api/client.js').ResultEntry[]} results
 * @param {(entry: import('../api/client.js').ResultEntry) => void} onRowClick
 * @param {{ skipTopN?: number }} [opts]
 */
export function renderResultsTable(tbody, results, onRowClick, opts = {}) {
  const { skipTopN = 0, page = 1, limit = 50, hasFilter = false } = opts;

  tbody.innerHTML = '';

  // Sort by gun time (fastest first)
  const sorted = [...results].sort((a, b) =>
    parseTimeToSeconds(a.gunTime) - parseTimeToSeconds(b.gunTime)
  );

  // Assign rank based on sorted position within the current page
  // On page 1 rank starts at 1, on page 2 it starts at limit+1, etc.
  const pageOffset = (page - 1) * limit;
  const mapped = sorted.map((entry, index) => {
    const rank = pageOffset + index + 1;
    return { ...entry, _computedRank: rank };
  });

  // When podium is visible (hasFilter), skip the top-N rows that appear on the podium
  const shouldSkip = skipTopN > 0 && hasFilter;
  const filtered = shouldSkip
    ? mapped.filter(entry => entry._computedRank > skipTopN)
    : mapped;

  if (!filtered.length) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 8;
    td.className = 'table-state';
    const icon = document.createElement('div');
    icon.className = 'table-state__icon';
    icon.textContent = '🔍';
    const title = document.createElement('div');
    title.className = 'table-state__title';
    title.textContent = 'Tidak Ada Hasil';
    const sub = document.createElement('div');
    sub.className = 'table-state__sub';
    sub.textContent = 'Coba ubah filter atau kata kunci pencarian.';
    td.append(icon, title, sub);
    tr.appendChild(td);
    tbody.appendChild(tr);
    return;
  }

  /** @type {HTMLTemplateElement} */
  const tpl = document.getElementById('row-template');

  for (let i = 0; i < filtered.length; i++) {
    const entry = filtered[i];
    const row = /** @type {HTMLTableRowElement} */ (tpl.content.cloneNode(true)).querySelector('tr');

    const rank = entry._computedRank;
    if (rank >= 1 && rank <= 3) row.dataset.rank = String(rank);

    // Rank cell
    const rankCell = row.querySelector('.rank-cell');
    const rankText = document.createElement('span');
    rankText.textContent = String(rank);
    if (rank >= 1 && rank <= 5) {
      const medal = document.createElement('span');
      medal.className = `medal medal--${rank}`;
      medal.textContent = String(rank);
      medal.setAttribute('aria-label', `Juara ${rank}`);
      rankCell.appendChild(medal);
    }
    rankCell.appendChild(rankText);
    // Name
    row.querySelector('.col-name').textContent = entry.name;

    // Times
    row.querySelector('.col-pace').textContent = formatPace(entry.pace);
    row.querySelector('.col-gun-time').textContent = formatTime(entry.gunTime);

    // Category badge
    const badge = row.querySelector('.badge--category');
    badge.textContent = entry.category;

    // Gender
    row.querySelector('.col-gender').textContent = formatGender(entry.gender);

    // BIB
    row.querySelector('.col-bib').textContent = entry.bib;

    // Click → bib card
    row.addEventListener('click', () => onRowClick(entry));
    row.style.cursor = 'pointer';

    tbody.appendChild(row);
  }
}
