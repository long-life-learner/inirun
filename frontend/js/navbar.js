/**
 * navbar.js — Render navbar INI RUN FEST.
 * Dipakai lintas halaman (index, results, podium). Lihat AGENTS.md §5.1:
 * fungsi render menerima container + opsi, tanpa state management eksternal.
 */

const NAV_LINKS = [
  { label: 'Beranda', href: 'index.html' },
  { label: 'Hasil Lomba', href: 'results.html' },
  { label: 'Podium Juara', href: 'podium.html' },
];

/**
 * @param {HTMLElement} container - elemen target (mis. <header id="navbar">)
 * @param {{ activePage?: string }} [options] - 'index' | 'results' | 'podium'
 */
export function renderNavbar(container, options = {}) {
  const { activePage = '' } = options;

  const linksHtml = NAV_LINKS.map((link) => {
    const page = link.href.replace('.html', '');
    const isActive = page === activePage;
    return `<a class="navbar__link" href="${link.href}" ${isActive ? 'aria-current="page"' : ''}>${link.label}</a>`;
  }).join('');

  container.innerHTML = `
    <div class="container navbar__inner">
      <a class="navbar__brand" href="index.html" aria-label="INI RUN FEST — Beranda">
            <img src="assets/logo.jpg" alt="ini run logo" srcset="ini run logo">
      </a>
      <nav class="navbar__menu" aria-label="Navigasi utama">
        ${linksHtml}
      </nav>
      <button class="navbar__toggle" id="navbarToggle" aria-expanded="false" aria-controls="navbarMobileMenu" aria-label="Buka menu navigasi">
        <svg class="icon" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
    </div>
    <div class="container">
      <nav class="navbar__mobile-menu" id="navbarMobileMenu" aria-label="Navigasi mobile">
        ${linksHtml}
      </nav>
    </div>
  `;

  const toggle = container.querySelector('#navbarToggle');
  const mobileMenu = container.querySelector('#navbarMobileMenu');

  toggle?.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Sticky shadow saat scroll
  const onScroll = () => {
    container.classList.toggle('is-scrolled', window.scrollY > 4);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}
