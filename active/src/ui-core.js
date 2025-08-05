// src/ui-core.js
export function createUIModule(title = '', content = '') {
  const wrapper = document.createElement('div');
  wrapper.className = 'ui-module';
  wrapper.innerHTML = `<h3>${title}</h3><div class="ui-content">${content}</div>`;
  document.getElementById('ui-root').appendChild(wrapper);
  return wrapper;
}
