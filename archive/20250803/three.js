import * as THREE from 'three';
import { OrbitControls } from 'OrbitControls';

// === Setup ===
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202020);

const camera = new THREE.PerspectiveCamera(
  75, window.innerWidth / window.innerHeight, 0.1, 1000
);
camera.position.set(2, 2, 5);

// === Renderer ===
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// === Controls ===
const controls = new OrbitControls(camera, renderer.domElement);

// === Lighting ===
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.position.set(5, 10, 7);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
directionalLight.shadow.camera.near = 1;
directionalLight.shadow.camera.far = 20;
scene.add(directionalLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

// === Complex BufferGeometry (wave grid) ===
const segmentsX = 50;
const segmentsY = 50;
const size = 4;

const positions = [];
const indices = [];
const uvs = [];

for (let i = 0; i <= segmentsY; i++) {
  for (let j = 0; j <= segmentsX; j++) {
    const x = (j / segmentsX - 0.5) * size;
    const z = (i / segmentsY - 0.5) * size;
    const y = Math.sin(x * 5) * Math.cos(z * 5) * 0.3;  // height on Y

    positions.push(x, y, z);
    uvs.push(j / segmentsX, i / segmentsY);
  }
}

for (let i = 0; i < segmentsY; i++) {
  for (let j = 0; j < segmentsX; j++) {
    const a = i * (segmentsX + 1) + j;
    const b = a + segmentsX + 1;
    const c = a + 1;
    const d = b + 1;

    indices.push(a, b, c);
    indices.push(c, b, d);
  }
}

const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
geometry.setIndex(indices);
geometry.computeVertexNormals();

// === Procedural noise texture for normal map and color map ===
const noiseSize = 256;
const canvas = document.createElement('canvas');
canvas.width = noiseSize;
canvas.height = noiseSize;
const ctx = canvas.getContext('2d');

for (let i = 0; i < noiseSize; i++) {
  for (let j = 0; j < noiseSize; j++) {
    const shade = Math.floor(Math.random() * 255);
    ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
    ctx.fillRect(i, j, 1, 1);
  }
}

const normalTexture = new THREE.CanvasTexture(canvas);
normalTexture.wrapS = normalTexture.wrapT = THREE.RepeatWrapping;
normalTexture.repeat.set(10, 10);

const colorTexture = new THREE.CanvasTexture(canvas);
colorTexture.wrapS = colorTexture.wrapT = THREE.RepeatWrapping;
colorTexture.repeat.set(10, 10);

const material = new THREE.MeshStandardMaterial({
  color: 0x808080,
  roughness: 0.9,
  metalness: 0.1,
  normalMap: normalTexture,
  map: colorTexture,
  side: THREE.DoubleSide,
  normalScale: new THREE.Vector2(0.1, 0.1),
});

const mesh = new THREE.Mesh(geometry, material);
mesh.castShadow = true;
mesh.receiveShadow = true;
scene.add(mesh);

// === Handle Resize ===
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// === Animation Loop ===
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
