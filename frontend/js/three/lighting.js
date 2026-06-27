// js/three/lighting.js
// DESIGN.md §7.1 lighting setup.

/**
 * @param {import('three').Scene} scene
 * @returns {{ keyLight: import('three').DirectionalLight }}
 */
export function setupLighting(scene) {
  const THREE = window.__THREE__;

  // Ambient — dark maroon, keeps mood without going full black
  const ambient = new THREE.AmbientLight(0x3A0000, 0.5);
  scene.add(ambient);

  // Key light — warm white from front-top, targets podium center
  const keyLight = new THREE.DirectionalLight(0xFFF4E0, 2.2);
  keyLight.position.set(2, 6, 5);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.setScalar(1024);
  keyLight.shadow.camera.near = 0.5;
  keyLight.shadow.camera.far  = 30;
  keyLight.shadow.camera.left = keyLight.shadow.camera.bottom = -8;
  keyLight.shadow.camera.right = keyLight.shadow.camera.top  =  8;
  scene.add(keyLight);

  // Rim lights — gold from behind each podium block
  const rimPositions = [
    [-1.8, 3, -2],  // Juara 2 (left)
    [ 0,   4, -3],  // Juara 1 (center) — strongest
    [ 1.8, 3, -2],  // Juara 3 (right)
  ];
  const rimIntensities = [0.8, 1.4, 0.8];

  for (let i = 0; i < 3; i++) {
    const rim = new THREE.PointLight(0xFBF000, rimIntensities[i], 12);
    rim.position.set(...rimPositions[i]);
    scene.add(rim);
  }

  // Gold glow under juara-1 position
  const glow = new THREE.PointLight(0xFFE873, 0.9, 5);
  glow.position.set(0, 0, 0);
  scene.add(glow);

  return { keyLight };
}
