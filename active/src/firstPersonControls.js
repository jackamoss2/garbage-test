import * as THREE from 'three';

export class FirstPersonControls {
  constructor(camera, domElement, scene = null, options = {}) {
    this.camera = camera;
    this.domElement = domElement;
    this.scene = scene;

    this.speed = options.speed || 4;
    this.sprintMultiplier = options.sprintMultiplier || 8;
    this.crawlMultiplier = options.crawlMultiplier || 0.25;
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
    this.enabled = false;
    this._ignoreFirstMouseMove = false;

    this.crosshair = this._createCrosshair();

    // UI Overlay container div
    this.uiOverlay = this._createUIOverlay();
    document.body.appendChild(this.uiOverlay);

    this._updateUIPosition();
    window.addEventListener('resize', () => this._updateUIPosition());

    this.domElement.style.cursor = '';

    this._initKeyboard();
    this._initPointerLock();
    this._initMouseButtons();

    this._updateUI();
  }

  frameObject(object3D) {
    if (!object3D) return;

    const box = new THREE.Box3().setFromObject(object3D);
    if (box.isEmpty()) return;

    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    // Adjust this factor to get camera closer or farther
    const distance = size.length() * .2;

    // Position camera offset relative to object center
    this.position.copy(center);
    this.position.x += distance;
    this.position.y += distance * 0.5;
    this.position.z += distance;

    this.camera.position.copy(this.position);
    this.camera.lookAt(center);

    // Reset yaw and pitch from new camera orientation
    const lookDir = new THREE.Vector3();
    this.camera.getWorldDirection(lookDir);

    this.yaw = Math.atan2(-lookDir.x, -lookDir.z);
    this.pitch = Math.asin(lookDir.y);
  }

  _updateUIPosition() {
    const rect = this.domElement.getBoundingClientRect();
    this.uiOverlay.style.position = 'fixed';
    this.uiOverlay.style.left = `${rect.left + 10}px`;
    this.uiOverlay.style.top = `${rect.bottom - this.uiOverlay.offsetHeight - 10}px`;
  }

  _createUIOverlay() {
    const container = document.createElement('div');
    container.style.background = 'rgba(0, 0, 0, 0.4)';
    container.style.color = 'white';
    container.style.padding = '8px 12px';
    container.style.borderRadius = '6px';
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.fontSize = '14px';
    container.style.maxWidth = '280px';
    container.style.userSelect = 'none';
    container.style.pointerEvents = 'none';
    container.style.zIndex = '10000';
    container.style.transition = 'opacity 0.3s ease';

    this._infoText = document.createElement('div');
    container.appendChild(this._infoText);

    return container;
  }

  _updateUI() {
    if (this.enabled) {
      this._infoText.innerHTML =
        `<div>WASD to move, Space/Shift to move up/down</div>
         <div>Hold Right Mouse to sprint, Ctrl to crawl</div>
         <div style="margin-top:8px;">Press <b>E</b> to deactivate controls</div>`;
    } else {
      this._infoText.innerHTML =
        `Press <b>E</b> to activate first person controls`;
    }
    this._updateUIPosition();
  }

  _createCrosshair() {
    const crosshair = document.createElement('div');
    crosshair.style.position = 'fixed';
    crosshair.style.top = '50%';
    crosshair.style.left = '50%';
    crosshair.style.width = '20px';
    crosshair.style.height = '20px';
    crosshair.style.marginLeft = '-10px';
    crosshair.style.marginTop = '-10px';
    crosshair.style.pointerEvents = 'none';
    crosshair.style.zIndex = '9999';
    crosshair.style.display = 'flex';
    crosshair.style.alignItems = 'center';
    crosshair.style.justifyContent = 'center';

    const hLine = document.createElement('div');
    hLine.style.position = 'absolute';
    hLine.style.width = '20px';
    hLine.style.height = '2px';
    hLine.style.backgroundColor = 'white';
    crosshair.appendChild(hLine);

    const vLine = document.createElement('div');
    vLine.style.position = 'absolute';
    vLine.style.width = '2px';
    vLine.style.height = '20px';
    vLine.style.backgroundColor = 'white';
    crosshair.appendChild(vLine);

    return crosshair;
  }

  _showCrosshair() {
    if (!document.body.contains(this.crosshair)) {
      document.body.appendChild(this.crosshair);
    }
  }

  _hideCrosshair() {
    if (document.body.contains(this.crosshair)) {
      document.body.removeChild(this.crosshair);
    }
  }

  _clearKeys() {
    for (const key in this.keys) {
      this.keys[key] = false;
    }
    this.isRightMouseDown = false;
  }

  _initKeyboard() {
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyE') {
        if (!this.enabled) {
          this._enterControls();
        } else {
          this._exitControls();
        }
        return;
      }

      if (!this.enabled) return;

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
      if (!this.enabled) return;

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

  _enterControls() {
    this.enabled = true;
    this._clearKeys();
    this._showCrosshair();
    this.domElement.style.cursor = 'none';
    this._ignoreFirstMouseMove = true;
    this.domElement.requestPointerLock();
    this._updateUI();
  }

  _exitControls() {
    this.enabled = false;
    this._clearKeys();
    this._hideCrosshair();
    this.domElement.style.cursor = '';
    if (document.pointerLockElement === this.domElement) {
      document.exitPointerLock();
    }
    this._updateUI();
  }

  _initPointerLock() {
    document.addEventListener('pointerlockchange', () => {
      this.isPointerLocked = document.pointerLockElement === this.domElement;

      if (this.enabled && !this.isPointerLocked) {
        this._exitControls();
      }
    });

    document.addEventListener('mousemove', (e) => {
      if (!this.enabled) return;
      if (!this.isPointerLocked) return;

      if (this._ignoreFirstMouseMove) {
        this._ignoreFirstMouseMove = false;
        return;
      }

      this.yaw -= e.movementX * this.sensitivity;
      this.pitch -= e.movementY * this.sensitivity;

      const piHalf = Math.PI / 2 - 0.1;
      this.pitch = Math.max(-piHalf, Math.min(piHalf, this.pitch));
    });
  }

  _initMouseButtons() {
    this.domElement.addEventListener('mousedown', (e) => {
      if (!this.enabled) return;
      if (e.button === 2) {
        this.isRightMouseDown = true;
      }
    });
    this.domElement.addEventListener('mouseup', (e) => {
      if (!this.enabled) return;
      if (e.button === 2) {
        this.isRightMouseDown = false;
      }
    });
    this.domElement.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  update() {
    if (!this.enabled) return;

    let currentSpeed = this.speed;

    if (this.keys.ctrl) {
      currentSpeed *= this.crawlMultiplier;
    } else if (this.isRightMouseDown) {
      currentSpeed *= this.sprintMultiplier;
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
