// js/podium/podium-page.js
// Entry point for podium.html — AGENTS.md §5.2 pattern.

import { fetchTopFive } from '../api/client.js';
import { isWebGLAvailable } from '../utils/webgl-check.js';
import { renderNavbar } from '../components/navbar.js';
import { renderFooter } from '../components/footer.js';
import { renderFallback2D } from './fallback-2d.js';
import { initCategorySelector } from './category-selector.js';
import { formatGender } from '../utils/format.js';

// DOM refs
const navContainer = document.getElementById('nav-container');
const footContainer = document.getElementById('footer-container');
const stageEl = document.getElementById('podium-stage');
const loadingEl = document.getElementById('podium-loading');
const fallbackEl = document.getElementById('podium-fallback');
const labelContainer = document.getElementById('podium-labels');
const categorySelect = document.getElementById('category-selector');
const resetViewBtn = document.getElementById('btn-reset-view');
const shareBtn = document.getElementById('btn-share');
const errorEl = document.getElementById('podium-error');

renderNavbar(navContainer, 'podium');
renderFooter(footContainer);

const webglOk = isWebGLAvailable();
let sceneModule; // lazy-loaded

// ── State ─────────────────────────────────────────────────────────────────
let currentCategory = '5K', currentGender = 'M';

// ── Helpers ───────────────────────────────────────────────────────────────
function setLoading(on) {
  loadingEl.hidden = !on;
  stageEl.style.opacity = on ? '0.4' : '1';
}

function setError(msg) {
  errorEl.hidden = false;
  errorEl.querySelector('.alert__msg').textContent = msg;
}

// ── Main load ─────────────────────────────────────────────────────────────
async function loadPodium(category, gender) {
  currentCategory = category;
  currentGender = gender;
  errorEl.hidden = true;
  setLoading(true);

  try {
    const topFive = await fetchTopFive(category, gender);

    if (webglOk) {
      if (!sceneModule) {
        throw new Error('Scene module belum siap');
      }
      sceneModule.updatePodiumData(topFive, labelContainer);
      setLoading(false);
    } else {
      const label = `${category} ${formatGender(gender)}`;
      renderFallback2D(fallbackEl, topFive, label);
      setLoading(false);
    }
  } catch (err) {
    setLoading(false);
    setError(err.message);
  }
}

// ── Init ──────────────────────────────────────────────────────────────────
async function init() {
  if (webglOk) {
    // Lazy-load Three.js + scene only on this page
    sceneModule = await import('../three/scene.js');
    await sceneModule.initPodiumScene(stageEl);
    // Note: playEntrance() is NOT called here - let loadPodium handle the first display

    resetViewBtn.addEventListener('click', () => sceneModule.resetView());

    shareBtn.addEventListener('click', async () => {
      const { sharePodiumImage } = await import('../utils/share-image.js');
      const canvas = sceneModule.captureScreenshot();
      if (canvas) sharePodiumImage(canvas, labelContainer, '1:1');
    });
  } else {
    // No WebGL — show fallback immediately
    stageEl.hidden = true;
    fallbackEl.hidden = false;
    resetViewBtn.hidden = true;
  }

  // Category selector — fires initial selection → loadPodium
  await initCategorySelector(categorySelect, (cat, gen) => loadPodium(cat, gen));
}

init();
