// Script pour l'overlay Stream Ended

class EndedOverlay {
  constructor() {
    this.init();
  }

  async init() {
    // Charger la configuration
    const config = await utils.loadConfig();

    if (config) {
      if (config.streamer) {
        this.applySocials(config.streamer.socials);
      }

      // Appliquer les messages personnalisés
      if (config.ended) {
        if (config.ended.message) {
          document.querySelector('.message-line.highlight').textContent = config.ended.message;
        }
        if (config.ended.submessage) {
          document.querySelector('.message-line:first-child').textContent = config.ended.submessage;
        }
        if (config.ended.nextStream) {
          document.querySelector('.next-stream p').textContent = config.ended.nextStream;
        }
      }
    }

    // Créer les effets visuels
    this.createConfetti();
    this.createFireworks();

    // Animer les statistiques (exemple)
    this.animateStats();

    // Créer des particules
    utils.createParticles(document.querySelector('.fireworks-container'), 25);
  }

  applySocials(socials) {
    if (socials.twitch) {
      document.getElementById('twitch').textContent = `twitch.tv/${socials.twitch}`;
    }
    if (socials.twitter) {
      document.getElementById('twitter').textContent = `@${socials.twitter}`;
    }
    if (socials.youtube) {
      document.getElementById('youtube').textContent = `youtube.com/@${socials.youtube}`;
    }
    if (socials.discord) {
      document.getElementById('discord').textContent = socials.discord;
    }
  }

  animateStats() {
    // Animer les statistiques avec un compteur
    this.animateCounter('viewers', 0, 147, 2000);
    this.animateCounter('followers', 0, 23, 2000);

    // Animer la durée
    setTimeout(() => {
      document.getElementById('duration').textContent = '3h42';
    }, 1000);
  }

  animateCounter(id, start, end, duration) {
    const element = document.getElementById(id);
    const startTime = Date.now();
    const prefix = id === 'followers' ? '+' : '';

    const updateCounter = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const value = Math.floor(start + (end - start) * progress);

      element.textContent = prefix + value;

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    };

    requestAnimationFrame(updateCounter);
  }

  createConfetti() {
    const container = document.querySelector('.confetti-container');
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];

    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDelay = Math.random() * 4 + 's';
      confetti.style.animationDuration = (Math.random() * 3 + 3) + 's';
      container.appendChild(confetti);
    }
  }

  createFireworks() {
    const container = document.querySelector('.fireworks-container');

    setInterval(() => {
      const x = Math.random() * window.innerWidth;
      const y = Math.random() * window.innerHeight * 0.5;

      this.createFirework(container, x, y);
    }, 1000);
  }

  createFirework(container, x, y) {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffffff'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const particleCount = 30;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'firework';
      particle.style.left = x + 'px';
      particle.style.top = y + 'px';
      particle.style.background = color;
      particle.style.boxShadow = `0 0 10px ${color}`;

      const angle = (Math.PI * 2 * i) / particleCount;
      const velocity = 50 + Math.random() * 50;
      const tx = Math.cos(angle) * velocity;
      const ty = Math.sin(angle) * velocity;

      particle.style.setProperty('--x', tx + 'px');
      particle.style.setProperty('--y', ty + 'px');

      container.appendChild(particle);

      setTimeout(() => {
        particle.remove();
      }, 1000);
    }
  }
}

// Initialiser l'overlay
window.addEventListener('DOMContentLoaded', () => {
  new EndedOverlay();
});
