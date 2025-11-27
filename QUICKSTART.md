# 🚀 Quick Start Guide - 5 Minutes Setup

Ce guide vous permet de lancer la plateforme complète en **5 minutes**.

---

## ✅ Prérequis

Assurez-vous d'avoir installé :
- ✅ **Docker** (version 20.10+)
- ✅ **Docker Compose** (version 2.0+)
- ✅ **Git**
- ⚠️ **Make** (optionnel, pour commandes simplifiées)

> **Note Windows** : Utilisez WSL2 + Docker Desktop

---

## 📦 Installation

### Option 1 : Avec Make (recommandé)

```bash
# 1. Cloner le repository
git clone <repo-url> esports-platform
cd esports-platform

# 2. Setup complet automatique
make setup

# 3. Créer un utilisateur admin
make laravel-admin
# Suivez les instructions pour créer username/email/password

# 4. Démarrer les services
make up

# ✅ C'est prêt ! Voir les URLs ci-dessous
```

---

### Option 2 : Manuel (sans Make)

```bash
# 1. Cloner le repository
git clone <repo-url> esports-platform
cd esports-platform

# 2. Copier la configuration
cp .env.example .env

# 3. Build les containers
docker-compose build

# 4. Démarrer les services
docker-compose up -d

# 5. Installer les dépendances
docker-compose exec laravel composer install
docker-compose exec nestjs npm install
docker-compose exec frontend npm install

# 6. Générer la clé Laravel
docker-compose exec laravel php artisan key:generate

# 7. Migrations de base de données
docker-compose exec laravel php artisan migrate

# 8. Seed les données de test
docker-compose exec laravel php artisan db:seed

# 9. Créer un admin
docker-compose exec laravel php artisan make:filament-user

# ✅ C'est prêt !
```

---

## 🌐 Accès aux Services

Une fois démarré, vous pouvez accéder à :

| Service | URL | Description |
|---------|-----|-------------|
| 🎨 **Frontend React** | http://localhost:3000 | Interface utilisateur principale |
| 🔧 **Laravel API** | http://localhost:8000/api | API REST (JSON) |
| 👨‍💼 **Admin Panel** | http://localhost:8000/admin | Back-office Filament |
| 🔌 **WebSocket** | ws://localhost:3001 | Connexion temps réel |
| 🐘 **pgAdmin** | http://localhost:5050 | GUI PostgreSQL |
| 📦 **Redis Commander** | http://localhost:8081 | GUI Redis |

---

## 🧪 Tester la Plateforme

### 1. Créer un Tournoi via l'Admin Panel

1. Ouvrir http://localhost:8000/admin
2. Se connecter avec vos credentials admin
3. Aller dans **Tournaments** → **New**
4. Remplir le formulaire :
   - **Name**: Summer Cup 2025
   - **Game**: League of Legends
   - **Format**: Single Elimination
   - **Team Size**: 5
   - **Max Teams**: 16
   - **Start Date**: Date future
5. Sauvegarder

### 2. Tester l'API REST

```bash
# Get all tournaments
curl http://localhost:8000/api/tournaments

# Get tournament by ID
curl http://localhost:8000/api/tournaments/1

# Create a team (requires authentication)
curl -X POST http://localhost:8000/api/tournaments/1/teams \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "team_name": "Fnatic",
    "team_tag": "FNC",
    "players": [
      {"ign": "Rekkles", "role": "ADC"},
      {"ign": "Caps", "role": "Mid"}
    ]
  }'
```

### 3. Tester le WebSocket

Ouvrir la console du navigateur sur http://localhost:3000 :

```javascript
// Se connecter au WebSocket
const socket = io('ws://localhost:3001');

// Écouter les événements
socket.on('connected', (data) => {
  console.log('Connected:', data);
});

socket.on('notification', (data) => {
  console.log('Notification:', data);
});

// Rejoindre un tournoi
socket.emit('join_tournament', { tournamentId: 1 });

socket.on('team_registered', (data) => {
  console.log('New team registered:', data);
});
```

---

## 📊 Données de Test

Après `make seed`, vous avez :

- ✅ 1 utilisateur admin (credentials que vous avez créés)
- ✅ 1 tournoi de démonstration (Summer Cup 2025)
- ✅ 5 équipes de test
- ✅ 25 joueurs de test
- ✅ Quelques matchs pré-générés

---

## 🔍 Logs & Debugging

### Voir tous les logs en temps réel
```bash
make logs
# OU
docker-compose logs -f
```

