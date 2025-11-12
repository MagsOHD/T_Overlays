class EndedOverlay {
  constructor() {
    this.init();
  }

  async init() {
    const config = await utils.loadConfig();

    if (config) {
      if (config.streamer?.socials) {
        this.applySocials(config.streamer.socials);
      }

      if (config.ended) {
        if (config.ended.submessage) {
          document.getElementById('message').textContent = config.ended.submessage;
        }
        if (config.ended.nextStream) {
          document.getElementById('nextStream').textContent = config.ended.nextStream;
        }
      }
    }
  }

  applySocials(socials) {
    if (socials.twitch) {
      document.getElementById('twitch').textContent = 'twitch.tv/' + socials.twitch;
    }
    if (socials.discord) {
      document.getElementById('discord').textContent = socials.discord;
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new EndedOverlay();
});
