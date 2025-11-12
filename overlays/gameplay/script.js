class GameplayOverlay {
  constructor() {
    this.init();
  }

  async init() {
    const config = await utils.loadConfig();

    if (config?.streamer?.name) {
      document.getElementById('streamTitle').textContent = 'En direct';
    }

    // Simuler le compteur de viewers (en vrai, ça viendrait de l'API Twitch)
    this.updateViewers();
    setInterval(() => this.updateViewers(), 30000);
  }

  updateViewers() {
    // Placeholder - remplacer par vraie API Twitch
    document.getElementById('viewers').textContent = '---';
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new GameplayOverlay();
});
