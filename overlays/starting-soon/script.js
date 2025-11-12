// Script pour l'overlay Starting Soon

class StartingSoonOverlay {
  constructor() {
    this.minutesElement = document.getElementById('minutes');
    this.secondsElement = document.getElementById('seconds');
    this.countdown = null;
    this.totalSeconds = 0;

    this.init();
  }

  async init() {
    // Charger la configuration
    const config = await utils.loadConfig();

    if (config) {
      // Appliquer les informations du streamer
      this.applySocials(config.streamer.socials);

      // Démarrer le countdown
      const countdownMinutes = config.startingSoon?.countdownMinutes || 5;
      this.startCountdown(countdownMinutes * 60);
    } else {
      // Valeurs par défaut
      this.startCountdown(300); // 5 minutes
    }

    // Créer les particules
    utils.createParticles(document.querySelector('.background-particles'), 30);
  }

  applySocials(socials) {
    if (socials.twitch) {
      document.getElementById('twitch').textContent = `twitch.tv/${socials.twitch}`;
    }
    if (socials.twitter) {
      document.getElementById('twitter').textContent = `@${socials.twitter}`;
    }
    if (socials.discord) {
      document.getElementById('discord').textContent = socials.discord;
    }
  }

  startCountdown(seconds) {
    this.totalSeconds = seconds;
    this.updateDisplay();

    this.countdown = setInterval(() => {
      this.totalSeconds--;

      if (this.totalSeconds <= 0) {
        clearInterval(this.countdown);
        this.totalSeconds = 0;
        this.onCountdownEnd();
      }

      this.updateDisplay();
    }, 1000);
  }

  updateDisplay() {
    const minutes = Math.floor(this.totalSeconds / 60);
    const seconds = this.totalSeconds % 60;

    this.minutesElement.textContent = minutes.toString().padStart(2, '0');
    this.secondsElement.textContent = seconds.toString().padStart(2, '0');

    // Animation spéciale pour les dernières 10 secondes
    if (this.totalSeconds <= 10 && this.totalSeconds > 0) {
      this.minutesElement.style.color = '#ff0000';
      this.secondsElement.style.color = '#ff0000';

      // Faire vibrer le countdown
      const countdown = document.querySelector('.countdown-container');
      countdown.style.animation = 'shake 0.5s ease-in-out';
      setTimeout(() => {
        countdown.style.animation = '';
      }, 500);
    }
  }

  onCountdownEnd() {
    // Afficher un message de fin
    const preparing = document.querySelector('.preparing');
    preparing.textContent = '🎮 C\'EST PARTI ! 🎮';
    preparing.style.fontSize = '3rem';
    preparing.style.animation = 'bounce 0.5s ease-in-out infinite';

    // Jouer un son de début (si disponible)
    utils.playSound('../../assets/sounds/start.mp3', 0.8).catch(() => {
      console.log('Son de début non disponible');
    });
  }
}

// Initialiser l'overlay
window.addEventListener('DOMContentLoaded', () => {
  new StartingSoonOverlay();
});
