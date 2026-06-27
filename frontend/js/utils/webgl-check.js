// js/utils/webgl-check.js
// AGENTS.md §6.9 — verbatim, as specified.

/** @returns {boolean} */
export function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch (_) {
    return false;
  }
}
