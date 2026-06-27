/**
 * include-layout.js — Inject navbar & footer ke halaman manapun.
 * Dipanggil dari tiap entry point halaman (lihat js/home.js).
 */
import { renderNavbar } from './navbar.js';
import { renderFooter } from './footer.js';

/**
 * @param {string} activePage - 'index' | 'results' | 'podium'
 */
export function mountLayout(activePage) {
  const navbarEl = document.getElementById('navbar');
  const footerEl = document.getElementById('footer');

  if (navbarEl) renderNavbar(navbarEl, { activePage });
  if (footerEl) renderFooter(footerEl);
}
