import * as THREE from 'three';

export class FirstPersonControls {
  constructor(camera, domElement, options = {}) {
    this.camera = camera;
    this.domElement = domElement;

    this.speed = options.speed || 4;               // Default speed 4
    this.sprintMultiplier = options.sprintMultiplier || 4;  // Sprint 4x
    this.crawlMultiplier = options.crawlMultiplier || 0.25; // Crawl 0.25x
    this.sensitivity = options.sensitivity || 0.002;

    this.position = new THREE.Vector3();

    this.yaw = 0;
    this.pitch = 0;

    this.keys = {
      w: false,
      a: false,
      s: false,
      d: false,
      space: false,
      shift: false,
      ctrl: false,
    };

    this.isPointerLocked = false;
    this.isRightMouseDown = false;

    this._initKeyboard();
    this._initPointerLock();
    this._initMouseButtons();
  }

  _initKeyboard() {
    window.addEventListener('keydown', (e) => {
      switch (e.code) {
        case 'KeyW': this.keys.w = true; break;
        case 'KeyA': this.keys.a = true; break;
        case 'KeyS': this.keys.s = true; break;
        case 'KeyD': this.keys.d = true; break;
        case 'Space': this.keys.space = true; break;
        case 'ShiftLeft':
        case 'ShiftRight': this.keys.shift = true; break;
        case 'ControlLeft':
        case 'ControlRight': this.keys.ctrl = true; break;
      }
    });

    window.addEventListener('keyup', (e) => {
      switch (e.code) {
        case 'KeyW': this.keys.w = false; break;
        case 'KeyA': this.keys.a = false; break;
        case 'KeyS': this.keys.s = false; break;
        case 'KeyD': this.keys.d = false; break;
        case 'Space': this.keys.space = false; break;
        case 'ShiftLeft':
        case 'ShiftRight': this.keys.shift = false; break;
        case 'ControlLeft':
        case 'ControlRight': this.keys.ctrl = false; break;
      }
    });
  }

  _initPointerLock() {
    this.domElement.addEventListener('click', () => {
      this.domElement.requestPointerLock();
    });

    document.addEventListener('pointerlockchange', () => {
      this.isPointerLocked = document.pointerLockElement === this.domElement;
    });

    document.addEventListener('mousemove', (e) => {
      if (!this.isPointerLocked) return;

      this.yaw -= e.movementX * this.sensitivity;
      this.pitch -= e.movementY * this.sensitivity;

      const piHalf = Math.PI / 2 - 0.1;
      this.pitch = Math.max(-piHalf, Math.min(piHalf, this.pitch));
    });
  }

  _initMouseButtons() {
    this.domElement.addEventListener('mousedown', (e) => {
      if (e.button === 2) {
        this.isRightMouseDown = true;
      }
    });
    this.domElement.addEventListener('mouseup', (e) => {
      if (e.button === 2) {
        this.isRightMouseDown = false;
      }
    });
    this.domElement.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  update() {
    let currentSpeed = this.speed;

    if (this.keys.ctrl) {
      currentSpeed *= this.crawlMultiplier; // crawl
    } else if (this.isRightMouseDown) {
      currentSpeed *= this.sprintMultiplier; // sprint
    }

    const forward = new THREE.Vector3(
      -Math.sin(this.yaw) * Math.cos(this.pitch),
      Math.sin(this.pitch),
      -Math.cos(this.yaw) * Math.cos(this.pitch)
    ).normalize();

    const right = new THREE.Vector3(
      Math.sin(this.yaw + Math.PI / 2),
      0,
      Math.cos(this.yaw + Math.PI / 2)
    ).normalize();

    const moveVector = new THREE.Vector3();

    if (this.keys.w) moveVector.add(forward);
    if (this.keys.s) moveVector.sub(forward);
    if (this.keys.a) moveVector.sub(right);
    if (this.keys.d) moveVector.add(right);

    if (moveVector.lengthSq() > 0) {
      moveVector.normalize().multiplyScalar(currentSpeed);
    }

    if (this.keys.space) moveVector.y += currentSpeed;
    if (this.keys.shift) moveVector.y -= currentSpeed;

    this.position.add(moveVector);

    this.camera.position.copy(this.position);
    this.camera.rotation.set(this.pitch, this.yaw, 0, 'YXZ');
  }
}
