// src/uiPanelBuilder.js

export function addModuleControl(title, checkboxItems, sceneObjectsGroup) {
  const panel = document.getElementById('control-panel');

  const container = document.createElement('div');
  container.className = 'module-control';

  const heading = document.createElement('h3');
  heading.textContent = title;
  container.appendChild(heading);

  const wrapper = document.createElement('div');

  checkboxItems.forEach(({ id, label, groupName }) => {
    const labelEl = document.createElement('label');
    labelEl.htmlFor = id;

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = id;
    input.checked = true;

    input.addEventListener('change', (e) => {
      const obj = sceneObjectsGroup.getObjectByName(groupName);
      if (obj) obj.visible = e.target.checked;
    });

    labelEl.appendChild(input);
    labelEl.appendChild(document.createTextNode(` ${label}`));
    wrapper.appendChild(labelEl);
  });

  container.appendChild(wrapper);
  panel.appendChild(container);
}
