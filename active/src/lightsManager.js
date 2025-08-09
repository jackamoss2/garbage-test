import * as THREE from "three";

export class LightsManager {
  constructor(scene, panelElement) {
    this.scene = scene;
    this.panelElement = panelElement;

    this.directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    this.directionalLight.position.set(5, 10, 7);
    this.directionalLight.castShadow = true;
    this.directionalLight.shadow.mapSize.width = 1024;
    this.directionalLight.shadow.mapSize.height = 1024;
    this.directionalLight.shadow.camera.near = 1;
    this.directionalLight.shadow.camera.far = 20;
    scene.add(this.directionalLight);

    this.directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
    this.directionalLight2.position.set(-5, -10, -7);
    this.directionalLight2.castShadow = true;
    this.directionalLight2.shadow.mapSize.width = 1024;
    this.directionalLight2.shadow.mapSize.height = 1024;
    this.directionalLight2.shadow.camera.near = 1;
    this.directionalLight2.shadow.camera.far = 20;
    scene.add(this.directionalLight2);

    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(this.ambientLight);

    this._createUI();
  }

  _createUI() {
    if (!this.panelElement) {
      console.warn("LightsManager: No panelElement provided, skipping UI creation");
      return;
    }

    this.container = document.createElement("div");
    this.container.className = "control-item";

    this.label = document.createElement("label");
    this.label.textContent = "Light Rotation: 45°";
    this.label.htmlFor = "light-rotation-slider";
    this.container.appendChild(this.label);

    this.slider = document.createElement("input");
    this.slider.type = "range";
    this.slider.min = "0";
    this.slider.max = "360";
    this.slider.value = "45";
    this.slider.id = "light-rotation-slider";
    this.slider.className = "slider";
    this.container.appendChild(this.slider);

    this.panelElement.appendChild(this.container);

    this.slider.addEventListener("input", () => {
      this._updateLightRotation(parseFloat(this.slider.value));
    });

    this._updateLightRotation(parseFloat(this.slider.value));
  }

  _updateLightRotation(degrees) {
    this.label.textContent = `Light Rotation: ${degrees.toFixed(0)}°`;

    const radians = THREE.MathUtils.degToRad(degrees);
    const origPos = this.directionalLight.position;
    const radius = Math.sqrt(origPos.x * origPos.x + origPos.z * origPos.z);

    this.directionalLight.position.x = radius * Math.cos(radians);
    this.directionalLight.position.z = radius * Math.sin(radians);
    this.directionalLight.lookAt(0, 0, 0);
    this.directionalLight2.position.x = -radius * Math.cos(radians);
    this.directionalLight2.position.z = -radius * Math.sin(radians);
    this.directionalLight2.lookAt(0, 0, 0);
  }

  dispose() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}
