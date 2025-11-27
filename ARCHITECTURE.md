# 🏗️ Architecture Hybride PHP/Node.js - Plateforme Tournois Esports

## 📋 Vue d'ensemble

Plateforme complète de gestion de tournois esports combinant **Laravel 11 (PHP 8.3)** pour la logique métier robuste et **NestJS (Node.js/TypeScript)** pour le temps réel haute performance.

## 🎯 Objectifs Business

- **Gestion de tournois** : Inscription, brackets, matchs, classements
- **Overlays de stream** : Intégration des overlays existants pour broadcast
- **Temps réel** : Live scores, notifications push, chat
- **Administration** : Back-office complet pour organisateurs
- **Scalabilité** : Architecture microservices prête pour la croissance

---

## 🔧 Stack Technique Complète

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend React + TypeScript              │
│                    WebSocket Client (Socket.io)             │
└─────────────────────────────────────────────────────────────┘
                              ↓
         ┌────────────────────────────────────┐
         │     API Gateway (Nginx/Traefik)    │
         └────────────────────────────────────┘
                    ↓                ↓
      ┌─────────────────┐  ┌────────────────────┐
      │  Laravel 11     │  │    NestJS          │
      │  (PHP 8.3)      │  │    (Node.js 20)    │
      │                 │  │                    │
      │ • API REST      │  │ • WebSocket        │
      │ • Eloquent ORM  │  │ • Real-time        │
      │ • Queues        │  │ • Notifications    │
      │ • Admin Panel   │  │ • Chat Service     │
      │ • Auth (Sanctum)│  │ • Matchmaking      │
      └─────────────────┘  └────────────────────┘
               ↓                     ↓
      ┌─────────────────────────────────────────┐
      │         PostgreSQL 16                   │
      │    (Shared Database)                    │
      └─────────────────────────────────────────┘
                        ↓
      ┌─────────────────────────────────────────┐
      │         Redis 7                         │
      │    (Cache + Pub/Sub + Sessions)         │
      └─────────────────────────────────────────┘
```

---

## 🎨 Architecture des Services

### 🔷 Backend Laravel 11 (PHP 8.3) - Core Business

**Responsabilités :**
- ✅ API REST principale (CRUD tournois, équipes, joueurs, matchs)
- ✅ Authentification & autorisation (Laravel Sanctum)
- ✅ Logique métier complexe (Eloquent ORM)
- ✅ Jobs asynchrones (Laravel Queues)
- ✅ Admin panel (Laravel Filament)
- ✅ Génération de brackets/arbres de tournoi
- ✅ Gestion des inscriptions et paiements

**Technologies :**
- PHP 8.3 (performance + typage strict)
- Laravel 11 (framework)
- Eloquent ORM (relations complexes)
- Laravel Sanctum (API tokens)
- Laravel Queues (Redis driver)
- Laravel Filament (admin panel)

**Endpoints principaux :**
```
POST   /api/tournaments           - Créer tournoi
GET    /api/tournaments/:id       - Détails tournoi
POST   /api/tournaments/:id/teams - Inscrire équipe
GET    /api/tournaments/:id/bracket - Générer bracket
POST   /api/matches/:id/score     - Update score
GET    /api/leaderboard/:id       - Classement
```

---

### 🔶 Backend NestJS (Node.js 20) - Real-time

**Responsabilités :**
- ✅ WebSocket server (Socket.io)
- ✅ Diffusion scores en temps réel
- ✅ Notifications push instantanées
- ✅ Chat en direct (joueurs, spectateurs)
- ✅ Algorithmes de matchmaking live
- ✅ Métriques temps réel (viewers, stats)

**Technologies :**
- Node.js 20 LTS
- NestJS (framework TypeScript)
- Socket.io (WebSocket)
- TypeORM (PostgreSQL)
- Bull (job queues Redis)
- Class-validator (validation)

**WebSocket Events :**
```typescript
// Client → Server
socket.emit('join_tournament', { tournamentId })
socket.emit('chat_message', { message, roomId })

// Server → Client
socket.on('score_update', { matchId, score })
socket.on('notification', { type, message })
socket.on('chat_message', { user, message })
socket.on('tournament_start', { tournamentId })
```

---

## 🔄 Communication Inter-Services

### 1. API REST (Laravel ↔ NestJS)
```
Laravel API ←→ NestJS API
GET /internal/tournament/:id
POST /internal/notify
```

### 2. Redis Pub/Sub (Event-driven)
```
Laravel publishes:
- tournament.created
- match.score_updated
- team.registered

NestJS subscribes:
- Écoute événements Redis
- Broadcast WebSocket aux clients
- Trigger notifications push
```

### 3. Base de données partagée
```
PostgreSQL (shared)
├─ Laravel (Eloquent)
└─ NestJS (TypeORM)

