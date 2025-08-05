import * as THREE from 'three';

export function parseCoords(text) {
  const parts = text.trim().split(/\s+/).map(parseFloat);
  if (parts.length === 2) parts.push(0);
  return parts;
}

function centerGeometry(geometry) {
  geometry.computeBoundingBox();
  const bbox = geometry.boundingBox;

  const offsetX = (bbox.min.x + bbox.max.x) / 2;
  const offsetY = (bbox.min.y + bbox.max.y) / 2;
  const offsetZ = (bbox.min.z + bbox.max.z) / 2;

  const position = geometry.attributes.position;
  for (let i = 0; i < position.count; i++) {
    position.setX(i, position.getX(i) - offsetX);
    position.setY(i, position.getY(i) - offsetY);
    position.setZ(i, position.getZ(i) - offsetZ);
  }

  position.needsUpdate = true;
  geometry.computeBoundingBox();
  geometry.computeVertexNormals();
}

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

    // Skip faces with i="1" (optional)
    if (node.getAttribute('i') === "1") continue;

    // Skip faces with neighbor='0' (optional)
    const neighborAttr = node.getAttribute('n');
    if (neighborAttr && neighborAttr.trim().split(/\s+/).includes('0')) continue;

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
      vertexArray.push(x, y, z); // LandXML coordinate system: X, Y, Z
    });
  }

  // === Create geometry ===
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    'position',
    new THREE.BufferAttribute(new Float32Array(vertexArray), 3)
  );

  // Rotate from Y-up (LandXML) to Z-up (Three.js)
  geometry.rotateX(-Math.PI / 2);

  // ✅ Flip Z axis to fix mirrored north-south orientation
  geometry.scale(1, 1, -1);

  // Center geometry at origin
  centerGeometry(geometry);

  // UV mapping (XZ plane)
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
    uvs.push(u * 4, v * 4); // scale UVs
  }
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));

  // Material (change to glow/wireframe if needed)
  const material = new THREE.MeshStandardMaterial({
    color: 0x8080ff,
    roughness: 0.6,
    metalness: 0.2,
    side: THREE.DoubleSide,
    flatShading: true
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = 'LandXML_Surface';
  return mesh;
}
