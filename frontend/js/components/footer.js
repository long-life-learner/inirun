// js/components/footer.js
// Injects footer into `container`.

import { EVENT } from '../config.js';

/** @param {HTMLElement} container */
export function renderFooter(container) {
  container.innerHTML = `
    <footer class="footer">
      <div class="footer__inner">
        <div>
          <div class="footer__brand">INI RUN <span>FEST</span> 2026</div>
          <div class="footer__sub">
            ${EVENT.date} · ${EVENT.location}<br>
            Presented by Pengda Kabupaten Bekasi, Ikatan Notaris Indonesia
          </div>
        </div>
        <div class="footer__sponsors" aria-label="Sponsor">
          <div class="sponsor-placeholder" title="Logo INI Pengda Kab. Bekasi — aset resmi belum tersedia">INI Pengda<br>Kab. Bekasi</div>
        </div>
      </div>
      <p class="footer__copy">
        &copy; 2026 INI RUN FEST · Ikatan Notaris Indonesia Pengda Kabupaten Bekasi
      </p>
    </footer>`;
}
