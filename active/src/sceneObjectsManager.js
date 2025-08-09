import { buildMeshFromLandXML } from './landxmlMeshBuilder.js';
import { readLocalFile } from './readLocalFile.js';
import * as THREE from 'three';

export class SceneObjectsManager {
  constructor(folderPath, fileList = [
    // 'EG.xml',
    // 'FG.xml'
    'EG2.xml'
  ]) {
    this.folderPath = folderPath;
    this.fileList = fileList;
    this.objects = [];
    this.firstObjectOffset = null; // THREE.Vector3
  }

  loadAll() {
    this.objects = [];
    this.firstObjectOffset = null;

    for (const fileName of this.fileList) {
      try {
        const fullPath = this.folderPath + fileName;
        const xmlString = readLocalFile(fullPath);
        const mesh = buildMeshFromLandXML(xmlString);

        // Add metadata
        mesh.userData = mesh.userData || {};
        mesh.userData.fileSourceName = fileName;
        mesh.userData.nickname = this._deriveNickname(fileName);
        mesh.userData.numPoints = this._countPointsInXML(xmlString);
        mesh.name = mesh.userData.nickname;

        // Compute bounding box of geometry to get center
        mesh.geometry.computeBoundingBox();
        const bbox = mesh.geometry.boundingBox;

        const center = new THREE.Vector3();
        bbox.getCenter(center);

        if (!this.firstObjectOffset) {
          this.firstObjectOffset = center.clone();
          console.log(`First object center offset: ${this.firstObjectOffset.x}, ${this.firstObjectOffset.y}, ${this.firstObjectOffset.z}`);
        }

        // Shift geometry vertices by subtracting first object's center offset
        const offset = this.firstObjectOffset;
        const positionAttr = mesh.geometry.attributes.position;

        for (let i = 0; i < positionAttr.count; i++) {
          positionAttr.setX(i, positionAttr.getX(i) - offset.x);
          positionAttr.setY(i, positionAttr.getY(i) - offset.y);
          positionAttr.setZ(i, positionAttr.getZ(i) - offset.z);
        }
        positionAttr.needsUpdate = true;

        mesh.geometry.computeBoundingBox();
        mesh.geometry.computeVertexNormals();

        // Reset mesh position to zero
        mesh.position.set(0, 0, 0);

        console.log(`Loaded mesh ${mesh.name}, geometry centered at 0,0,0`);
        console.log(`Mesh position after shift: ${mesh.position.x}, ${mesh.position.y}, ${mesh.position.z}`);

        this.objects.push(mesh);
      } catch (err) {
        console.error(`Failed to load or parse ${fileName}:`, err);
      }
    }
  }

  _deriveNickname(fileName) {
    return fileName.replace(/\.[^/.]+$/, '');
  }

  _countPointsInXML(xmlString) {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, "application/xml");
      const points = xmlDoc.getElementsByTagName('P');
      return points.length;
    } catch {
      return 0;
    }
  }

  getObjects() {
    return this.objects;
  }

  getFirstObjectOffset() {
    return this.firstObjectOffset;
  }
}
