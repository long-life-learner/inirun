// js/three/crowd.js
// Stylized low-poly human crowd figures around the 5-block podium.
// Pure Three.js primitives — no external assets needed.
// Figures: 5 winners on blocks + audience on left/right/background.

// ── Palette ─────────────────────────────────────────────────────────────────
const SKIN   = 0xC68642;
const SHOE   = 0x111122;

// Jersey / pants colours — event themed (maroon, white, gold, dark-red)
const JERSEYS = [0x9B0103, 0x7A0203, 0xF8F8F8, 0xFBF000, 0x5E0103, 0xCC3333];
const PANTS   = [0x1A0000, 0x0D0000, 0x2A0800];

// ── Figure builder ───────────────────────────────────────────────────────────

/**
 * Build one stylized figure Group.
 * Feet sit at y = 0 of the group's local space.
 *
 * @param {typeof import('three')} THREE
 * @param {{
 *   jerseyIdx?: number,
 *   armsUp?: boolean,
 *   opacity?: number,
 * }} opts
 */
function buildFigure(THREE, { jerseyIdx = 0, armsUp = false, opacity = 1 } = {}) {
  const group = new THREE.Group();

  const mkMat = (color) => new THREE.MeshStandardMaterial({
    color,
    roughness: 0.82,
    metalness: 0,
    ...(opacity < 1 ? { transparent: true, opacity } : {}),
  });

  const skin  = mkMat(SKIN);
  const shirt = mkMat(JERSEYS[jerseyIdx % JERSEYS.length]);
  const pant  = mkMat(PANTS[jerseyIdx % PANTS.length]);
  const shoe  = mkMat(SHOE);

  /** Add a mesh to the group */
  const add = (geo, mat, x, y, z, rx = 0, rz = 0) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    if (rx !== 0) m.rotation.x = rx;
    if (rz !== 0) m.rotation.z = rz;
    m.castShadow = true;
    group.add(m);
  };

  // ── Anatomy (bottom to top, feet at y=0) ──────────────────────────────────

  // Shoes (y ≈ 0.035)
  add(new THREE.BoxGeometry(0.14, 0.07, 0.22), shoe, -0.09, 0.035,  0.02);
  add(new THREE.BoxGeometry(0.14, 0.07, 0.22), shoe,  0.09, 0.035,  0.02);

  // Legs (centre ≈ y 0.35, top ≈ 0.63)
  add(new THREE.CylinderGeometry(0.065, 0.055, 0.56, 6), pant, -0.09, 0.35, 0);
  add(new THREE.CylinderGeometry(0.065, 0.055, 0.56, 6), pant,  0.09, 0.35, 0);

  // Torso (centre ≈ y 0.90, top ≈ 1.16)
  add(new THREE.CylinderGeometry(0.115, 0.145, 0.52, 7), shirt, 0, 0.895, 0);

  // Neck (centre ≈ y 1.22)
  add(new THREE.CylinderGeometry(0.053, 0.063, 0.11, 6), skin, 0, 1.215, 0);

  // Head (centre ≈ y 1.43)
  add(new THREE.SphereGeometry(0.165, 9, 7), skin, 0, 1.43, 0);

  // Arms — pivot around shoulder joint (top of torso ≈ y 1.16)
  if (armsUp) {
    // Victory pose — arms raised ~45 ° from vertical, spread outward
    add(new THREE.CylinderGeometry(0.05, 0.04, 0.44, 6), shirt, -0.20, 1.28, 0, 0,  0.52);
    add(new THREE.CylinderGeometry(0.05, 0.04, 0.44, 6), shirt,  0.20, 1.28, 0, 0, -0.52);
    // Forearms/fists slightly higher — give illusion of bent-elbow cheer
    add(new THREE.SphereGeometry(0.06, 6, 5), skin, -0.36, 1.50, 0);
    add(new THREE.SphereGeometry(0.06, 6, 5), skin,  0.36, 1.50, 0);
  } else {
    // Relaxed — arms hang at sides with slight outward angle
    add(new THREE.CylinderGeometry(0.05, 0.04, 0.44, 6), shirt, -0.25, 0.875, 0, 0,  0.18);
    add(new THREE.CylinderGeometry(0.05, 0.04, 0.44, 6), shirt,  0.25, 0.875, 0, 0, -0.18);
  }

  return group;
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Spawn crowd around the podium and return a tick fn for idle animation.
 *
 * @param {typeof import('three')} THREE
 * @param {import('three').Scene} scene
 * @returns {(dt: number) => void}
 */
