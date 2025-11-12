# 🎮 Overlays de Stream Professionnels

Un système complet d'overlays de streaming avec animations, sons et effets visuels pour OBS, Streamlabs, et autres logiciels de streaming.

## ✨ Fonctionnalités

### Overlays Inclus

1. **Starting Soon** - Écran de démarrage avec countdown
   - Countdown personnalisable
   - Animations fluides
   - Affichage des réseaux sociaux
   - Particules animées

2. **Be Right Back (BRB)** - Écran de pause
   - Timer en temps réel
   - Animations de café
   - Messages personnalisables
   - Effets visuels dynamiques

3. **Stream Ended** - Écran de fin
   - Statistiques du stream
   - Effets de confettis et feux d'artifice
   - Remerciements animés
   - Liens sociaux

4. **Système d'Alertes** - Alertes en temps réel
   - Follows
   - Subscriptions
   - Donations
   - Raids
   - Bits/Cheers
   - Sons personnalisables
   - Animations uniques par type
   - File d'attente automatique

5. **Chat Box** - Affichage du chat en direct
   - Design moderne et transparent
   - Badges (MOD, VIP, SUB)
   - Couleurs personnalisables
   - Limite de messages configurable

## 📁 Structure du Projet

```
T_Overlays/
├── overlays/
│   ├── starting-soon/    # Overlay de démarrage
│   ├── brb/              # Overlay Be Right Back
│   ├── ended/            # Overlay de fin
│   ├── alerts/           # Système d'alertes
│   └── chat-box/         # Chat box en direct
├── assets/
│   ├── sounds/           # Fichiers audio
│   ├── images/           # Images et logos
│   └── fonts/            # Polices personnalisées
├── css/
│   └── global.css        # Styles globaux
├── js/
│   └── utils.js          # Utilitaires JS
└── config.json           # Configuration centrale
```

## 🚀 Installation

### 1. Télécharger le Projet

```bash
git clone https://github.com/votre-username/T_Overlays.git
cd T_Overlays
```

### 2. Configuration

Éditez le fichier `config.json` pour personnaliser vos overlays :

```json
{
  "streamer": {
    "name": "Votre Nom",
    "socials": {
      "twitch": "votre_twitch",
      "twitter": "votre_twitter",
      "youtube": "votre_youtube",
      "discord": "votre_discord"
    }
  },
  "theme": {
    "primaryColor": "#6441a5",
    "secondaryColor": "#9147ff",
    "accentColor": "#f1c40f"
  }
}
```

### 3. Ajouter vos Sons

Placez vos fichiers audio dans `assets/sounds/` :
- `follow.mp3`
- `sub.mp3`
- `donation.mp3`
- `raid.mp3`
- `bits.mp3`
- `start.mp3`

Voir `assets/sounds/README.md` pour les recommandations et ressources.

### 4. Ajouter votre Logo

Placez votre logo dans `assets/images/logo.png` pour qu'il apparaisse dans les overlays.

## 🎥 Configuration OBS/Streamlabs

### Ajouter un Overlay

1. **Ouvrir OBS/Streamlabs**
2. **Ajouter une Source** → **Navigateur**
3. **Configurer la source :**
   - **URL locale** : `file:///CHEMIN_COMPLET/T_Overlays/overlays/OVERLAY_NAME/index.html`
   - **Largeur** : 1920
   - **Hauteur** : 1080
   - **FPS** : 30 ou plus
   - Cocher "Actualiser le navigateur quand la scène devient active"

### Exemples d'URLs

```
Starting Soon:
file:///C:/Users/VotreNom/T_Overlays/overlays/starting-soon/index.html

Alertes:
file:///C:/Users/VotreNom/T_Overlays/overlays/alerts/index.html

Chat Box:
file:///C:/Users/VotreNom/T_Overlays/overlays/chat-box/index.html
```

**Note Linux/Mac :**
- Linux : `file:///home/user/T_Overlays/overlays/...`
- Mac : `file:///Users/votrenom/T_Overlays/overlays/...`

## 🔧 Personnalisation Avancée

### Modifier les Couleurs

Éditez `config.json` pour changer les couleurs du thème :