Schéma commun :
- tournaments
- teams
- players
- matches
- scores
```

---

## 📊 Modèle de Données (PostgreSQL)

```sql
-- Tournois
CREATE TABLE tournaments (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    game VARCHAR(100) NOT NULL,
    format VARCHAR(50) NOT NULL, -- single_elim, double_elim, round_robin
    max_teams INT NOT NULL,
    start_date TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'draft', -- draft, open, ongoing, finished
    prize_pool DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Équipes
CREATE TABLE teams (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    tag VARCHAR(10),
    tournament_id BIGINT REFERENCES tournaments(id),
    captain_id BIGINT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Joueurs
CREATE TABLE players (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    team_id BIGINT REFERENCES teams(id),
    ign VARCHAR(100) NOT NULL, -- In-Game Name
    role VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Matchs
CREATE TABLE matches (
    id BIGSERIAL PRIMARY KEY,
    tournament_id BIGINT REFERENCES tournaments(id),
    team_a_id BIGINT REFERENCES teams(id),
    team_b_id BIGINT REFERENCES teams(id),
    round INT NOT NULL,
    bracket_position INT,
    score_a INT DEFAULT 0,
    score_b INT DEFAULT 0,
    winner_id BIGINT REFERENCES teams(id),
    status VARCHAR(50) DEFAULT 'pending', -- pending, live, finished
    scheduled_at TIMESTAMP,
    played_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Utilisateurs
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'player', -- admin, organizer, player
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🐳 Docker Compose - Orchestration

```yaml
version: '3.8'

services:
  # Frontend React
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
    environment:
      - REACT_APP_API_URL=http://localhost:8000
      - REACT_APP_WS_URL=ws://localhost:3001

  # Laravel API
  laravel:
    build: ./backend-laravel
    ports:
      - "8000:8000"
    volumes:
      - ./backend-laravel:/var/www/html
    environment:
      - DB_HOST=postgres
      - DB_DATABASE=esports_tournament
      - REDIS_HOST=redis
    depends_on:
      - postgres
      - redis

  # NestJS Real-time
  nestjs:
    build: ./backend-nestjs
    ports:
      - "3001:3001"
    volumes:
      - ./backend-nestjs:/app
    environment:
      - DB_HOST=postgres
      - REDIS_HOST=redis
    depends_on:
      - postgres
      - redis

  # PostgreSQL
  postgres:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_DB=esports_tournament
      - POSTGRES_USER=esports_user
      - POSTGRES_PASSWORD=esports_pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

  # Redis
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  # Nginx (Reverse Proxy)
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - laravel
      - nestjs
      - frontend

volumes:
  postgres_data:
  redis_data:
```

---

## 🚀 Flux de Données Complets

### 1️⃣ Inscription à un tournoi

```
[Frontend React]
    │
    │ POST /api/tournaments/1/teams
    ↓
[Laravel API]
    │ 1. Validation (places disponibles, équipe valide)
    │ 2. Persist en PostgreSQL (Eloquent)
    │ 3. Dispatch job Laravel Queue (email confirmation)
    │ 4. Publish Redis event: "team.registered"
    ↓
[Redis Pub/Sub]
    │
    ↓
[NestJS Real-time]
    │ 1. Subscribe "team.registered"
    │ 2. Broadcast WebSocket → Tous spectateurs connectés
    │ 3. Notification push admin
    ↓
[Frontend React]
    │ Update UI en temps réel
```

---

### 2️⃣ Mise à jour live d'un score

```
[Admin Panel Filament]
    │
    │ POST /api/matches/42/score { team_a: 2, team_b: 1 }
    ↓
[Laravel API]
    │ 1. Update PostgreSQL
    │ 2. Publish Redis: "match.score_updated"
    ↓
[Redis Pub/Sub]
    │
    ↓
[NestJS WebSocket]
    │ Broadcast → Tous clients room "match:42"
    ↓
[Overlays Stream OBS]
    │ Update score overlay en temps réel
    │
[Frontend Spectateurs]
    │ Update leaderboard instantanément
```

---

### 3️⃣ Génération de bracket

```
[Laravel API]
    │ POST /api/tournaments/1/generate-bracket
    │
    │ 1. Récupère toutes les équipes inscrites
    │ 2. Algorithme génération bracket (single/double elim)
    │ 3. Créer tous les matchs en base
    │ 4. Publish "bracket.generated"
    ↓
[NestJS]
    │ Notify tous spectateurs
    ↓
[Frontend]
    │ Affiche bracket interactif
```

---

## 🎮 Intégration Overlays de Stream

Les overlays HTML/CSS/JS existants sont intégrés comme **micro-frontend** :

```
/overlays/tournament-live/
├── index.html           (Browser source OBS)
├── websocket-client.js  (Connexion NestJS WebSocket)
└── config.json

WebSocket Events:
- score_update → Update score overlay
- team_spotlight → Highlight équipe
- tournament_start → Animation démarrage
```

**Workflow :**
1. OBS charge `overlays/tournament-live/index.html` (Browser Source)
2. Overlay se connecte au NestJS WebSocket
3. Scores/événements broadcast en temps réel
4. Overlay anime et affiche les données

---

## ⚡ Optimisations & Performance

### Laravel
- **Cache Redis** : `Cache::remember()` pour requêtes lourdes
- **Eager Loading** : Éviter N+1 queries
- **Queue Jobs** : Emails, notifications, calculs lourds
- **Database indexing** : Index sur `tournament_id`, `team_id`

### NestJS
- **Clustering** : PM2 multi-process pour WebSocket
- **Redis Adapter** : Socket.io horizontal scaling
- **Rate limiting** : Protéger endpoints publics

### PostgreSQL
- **Partitioning** : Table `matches` par tournoi si volumétrie haute
- **Materialized Views** : Leaderboards pré-calculés
- **Connection pooling** : PgBouncer si besoin

---

## 🔒 Sécurité

### Laravel
- **Sanctum tokens** : API authentication
- **CORS** : Configured pour frontend/overlays
- **Validation** : Form requests Laravel
- **SQL Injection** : Eloquent ORM protège

### NestJS
- **JWT validation** : Vérifier tokens Sanctum
- **WebSocket auth** : Handshake avec token
- **Rate limiting** : Guard NestJS
- **XSS protection** : Sanitize chat messages

---

## 📈 Scalabilité Future

### Horizontal Scaling
```
Load Balancer
    │
    ├─ Laravel Pod 1 ──┐
    ├─ Laravel Pod 2 ──┼─→ PostgreSQL (Primary + Replicas)
    ├─ Laravel Pod N ──┘
    │
    ├─ NestJS Pod 1 ──┐
    ├─ NestJS Pod 2 ──┼─→ Redis Cluster (Pub/Sub)
    └─ NestJS Pod N ──┘
```

### Microservices Future
- **Service Paiements** : Stripe/PayPal (Node.js)
- **Service Analytics** : Métrics & BI (Python/Pandas)
- **Service Matchmaking** : Algorithmes avancés (Go)

---

## 🛠️ Commandes Développement

```bash
# Démarrer tous les services
docker-compose up -d

# Laravel migrations
docker-compose exec laravel php artisan migrate

# Laravel admin (Filament)
docker-compose exec laravel php artisan make:filament-user

# NestJS dev mode
docker-compose exec nestjs npm run start:dev

# Tests
docker-compose exec laravel php artisan test
docker-compose exec nestjs npm run test

# Logs
docker-compose logs -f laravel
docker-compose logs -f nestjs
```

---

## 💼 Arguments pour Entretien Technique

### 1. Expertise PHP valorisée
> "J'ai architecturé le core business avec Laravel car je maîtrise parfaitement PHP 8 et son écosystème. Laravel Eloquent me permet de gérer efficacement les relations complexes entre tournois/équipes/joueurs/matchs."

### 2. Ouverture aux nouvelles technos
> "J'ai intégré NestJS pour le temps réel car il excelle dans la gestion de milliers de connexions WebSocket simultanées. Cela me permet d'apprendre TypeScript tout en capitalisant sur mon expertise backend."

### 3. Architecture pragmatique
> "Chaque technologie est utilisée pour ses forces : Laravel pour le CRUD et la logique métier, NestJS pour la performance temps réel. Communication via Redis Pub/Sub pour un couplage faible."

### 4. Problématiques résolues
> "Laravel Queues gère les pics d'inscription (100+ équipes simultanément), WebSocket NestJS broadcast les scores à 1000+ spectateurs, optimisations SQL pour les leaderboards complexes."

### 5. Production-ready
> "Architecture containerisée Docker, prête pour Kubernetes. PostgreSQL avec réplication, Redis Cluster pour haute disponibilité, monitoring avec Prometheus."

---

## 📚 Ressources

- [Laravel 11 Docs](https://laravel.com/docs/11.x)
- [NestJS Docs](https://docs.nestjs.com/)
- [Socket.io Docs](https://socket.io/docs/v4/)
- [PostgreSQL 16](https://www.postgresql.org/docs/16/)
- [Redis Pub/Sub](https://redis.io/docs/interact/pubsub/)

---

**Créé avec ❤️ pour démontrer une expertise full-stack moderne**
