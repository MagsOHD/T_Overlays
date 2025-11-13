class GameplayOverlay {
  constructor() {
    this.config = null;
    this.minimal = false;
  }

  async init() {
    try {
      // Charger la configuration
      const response = await fetch('../../config-organic.json');
      this.config = await response.json();

      // Vérifier les paramètres URL pour le mode minimal
      this.checkUrlParams();

      console.log('✅ Gameplay overlay initialized');
    } catch (error) {
      console.error('❌ Error initializing gameplay overlay:', error);
    }
  }

  checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);

    // Mode minimal (bordure et décos encore plus discrètes)
    if (urlParams.get('minimal') === 'true') {
      document.body.classList.add('minimal');
      this.minimal = true;
      console.log('🎮 Minimal mode enabled');
    }

    // Masquer la webcam frame si demandé
    if (urlParams.get('webcam') === 'false') {
      const webcamFrame = document.querySelector('.webcam-frame');
      if (webcamFrame) {
        webcamFrame.classList.add('hidden');
      }
      console.log('📹 Webcam frame hidden');
    }
  }
}

// Initialiser l'overlay quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
  const overlay = new GameplayOverlay();
  overlay.init();
});
