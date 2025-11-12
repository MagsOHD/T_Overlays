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
    this.config = await utils.loadConfig();
    
    window.addEventListener('message', (e) => {
      if (e.data.type && e.data.data) {
        this.addAlert(e.data.type, e.data.data);
      }
    });

    window.triggerAlert = (type, data) => this.addAlert(type, data);
    console.log('Système d\'alertes prêt');
  }

  addAlert(type, data) {
    this.queue.push({ type, data });
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
    const { type, data } = this.queue.shift();
    await this.showAlert(type, data);
  }

  async showAlert(type, data) {
    const alertEl = this.createAlertElement(type, data);
    this.container.appendChild(alertEl);

    const config = this.getAlertConfig(type);
    
    if (config?.sound) {
      try {
        utils.playSound(config.sound, config.volume || 0.6);
      } catch (e) {
        console.log('Son non disponible');
      }
    }

    const duration = config?.duration || 5000;
    await new Promise(r => setTimeout(r, duration));

    alertEl.classList.add('exiting');
    await new Promise(r => setTimeout(r, 400));
    alertEl.remove();

    this.playNext();
  }

  createAlertElement(type, data) {
    const clone = this.template.content.cloneNode(true);
    const alert = clone.querySelector('.alert');
    alert.classList.add(type);

    const icon = alert.querySelector('.alert-icon');
    const message = alert.querySelector('.alert-message');
    const submessage = alert.querySelector('.alert-submessage');

    const icons = {
      follow: '💜',
      subscription: '✨',
      donation: '🌸',
      raid: '🎉',
      bits: '⭐'
    };

    icon.textContent = icons[type] || '💫';

    const config = this.getAlertConfig(type);
    if (config?.message) {
      const msg = utils.formatMessage(config.message, {
        user: data.user || 'Un viewer',
        amount: data.amount || '0',
        viewers: data.viewers || '0',
        tier: data.tier || '1'
      });
      message.textContent = msg;
    } else {
      message.textContent = data.user || 'Un viewer';
    }

    if (config?.submessage) {
      submessage.textContent = config.submessage;
    } else {
      submessage.textContent = 'Merci !';
    }

    return alert;
  }

  getAlertConfig(type) {
    return this.config?.alerts?.[type] || null;
  }
}

let alertSystem;
window.addEventListener('DOMContentLoaded', () => {
  alertSystem = new AlertSystem();
});

window.testAlert = (type = 'follow') => {
  const testData = {
    follow: { user: 'TestUser' },
    subscription: { user: 'MegaSub', tier: 3 },
    donation: { user: 'GenerousDonor', amount: 50 },
    raid: { user: 'FriendlyStreamer', viewers: 250 },
    bits: { user: 'BitCheer', amount: 1000 }
  };

  if (window.alertSystem) {
    window.alertSystem.addAlert(type, testData[type] || {});
  }
};
