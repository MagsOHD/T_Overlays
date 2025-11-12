// Utilitaires globaux pour les overlays

class OverlayUtils {
  constructor() {
    this.config = null;
    this.loadConfig();
  }

  // Charger la configuration
  async loadConfig() {
    try {
      const response = await fetch('../config.json');
      this.config = await response.json();
      this.applyTheme();
      return this.config;
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration:', error);
      return null;
    }
  }

  // Appliquer le thème
  applyTheme() {
    if (this.config && this.config.theme) {
      const root = document.documentElement;
      root.style.setProperty('--primary-color', this.config.theme.primaryColor);
      root.style.setProperty('--secondary-color', this.config.theme.secondaryColor);
      root.style.setProperty('--accent-color', this.config.theme.accentColor);
      root.style.setProperty('--background-color', this.config.theme.backgroundColor);
      root.style.setProperty('--text-color', this.config.theme.textColor);
    }
  }

  // Jouer un son
  playSound(soundPath, volume = 1.0) {
    const audio = new Audio(soundPath);
    audio.volume = Math.max(0, Math.min(1, volume));
    audio.play().catch(err => console.error('Erreur lors de la lecture du son:', err));
    return audio;
  }

  // Formater un message avec des variables
  formatMessage(template, variables) {
    let message = template;
    for (const [key, value] of Object.entries(variables)) {
      message = message.replace(`{${key}}`, value);
    }
    return message;
  }

  // Créer des particules d'animation
  createParticles(container, count = 20) {
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.cssText = `
        position: absolute;
        width: ${Math.random() * 10 + 5}px;
        height: ${Math.random() * 10 + 5}px;
        background: ${this.getRandomColor()};
        border-radius: 50%;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        animation: float ${Math.random() * 3 + 2}s ease-in-out infinite;
        opacity: ${Math.random() * 0.5 + 0.3};
      `;
      container.appendChild(particle);
    }
  }

  // Obtenir une couleur aléatoire du thème
  getRandomColor() {
    if (!this.config) return '#fff';
    const colors = [
      this.config.theme.primaryColor,
      this.config.theme.secondaryColor,
      this.config.theme.accentColor
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // Timer formaté
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // Simuler une alerte (pour les tests)
  async testAlert(type, data = {}) {
    const alertWindow = window.open('../overlays/alerts/index.html', '_blank', 'width=800,height=200');

    setTimeout(() => {
      if (alertWindow) {
        alertWindow.postMessage({
          type: type,
          data: data
        }, '*');
      }
    }, 1000);
  }
}

// Animation des particules flottantes
const style = document.createElement('style');
style.textContent = `
  @keyframes float {
    0%, 100% {
      transform: translateY(0) rotate(0deg);
    }
    50% {
      transform: translateY(-20px) rotate(180deg);
    }
  }
`;
document.head.appendChild(style);

// Instance globale
const utils = new OverlayUtils();
