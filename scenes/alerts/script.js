class AlertsSystem {
  constructor() {
    this.config = null;
    this.alertBox = document.getElementById('alertBox');
    this.alertIcon = document.getElementById('alertIcon');
    this.alertMessage = document.getElementById('alertMessage');
    this.alertSubmessage = document.getElementById('alertSubmessage');
    this.alertSound = document.getElementById('alertSound');
    this.particlesContainer = document.getElementById('particles');
    this.queue = [];
    this.isPlaying = false;
  }

  async init() {
    try {
      // Charger la configuration
      const response = await fetch('../../config-organic.json');
      this.config = await response.json();

      console.log('✅ Alerts system initialized');

      // Mode test via URL
      this.checkTestMode();
    } catch (error) {
      console.error('❌ Error initializing alerts system:', error);
      this.useFallbackConfig();
    }
  }

  checkTestMode() {
    const urlParams = new URLSearchParams(window.location.search);
    const testType = urlParams.get('test');

    if (testType) {
      document.body.classList.add('test-mode');
      console.log(`🧪 Test mode: ${testType}`);

      // Simuler une alerte de test
      setTimeout(() => {
        this.testAlert(testType);
      }, 1000);
    }
  }

  testAlert(type) {
    const testData = {
      follow: {
        type: 'follow',
        user: 'TestUser123',
      },
      subscription: {
        type: 'subscription',
        user: 'SuperFan',
        months: 6,
      },
      donation: {
        type: 'donation',
        user: 'GenerosiDude',
        amount: 5.00,
        message: 'Continue comme ça ! 💜',
      },
      raid: {
        type: 'raid',
        user: 'AnotherStreamer',
        viewers: 42,
      },
      bits: {
        type: 'bits',
        user: 'BitsLover',
        amount: 100,
      },
    };

    const data = testData[type] || testData.follow;
    this.showAlert(data);
  }

  showAlert(data) {
    // Ajouter à la queue si une alerte est déjà en cours
    if (this.isPlaying) {
      this.queue.push(data);
      console.log('📬 Alert added to queue');
      return;
    }

    this.isPlaying = true;

    const alertConfig = this.config?.alerts?.[data.type] || this.getDefaultAlertConfig(data.type);

    if (!alertConfig.enabled) {
      console.log(`⏭️ Alert type ${data.type} is disabled`);
      this.isPlaying = false;
      this.processQueue();
      return;
    }

    // Appliquer le type d'alerte
    this.alertBox.className = 'alert-box glass blob show';
    this.alertBox.classList.add(`type-${data.type}`);

    // Configurer l'icône
    this.alertIcon.textContent = alertConfig.emoji || this.getDefaultEmoji(data.type);

    // Configurer le message
    const message = this.formatMessage(alertConfig.message, data);
    const submessage = this.formatMessage(alertConfig.submessage, data);

    this.alertMessage.textContent = message;
    this.alertSubmessage.textContent = submessage;

    // Créer des particules
    this.createParticles(alertConfig.emoji || this.getDefaultEmoji(data.type));

    // Jouer le son
    this.playSound(alertConfig.sound, alertConfig.volume);

    // Masquer l'alerte après la durée configurée
    const duration = alertConfig.duration || 5000;
    setTimeout(() => {
      this.hideAlert();
    }, duration);
  }

  formatMessage(template, data) {
    if (!template) return '';

    return template
      .replace('{user}', data.user || 'Anonyme')
      .replace('{amount}', data.amount || 0)
      .replace('{viewers}', data.viewers || 0)
      .replace('{months}', data.months || 1)
      .replace('{message}', data.message || '');
  }

  hideAlert() {
    this.alertBox.classList.remove('show');
    this.alertBox.classList.add('hide');

    setTimeout(() => {
      this.alertBox.classList.remove('hide');
      this.isPlaying = false;
      this.clearParticles();
      this.processQueue();
    }, 500);
  }

  processQueue() {
    if (this.queue.length > 0) {
      const nextAlert = this.queue.shift();
      setTimeout(() => {
        this.showAlert(nextAlert);
      }, 500);
    }
  }

  createParticles(emoji) {
    const particleCount = 12;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.textContent = emoji;

      // Position aléatoire
      const startX = Math.random() * 100;
      const startY = 50 + Math.random() * 30;

      particle.style.left = `${startX}%`;
      particle.style.top = `${startY}%`;

      this.particlesContainer.appendChild(particle);

      // Animer avec un délai aléatoire
      setTimeout(() => {
        particle.classList.add('animate');
      }, Math.random() * 800);

      // Supprimer après l'animation
      setTimeout(() => {
        particle.remove();
      }, 3000);
    }
  }

  clearParticles() {
    this.particlesContainer.innerHTML = '';
  }

  playSound(soundPath, volume = 0.6) {
    if (!soundPath) {
      console.log('🔇 No sound configured for this alert');
      return;
    }

    // Volume master
    const masterVolume = this.config?.sounds?.volume?.master || 0.7;
    const alertsVolume = this.config?.sounds?.volume?.alerts || 0.6;
    const finalVolume = volume * alertsVolume * masterVolume;

    this.alertSound.volume = Math.min(1, Math.max(0, finalVolume));
    this.alertSound.src = soundPath;

    this.alertSound.play().catch(error => {
      console.warn('⚠️ Could not play sound:', error);
    });
  }

  getDefaultAlertConfig(type) {
    const defaults = {
      follow: {
        enabled: true,
        duration: 4500,
        emoji: '💜',
        message: '{user} vient de follow !',
        submessage: 'Bienvenue parmi nous 💜',
      },
      subscription: {
        enabled: true,
        duration: 5500,
        emoji: '⭐',
        message: '{user} s\'est abonné !',
        submessage: 'Merci infiniment ✨',
      },
      donation: {
        enabled: true,
        duration: 6000,
        emoji: '🎁',
        message: '{user} a donné {amount}€',
        submessage: 'Tu es incroyable !',
      },
      raid: {
        enabled: true,
        duration: 7000,
        emoji: '🚀',
        message: '{user} raid avec {viewers} viewers !',
        submessage: 'Bienvenue à tous ! 🎉',
      },
      bits: {
        enabled: true,
        duration: 4500,
        emoji: '💎',
        message: '{user} a envoyé {amount} bits',
        submessage: 'Merci pour le soutien !',
      },
    };

    return defaults[type] || defaults.follow;
  }

  getDefaultEmoji(type) {
    const emojis = {
      follow: '💜',
      subscription: '⭐',
      donation: '🎁',
      raid: '🚀',
      bits: '💎',
    };

    return emojis[type] || '✨';
  }

  useFallbackConfig() {
    console.log('📝 Using fallback configuration');
    this.config = {
      alerts: {},
      sounds: {
        volume: {
          master: 0.7,
          alerts: 0.6,
        },
      },
    };
  }
}

// Initialiser le système d'alertes
const alertsSystem = new AlertsSystem();

document.addEventListener('DOMContentLoaded', () => {
  alertsSystem.init();
});

// Exposer la fonction pour utilisation externe (Streamlabs, StreamElements, etc.)
window.showAlert = (data) => {
  alertsSystem.showAlert(data);
};

// Exemple d'utilisation pour les développeurs :
// window.showAlert({ type: 'follow', user: 'TestUser' });
// window.showAlert({ type: 'subscription', user: 'SuperFan', months: 6 });
// window.showAlert({ type: 'donation', user: 'Generous', amount: 5.00 });
// window.showAlert({ type: 'raid', user: 'Raider', viewers: 42 });
// window.showAlert({ type: 'bits', user: 'BitsUser', amount: 100 });
