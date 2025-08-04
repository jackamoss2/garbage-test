import * as THREE from 'three';

export function parseCoords(text) {
  const parts = text.trim().split(/\s+/).map(parseFloat);
  if (parts.length === 2) parts.push(0);
  return parts;
}

export function formatCoords(coords) {
  return coords.map(c => c.toFixed(6)).join(" ");
}

/**
 * Centers geometry vertices around (0,0,0)
 * @param {THREE.BufferGeometry} geometry 
 */
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

/**
 * Parses LandXML string and returns a THREE.Mesh with concrete texture applied,
 * transforming LandXML coordinates to Three.js coordinate system,
 * and centering the mesh at the origin.
 * @param {string} xmlString - LandXML content string.
 * @returns {THREE.Mesh}
 */
export function buildMeshFromLandXML(xmlString) {
  // Parse XML
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

  // Collect triangle vertices from faces, transforming coords to Three.js space
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
    const ids = node.textContent.trim().split(/\s+/);
    ids.forEach(id => {
      const coord = pointsMap.get(id);
      if (!coord) throw new Error(`Missing point ID: ${id}`);
      const [x, y, z] = coord;
      // LandXML [X, Y, Z] → Three.js [X, Z, -Y]
      vertexArray.push(x, z, -y);
    });
  }

  // Build geometry and compute normals
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    'position',
    new THREE.BufferAttribute(new Float32Array(vertexArray), 3)
  );

  // Center geometry around (0,0,0)
  centerGeometry(geometry);

  // UV mapping — planar projection on XZ plane with tiling
  geometry.computeBoundingBox();
  const bounds = geometry.boundingBox;
  const sizeX = bounds.max.x - bounds.min.x;
  const sizeZ = bounds.max.z - bounds.min.z;

  const positions = geometry.attributes.position;
  const uvs = [];
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const z = positions.getZ(i);
    const u = (x - bounds.min.x) / sizeX;
    const v = (z - bounds.min.z) / sizeZ;
    uvs.push(u * 4, v * 4); // 4 = tiling factor, adjust as needed
  }
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));

const material = new THREE.MeshStandardMaterial({
    color: 0x808080, // Concrete color
    roughness: 0.7,
    metalness: 0.1,
    side: THREE.DoubleSide,
    flatShading: true
  });

  // Return the mesh
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = 'LandXML_ConcreteSurface';
  return mesh;
}
