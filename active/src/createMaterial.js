import * as THREE from 'three';

function generateNoiseCanvas(size = 256) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const shade = Math.floor(Math.random() * 255);
      ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
      ctx.fillRect(i, j, 1, 1);
    }
  }
  return canvas;
}

export function createConcreteMaterial() {
  const noiseCanvas = generateNoiseCanvas();

  const normalTexture = new THREE.CanvasTexture(noiseCanvas);
  normalTexture.wrapS = normalTexture.wrapT = THREE.RepeatWrapping;
  normalTexture.repeat.set(10, 10);

  const colorTexture = new THREE.CanvasTexture(noiseCanvas);
  colorTexture.wrapS = colorTexture.wrapT = THREE.RepeatWrapping;
  colorTexture.repeat.set(10, 10);

  return new THREE.MeshStandardMaterial({
    color: 0x808080,
    roughness: 0.9,
    metalness: 0.1,
    normalMap: normalTexture,
    map: colorTexture,
    side: THREE.DoubleSide,
    normalScale: new THREE.Vector2(0.1, 0.1),
  });
}