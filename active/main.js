import * as THREE from 'three';
// import { OrbitControls } from 'OrbitControls';
import { FirstPersonControls } from './src/firstPersonControls.js';
import { LightsManager } from './src/lightsManager.js';
import { BackgroundGrid } from './src/backgroundGrid.js';
import { SceneObjectsManager } from './src/sceneObjectsManager.js';
import { InfoUI } from './src/infoUI.js';
import { addModuleControl } from './src/uiPanelBuilder.js';
import { wrapMeshesInGroups } from './src/sceneOrganizer.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202020);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  100000
);

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

// New: append UI bubbles inside #ui-panel-container for vertical stacking
const uiPanelContainer = document.getElementById('ui-panel-container');

const lightManager = new LightsManager(scene, uiPanelContainer);

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

addModuleControl('Objects', visibilityControls, sceneObjectsGroup, uiPanelContainer);

backgroundGrid.updateGrid();

if (loadedMeshes.length > 0) {
  controls.frameObject(loadedMeshes[0]);
}

const infoUI = new InfoUI('ui-root');

function hidePanel() {
  uiPanelContainer.parentElement.classList.add('hidden'); // hides #control-panel
}

function showPanel() {
  uiPanelContainer.parentElement.classList.remove('hidden');
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
