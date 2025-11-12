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

      // Si plusieurs messages, les faire tourner aléatoirement
      if (config.brb.messages && config.brb.messages.length > 0) {
        this.startRandomMessages(config.brb.messages);
      } else if (config.brb.message) {
        // Sinon appliquer le message unique
        document.getElementById('message').textContent = config.brb.message;
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

  startRandomMessages(messages) {
    const messageElement = document.getElementById('message');

    // Afficher un message aléatoire au départ
    const randomIndex = Math.floor(Math.random() * messages.length);
    messageElement.textContent = messages[randomIndex];

    // Changer de message toutes les 8 secondes
    setInterval(() => {
      const newIndex = Math.floor(Math.random() * messages.length);
      messageElement.style.opacity = '0';

      setTimeout(() => {
        messageElement.textContent = messages[newIndex];
        messageElement.style.opacity = '1';
      }, 300);
    }, 8000);
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
