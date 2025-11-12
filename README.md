# 🌸 Overlays de Stream - Safe Space & Design Pastel

Un système complet d'overlays de streaming conçu avec bienveillance, accessibilité et esthétique douce.

## ✨ Philosophie du Design

Ces overlays sont créés pour offrir un **espace chaleureux et accueillant** où chacun·e peut se sentir bien. Le design utilise :

- **Couleurs pastel apaisantes** (lavande, pêche, menthe, rose doux)
- **Animations douces** et non agressives
- **Typographie lisible** et confortable
- **Accessibilité** prioritaire (contraste, réduction de mouvement)
- **Messages inclusifs** et bienveillants

## 🎨 Overlays Inclus

### 1. **Starting Soon** ⏳
Écran de démarrage chaleureux avec :
- Countdown clair et doux
- Messages d'accueil rotatifs
- Formes décoratives subtiles
- Liens sociaux

### 2. **Be Right Back** ☕
Pause agréable avec :
- Timer en temps réel
- Messages changeants aléatoires
- Design apaisant
- Rappel que le chat est actif

### 3. **Stream Ended** 💜
Fin de stream reconnaissante avec :
- Remerciements chaleureux
- Liens sociaux
- Message pour le prochain stream

### 4. **Gameplay** 🎮
Overlay minimal pour le jeu :
- Bordure discrète
- Barre d'infos subtile
- Ne gêne pas le gameplay

### 5. **Gameplay + Chat** 🎮💬
Version avec chat visible :
- Chat à droite avec scroll
- Design intégré au thème
- Parfait pour l'interaction

### 6. **Alertes** 🔔
Notifications douces pour :
- Follows : "Bienvenue {user} ! 💜"
- Subs : "{user} s'est abonné·e ! ✨"
- Donations : "{user} a fait un don de {amount}€ 🌸"
- Raids : "{user} arrive avec {viewers} personnes ! 🎉"
- Bits : "{user} a envoyé {amount} bits ⭐"

## 🎨 Palette de Couleurs

```css
Lavande doux : #E0BBE4
Pêche : #FFDFD3
Menthe : #B4E7CE
Rose : #FFB3BA
Bleu ciel : #A2D5F2
Crème : #FFF9F5
Texte : #5A4A42
```

## 📦 Installation

### 1. Personnaliser la Configuration

Éditez `config.json` :

```json
{
  "streamer": {
    "name": "Votre Nom",
    "tagline": "Safe space pour chill et s'amuser 💜",
    "socials": {
      "twitch": "votre_twitch",
      "discord": "votre_discord"
    }
  },
  "theme": {
    "primaryColor": "#E0BBE4",
    "secondaryColor": "#FFDFD3",
    "accentColor": "#B4E7CE"
  }
}
```

### 2. Ajouter vos Sons

Placez vos fichiers audio dans `assets/sounds/` :
- `follow.mp3`
- `sub.mp3`
- `donation.mp3`
- `raid.mp3`
- `bits.mp3`

### 3. Configurer OBS/Streamlabs

1. **Ajouter une Source** → Navigateur
2. **URL locale** : `file:///CHEMIN_COMPLET/overlays/NOM_OVERLAY/index.html`
3. **Dimensions** : 1920x1080
4. **FPS** : 30+
5. Cocher "Actualiser quand la scène devient active"

## 🧪 Tester les Overlays

Ouvrez `index.html` dans votre navigateur pour naviguer entre tous les overlays.

Pour tester les alertes :
```javascript
// Ouvrez la console (F12) sur overlays/alerts/index.html
window.testAlert('follow')
window.testAlert('subscription')
window.testAlert('donation')
```

## ♿ Accessibilité

- **Contraste** : Tous les textes respectent WCAG AA
- **Mouvements** : Respect de `prefers-reduced-motion`
- **Focus** : Indicateurs visuels clairs
- **Langage** : Écriture inclusive et bienveillante

## 💜 Valeurs du Projet

- **Bienveillance** : Messages chaleureux et positifs
- **Inclusivité** : Langage neutre et accueillant
- **Accessibilité** : Design pour tou·tes
- **Bien-être** : Couleurs et animations apaisantes
- **Simplicité** : Interface épurée et claire

## 🛠️ Structure du Projet

```
T_Overlays/
├── overlays/
│   ├── starting-soon/    # Écran de démarrage
│   ├── brb/              # Pause
│   ├── ended/            # Fin de stream
│   ├── gameplay/         # Jeu minimal
│   ├── gameplay-chat/    # Jeu + chat
│   └── alerts/           # Notifications
├── assets/
│   ├── sounds/           # Fichiers audio
│   └── images/           # Images/logos
├── css/
│   └── global.css        # Styles globaux
├── js/
│   └── utils.js          # Utilitaires
├── config.json           # Configuration
└── index.html            # Page de navigation
```

## 🎯 Cas d'Usage

### Streamer Solo
- Overlay minimal pendant le jeu
- Alertes douces pour les interactions
- BRB pour les pauses

### Stream Communautaire
- Chat visible pendant le jeu
- Messages inclusifs et chaleureux
- Emphasis sur la bienveillance

### Just Chatting
- Starting Soon accueillant
- Alertes pour célébrer la communauté
- Ended avec reconnaissance

## 🌈 Personnalisation Avancée

### Changer les Couleurs

Dans `config.json`, modifiez les couleurs du thème :
```json
{
  "theme": {
    "primaryColor": "#VotreCouleur",
    "secondaryColor": "#VotreCouleur",
    "accentColor": "#VotreCouleur"
  }
}
```

### Messages Personnalisés

Chaque overlay a des messages configurables :
```json
{
  "startingSoon": {
    "welcomeMessages": [
      "Votre message 1",
      "Votre message 2"
    ]
  },
  "brb": {
    "messages": [
      "Votre raison 1",
      "Votre raison 2"
    ]
  }
}
```

## 📝 License

MIT License - Utilisez librement et avec bienveillance 💜

## 🙏 Remerciements

Merci d'utiliser ces overlays pour créer un espace accueillant et chaleureux sur vos streams !

---

**Créé avec 💜 pour la communauté streaming**
