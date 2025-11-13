# Overlays de Stream Organiques 🌿

Un système complet d'overlays de stream avec un design organique, cozy et accueillant. Créé pour offrir une expérience visuelle douce et bienveillante à vos viewers.

## ✨ Caractéristiques

- **Design Organique** : Formes blob naturelles et animations fluides
- **Couleurs Pastel** : Palette apaisante (lavande, pêche, menthe, crème)
- **Animations Douces** : Mouvements fluides et non intrusifs
- **Système de Configuration** : Tout se personnalise via `config-organic.json`
- **Compatible Streamlabs/OBS** : Fonctionne avec tous les logiciels de streaming

## 📁 Structure

```
T_Overlays/
├── css/
│   └── organic-global.css          # Système de design global
├── js/
│   └── utils.js                    # Utilitaires JavaScript
├── scenes/                         # Toutes les scènes
│   ├── starting-soon/              # Écran de démarrage
│   ├── brb/                        # Be Right Back (pause)
│   ├── ending/                     # Fin de stream
│   ├── gameplay/                   # Overlay de jeu minimal
│   ├── just-chatting/              # Scène de discussion
│   └── alerts/                     # Système d'alertes
├── config-organic.json             # Configuration principale
└── index-organic.html              # Page de navigation
```

## 🎨 Scènes Disponibles

### 1. Starting Soon ⏳
Écran d'attente avant le début du stream avec :
- Countdown configurable
- Messages rotatifs
- Liens réseaux sociaux
- Animations organiques douces

### 2. Be Right Back ☕
Écran de pause avec :
- Timer qui compte le temps écoulé
- Messages d'absence rotatifs (pause café, pipi, etc.)
- Design chaleureux et rassurant

### 3. Stream Ended 💜
Écran de fin avec :
- Message de remerciement
- Liens vers tous vos réseaux sociaux
- Annonce du prochain stream
- Call-to-action (follow, etc.)

### 4. Gameplay 🎮
Overlay minimal pour le jeu :
- Bordure organique subtile
- Coins décoratifs discrets
- Cadre webcam avec forme organique
- Mode minimal disponible (`?minimal=true`)

### 5. Just Chatting 💬
Scène pour discussions :
- Header personnalisable
- Zone pour sujet de discussion
- Espaces pour webcam et chat
- Socials affichés

### 6. Alerts 🔔
Système d'alertes complet :
- Follow, Subscription, Donation, Raid, Bits
- Animations organiques et particules
- Sons personnalisables
- File d'attente automatique
- Mode test intégré

## ⚙️ Configuration

Éditez `config-organic.json` pour personnaliser :

```json
{
  "streamer": {
    "name": "Votre Nom",
    "socials": {
      "twitch": "votre_twitch",
      "discord": "votre_discord",
      ...
    }
  },
  "scenes": {
    "startingSoon": {
      "countdownMinutes": 5,
      "messages": ["Message 1", "Message 2"]
    },
    ...
  },
  "alerts": {
    "follow": {
      "enabled": true,
      "duration": 4500,
      "sound": "assets/sounds/follow.mp3",
      "message": "{user} vient de follow !",
      ...
    }
  }
}
```

## 🚀 Installation dans OBS/Streamlabs

### Méthode 1 : Source Navigateur (recommandé)

1. Ajoutez une source → **Navigateur**
2. Dans "URL", mettez le chemin complet :
   ```
   file:///C:/chemin/complet/vers/T_Overlays/scenes/starting-soon/index.html
   ```
3. Dimensions : **1920 x 1080**
4. Cochez **"Actualiser quand la scène devient active"**
5. Cliquez sur OK

### Méthode 2 : Serveur Local (pour tests)

Si vous avez Python installé :

```bash
cd T_Overlays
python -m http.server 8000
```

Puis dans OBS, utilisez : `http://localhost:8000/scenes/starting-soon/index.html`

## 🧪 Tests

### Tester les Alertes

Ajoutez `?test=TYPE` à l'URL des alertes :

- `scenes/alerts/index.html?test=follow` - Follow
- `scenes/alerts/index.html?test=subscription` - Abonnement
- `scenes/alerts/index.html?test=donation` - Don
- `scenes/alerts/index.html?test=raid` - Raid
- `scenes/alerts/index.html?test=bits` - Bits

### Tester le Gameplay Minimal

`scenes/gameplay/index.html?minimal=true` - Mode ultra-discret

### Tester Just Chatting avec Sujet

`scenes/just-chatting/index.html?topic=Votre%20Sujet` - Définir un sujet

## 🎨 Personnalisation Avancée

### Modifier les Couleurs

Éditez `css/organic-global.css` :

```css
:root {
  --lavender: #D4C5F9;    /* Couleur principale */
  --peach: #FFD4C4;       /* Couleur secondaire */
  --mint: #B8E6D5;        /* Couleur accent */
  --cream: #FFF8F0;       /* Background clair */
  ...
}
```

### Modifier les Animations

Toutes les animations sont définies dans `organic-global.css` :
- `blobMorph` - Morphing des formes
- `floatSoft` - Flottement doux
- `pulseGlow` - Pulsation lumineuse
- etc.

## 🔊 Sons

Pour ajouter des sons d'alerte :

1. Créez un dossier `assets/sounds/`
2. Ajoutez vos fichiers audio (MP3, OGG, WAV)
3. Référencez-les dans `config-organic.json` :

```json
{
  "alerts": {
    "follow": {
      "sound": "assets/sounds/follow.mp3",
      "volume": 0.6
    }
  }
}
```

## 📱 Intégration Streamlabs

Pour connecter les alertes à Streamlabs :

1. Utilisez les **Custom Widgets**
2. Copiez l'URL de votre overlay d'alertes
3. Configurez les événements Streamlabs pour appeler :
   ```javascript
   window.showAlert({
     type: 'follow',
     user: '{name}'
   });
   ```

## 🐛 Résolution de Problèmes

### Les overlays ne s'affichent pas
- Vérifiez que le chemin du fichier est correct
- Assurez-vous d'utiliser `file:///` avec le chemin complet
- Vérifiez que les dimensions sont 1920x1080

### Les animations sont saccadées
- Activez l'accélération matérielle dans OBS
- Réduisez le nombre de sources dans votre scène
- Vérifiez que FPS shutdown est désactivé

### Le son ne fonctionne pas
- Vérifiez que les fichiers audio existent
- Vérifiez les permissions du dossier
- Testez avec un fichier audio différent

### La configuration ne se charge pas
- Vérifiez la syntaxe JSON (utilisez jsonlint.com)
- Assurez-vous que `config-organic.json` est au bon endroit
- Consultez la console du navigateur (F12 dans OBS)

## 💡 Conseils

- **Performance** : Les overlays sont optimisés, mais limitez le nombre de sources actives
- **Personnalisation** : Commencez par modifier `config-organic.json` avant de toucher au CSS
- **Tests** : Testez toujours vos overlays avant le stream
- **Backup** : Gardez une copie de votre config personnalisée

## 🎯 Roadmap

Fonctionnalités à venir :
- [ ] Transitions entre scènes
- [ ] Stinger transitions
- [ ] Système de goals
- [ ] Overlay pour raids sortants
- [ ] Widget chat intégré
- [ ] Thèmes de couleurs alternatifs

## 📄 Licence

Ce projet est libre d'utilisation pour vos streams personnels. Si vous le partagez ou le modifiez, merci de créditer la source originale.

## 🤝 Contribution

Les suggestions et améliorations sont les bienvenues ! N'hésitez pas à ouvrir une issue ou proposer des modifications.

---

Créé avec 💜 pour la communauté des streamers cozy
