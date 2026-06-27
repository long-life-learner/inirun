// js/components/navbar.js
// Injects sticky navbar into `container`. Call once per page.

/**
 * @param {HTMLElement} container
 * @param {'home'|'results'|'podium'} activePage
 */
export function renderNavbar(container, activePage) {
  container.innerHTML = `
    <nav class="navbar" id="main-navbar" aria-label="Navigasi utama">
      <div class="navbar__inner">
        <a href="/index.html" class="navbar__logo" aria-label="INI RUN FEST beranda">
            INI RUN <span>FEST</span>
            <svg width="20" height="14" viewBox="0 0 32 22" fill="none" aria-hidden="true">
              <path d="M4 18 Q12 2 28 4" stroke="#FBF000" stroke-width="2.5" stroke-linecap="round" fill="none"/>
              <circle cx="28" cy="4" r="3" fill="#FBF000"/>
            </svg>
        </a>

        
      </div>
    </nav>`;

  // <button class="navbar__hamburger" id="nav-toggle" aria-expanded="false" aria-controls="nav-menu" aria-label="Buka menu">
  //       <span></span><span></span><span></span>
  //     </button>

  //     <ul class="navbar__nav" id="nav-menu" role="list">
  //       <li><a href="/index.html"     ${activePage === 'home' ? 'aria-current="page"' : ''}>Beranda</a></li>
  //       <li><a href="/results.html"   ${activePage === 'results' ? 'aria-current="page"' : ''}>Hasil Lomba</a></li>
  //       <li><a href="/podium.html"    ${activePage === 'podium' ? 'aria-current="page"' : ''}>Podium</a></li>
  //     </ul>
  // Scroll shadow
  const nav = container.querySelector('#main-navbar');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 4);
  }, { passive: true });

  // Hamburger toggle
  // const toggle = container.querySelector('#nav-toggle');
  // const menu = container.querySelector('#nav-menu');
  // toggle.addEventListener('click', () => {
  //   const open = menu.classList.toggle('open');
  //   toggle.setAttribute('aria-expanded', String(open));
  // });

  // Close menu on outside click
  // document.addEventListener('click', e => {
  //   if (!container.contains(e.target)) menu.classList.remove('open');
  // });
}
