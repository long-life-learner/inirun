// js/three/podium-geometry.js
// Builds 5 podium blocks + floor for top-5 display.
// Layout (left→right): 4 | 2 | 1 | 3 | 5 — classic podium extended.
// Numbers drawn on CanvasTexture (lighter than TextGeometry for mobile).

/**
 * @param {typeof import('three')} THREE
 * @param {import('three').Scene} scene
 * @returns {{ blocks: import('three').Mesh[], floor: import('three').Mesh }}
 */
export function buildPodium(THREE, scene) {
  // Classic extended layout — center=1st, then outward by rank
  // Heights decrease from center outward
  const configs = [
    { rank: 4, x: -4.4, height: 1.3, color: 0x5E0103 },  // Juara 4 far-left
    { rank: 2, x: -2.2, height: 2.2, color: 0x7A0203 },  // Juara 2 left
    { rank: 1, x:  0,   height: 3.0, color: 0x9B0103 },  // Juara 1 center
    { rank: 3, x:  2.2, height: 1.7, color: 0x7A0203 },  // Juara 3 right
    { rank: 5, x:  4.4, height: 1.0, color: 0x5E0103 },  // Juara 5 far-right
  ];

  const blocks = [];
  const W = 1.6, D = 1.6;

  for (const cfg of configs) {
    // Main block
    const geo = new THREE.BoxGeometry(W, cfg.height, D);
    const mat = new THREE.MeshStandardMaterial({
      color:     cfg.color,
      roughness: 0.5,
      metalness: 0.12,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(cfg.x, cfg.height / 2, 0);
    mesh.castShadow    = true;
    mesh.receiveShadow = true;
    mesh.userData.rank       = cfg.rank;
    mesh.userData.baseHeight = cfg.height;
    scene.add(mesh);
    blocks.push(mesh);

    // Gold edge strip — thin box on front face (only for top 3)
    const edgeColor = cfg.rank <= 3 ? 0xFBF000 : 0xAA8800;
    const edgeMat = new THREE.MeshStandardMaterial({
      color:             edgeColor,
      emissive:          edgeColor,
      emissiveIntensity: cfg.rank <= 3 ? 0.25 : 0.08,
      roughness: 0.3,
      metalness: 0.8,
    });
    const edgeGeo  = new THREE.BoxGeometry(W + 0.02, 0.04, 0.04);
    const topEdge  = new THREE.Mesh(edgeGeo, edgeMat);
    topEdge.position.set(cfg.x, cfg.height, D / 2);
    scene.add(topEdge);

    // Number texture
    const numMesh = makeNumberPlane(THREE, cfg.rank, cfg.height);
    numMesh.position.set(cfg.x, cfg.height / 2, D / 2 + 0.01);
    scene.add(numMesh);
  }

  // Floor — spotlight glow
  const floorGeo = new THREE.PlaneGeometry(20, 12);
  const floorMat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      varying vec2 vUv;
      void main() {
        vec2 center = vUv - 0.5;
        float dist = length(center);
        float pulse = 0.9 + 0.1 * sin(uTime * 1.5);
        vec3 maroon = vec3(0.23, 0.01, 0.02);
        vec3 gold   = vec3(0.98, 0.94, 0.0);
        float ringIntensity = smoothstep(0.5, 0.15, dist) * pulse;
        vec3 glow = mix(maroon, gold * 0.3, ringIntensity);
        float alpha = smoothstep(0.5, 0.1, dist) * 0.6;
        gl_FragColor = vec4(glow, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0.001;
  scene.add(floor);

  const animateFloor = () => {
    floorMat.uniforms.uTime.value = performance.now() / 1000;
    requestAnimationFrame(animateFloor);
  };
  animateFloor();

  return { blocks, floor };
}

/**
 * Create a plane with a canvas-rendered number as texture.
 * @param {typeof import('three')} THREE
 * @param {1|2|3|4|5} rank
 * @param {number} blockHeight
 */
function makeNumberPlane(THREE, rank, blockHeight) {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, size, size);

  // Gold for 1-3, dimmer for 4-5
  const color = rank <= 3 ? '#FBF000' : 'rgba(255,230,100,0.5)';
  ctx.font = 'bold 180px Anton, Impact, sans-serif';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor  = rank <= 3 ? '#FBF000' : '#AA8800';
  ctx.shadowBlur   = rank <= 3 ? 24 : 8;
  ctx.fillStyle    = color;
  ctx.fillText(String(rank), size / 2, size / 2);

  const tex = new THREE.CanvasTexture(canvas);
  const planeH = Math.min(1.2, blockHeight * 0.4);
  const geo    = new THREE.PlaneGeometry(planeH, planeH);
  const mat    = new THREE.MeshStandardMaterial({
    map:              tex,
    transparent:      true,
    alphaTest:        0.05,
    emissive:         rank <= 3 ? 0xFBF000 : 0xAA8800,
    emissiveMap:      tex,
    emissiveIntensity: rank <= 3 ? 0.15 : 0.05,
  });
  return new THREE.Mesh(geo, mat);
}
