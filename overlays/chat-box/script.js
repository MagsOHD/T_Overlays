// Script pour le Chat Box

class ChatBox {
  constructor() {
    this.messagesContainer = document.getElementById('chatMessages');
    this.template = document.getElementById('messageTemplate');
    this.maxMessages = 10;
    this.messages = [];

    this.init();
  }

  async init() {
    // Charger la configuration
    await utils.loadConfig();

    // Écouter les messages (pour les intégrations)
    window.addEventListener('message', (event) => {
      if (event.data.type === 'chat') {
        this.addMessage(event.data.data);
      }
    });

    // Exposer une méthode globale
    window.addChatMessage = (data) => this.addMessage(data);

    // Afficher un message par défaut
    this.showNoMessages();

    console.log('Chat box initialisé');
  }

  showNoMessages() {
    if (this.messages.length === 0) {
      const noMessages = document.createElement('div');
      noMessages.className = 'no-messages';
      noMessages.textContent = 'En attente de messages...';
      this.messagesContainer.appendChild(noMessages);
    }
  }

  addMessage(data) {
    // Retirer le message "no messages"
    const noMessages = this.messagesContainer.querySelector('.no-messages');
    if (noMessages) {
      noMessages.remove();
    }

    // Créer le message
    const messageElement = this.createMessageElement(data);
    this.messagesContainer.appendChild(messageElement);
    this.messages.push(messageElement);

    // Limiter le nombre de messages
    if (this.messages.length > this.maxMessages) {
      const oldMessage = this.messages.shift();
      oldMessage.style.animation = 'messageSlideOut 0.3s ease-out';
      setTimeout(() => oldMessage.remove(), 300);
    }

    // Scroll vers le bas
    this.scrollToBottom();
  }

  createMessageElement(data) {
    const clone = this.template.content.cloneNode(true);
    const message = clone.querySelector('.chat-message');

    // Type de message
    if (data.highlight) {
      message.classList.add('highlight');
    }
    if (data.system) {
      message.classList.add('system');
    }

    // Avatar
    const avatar = message.querySelector('.message-avatar');
    if (data.avatarUrl) {
      avatar.style.backgroundImage = `url(${data.avatarUrl})`;
      avatar.style.backgroundSize = 'cover';
    } else {
      // Utiliser la première lettre du nom
      avatar.textContent = (data.username || 'U')[0];
    }

    // Username
    const username = message.querySelector('.message-username');
    username.textContent = data.username || 'Anonyme';
    username.style.color = data.color || '#f1c40f';

    // Badges
    const badgesContainer = message.querySelector('.message-badges');
    if (data.badges && data.badges.length > 0) {
      data.badges.forEach(badge => {
        const badgeElement = document.createElement('span');
        badgeElement.className = `badge ${badge.toLowerCase()}`;
        badgeElement.textContent = badge;
        badgesContainer.appendChild(badgeElement);
      });
    }

    // Message text
    const messageText = message.querySelector('.message-text');
    messageText.innerHTML = this.formatMessage(data.message || '');

    return message;
  }

  formatMessage(text) {
    // Convertir les emojis simples
    text = text.replace(/:\)/g, '😊')
               .replace(/:\(/g, '😢')
               .replace(/:D/g, '😃')
               .replace(/:P/g, '😛')
               .replace(/<3/g, '❤️')
               .replace(/\bLUL\b/g, '😂')
               .replace(/\bPogChamp\b/g, '😮')
               .replace(/\bKappa\b/g, '🙃');

    // Échapper le HTML
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  scrollToBottom() {
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }
}

// Initialiser le chat box
let chatBox;
window.addEventListener('DOMContentLoaded', () => {
  chatBox = new ChatBox();
});

// Fonction de test
window.testChat = () => {
  const testMessages = [
    {
      username: 'StreamerPro',
      message: 'Salut tout le monde ! 👋',
      color: '#9147ff',
      badges: ['MOD']
    },
    {
      username: 'MegaFan',
      message: 'Super stream ! :D',
      color: '#ff0000',
      badges: ['SUB', 'VIP']
    },
    {
      username: 'NewViewer',
      message: 'Première fois que je regarde, c\'est cool !',
      color: '#00ff00'
    },
    {
      username: 'System',
      message: 'Bienvenue dans le chat !',
      system: true
    },
    {
      username: 'GenerousDonor',
      message: 'Voici 50€ pour le stream ! <3',
      highlight: true,
      color: '#f1c40f'
    }
  ];

  testMessages.forEach((msg, index) => {
    setTimeout(() => {
      if (window.chatBox) {
        window.chatBox.addMessage(msg);
      }
    }, index * 1000);
  });
};
