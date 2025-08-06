import * as THREE from 'three';
import { OrbitControls } from 'OrbitControls';
import { FirstPersonControls } from './firstPersonControls.js';
import { setupLights } from './setupLights.js';
import { BackgroundGrid } from './backgroundGrid.js';
import { SceneObjectsManager } from './sceneObjectsManager.js';
import { InfoUI } from './infoUI.js';
import { addModuleControl } from './uiPanelBuilder.js';
import { wrapMeshesInGroups } from './sceneOrganizer.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202020);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  100000
);

// Position the camera near the origin, looking at (0,0,0)
camera.position.set(0, 50, 100);
camera.lookAt(new THREE.Vector3(0, 0, 0));

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas: document.getElementById('bg')
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const controls = new FirstPersonControls(camera, renderer.domElement, scene, {
  speed: 4
});

setupLights(scene);

const backgroundGrid = new BackgroundGrid(scene, {
  divisions: 100,
  opacity: 0.2,
});

const sceneObjectsGroup = new THREE.Group();
scene.add(sceneObjectsGroup);

const sceneObjectsManager = new SceneObjectsManager('../geometry/', [
  'EG_Harvey.xml',
  'FG_Harvey.xml'
]);

sceneObjectsManager.loadAll();
const loadedMeshes = sceneObjectsManager.getObjects();

const visibilityControls = wrapMeshesInGroups(loadedMeshes, sceneObjectsGroup);

addModuleControl('Objects', visibilityControls, sceneObjectsGroup);

backgroundGrid.updateGrid();

if (loadedMeshes.length > 0) {
  controls.frameObject(loadedMeshes[0]);
}

const infoUI = new InfoUI('ui-root');

const controlPanel = document.getElementById('control-panel');

function hidePanel() {
  controlPanel.classList.add('hidden');
}

function showPanel() {
  controlPanel.classList.remove('hidden');
}

function onEnterControls() {
  infoUI.hide();
  if (!infoUI.isPinned()) {
    hidePanel();
  }
}

function onExitControls() {
  infoUI.show();
  showPanel();
}

window.addEventListener('pointerlockchange', () => {
  if (document.pointerLockElement) {
    onEnterControls();
  } else {
    onExitControls();
  }
});

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
