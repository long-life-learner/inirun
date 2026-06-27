// js/home.js
// Entry point for index.html

import { renderNavbar } from './components/navbar.js';
import { renderFooter } from './components/footer.js';

document.addEventListener('DOMContentLoaded', () => {
  const navContainer = document.getElementById('nav-container');
  const footerContainer = document.getElementById('footer-container');

  if (navContainer) {
    renderNavbar(navContainer, 'home');
  }

  if (footerContainer) {
    renderFooter(footerContainer);
  }
});
