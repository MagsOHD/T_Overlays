// Script pour le système d'alertes

class AlertSystem {
  constructor() {
    this.container = document.getElementById('alertContainer');
    this.template = document.getElementById('alertTemplate');
    this.queue = [];
    this.isPlaying = false;
    this.config = null;

    this.init();
  }

  async init() {
    // Charger la configuration
    this.config = await utils.loadConfig();

    // Écouter les messages (pour les tests et intégrations)
    window.addEventListener('message', (event) => {
      this.handleMessage(event.data);
    });

    // Exposer une méthode globale pour déclencher des alertes
    window.triggerAlert = (type, data) => this.addAlert(type, data);

    console.log('Système d\'alertes initialisé');
  }

  handleMessage(message) {
    if (message.type && message.data) {
      this.addAlert(message.type, message.data);
    }
  }

  addAlert(type, data) {
    // Ajouter l'alerte à la file
    this.queue.push({ type, data });

    // Si aucune alerte n'est en cours, commencer
    if (!this.isPlaying) {
      this.playNext();
    }
  }

  async playNext() {
    if (this.queue.length === 0) {
      this.isPlaying = false;
      return;
    }

    this.isPlaying = true;
    const alert = this.queue.shift();
    await this.showAlert(alert.type, alert.data);
  }

  async showAlert(type, data) {
    // Créer l'élément d'alerte
    const alertElement = this.createAlertElement(type, data);
    this.container.appendChild(alertElement);

    // Obtenir la configuration de l'alerte
    const alertConfig = this.getAlertConfig(type);

    // Jouer le son
    if (alertConfig && alertConfig.enabled && alertConfig.sound) {
      try {
        utils.playSound(alertConfig.sound, alertConfig.volume || 0.7);
      } catch (error) {
        console.log('Son non disponible pour', type);
      }
    }

    // Créer les particules
    this.createAlertParticles(alertElement, type);

    // Effet spécial pour certaines alertes
    if (type === 'raid' || type === 'donation') {
      this.screenShake();
    }

    // Durée d'affichage
    const duration = alertConfig?.duration || 5000;

    // Attendre avant de retirer l'alerte
    await new Promise(resolve => setTimeout(resolve, duration));

    // Animer la sortie
    alertElement.classList.add('alert-exit');

    // Retirer l'élément après l'animation
    await new Promise(resolve => setTimeout(resolve, 500));
    alertElement.remove();

    // Jouer l'alerte suivante
    this.playNext();
  }

  createAlertElement(type, data) {
    const clone = this.template.content.cloneNode(true);
    const alert = clone.querySelector('.alert');

    // Ajouter la classe de type
    alert.classList.add(type);

    // Remplir le contenu
    const typeElement = alert.querySelector('.alert-type');
    const messageElement = alert.querySelector('.alert-message');
    const submessageElement = alert.querySelector('.alert-submessage');

    // Obtenir le texte de l'alerte
    const alertText = this.getAlertText(type, data);

    typeElement.textContent = alertText.type;
    messageElement.textContent = alertText.message;
    submessageElement.textContent = alertText.submessage || '';

    return alert;
  }

  getAlertText(type, data) {
    const defaults = {
      follow: {
        type: 'Nouveau Follow',
        message: data.user || 'Un viewer',
        submessage: 'Merci pour le follow ! ❤️'
      },
      subscription: {
        type: 'Nouvel Abonné',
        message: data.user || 'Un viewer',
        submessage: data.tier ? `Abonnement Tier ${data.tier}` : 'Merci pour le sub ! ⭐'
      },
      donation: {
        type: 'Donation',
        message: data.user || 'Un donateur',
        submessage: data.amount ? `${data.amount}€` : 'Merci pour le don ! 💰'
      },
      raid: {
        type: 'Raid',
        message: data.user || 'Un streamer',
        submessage: data.viewers ? `${data.viewers} viewers !` : 'Merci pour le raid ! 🚀'
      },
      bits: {
        type: 'Bits',
        message: data.user || 'Un viewer',
        submessage: data.amount ? `${data.amount} bits` : 'Merci pour les bits ! 💎'
      }
    };

    // Si une configuration personnalisée existe
    const alertConfig = this.getAlertConfig(type);
    if (alertConfig && alertConfig.message) {
      const customMessage = utils.formatMessage(alertConfig.message, {
        user: data.user || 'Un viewer',
        amount: data.amount || '0',
        viewers: data.viewers || '0',
        tier: data.tier || '1'
      });

      return {
        type: defaults[type]?.type || type.toUpperCase(),
        message: customMessage,
        submessage: data.customMessage || defaults[type]?.submessage || ''
      };
    }

    return defaults[type] || {
      type: type.toUpperCase(),
      message: data.user || 'Un viewer',
      submessage: data.message || ''
    };
  }

  getAlertConfig(type) {
    if (!this.config || !this.config.alerts) return null;
    return this.config.alerts[type];
  }

  createAlertParticles(alertElement, type) {
    const particlesContainer = alertElement.querySelector('.alert-particles');
    const particleCount = 20;

    const colors = {
      follow: ['#9333ea', '#a855f7', '#c084fc'],
      subscription: ['#ec4899', '#f472b6', '#fb7185'],
      donation: ['#f59e0b', '#fbbf24', '#fcd34d'],
      raid: ['#ef4444', '#f87171', '#fca5a5'],
      bits: ['#3b82f6', '#60a5fa', '#93c5fd']
    };

    const particleColors = colors[type] || ['#ffffff'];

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';

      const size = Math.random() * 10 + 5;
      particle.style.width = size + 'px';
      particle.style.height = size + 'px';
      particle.style.background = particleColors[Math.floor(Math.random() * particleColors.length)];
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 1 + 's';
      particle.style.animationDuration = (Math.random() * 2 + 2) + 's';

      particlesContainer.appendChild(particle);
    }
  }

  screenShake() {
    document.body.classList.add('screen-shake');
    setTimeout(() => {
      document.body.classList.remove('screen-shake');
    }, 500);
  }
}

// Initialiser le système d'alertes
let alertSystem;
window.addEventListener('DOMContentLoaded', () => {
  alertSystem = new AlertSystem();
});

// Fonction de test pour les alertes
window.testAlert = (type = 'follow') => {
  const testData = {
    follow: { user: 'TestUser123' },
    subscription: { user: 'MegaSub', tier: 3 },
    donation: { user: 'GenerousDonor', amount: 50 },
    raid: { user: 'FriendlyStreamer', viewers: 250 },
    bits: { user: 'BitCheer', amount: 1000 }
  };

  if (window.alertSystem) {
    window.alertSystem.addAlert(type, testData[type] || {});
  } else {
    console.error('Système d\'alertes non initialisé');
  }
};
