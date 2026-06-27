// js/three/controls.js
// OrbitControls config per AGENTS.md §6.8

/**
 * @param {import('three/examples/jsm/controls/OrbitControls').OrbitControls} controls
 * @param {boolean} isMobile
 */
export function configureControls(controls, isMobile) {
  // Polar angle: prevent looking from below or directly above
  controls.minPolarAngle = Math.PI * (50 / 180);  // 50°
  controls.maxPolarAngle = Math.PI * (85 / 180);  // 85°

  // Zoom limits
  controls.minDistance = 5;
  controls.maxDistance = 18;

  // Damping feels more premium
  controls.enableDamping  = true;
  controls.dampingFactor  = 0.07;

  if (isMobile) {
    controls.enablePan  = false;
    controls.enableZoom = true;
    // Restrict vertical drag on mobile (only horizontal rotate)
    // ponytail: simplest lock is just reducing maxPolarAngle closer to mid
    controls.minPolarAngle = Math.PI * (65 / 180);
    controls.maxPolarAngle = Math.PI * (80 / 180);
  } else {
    controls.enablePan = false;  // pan disabled always to prevent "losing" the scene
  }

  return controls;
}
