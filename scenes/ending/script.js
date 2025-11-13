class EndingScene {
  constructor() {
    this.config = null;
  }

  async init() {
    try {
      // Charger la configuration
      const response = await fetch('../../config-organic.json');
      this.config = await response.json();

      // Appliquer la configuration
      this.applyConfig();

      console.log('✅ Ending scene initialized');
    } catch (error) {
      console.error('❌ Error initializing ending scene:', error);
      this.useFallbackConfig();
    }
  }

  applyConfig() {
    const endingConfig = this.config.scenes.ending;
    const streamerConfig = this.config.streamer;

    // Appliquer les textes principaux
    const titleElement = document.getElementById('title');
    if (titleElement && endingConfig.title) {
      titleElement.textContent = endingConfig.title;
    }

    const subtitleElement = document.getElementById('subtitle');
    if (subtitleElement && endingConfig.subtitle) {
      subtitleElement.textContent = endingConfig.subtitle;
    }

    const nextStreamElement = document.getElementById('nextStream');
    if (nextStreamElement && endingConfig.nextStreamMessage) {
      nextStreamElement.textContent = endingConfig.nextStreamMessage;
    }

    const ctaElement = document.getElementById('cta');
    if (ctaElement && endingConfig.callToAction) {
      ctaElement.textContent = endingConfig.callToAction;
    }

    // Configurer les liens sociaux
    this.setupSocialLinks(streamerConfig.socials);
  }

  setupSocialLinks(socials) {
    // Twitch
    const twitchLink = document.getElementById('twitchLink');
    const twitchName = document.getElementById('twitchName');
    if (twitchLink && socials.twitch) {
      twitchLink.href = `https://twitch.tv/${socials.twitch}`;
      if (twitchName) {
        twitchName.textContent = socials.twitch;
      }
    } else if (twitchLink) {
      twitchLink.style.display = 'none';
    }

    // Discord
    const discordLink = document.getElementById('discordLink');
    const discordName = document.getElementById('discordName');
    if (discordLink && socials.discord) {
      discordLink.href = `https://discord.gg/${socials.discord}`;
      if (discordName) {
        discordName.textContent = socials.discord;
      }
    } else if (discordLink) {
      discordLink.style.display = 'none';
    }

    // Twitter
    const twitterLink = document.getElementById('twitterLink');
    const twitterName = document.getElementById('twitterName');
    if (twitterLink && socials.twitter) {
      twitterLink.href = `https://twitter.com/${socials.twitter}`;
      if (twitterName) {
        twitterName.textContent = `@${socials.twitter}`;
      }
    } else if (twitterLink) {
      twitterLink.style.display = 'none';
    }

    // YouTube
    const youtubeLink = document.getElementById('youtubeLink');
    const youtubeName = document.getElementById('youtubeName');
    if (youtubeLink && socials.youtube) {
      youtubeLink.href = `https://youtube.com/${socials.youtube}`;
      if (youtubeName) {
        youtubeName.textContent = socials.youtube;
      }
    } else if (youtubeLink) {
      youtubeLink.style.display = 'none';
    }
  }

  useFallbackConfig() {
    console.log('📝 Using fallback configuration');
    // Les valeurs par défaut sont déjà dans le HTML
  }
}

// Initialiser la scène quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
  const scene = new EndingScene();
  scene.init();
});
