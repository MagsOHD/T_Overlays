class BRBScene {
  constructor() {
    this.config = null;
    this.currentMessageIndex = 0;
    this.messageRotationInterval = null;
    this.timerInterval = null;
    this.startTime = Date.now();
    this.showTimer = true;
  }

  async init() {
    try {
      // Charger la configuration
      const response = await fetch('../../config-organic.json');
      this.config = await response.json();

      // Appliquer la configuration
      this.applyConfig();

      // Démarrer les animations
      this.startMessageRotation();
      if (this.showTimer) {
        this.startTimer();
      }

      console.log('✅ BRB scene initialized');
    } catch (error) {
      console.error('❌ Error initializing BRB scene:', error);
      this.useFallbackConfig();
    }
  }

  applyConfig() {
    const brbConfig = this.config.scenes.brb;

    // Appliquer le titre
    const titleElement = document.getElementById('title');
    if (titleElement && brbConfig.title) {
      titleElement.textContent = brbConfig.title;
    }

    // Définir si on affiche le timer
    this.showTimer = brbConfig.showTimer !== false;

    // Afficher/masquer le timer card selon la config
    const timerCard = document.getElementById('timerCard');
    if (timerCard && !this.showTimer) {
      timerCard.style.display = 'none';
    }

    // Stocker les messages pour rotation
    this.messages = brbConfig.messages || [
      'Je reviens vite !',
      'Pause pipi 🚽',
      'Pause café ☕',
      'Pause snack 🍪'
    ];

    // Afficher le premier message
    this.displayMessage(0);
  }

  useFallbackConfig() {
    console.log('📝 Using fallback configuration');
    this.messages = [
      'Je reviens vite !',
      'Petite pause technique',
      'On se retrouve dans un instant'
    ];
    this.showTimer = true;
    this.displayMessage(0);
    this.startMessageRotation();
    this.startTimer();
  }

  displayMessage(index) {
    const messageElement = document.getElementById('message');
    if (!messageElement || !this.messages) return;

    // Fade out
    messageElement.style.opacity = '0';

    setTimeout(() => {
      messageElement.textContent = this.messages[index];
      // Fade in
      messageElement.style.opacity = '1';
    }, 500);
  }

  startMessageRotation() {
    // Changer de message toutes les 8 secondes
    this.messageRotationInterval = setInterval(() => {
      this.currentMessageIndex = (this.currentMessageIndex + 1) % this.messages.length;
      this.displayMessage(this.currentMessageIndex);
    }, 8000);
  }

  startTimer() {
    const timerElement = document.getElementById('timer');
    if (!timerElement) return;

    // Mettre à jour le timer chaque seconde
    this.timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;

      timerElement.textContent =
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, 1000);
  }

  cleanup() {
    if (this.messageRotationInterval) {
      clearInterval(this.messageRotationInterval);
    }
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }
}

// Initialiser la scène quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
  const scene = new BRBScene();
  scene.init();

  // Cleanup quand la page est déchargée
  window.addEventListener('beforeunload', () => {
    scene.cleanup();
  });
});
