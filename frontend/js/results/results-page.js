// js/results/results-page.js
// Entry point for results.html
// Owns page state: filters, current page, loading/error/empty states.

import { fetchResults } from '../api/client.js';
import { renderNavbar }        from '../components/navbar.js';
import { renderFooter }        from '../components/footer.js';
import { initSearch }          from './search.js';
import { renderResultsTable, showTableSkeleton } from './table-render.js';
import { openBibCard }         from './bib-card.js';
import { initResultsPodium, loadPodium } from './results-podium.js';

// ── DOM refs ──────────────────────────────────────────────────────────────
const navContainer    = document.getElementById('nav-container');
const footContainer   = document.getElementById('footer-container');
const searchInput     = document.getElementById('search-input');
const filterCategory  = document.getElementById('filter-category');
const filterGender    = document.getElementById('filter-gender');
const resetBtn        = document.getElementById('filter-reset');
const tbody           = document.getElementById('results-tbody');
const countEl         = document.getElementById('results-count');
const prevBtn         = document.getElementById('page-prev');
const nextBtn         = document.getElementById('page-next');
const pageInfo        = document.getElementById('page-info');
const errorContainer  = document.getElementById('results-error');

// ── State ─────────────────────────────────────────────────────────────────
const state = { category: '5K', gender: '', search: '', page: 1, total: 0, pages: 1 };

// ── Init ──────────────────────────────────────────────────────────────────
renderNavbar(navContainer, 'results');
renderFooter(footContainer);
initSearch(searchInput, q => { state.search = q; state.page = 1; load(); });

// Init podium scene (lazy-loads Three.js)
initResultsPodium(openBibCard);

// Pre-select 5K category on initial load
filterCategory.value = state.category;

// Filter chips
filterCategory.addEventListener('change', () => { state.category = filterCategory.value; state.page = 1; load(); loadPodium(state.category, state.gender); });
filterGender.addEventListener('change',   () => { state.gender   = filterGender.value;   state.page = 1; load(); loadPodium(state.category, state.gender); });
resetBtn.addEventListener('click', resetFilters);

// Pagination
prevBtn.addEventListener('click', () => { if (state.page > 1)           { state.page--; load(); } });
nextBtn.addEventListener('click', () => { if (state.page < state.pages) { state.page++; load(); } });

// ── Helpers ───────────────────────────────────────────────────────────────
function resetFilters() {
  state.category = '5K'; state.gender = ''; state.search = ''; state.page = 1;
  filterCategory.value = '5K';
  filterGender.value   = '';
  searchInput.value    = '';
  updateResetBtn();
  load();
  loadPodium(state.category, state.gender);
}

function updateResetBtn() {
  const active = state.category || state.gender || state.search;
  resetBtn.classList.toggle('visible', !!active);
}

function updatePagination() {
  pageInfo.textContent = `Halaman ${state.page} dari ${state.pages}`;
  prevBtn.disabled = state.page <= 1;
  nextBtn.disabled = state.page >= state.pages;
  countEl.textContent = `${state.total.toLocaleString('id-ID')} peserta`;
}

function setError(msg) {
  errorContainer.hidden = false;
  errorContainer.querySelector('.alert__msg').textContent = msg;
  tbody.innerHTML = '';
}

// ── Main load ─────────────────────────────────────────────────────────────
async function load() {
  errorContainer.hidden = true;
  updateResetBtn();

  const placeholderEl = document.getElementById('results-placeholder');
  const resultsSec = document.querySelector('.results-section');
  const podiumSec = document.getElementById('results-podium');

  if (!state.category) {
    if (placeholderEl) placeholderEl.hidden = false;
    if (resultsSec) resultsSec.hidden = true;
    if (podiumSec) podiumSec.hidden = true;
    return;
  }

  if (placeholderEl) placeholderEl.hidden = true;
  if (resultsSec) resultsSec.hidden = false;
  // Podium is only shown when BOTH category and gender are selected
  if (podiumSec) {
    podiumSec.hidden = !(state.category && state.gender);
  }

  showTableSkeleton(tbody);

  try {
    const data = await fetchResults({
      category: state.category || undefined,
      gender:   state.gender   || undefined,
      search:   state.search   || undefined,
      page:     state.page,
      limit:    50,
    });

    state.total = data.total;
    state.pages = data.pages;
    updatePagination();
    const hasFilter = !!(state.category && state.gender);
    renderResultsTable(tbody, data.results, openBibCard, { skipTopN: hasFilter ? 5 : 0, hasFilter, page: state.page, limit: 50 });
  } catch (err) {
    setError(err.message);
  }
}

// Initial load
load();
loadPodium(state.category, state.gender);
