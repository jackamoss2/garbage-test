import * as THREE from 'three';

/**
 * Adds a visible marker to the current OrbitControls target.
 * @param {THREE.Scene} scene - Your THREE.Scene instance.
 * @param {OrbitControls} controls - Your OrbitControls instance.
 * @param {Object} [options] - Optional styling for the marker.
 * @returns {Function} call this in your animation loop to keep it updated.
 */

export function orbitalTargetHelper(scene, controls, options = {}) {
	const {
		color = 0xff0000,
		size = 0.2,
		segments = 16
	} = options;

	const geometry = new THREE.SphereGeometry(size, segments, segments);
	const material = new THREE.MeshBasicMaterial({ color });
	const marker = new THREE.Mesh(geometry, material);

	marker.name = 'OrbitTargetHelper';
	scene.add(marker);

	// Initial position
	marker.position.copy(controls.target);

	// Update function to call in the animation loop
	return function updateTargetMarker() {
		marker.position.copy(controls.target);
	};
}

export function patchOrbitControlsScrollToPanTarget(controls, speed = 1.0) {
	const domElement = controls.domElement;

	function onWheel(event) {
		event.preventDefault();

		// normalize scroll delta
		const delta = event.deltaY < 0 ? -1 : 1;

		// compute forward direction
		const dir = new THREE.Vector3();
		dir.subVectors(controls.target, controls.object.position).normalize();

		// move the target forward or backward
		const moveAmount = delta * speed;

		controls.target.addScaledVector(dir, moveAmount);
	}

	domElement.addEventListener('wheel', onWheel, { passive: false });

	// Return an unpatch function for cleanup
	return () => domElement.removeEventListener('wheel', onWheel);
}