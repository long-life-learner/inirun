/**
 * footer.js — Render footer INI RUN FEST.
 * Placeholder sponsor sengaja eksplisit ([LOGO SPONSOR]) sampai panitia
 * menyediakan aset vector resmi — lihat AGENTS.md §9 (Hal yang Harus Dihindari).
 */

/**
 * @param {HTMLElement} container - elemen target (mis. <footer id="footer">)
 */
export function renderFooter(container) {
  const year = new Date().getFullYear();

  container.innerHTML = `
    <div class="container footer__inner">
      <div class="footer__brand">INI RUN <span>FEST</span> 2026</div>

      <div class="footer__sponsors" aria-label="Sponsor & mitra">
        <div class="footer__sponsor-slot">[LOGO IKATAN NOTARIS INDONESIA]</div>
        <div class="footer__sponsor-slot">[LOGO PENGDA KAB. BEKASI]</div>
      </div>

      <p class="footer__meta">
        Dipersembahkan oleh Pengurus Daerah Kabupaten Bekasi,
        Ikatan Notaris Indonesia &middot; 27&ndash;28 Juni 2026 &middot; AEON Mall Deltamas<br>
        Ikuti kami di
        <a href="https://www.instagram.com/inirunfest" target="_blank" rel="noopener noreferrer">@inirunfest</a>
        &middot; &copy; ${year} INI RUN FEST. Seluruh hak cipta dilindungi.
      </p>
    </div>
  `;
}
