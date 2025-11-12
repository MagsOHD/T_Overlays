class BRBOverlay {
  constructor() {
    this.timerEl = document.getElementById('timer');
    this.seconds = 0;
    this.init();
  }

  async init() {
    const config = await utils.loadConfig();

    if (config?.brb) {
      if (config.brb.messages?.length > 0) {
        this.startRandomMessages(config.brb.messages);
      }

      if (config.brb.showTimer !== false) {
        this.startTimer();
      } else {
        document.getElementById('timerCard').style.display = 'none';
      }
    } else {
      this.startTimer();
    }
  }

  startRandomMessages(messages) {
    const el = document.getElementById('message');
    let index = Math.floor(Math.random() * messages.length);
    el.textContent = messages[index];

    setInterval(() => {
      index = Math.floor(Math.random() * messages.length);
      el.style.opacity = '0';
      
      setTimeout(() => {
        el.textContent = messages[index];
        el.style.opacity = '1';
      }, 500);
    }, 10000);
  }

  startTimer() {
    setInterval(() => {
      this.seconds++;
      const mins = Math.floor(this.seconds / 60);
      const secs = this.seconds % 60;
      const minsStr = mins.toString().padStart(2, '0');
      const secsStr = secs.toString().padStart(2, '0');
      this.timerEl.textContent = minsStr + ':' + secsStr;
    }, 1000);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new BRBOverlay();
});
