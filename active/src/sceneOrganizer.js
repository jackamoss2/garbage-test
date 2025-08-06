import * as THREE from 'three';

export function wrapMeshesInGroups(meshes, sceneObjectsGroup, sharedOffset = null) {
  const visibilityControls = [];

  meshes.forEach((mesh) => {
    const group = new THREE.Group();
    const nickname = mesh.userData.nickname || mesh.name || 'Surface';

    group.name = nickname;

    // Apply the shared offset to the group so all objects align properly
    if (sharedOffset instanceof THREE.Vector3) {
      group.position.copy(sharedOffset);
    }

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
