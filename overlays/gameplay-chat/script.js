class GameplayChatOverlay {
  constructor() {
    this.init();
  }

  async init() {
    const config = await utils.loadConfig();

    if (config?.streamer?.name) {
      document.getElementById('streamTitle').textContent = 'En direct';
    }

    this.updateViewers();
    setInterval(() => this.updateViewers(), 30000);
  }

  updateViewers() {
    // Placeholder
    document.getElementById('viewers').textContent = '---';
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new GameplayChatOverlay();
});