### Logs spécifiques
```bash
make logs-laravel   # Laravel API
make logs-nestjs    # NestJS WebSocket
make logs-frontend  # React Frontend
```

### Shell dans un container
```bash
make shell-laravel    # PHP shell
make shell-nestjs     # Node.js shell
make shell-postgres   # psql PostgreSQL
make shell-redis      # redis-cli
```

### Vérifier l'état des services
```bash
docker-compose ps
```

Vous devriez voir tous les services en **Up** :
```
NAME                    STATUS
esports_frontend        Up
esports_laravel         Up
esports_nestjs          Up
esports_postgres        Up (healthy)
esports_redis           Up (healthy)
esports_nginx           Up
```

---

## 🛑 Arrêter les Services

```bash
# Arrêter tous les services
make down
# OU
docker-compose down

# Arrêter ET supprimer les volumes (⚠️ perte de données)
docker-compose down -v
```

---

## 🔄 Redémarrer depuis Zéro

```bash
# Tout supprimer et recommencer
make clean
make setup
make up
```

⚠️ **Attention** : Cela supprime toutes les données (tournois, équipes, etc.)

---

## 🐛 Problèmes Fréquents

### Port déjà utilisé
```
Error: bind: address already in use
```

**Solution** : Un service utilise déjà le port.

```bash
# Trouver le processus
sudo lsof -i :8000   # Remplacer 8000 par le port problématique

# Tuer le processus
sudo kill -9 PID

# OU changer le port dans docker-compose.yml
```

---

### Laravel : APP_KEY not set
```
RuntimeException: No application encryption key has been specified.
```

**Solution** :
```bash
docker-compose exec laravel php artisan key:generate
```

---

### NestJS : Cannot connect to Redis
```
Error: connect ECONNREFUSED redis:6379
```

**Solution** : Attendre que Redis soit prêt (health check)

```bash
# Vérifier que Redis est up
docker-compose ps redis

# Redémarrer NestJS
docker-compose restart nestjs
```

---

### PostgreSQL : Database does not exist
```
SQLSTATE[08006]: Connection failure: database "esports_tournament" does not exist
```

**Solution** :
```bash
# Vérifier que le script init.sql s'est exécuté
docker-compose logs postgres | grep init.sql

# Si besoin, recréer la DB
docker-compose down -v
docker-compose up -d
```

---

### Frontend : Module not found
```
Error: Cannot find module '@tanstack/react-query'
```

**Solution** :
```bash
docker-compose exec frontend npm install
```

---

## 🚀 Prochaines Étapes

Maintenant que tout fonctionne :

1. **Lire la documentation complète** : [README-HYBRID-PLATFORM.md](./README-HYBRID-PLATFORM.md)
2. **Explorer l'architecture** : [ARCHITECTURE.md](./ARCHITECTURE.md)
3. **Développer** : Ajouter vos fonctionnalités
4. **Tester** : `make test`
5. **Déployer** : Voir section déploiement dans le README

---

## 📚 Commandes Utiles

```bash
# Développement
make dev              # Quick start dev
make logs             # Voir tous les logs
make test             # Lancer tous les tests

# Laravel
make laravel-cache    # Clear caches
make laravel-queue    # Start queue worker
make laravel-tinker   # REPL PHP

# Database
make migrate          # Run migrations
make seed             # Seed database
make db-refresh       # Fresh + seed

# Cleanup
make clean-cache      # Clear caches only
make clean            # Delete everything
```

---

## 💡 Astuces

### Live Reload
Tous les services ont le hot-reload activé :
- **Laravel** : Auto-reload sur changement fichier
- **NestJS** : `npm run start:dev` avec watch mode
- **React** : Hot Module Replacement (HMR)

### Debugging Laravel
```bash
# Tinker REPL
make laravel-tinker

# Query log
\DB::enableQueryLog();
// ... vos requêtes
dd(\DB::getQueryLog());
```

### Debugging NestJS
```javascript
// Ajouter des breakpoints
this.logger.debug('Debug info:', data);
```

---

## ✅ Checklist de Setup

- [ ] Docker installé et démarré
- [ ] Repository cloné
- [ ] `.env` créé depuis `.env.example`
- [ ] Services démarrés (`make up`)
- [ ] Dépendances installées
- [ ] Migrations exécutées
- [ ] Admin user créé
- [ ] Accès à http://localhost:8000/admin ✅
- [ ] Accès à http://localhost:3000 ✅

---

**🎉 Félicitations ! Vous êtes prêt à développer sur la plateforme.**

Pour toute question, consultez la [documentation complète](./README-HYBRID-PLATFORM.md).
