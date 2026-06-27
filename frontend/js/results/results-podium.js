// js/results/results-podium.js
// Podium controller embedded on results.html.
// Uses Three.js 3D scene (scene.js) with top-5 support.
// Driven by results-page.js filter state.

import { fetchResults } from '../api/client.js';
import { isWebGLAvailable } from '../utils/webgl-check.js';
import { renderFallback2D } from '../podium/fallback-2d.js';
import { formatGender } from '../utils/format.js';

// DOM refs (inside #results-podium)
const stageEl    = document.getElementById('podium-stage');
const loadingEl  = document.getElementById('podium-loading');
const fallbackEl = document.getElementById('podium-fallback');
const labelCont  = document.getElementById('podium-labels');
const resetBtn   = document.getElementById('btn-reset-view');
const catLabel   = document.getElementById('podium-category-label');

let sceneModule;   // lazy-loaded three scene
let webglOk = false;
let bibCardOpener = null;

/**
 * Init podium scene once at page load.
 * @param {Function} openBibCardFn
 */
export async function initResultsPodium(openBibCardFn) {
  webglOk = isWebGLAvailable();
  bibCardOpener = openBibCardFn;

  if (webglOk) {
    sceneModule = await import('../three/scene.js');
    await sceneModule.initPodiumScene(stageEl);

    sceneModule.setLabelClickHandler((entry) => {
      if (bibCardOpener) bibCardOpener(entry);
    });

    resetBtn.addEventListener('click', () => sceneModule.resetView());
  } else {
    stageEl.hidden = true;
    fallbackEl.hidden = false;
    resetBtn.hidden = true;
  }
}

/**
 * Convert time string to seconds for sorting.
 */
function parseTimeToSeconds(timeStr) {
  if (!timeStr) return Infinity;
  const parts = timeStr.split(':').map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return Infinity;
}

/**
 * Sort entries by gun time and return top 5 as an array [rank1, rank2, ..., rank5].
 */
function getTopFive(rows) {
  return [...rows]
    .sort((a, b) => parseTimeToSeconds(a.gunTime) - parseTimeToSeconds(b.gunTime))
    .slice(0, 5);
}

/**
 * Update podium with data for the selected category+gender.
 */
export async function loadPodium(category, gender) {
  // Update label
  if (catLabel) {
    catLabel.textContent = category && gender
      ? `${category} · ${formatGender(gender)}`
      : 'Semua Kategori';
  }

  if (!category || !gender) {
    const podiumSec = document.getElementById('results-podium');
    if (podiumSec) podiumSec.hidden = true;
    return;
  }

  setLoading(true);

  try {
    const data = await fetchResults({ category, gender, page: 1, limit: 1000 });
    const topFive = getTopFive(data.results);

    if (webglOk && sceneModule) {
      sceneModule.updatePodiumData(topFive, labelCont);
      setLoading(false);
    } else {
      const label = `${category} ${formatGender(gender)}`;
      renderFallback2D(fallbackEl, topFive, label);
      setLoading(false);
    }
  } catch (err) {
    setLoading(false);
    let errEl = document.getElementById('podium-error');
    if (!errEl) {
      errEl = document.createElement('div');
      errEl.id = 'podium-error';
      errEl.className = 'container';
      errEl.style.cssText = 'padding:0 20px 16px;max-width:600px;margin:0 auto';
      stageEl.parentElement.insertBefore(errEl, stageEl.nextSibling);
    }
    errEl.hidden = false;
    errEl.innerHTML = `<div class="alert alert--error"><span>⚠️</span><div><strong>Gagal memuat podium.</strong> <span class="alert__msg">${err.message}</span></div></div>`;
  }
}

function setLoading(on) {
  loadingEl.hidden = !on;
  stageEl.style.opacity = on ? '0.4' : '1';
}
