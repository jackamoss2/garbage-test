import * as THREE from 'three';

export class BackgroundGrid {
  constructor(scene, options = {}) {
    this.scene = scene;
    const {
      divisions = 100,
      colorCenterLine = 0xffffff,
      colorGrid = 0xffffff,
      opacity = 0.1,
    } = options;

    this.divisions = divisions;
    this.colorCenterLine = colorCenterLine;
    this.colorGrid = colorGrid;
    this.opacity = opacity;

    this.gridHelper = new THREE.GridHelper(100, this.divisions, this.colorCenterLine, this.colorGrid);
    this.gridHelper.material.transparent = true;
    this.gridHelper.material.opacity = this.opacity;
    this.gridHelper.material.depthWrite = false;

    this.scene.add(this.gridHelper);

    this.updateGrid(); // Initial sizing
  }

  updateGrid() {
    const box = new THREE.Box3();
    box.makeEmpty();

    this.scene.traverse((obj) => {
      if ((obj.isMesh || obj.isPoints || obj.isLine) && obj !== this.gridHelper) {
        if (obj.geometry) {
          if (!obj.geometry.boundingBox) obj.geometry.computeBoundingBox();
          const objBox = obj.geometry.boundingBox.clone();
          objBox.applyMatrix4(obj.matrixWorld);
          box.union(objBox);
        }
      }
    });

    if (box.isEmpty()) {
      this.gridHelper.visible = false;
      return;
    }

    this.gridHelper.visible = true;

    const sizeX = box.max.x - box.min.x;
    const sizeZ = box.max.z - box.min.z;
    const size = Math.max(sizeX, sizeZ);
    const paddedSize = size * 1.1;

    this.gridHelper.scale.set(paddedSize / 100, 1, paddedSize / 100); // default grid size is 100

    const yPos = box.min.y - 10;
    const centerX = (box.min.x + box.max.x) / 2;
    const centerZ = (box.min.z + box.max.z) / 2;

    this.gridHelper.position.set(centerX, yPos, centerZ);
  }
}
