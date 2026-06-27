// js/three/background-effect.js
// Full-bleed background image using plane for promotional poster backdrop.

/**
 * Setup immersive background with promotional poster image.
 * @param {import('three').Scene} scene
 * @returns {() => void} cleanup tick function (no-op)
 */
export function setupBackgroundEffect(scene) {
  const THREE = window.__THREE__;

  // Load backdrop image
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load('/assets/backdrop.jpg');
  texture.colorSpace = THREE.SRGBColorSpace;

  // Create large plane with backdrop texture - cover entire view
  const planeGeo = new THREE.PlaneGeometry(40, 28);
  const planeMat = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.FrontSide,
  });

  const plane = new THREE.Mesh(planeGeo, planeMat);

  // Position behind podium area - larger to fill more space
  plane.position.set(0, 8, -15);
  scene.add(plane);

  // Subtle dark vignette overlay for depth
  const vignetteGeo = new THREE.PlaneGeometry(45, 32);
  const vignetteMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.35,
  });
  const vignette = new THREE.Mesh(vignetteGeo, vignetteMat);
  vignette.position.set(0, 8, -14.9);
  scene.add(vignette);

  return function tick() { };
}
