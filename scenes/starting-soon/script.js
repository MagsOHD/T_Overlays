class StartingSoonScene {
  constructor() {
    this.minutesEl = document.getElementById('minutes');
    this.secondsEl = document.getElementById('seconds');
    this.messageEl = document.getElementById('message');
    this.totalSeconds = 0;
    this.messages = [];
    this.currentMessageIndex = 0;
    this.init();
  }

  async init() {
    try {
      const response = await fetch('../../config-organic.json');
      const config = await response.json();
      
      if (config) {
        this.applyConfig(config);
      }
      
      this.startCountdown(this.totalSeconds || 300);
      this.startMessageRotation();
    } catch (error) {
      console.log('Using default config');
      this.startCountdown(300);
      this.messages = ['Le stream commence bientôt...'];
    }
  }

  applyConfig(config) {
    if (config.scenes?.startingSoon) {
      const scene = config.scenes.startingSoon;
      
      // Titre et subtitle
      if (scene.title) {
        document.querySelector('.main-title').textContent = scene.title;
      }
      if (scene.subtitle) {
        document.querySelector('.subtitle').textContent = scene.subtitle;
      }
      
      // Messages rotatifs
      if (scene.messages) {
        this.messages = scene.messages;
      }
      
      // Countdown
      if (scene.countdownMinutes) {
        this.totalSeconds = scene.countdownMinutes * 60;
      }
    }
    
    // Socials
    if (config.streamer?.socials) {
      if (config.streamer.socials.twitch) {
        document.getElementById('twitch').textContent = 'twitch.tv/' + config.streamer.socials.twitch;
      }
      if (config.streamer.socials.discord) {
        document.getElementById('discord').textContent = config.streamer.socials.discord;
      }
    }
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

  startMessageRotation() {
    if (this.messages.length === 0) return;

    this.messageEl.textContent = this.messages[0];

    setInterval(() => {
      this.currentMessageIndex = (this.currentMessageIndex + 1) % this.messages.length;
      
      this.messageEl.style.opacity = '0';
      
      setTimeout(() => {
        this.messageEl.textContent = this.messages[this.currentMessageIndex];
        this.messageEl.style.opacity = '1';
      }, 300);
    }, 6000);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new StartingSoonScene();
});