```json
{
  "theme": {
    "primaryColor": "#6441a5",    // Couleur principale
    "secondaryColor": "#9147ff",  // Couleur secondaire
    "accentColor": "#f1c40f",     // Couleur d'accent
    "backgroundColor": "#1a1a2e", // Couleur de fond
    "textColor": "#ffffff"        // Couleur du texte
  }
}
```

### Modifier les Animations

Les animations sont définies dans les fichiers CSS de chaque overlay. Exemple dans `overlays/alerts/style.css` :

```css
@keyframes alertSlideIn {
  0% {
    opacity: 0;
    transform: translateY(-100px) scale(0.5);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
```

### Durée des Alertes

Modifiez la durée d'affichage dans `config.json` :

```json
{
  "alerts": {
    "follow": {
      "duration": 5000,  // en millisecondes (5 secondes)
      "volume": 0.7
    }
  }
}
```

## 🧪 Tests

### Tester les Alertes

Ouvrez `overlays/alerts/index.html` dans votre navigateur et utilisez la console :

```javascript
// Tester une alerte de follow
window.testAlert('follow');

// Tester une alerte de donation
window.testAlert('donation');

// Tester avec des données personnalisées
window.alertSystem.addAlert('subscription', {
  user: 'TestUser',
  tier: 3
});
```

### Tester le Chat

Ouvrez `overlays/chat-box/index.html` et utilisez :

```javascript
// Ajouter des messages de test
window.testChat();

// Ajouter un message personnalisé
window.addChatMessage({
  username: 'TestUser',
  message: 'Hello World!',
  color: '#ff0000',
  badges: ['SUB']
});
```

## 🔗 Intégration avec Streamlabs/StreamElements

### StreamElements

Pour intégrer les alertes avec StreamElements :

1. Allez dans **StreamElements Dashboard**
2. **My Overlays** → **Alertbox**
3. **Settings** → **Custom HTML/CSS/JS**
4. Copiez le code d'intégration depuis `docs/streamelements-integration.js`

### Streamlabs

Pour Streamlabs :

1. **Streamlabs Dashboard** → **Alert Box**
2. **Settings** → **Enable Custom HTML/CSS/JS**
3. Utilisez le code d'intégration depuis `docs/streamlabs-integration.js`

## 🎨 Captures d'Écran

### Starting Soon
![Starting Soon](docs/screenshots/starting-soon.png)

### Alertes
![Alerts](docs/screenshots/alerts.png)

### BRB
![BRB](docs/screenshots/brb.png)

### Stream Ended
![Ended](docs/screenshots/ended.png)

## 📱 Responsive Design

Tous les overlays sont responsive et s'adaptent à différentes résolutions :
- 1920x1080 (Full HD) - Recommandé
- 1280x720 (HD)
- 2560x1440 (2K)
- 3840x2160 (4K)

## 🐛 Dépannage

### Les sons ne fonctionnent pas
- Vérifiez que les fichiers audio sont dans `assets/sounds/`
- Vérifiez les permissions des fichiers
- Dans OBS, assurez-vous que "Contrôler le son via OBS" est activé

### L'overlay ne s'affiche pas
- Vérifiez le chemin du fichier (doit être absolu)
- Ouvrez la console du navigateur dans OBS (clic droit → Interact)
- Vérifiez les erreurs JavaScript

### Les animations sont saccadées
- Augmentez le FPS dans les propriétés de la source navigateur (30+)
- Désactivez l'accélération matérielle si problème persiste
- Réduisez le nombre de particules dans `utils.js`

### Les alertes ne s'affichent pas
- Vérifiez que `enabled: true` dans `config.json`
- Testez avec `window.testAlert()` dans la console
- Vérifiez les erreurs dans la console

## 📝 License

Ce projet est sous licence MIT. Vous êtes libre de l'utiliser, le modifier et le distribuer.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
- Signaler des bugs
- Proposer des améliorations
- Ajouter de nouveaux overlays
- Améliorer la documentation

## 💬 Support

Pour toute question ou problème :
- Ouvrez une issue sur GitHub
- Rejoignez notre Discord (si applicable)
- Consultez la documentation complète

## 🎉 Remerciements

Merci d'utiliser ces overlays pour vos streams ! N'oubliez pas de :
- ⭐ Star ce repo si vous l'aimez
- 🐛 Signaler les bugs
- 💡 Partager vos idées d'amélioration

---

**Bon stream ! 🎮✨**