export function spawnCrowd(THREE, scene) {
  const figures = [];
  const baseYs  = [];
  const isMobile = window.innerWidth < 768;

  /**
   * @param {object} opts - figure options
   * @param {number} x
   * @param {number} y - base y (feet)
   * @param {number} z
   * @param {number} [ry] - rotation around Y axis
   */
  const place = (opts, x, y, z, ry = 0) => {
    const fig = buildFigure(THREE, opts);
    fig.position.set(x, y, z);
    fig.rotation.y = ry;
    scene.add(fig);
    figures.push(fig);
    baseYs.push(y);
  };

  // ── Winners on podium blocks ───────────────────────────────────────────────
  // Layout matches podium-geometry.js: 4 | 2 | 1 | 3 | 5  (x = -4.4,-2.2,0,2.2,4.4)
  // Heights:  1→3.0,  2→2.2,  3→1.7,  4→1.3,  5→1.0

  // Juara 1 — white jersey, arms fully raised
  place({ jerseyIdx: 2, armsUp: true },   0,    3.0, 0.35);
  // Juara 2 — maroon jersey, arms raised, facing slightly inward
  place({ jerseyIdx: 0, armsUp: true },  -2.2,  2.2, 0.35, -0.15);
  // Juara 3 — dark-red jersey, arms raised, facing slightly inward
  place({ jerseyIdx: 1, armsUp: true },   2.2,  1.7, 0.35,  0.15);
  // Juara 4 & 5 — relaxed pose (not top-3)
  place({ jerseyIdx: 0, armsUp: false }, -4.4,  1.3, 0.35, -0.25);
  place({ jerseyIdx: 0, armsUp: false },  4.4,  1.0, 0.35,  0.25);

  if (!isMobile) {
    // ── Left-side audience (cheering) ──────────────────────────────────────
    const leftAudience = [
      { x: -7.2, z: -1.2, ry:  0.55, ji: 1, au: true,  op: 0.92 },
      { x: -8.8, z: -2.2, ry:  0.40, ji: 3, au: false, op: 0.88 },
      { x: -7.8, z: -3.5, ry:  0.65, ji: 0, au: true,  op: 0.84 },
      { x: -9.5, z: -0.8, ry:  0.30, ji: 2, au: false, op: 0.82 },
      { x: -6.5, z: -4.5, ry:  0.50, ji: 5, au: true,  op: 0.78 },
    ];
    for (const { x, z, ry, ji, au, op } of leftAudience) {
      place({ jerseyIdx: ji, armsUp: au, opacity: op }, x, 0, z, ry);
    }

    // ── Right-side audience (cheering) ─────────────────────────────────────
    const rightAudience = [
      { x:  7.2, z: -1.2, ry: -0.55, ji: 4, au: true,  op: 0.92 },
      { x:  8.8, z: -2.2, ry: -0.40, ji: 0, au: false, op: 0.88 },
      { x:  7.8, z: -3.5, ry: -0.65, ji: 2, au: true,  op: 0.84 },
      { x:  9.5, z: -0.8, ry: -0.30, ji: 1, au: false, op: 0.82 },
      { x:  6.5, z: -4.5, ry: -0.50, ji: 3, au: true,  op: 0.78 },
    ];
    for (const { x, z, ry, ji, au, op } of rightAudience) {
      place({ jerseyIdx: ji, armsUp: au, opacity: op }, x, 0, z, ry);
    }

    // ── Background / mid crowd (faded depth) ──────────────────────────────
    const bgCrowd = [
      { x: -3.5, z: -5.5, ry:  0.10, ji: 0, au: true,  op: 0.65 },
      { x:  3.5, z: -5.5, ry: -0.10, ji: 2, au: true,  op: 0.65 },
      { x:  0.0, z: -6.2, ry:  0.00, ji: 1, au: false, op: 0.60 },
      { x: -5.8, z: -5.0, ry:  0.30, ji: 3, au: true,  op: 0.60 },
      { x:  5.8, z: -5.0, ry: -0.30, ji: 5, au: false, op: 0.58 },
      { x: -2.0, z: -6.8, ry:  0.05, ji: 4, au: true,  op: 0.52 },
      { x:  2.0, z: -6.8, ry: -0.05, ji: 0, au: true,  op: 0.52 },
    ];
    for (const { x, z, ry, ji, au, op } of bgCrowd) {
      place({ jerseyIdx: ji, armsUp: au, opacity: op }, x, 0, z, ry);
    }
  }

  // ── Idle bob animation ─────────────────────────────────────────────────────
  // Winners (index 0-4) don't bob — they stand proud.
  // Audience figures get a gentle sinusoidal bob at different phases.
  const audienceStart = 5;

  return (_dt) => {
    const t = performance.now() * 0.001;
    for (let i = audienceStart; i < figures.length; i++) {
      const phase = i * 0.91; // unique phase per figure
      figures[i].position.y = baseYs[i] + Math.sin(t * 1.7 + phase) * 0.028;
    }
  };
}
