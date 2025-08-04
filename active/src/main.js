import * as THREE from 'three';
import { OrbitControls } from 'OrbitControls';
import { buildMeshFromLandXML } from './landxmlMeshBuilder.js';
import { FirstPersonControls } from './firstPersonControls.js';
import { readLocalFile } from './readLocalFile.js';
import { setupLights } from './setupLights.js';
import { BackgroundGrid } from './backgroundGrid.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202020);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  100000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

camera.position.set(2, 2, 5);

// const controls = new OrbitControls(camera, renderer.domElement);
const controls = new FirstPersonControls(camera, renderer.domElement, scene, { speed: 4 });

setupLights(scene);

// === INIT BACKGROUND GRID ===
const backgroundGrid = new BackgroundGrid(scene, {
  divisions: 100,
  opacity: 0.2,
});

// === LOAD SURFACE ===
const dataSource = "EG_Harvey.xml";
const landXMLString = readLocalFile("../geometry/" + dataSource);
const concreteMesh = buildMeshFromLandXML(landXMLString);
scene.add(concreteMesh);

// === UPDATE GRID AFTER OBJECTS ARE LOADED ===
backgroundGrid.updateGrid();

// === FRAME THE OBJECT ===
controls.frameObject(concreteMesh);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
