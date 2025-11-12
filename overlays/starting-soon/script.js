class StartingSoonOverlay {
  constructor() {
    this.minutesEl = document.getElementById('minutes');
    this.secondsEl = document.getElementById('seconds');
    this.totalSeconds = 0;
    this.init();
  }

  async init() {
    const config = await utils.loadConfig();

    if (config) {
      // Appliquer les infos sociales
      if (config.streamer?.socials) {
        this.applySocials(config.streamer.socials);
      }

      // Appliquer le subtitle
      if (config.startingSoon?.subtitle) {
        document.getElementById('subtitle').textContent = config.startingSoon.subtitle;
      }

      // Messages d'accueil rotatifs
      if (config.startingSoon?.welcomeMessages) {
        this.startWelcomeMessages(config.startingSoon.welcomeMessages);
      }

      // Démarrer countdown
      const minutes = config.startingSoon?.countdownMinutes || 5;
      this.startCountdown(minutes * 60);
    } else {
      this.startCountdown(300);
    }
  }

  applySocials(socials) {
    if (socials.twitch) {
      document.getElementById('twitch').textContent = `twitch.tv/${socials.twitch}`;
    }
    if (socials.discord) {
      document.getElementById('discord').textContent = socials.discord;
    }
  }

  startWelcomeMessages(messages) {
    const el = document.getElementById('welcomeMessage');
    let index = 0;

    el.textContent = messages[0];

    setInterval(() => {
      index = (index + 1) % messages.length;
      el.style.opacity = '0';
      
      setTimeout(() => {
        el.textContent = messages[index];
        el.style.opacity = '1';
      }, 500);
    }, 8000);
  }

  startCountdown(seconds) {
    this.totalSeconds = seconds;
    this.updateDisplay();

    setInterval(() => {
      this.totalSeconds--;
      if (this.totalSeconds < 0) this.totalSeconds = 0;
      this.updateDisplay();
    }, 1000);
  }

  updateDisplay() {
    const mins = Math.floor(this.totalSeconds / 60);
    const secs = this.totalSeconds % 60;

    this.minutesEl.textContent = mins.toString().padStart(2, '0');
    this.secondsEl.textContent = secs.toString().padStart(2, '0');
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new StartingSoonOverlay();
});
