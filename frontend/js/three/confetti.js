// js/three/confetti.js
// 100 particles, gold+white, ~2s life, auto-disposed.
// AGENTS.md §6.7

/**
 * @param {typeof import('three')} THREE
 * @param {import('three').Scene} scene
 */
export function spawnConfetti(THREE, scene) {
  const COUNT   = 100;
  const LIFE    = 2.0; // seconds

  const positions = new Float32Array(COUNT * 3);
  const colors    = new Float32Array(COUNT * 3);
  const velocities = [];

  for (let i = 0; i < COUNT; i++) {
    const i3 = i * 3;
    positions[i3]     = (Math.random() - 0.5) * 4;
    positions[i3 + 1] = 3 + Math.random() * 2;
    positions[i3 + 2] = (Math.random() - 0.5) * 2;

    // Gold or white
    if (Math.random() > 0.4) {
      colors[i3] = 0.984; colors[i3+1] = 0.941; colors[i3+2] = 0; // gold #FBF000
    } else {
      colors[i3] = 1; colors[i3+1] = 1; colors[i3+2] = 1; // white
    }

    velocities.push({
      x: (Math.random() - 0.5) * 0.5,
      y: -(0.8 + Math.random() * 1.2),
      z: (Math.random() - 0.5) * 0.3,
    });
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(colors,    3));

  const mat = new THREE.PointsMaterial({
    size:          0.08,
    vertexColors:  true,
    transparent:   true,
    opacity:       1,
    depthWrite:    false,
    sizeAttenuation: true,
  });

  const points = new THREE.Points(geo, mat);
  scene.add(points);

  let elapsed = 0;
  let disposed = false;

  /** Call every frame with deltaTime. Returns true when done. */
  function tick(dt) {
    if (disposed) return true;
    elapsed += dt;
    const t = elapsed / LIFE;
    if (t >= 1) {
      scene.remove(points);
      geo.dispose();
      mat.dispose();
      disposed = true;
      return true;
    }

    mat.opacity = 1 - t;

    const pos = geo.attributes.position.array;
    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3;
      pos[i3]     += velocities[i].x * dt;
      pos[i3 + 1] += velocities[i].y * dt;
      pos[i3 + 2] += velocities[i].z * dt;
    }
    geo.attributes.position.needsUpdate = true;
    return false;
  }

  return { tick };
}
