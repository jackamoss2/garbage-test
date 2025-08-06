// src/sceneOrganizer.js

import * as THREE from 'three';

export function wrapMeshesInGroups(meshes, sceneObjectsGroup) {
  const visibilityControls = [];

  meshes.forEach((mesh) => {
    const group = new THREE.Group();
    const nickname = mesh.userData.nickname || mesh.name || 'Surface';

    group.name = nickname;
    group.add(mesh);
    sceneObjectsGroup.add(group);

    const id = `toggle-${nickname.replace(/\s+/g, '-')}`;

    visibilityControls.push({
      id,
      label: nickname,
      groupName: nickname
    });
  });

  return visibilityControls;
}
