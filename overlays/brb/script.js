// Script pour l'overlay BRB

class BRBOverlay {
  constructor() {
    this.timerElement = document.getElementById('timer');
    this.timerContainer = document.getElementById('timerContainer');
    this.seconds = 0;
    this.showTimer = true;

    this.init();
  }

  async init() {
    // Charger la configuration
    const config = await utils.loadConfig();

    if (config && config.brb) {
      this.showTimer = config.brb.showTimer !== false;

      // Appliquer le message personnalisé si défini
      if (config.brb.message) {
        document.querySelector('.message').textContent = config.brb.message;
      }
    }

    // Afficher ou cacher le timer
    if (!this.showTimer) {
      this.timerContainer.style.display = 'none';
    } else {
      this.startTimer();
    }

    // Créer les particules
    utils.createParticles(document.querySelector('.background-animation'), 20);
  }

  startTimer() {
    setInterval(() => {
      this.seconds++;
      this.updateTimer();
    }, 1000);
  }

  updateTimer() {
    const minutes = Math.floor(this.seconds / 60);
    const secs = this.seconds % 60;

    this.timerElement.textContent =
      `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}

// Initialiser l'overlay
window.addEventListener('DOMContentLoaded', () => {
  new BRBOverlay();
});
