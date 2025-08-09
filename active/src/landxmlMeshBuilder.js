import * as THREE from 'three';

export function parseCoords(text) {
  const parts = text.trim().split(/\s+/).map(parseFloat);
  if (parts.length === 2) parts.push(0);
  return parts;
}

// Remove centerGeometry call from here

export function buildMeshFromLandXML(xmlString) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "application/xml");
  const nsResolver = prefix =>
    prefix === 'l' ? 'http://www.landxml.org/schema/LandXML-1.2' : null;

  // Map point IDs to coordinates
  const pointsMap = new Map();
  const pointNodes = xmlDoc.evaluate(
    '//l:P',
    xmlDoc,
    nsResolver,
    XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
    null
  );
  for (let i = 0; i < pointNodes.snapshotLength; i++) {
    const node = pointNodes.snapshotItem(i);
    pointsMap.set(node.getAttribute('id'), parseCoords(node.textContent));
  }

  // Collect faces
  const faceNodes = xmlDoc.evaluate(
    '//l:F',
    xmlDoc,
    nsResolver,
    XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
    null
  );

  const vertexArray = [];

  for (let i = 0; i < faceNodes.snapshotLength; i++) {
    const node = faceNodes.snapshotItem(i);

    // Skip faces marked as invisible (i="1") 
    if (node.getAttribute('i') === "1") continue;

    const pointIDs = node.textContent.trim().split(/\s+/);
    const faceCoords = [];

    for (const id of pointIDs) {
      const coord = pointsMap.get(id);
      if (!coord) {
        console.warn(`Missing point ID: ${id}, skipping face`);
        faceCoords.length = 0;
        break;
      }
      faceCoords.push(coord);
    }

    if (faceCoords.length !== 3) continue;

    faceCoords.forEach(([x, y, z]) => {
      vertexArray.push(x, y, z);
    });
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    'position',
    new THREE.BufferAttribute(new Float32Array(vertexArray), 3)
  );

  // Rotate and flip to align with Three.js coordinates
  geometry.rotateX(-Math.PI / 2);
  geometry.scale(1, 1, -1);

  // UV mapping for texture coordinates
  geometry.computeBoundingBox();
  const bounds = geometry.boundingBox;
  const sizeX = bounds.max.x - bounds.min.x || 1;
  const sizeZ = bounds.max.z - bounds.min.z || 1;

  const positions = geometry.attributes.position;
  const uvs = [];
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const z = positions.getZ(i);
    const u = (x - bounds.min.x) / sizeX;
    const v = (z - bounds.min.z) / sizeZ;
    uvs.push(u * 4, v * 4);
  }
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));

  const material = new THREE.MeshStandardMaterial({
    color: 0x808080,
    roughness: 1.0,
    metalness: 0.0,
    side: THREE.DoubleSide,
    flatShading: true,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = 'LandXML_Surface';

  return mesh;
}
