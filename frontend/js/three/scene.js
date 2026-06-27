// js/three/scene.js
// Main Three.js scene: setup, render loop, label sync, cleanup.
// THREE is loaded via importmap and stored on window.__THREE__ for sibling modules.

import { setupLighting } from './lighting.js';
import { buildPodium } from './podium-geometry.js';
import { configureControls } from './controls.js';
import { entranceAnimation, exitAnimation, idleOrbit, resetCameraAnimation } from './animations.js';
import { spawnConfetti } from './confetti.js';
import { setupBackgroundEffect } from './background-effect.js';
import { spawnCrowd } from './crowd.js';

// Loaded dynamically by podium-page.js — accessed via importmap
let THREE, OrbitControls;

// Scene state
let renderer, camera, scene, controls, clock;
let podiumBlocks = [];
let labelEls = [];   // array of {el, worldPos} for HTML overlay
let activeAnim = null; // current tick fn
let bgTick = null; // background effect tick fn
let crowdTick = null; // crowd idle bob tick fn
let confettiSys = null;
let userInteracting = false;
let idleTimer = null;

const DEFAULT_CAM_POS = { x: 0, y: 5.5, z: 13 };
const START_CAM_POS = { x: 0, y: 9, z: 22 };

/**
 * @param {HTMLElement} container
 */
