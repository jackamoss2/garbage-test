export class InfoUI {
  constructor(containerId = 'ui-root') {
    this.container = document.getElementById(containerId);
    this.pinned = false;

    this.pinButton = document.getElementById('ui-pin-toggle');
    this.pinButton?.addEventListener('click', () => this.togglePin());

    this.bubbles = [];
  }

  addBubble(content) {
    const bubble = document.createElement('div');
    bubble.className = 'ui-bubble';
    bubble.innerHTML = content;
    this.container.appendChild(bubble);
    this.bubbles.push(bubble);
    return bubble;
  }

  clearBubbles() {
    this.bubbles.forEach(b => b.remove());
    this.bubbles = [];
  }

  hide() {
    if (!this.pinned) {
      this.container.style.display = 'none';
    }
  }

  show() {
    this.container.style.display = 'flex';
  }

  togglePin() {
    this.pinned = !this.pinned;
    this.pinButton.classList.toggle('pinned', this.pinned);
  }

  isPinned() {
    return this.pinned;
  }
}
