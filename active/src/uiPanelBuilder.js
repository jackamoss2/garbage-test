// uiPanelBuilder.js

/**
 * Adds a module control panel with checkboxes to toggle visibility of scene object groups.
 * 
 * @param {string} title - The title/header text for the module control.
 * @param {Array} controls - Array of objects describing each checkbox:
 *   Each control: { id: string, label: string, groupName: string }
 * @param {THREE.Group} sceneObjectsGroup - The group containing scene objects to toggle.
 * @param {HTMLElement} [container] - Optional DOM element to append the module control into.
 */
export function addModuleControl(title, controls, sceneObjectsGroup, container = null) {
  const panel = document.createElement('div');
  panel.className = 'module-control';

  // Header
  const header = document.createElement('h3');
  header.textContent = title;
  panel.appendChild(header);

  // Create checkbox controls
  controls.forEach(({ id, label, groupName }) => {
    const labelElem = document.createElement('label');
    labelElem.setAttribute('for', id);

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = id;
    checkbox.checked = true;

    checkbox.addEventListener('change', () => {
      const obj = sceneObjectsGroup.getObjectByName(groupName);
      if (obj) {
        obj.visible = checkbox.checked;
      }
    });

    labelElem.appendChild(checkbox);
    labelElem.appendChild(document.createTextNode(label));

    panel.appendChild(labelElem);
  });

  // Append the module control panel to the specified container or default container
  if (container instanceof HTMLElement) {
    container.appendChild(panel);
  } else {
    const defaultContainer = document.getElementById('control-panel');
    if (defaultContainer) {
      defaultContainer.appendChild(panel);
    } else {
      console.warn('uiPanelBuilder: No valid container found to append module control.');
    }
  }
}
