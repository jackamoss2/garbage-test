import * as THREE from 'three';
import { OrbitControls } from 'OrbitControls';
import { buildMeshFromLandXML } from './landxmlMeshBuilder.js';
import { readLocalFile } from './readLocalFile.js';
import { setupLights } from './setupLights.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202020);

const camera = new THREE.PerspectiveCamera(
  75,                              // fov: 75 degrees
  window.innerWidth / window.innerHeight,  // aspect ratio matches browser window
  0.1,                             // near clipping plane at 0.1 units
  100000                             // far clipping plane at 1000 units
);

// Position the camera in 3D space (x, y, z)
// This places the camera 2 units right, 2 units up, and 5 units forward from the origin
camera.position.set(2, 2, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

setupLights(scene);

// const geometry = createLandXMLGeometry();
// const material = createWireFrameMaterial();
// const mesh = new THREE.Mesh(geometry, material);
// mesh.castShadow = true;
// mesh.receiveShadow = true;
// scene.add(mesh);

// const dataSource = "Wilsonville_Ramp.xml";
// const dataSource = "EG_Harvey.xml";
const dataSource = "FG_Harvey.xml";
const landXMLString = readLocalFile("../geometry/" + dataSource);
const concreteMesh = buildMeshFromLandXML(landXMLString);
scene.add(concreteMesh);

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