import * as THREE from 'three';

export function createWaveGeometry(size = 4, segmentsX = 50, segmentsY = 50) {
  const positions = [];
  const indices = [];
  const uvs = [];

  for (let i = 0; i <= segmentsY; i++) {
    for (let j = 0; j <= segmentsX; j++) {
      const x = (j / segmentsX - 0.5) * size;
      const z = (i / segmentsY - 0.5) * size;
      const y = Math.sin(x * 5) * Math.cos(z * 5) * 0.3;

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

  return geometry;
}
