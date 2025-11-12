# Sons pour les Overlays

Ce dossier contient les fichiers audio utilisés pour les alertes et événements de stream.

## Fichiers audio nécessaires

Pour que les alertes fonctionnent avec les sons, vous devez ajouter les fichiers audio suivants dans ce dossier :

### Alertes
- `follow.mp3` - Son joué lors d'un nouveau follow
- `sub.mp3` - Son joué lors d'un nouvel abonnement
- `donation.mp3` - Son joué lors d'une donation
- `raid.mp3` - Son joué lors d'un raid
- `bits.mp3` - Son joué lors d'un cheer de bits

### Overlays
- `start.mp3` - Son joué à la fin du countdown "Starting Soon"

## Où trouver des sons gratuits ?

Voici quelques ressources pour trouver des sons gratuits et libres de droits :

1. **Freesound** - https://freesound.org/
   - Large collection de sons gratuits
   - Vérifier les licences Creative Commons

2. **Mixkit** - https://mixkit.co/free-sound-effects/
   - Sons gratuits sans attribution requise
   - Qualité professionnelle

3. **Zapsplat** - https://www.zapsplat.com/
   - Grande bibliothèque de sons
   - Gratuit avec attribution

4. **SoundBible** - http://soundbible.com/
   - Sons simples et efficaces
   - Plusieurs formats disponibles

5. **YouTube Audio Library** - https://www.youtube.com/audiolibrary
   - Sons gratuits de YouTube
   - Pas d'attribution nécessaire

## Recommandations

- **Format** : MP3 ou WAV (MP3 recommandé pour la taille)
- **Durée** : 2-5 secondes pour les alertes
- **Volume** : Normaliser vos sons à -3dB pour éviter la saturation
- **Qualité** : 192kbps minimum pour MP3

## Configuration des volumes

Vous pouvez ajuster le volume de chaque son dans le fichier `config.json` :

```json
{
  "alerts": {
    "follow": {
      "volume": 0.7  // Valeur entre 0.0 et 1.0
    }
  }
}
```

## Tester vos sons

Ouvrez l'overlay d'alertes dans votre navigateur et utilisez la console :

```javascript
// Tester un son spécifique
utils.playSound('../../assets/sounds/follow.mp3', 0.7);

// Tester une alerte complète
window.testAlert('follow');
```
