class JustChattingScene {
  constructor() {
    this.config = null;
    this.currentTopic = '';
  }

  async init() {
    try {
      // Charger la configuration
      const response = await fetch('../../config-organic.json');
      this.config = await response.json();

      // Appliquer la configuration
      this.applyConfig();

      // Vérifier les paramètres URL
      this.checkUrlParams();

      console.log('✅ Just Chatting scene initialized');
    } catch (error) {
      console.error('❌ Error initializing Just Chatting scene:', error);
      this.useFallbackConfig();
    }
  }

  applyConfig() {
    const jcConfig = this.config.scenes.justChatting;
    const streamerConfig = this.config.streamer;

    // Appliquer le titre si configuré
    const titleElement = document.getElementById('title');
    if (titleElement && jcConfig.title) {
      titleElement.textContent = jcConfig.title;
    }

    // Appliquer le sous-titre si configuré
    const subtitleElement = document.getElementById('subtitle');
    if (subtitleElement && jcConfig.subtitle) {
      subtitleElement.textContent = jcConfig.subtitle;
    }

    // Configurer les réseaux sociaux
    this.setupSocials(streamerConfig.socials);

    // Masquer/afficher les placeholders selon la config
    if (jcConfig.showWebcam === false) {
      const webcam = document.querySelector('.webcam-placeholder');
      if (webcam) webcam.style.display = 'none';
    }

    if (jcConfig.showChat === false) {
      const chat = document.querySelector('.chat-placeholder');
      if (chat) chat.style.display = 'none';
    }
  }

  setupSocials(socials) {
    // Twitch
    const twitchHandle = document.getElementById('twitchHandle');
    const twitchSocial = document.getElementById('twitchSocial');
    if (socials.twitch && twitchHandle) {
      twitchHandle.textContent = `twitch.tv/${socials.twitch}`;
    } else if (twitchSocial) {
      twitchSocial.style.display = 'none';
    }

    // Discord
    const discordHandle = document.getElementById('discordHandle');
    const discordSocial = document.getElementById('discordSocial');
    if (socials.discord && discordHandle) {
      discordHandle.textContent = socials.discord;
    } else if (discordSocial) {
      discordSocial.style.display = 'none';
    }

    // Masquer le séparateur si un des deux n'est pas affiché
    const separator = document.querySelector('.social-separator');
    if (separator && (!socials.twitch || !socials.discord)) {
      separator.style.display = 'none';
    }
  }

  checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);

    // Paramètre pour définir un sujet de discussion
    const topic = urlParams.get('topic');
    if (topic) {
      this.setTopic(decodeURIComponent(topic));
    }

    // Mode sans placeholders (si on ajoute webcam/chat directement dans OBS)
    if (urlParams.get('placeholders') === 'false') {
      document.body.classList.add('no-placeholders');
      console.log('🎨 Placeholders hidden');
    }
  }

  setTopic(topic) {
    const topicText = document.getElementById('topicText');
    if (topicText) {
      // Fade out
      topicText.style.opacity = '0';

      setTimeout(() => {
        topicText.textContent = topic;
        this.currentTopic = topic;
        // Fade in
        topicText.style.opacity = '1';
      }, 500);
    }
  }

  useFallbackConfig() {
    console.log('📝 Using fallback configuration');
    // Les valeurs par défaut sont déjà dans le HTML
  }
}

// Initialiser la scène quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
  const scene = new JustChattingScene();
  scene.init();

  // Exposer la fonction setTopic pour utilisation externe (StreamElements, etc.)
  window.setTopic = (topic) => {
    scene.setTopic(topic);
  };
});