export async function initPodiumScene(container) {
  // Dynamic import so Three.js only loads on podium page
  const mod = await import('three');
  const cmod = await import('three/addons/controls/OrbitControls.js');
  THREE = mod;
  OrbitControls = cmod.OrbitControls;
  window.__THREE__ = THREE; // share to sibling modules

  scene = new THREE.Scene();
  // No skybox texture - use animated background effect instead

  clock = new THREE.Clock();

  // Camera
  camera = new THREE.PerspectiveCamera(47, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(START_CAM_POS.x, START_CAM_POS.y, START_CAM_POS.z);
  camera.lookAt(0, 1.5, 0);

  // Renderer
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true, // needed for canvas export
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.domElement.className = 'podium-canvas';
  renderer.domElement.setAttribute('aria-label', 'Podium 3D interaktif INI RUN FEST 2026');
  container.prepend(renderer.domElement);

  // Lighting
  setupLighting(scene);

  // Animated background effect
  bgTick = setupBackgroundEffect(scene);

  // Podium geometry
  const { blocks } = buildPodium(THREE, scene);
  podiumBlocks = blocks;
  // Start hidden (scale-Y = 0.001 for entrance animation)
  for (const b of podiumBlocks) { b.scale.y = 0.001; b.position.y = 0; }

  // Crowd figures (added once, stay for life of scene)
  crowdTick = spawnCrowd(THREE, scene);

  // Controls
  const oc = new OrbitControls(camera, renderer.domElement);
  configureControls(oc, /Mobi|Android/i.test(navigator.userAgent));
  oc.target.set(0, 1.5, 0);
  oc.update();
  controls = oc;

  // Track user interaction for idle orbit pause
  oc.addEventListener('start', () => {
    userInteracting = true;
    clearTimeout(idleTimer);
  });
  oc.addEventListener('end', () => {
    idleTimer = setTimeout(() => { userInteracting = false; }, 3000);
  });

  // Responsive resize
  const ro = new ResizeObserver(() => {
    const w = container.clientWidth, h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
  ro.observe(container);

  // Render loop
  renderer.setAnimationLoop(() => {
    const dt = clock.getDelta();
    if (activeAnim) {
      const done = activeAnim(dt, camera);
      if (done) activeAnim = null;
    }
    if (confettiSys) {
      if (confettiSys.tick(dt)) confettiSys = null;
    }
    if (bgTick) bgTick(dt);
    if (crowdTick) crowdTick(dt);
    if (!userInteracting && !activeAnim) {
      idleOrbit(controls, dt, userInteracting);
    }
    controls.update();
    syncLabels();
    renderer.render(scene, camera);
  });

  // Store ro reference for cleanup
  renderer._ro = ro;
}

/**
 * Update podium with new top-5 data.
 * @param {Array} topFive — array of up to 5 entries (index 0 = rank 1)
 * @param {HTMLElement} labelContainer — .podium-labels div
 */
export function updatePodiumData(topFive, labelContainer) {
  // Check if this is the first load (blocks are still hidden)
  const isFirstLoad = podiumBlocks.length > 0 && podiumBlocks[0].scale.y < 0.01;

  if (isFirstLoad) {
    renderLabels(topFive, labelContainer);
    const defPos = new THREE.Vector3(DEFAULT_CAM_POS.x, DEFAULT_CAM_POS.y, DEFAULT_CAM_POS.z);
    const startPos = new THREE.Vector3(START_CAM_POS.x, START_CAM_POS.y, START_CAM_POS.z);
    activeAnim = entranceAnimation({
      blocks: podiumBlocks,
      camera,
      clock,
      defaultCameraPos: defPos,
      startCameraPos: startPos,
      onDone: () => { confettiSys = spawnConfetti(THREE, scene); },
    });
  } else {
    const exitFn = exitAnimation(podiumBlocks, 0.3);
    let exitDone = false;
    let labelsRendered = false;

    activeAnim = (dt, cam) => {
      if (!exitDone) {
        exitDone = exitFn(dt);
        return false;
      }
      if (!labelsRendered) {
        labelsRendered = true;
        renderLabels(topFive, labelContainer);
        const defPos = new THREE.Vector3(DEFAULT_CAM_POS.x, DEFAULT_CAM_POS.y, DEFAULT_CAM_POS.z);
        const startPos = new THREE.Vector3().copy(cam.position);
        const entrFn = entranceAnimation({
          blocks: podiumBlocks,
          camera: cam,
          clock,
          defaultCameraPos: defPos,
          startCameraPos: startPos,
          onDone: () => { confettiSys = spawnConfetti(THREE, scene); },
        });
        activeAnim = (dt2) => entrFn(dt2);
      }
      return false;
    };
  }
}

/**
 * First entrance (no data yet — no labels).
 */
export function playEntrance() {
  const defPos = new THREE.Vector3(DEFAULT_CAM_POS.x, DEFAULT_CAM_POS.y, DEFAULT_CAM_POS.z);
  const startPos = new THREE.Vector3(START_CAM_POS.x, START_CAM_POS.y, START_CAM_POS.z);
  activeAnim = entranceAnimation({
    blocks: podiumBlocks,
    camera, clock,
    defaultCameraPos: defPos,
    startCameraPos: startPos,
  });
}

/**
 * Tween camera back to default. Called by Reset View button.
 */
export function resetView() {
  const from = camera.position.clone();
  const to = new THREE.Vector3(DEFAULT_CAM_POS.x, DEFAULT_CAM_POS.y, DEFAULT_CAM_POS.z);
  activeAnim = resetCameraAnimation(from, to, 0.8);
}

/** Returns the WebGL canvas (for share-image.js). */
export function getCanvas() { return renderer?.domElement; }

/**
 * Render a frame to ensure the canvas is populated, then return it.
 */
export function captureScreenshot() {
  if (!renderer) return null;
  renderer.render(scene, camera);
  return renderer.domElement;
}

/** Dispose renderer + observer cleanly. */
export function disposePodiumScene() {
  renderer?.setAnimationLoop(null);
  renderer?._ro?.disconnect();
  renderer?.dispose();
  renderer = null;
}

// ── HTML Label overlay sync ─────────────────────────────────────────────────
function syncLabels() {
  if (!labelEls.length) return;
  for (const { el, worldPos } of labelEls) {
    const v = worldPos.clone().project(camera);
    const x = (v.x * 0.5 + 0.5) * renderer.domElement.clientWidth;
    const y = (-v.y * 0.5 + 0.5) * renderer.domElement.clientHeight;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
  }
}

// External callback for label click
let onLabelClick = null;
export function setLabelClickHandler(fn) {
  onLabelClick = fn;
}

/**
 * Render HTML label overlays for top-5 data.
 * @param {Array} topFive — array of up to 5 entries (index 0 = rank 1)
 * @param {HTMLElement} container
 */
function renderLabels(topFive, container) {
  container.innerHTML = '';
  labelEls = [];

  // Must match podium-geometry.js layout: 4 | 2 | 1 | 3 | 5
  const blockMap = [
    { rank: 1, x:  0,    height: 3.0 },
    { rank: 2, x: -2.2,  height: 2.2 },
    { rank: 3, x:  2.2,  height: 1.7 },
    { rank: 4, x: -4.4,  height: 1.3 },
    { rank: 5, x:  4.4,  height: 1.0 },
  ];

  for (const { rank, x, height } of blockMap) {
    const data = topFive[rank - 1] ?? null;
    if (!data) continue;

    const el = document.createElement('div');
    el.className = 'podium-label';
    el.dataset.rank = String(rank);
    el.style.pointerEvents = 'all';
    el.style.cursor = 'pointer';
    el.addEventListener('click', () => {
      if (onLabelClick) onLabelClick({ ...data, _computedRank: rank, rankCategoryGender: rank });
    });

    const card = document.createElement('div');
    card.className = 'podium-label__card';

    const rankEl = document.createElement('div');
    rankEl.className = `podium-label__rank podium-label__rank--${rank}`;
    rankEl.textContent = `#${rank}`;

    const nameEl = document.createElement('div');
    nameEl.className = 'podium-label__name';
    nameEl.textContent = data.name;

    const timeEl = document.createElement('div');
    timeEl.className = 'podium-label__time';
    timeEl.textContent = (data.gunTime || data.netTime || '').replace(/^00:/, '');

    const bibEl = document.createElement('div');
    bibEl.className = 'podium-label__bib';
    bibEl.textContent = `BIB ${data.bib}`;

    card.append(rankEl, nameEl, timeEl, bibEl);
    el.appendChild(card);
    container.appendChild(el);

    const worldPos = new THREE.Vector3(x, height + 0.5, 0);
    labelEls.push({ el, worldPos });
  }
}
