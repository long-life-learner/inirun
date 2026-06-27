// js/three/animations.js
// Manual lerp animations using THREE.Clock. No GSAP — THREE.Clock + lerp covers this.
// ponytail: removed GSAP dependency; easing fns are 3 lines each.

/** Quadratic ease-out */
const easeOut = t => 1 - (1 - t) * (1 - t);
/** Back ease-out (slight overshoot) */
const easeOutBack = t => {
  const c = 1.70158;
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
};

/**
 * Animate podium entrance: camera dolly + blocks scale-Y stagger.
 * Call once after scene/data is ready.
 *
 * @param {{
 *   blocks: import('three').Mesh[],
 *   camera: import('three').PerspectiveCamera,
 *   clock: import('three').Clock,
 *   defaultCameraPos: import('three').Vector3,
 *   startCameraPos: import('three').Vector3,
 *   onDone?: () => void
 * }} opts
 * @returns {(dt: number) => boolean} tick fn — returns true when animation is done
 */
export function entranceAnimation({ blocks, camera, clock, defaultCameraPos, startCameraPos, onDone }) {
  let elapsed = 0;
  const DOLLY_DUR   = 1.6;   // seconds
  const BLOCK_DUR   = 0.5;
  const BLOCK_DELAY = 0.3;   // stagger between blocks
  // Sort blocks by rank for stagger: 3→2→1
  const ordered = [...blocks].sort((a, b) => b.userData.rank - a.userData.rank);
  let doneFired  = false;

  return (dt) => {
    elapsed += dt;

    // Camera dolly-in
    const tp = Math.min(elapsed / DOLLY_DUR, 1);
    camera.position.lerpVectors(startCameraPos, defaultCameraPos, easeOut(tp));
    camera.lookAt(0, 1.5, 0);

    // Block scale-Y stagger
    let allDone = true;
    ordered.forEach((block, i) => {
      const delay    = i * BLOCK_DELAY;
      const blockT   = Math.min(Math.max((elapsed - delay) / BLOCK_DUR, 0), 1);
      const scaleY   = easeOutBack(blockT);
      const baseH    = block.userData.baseHeight;
      block.scale.y  = scaleY;
      // Keep base at floor (pivot is center, so shift up by (scaleY-1)/2 * baseH)
      block.position.y = (baseH / 2) * scaleY;
      if (blockT < 1) allDone = false;
    });

    const done = allDone && tp >= 1;
    if (done && !doneFired) { doneFired = true; onDone?.(); }
    return done;
  };
}

/**
 * Animate scale-Y to 0 for category transition exit.
 * @param {import('three').Mesh[]} blocks
 * @param {number} duration seconds
 * @returns {(dt: number) => boolean}
 */
export function exitAnimation(blocks, duration = 0.3) {
  let elapsed = 0;
  return (dt) => {
    elapsed += dt;
    const t = Math.min(elapsed / duration, 1);
    const scale = 1 - easeOut(t);
    for (const b of blocks) {
      b.scale.y    = Math.max(scale, 0.001);
      b.position.y = (b.userData.baseHeight / 2) * b.scale.y;
    }
    return t >= 1;
  };
}

/**
 * Idle auto-orbit: slowly rotate camera around target.
 * @param {import('three/examples/jsm/controls/OrbitControls').OrbitControls} controls
 * @param {number} dt
 * @param {boolean} userInteracting
 */
export function idleOrbit(controls, dt, userInteracting) {
  if (userInteracting) return;
  controls.azimuthAngle += 0.04 * dt; // ~2.3°/s
  controls.update();
}

/**
 * Tween camera back to default position (Reset View).
 * @returns {(dt: number, camera: import('three').PerspectiveCamera) => boolean}
 */
export function resetCameraAnimation(from, to, duration = 0.8) {
  let elapsed = 0;
  return (dt, camera) => {
    elapsed += dt;
    const t = Math.min(elapsed / duration, 1);
    camera.position.lerpVectors(from, to, easeOut(t));
    camera.lookAt(0, 1.5, 0);
    return t >= 1;
  };
}
