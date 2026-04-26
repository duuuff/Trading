# MarketLens — Codebase Guide

## Architecture

Monorepo avec deux packages:

```
Trading/
├── backend/        # Node.js + Express + TypeScript + SQLite
├── frontend/       # React + Vite + TypeScript + Tailwind CSS
└── package.json    # Scripts racine
```

## Stack technique

| Couche | Technologie |
|--------|------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Graphiques | lightweight-charts (TradingView) |
| Routage | React Router v6 |
| Backend | Node.js, Express, TypeScript |
| Base de données | SQLite (better-sqlite3) |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Données marché | Yahoo Finance REST API (fetch natif) |

## Lancer en développement

```bash
# Installer les dépendances
npm run install:all

# Initialiser la BDD avec les données de démo
npm run seed

# Backend (port 3001)
npm run dev:backend

# Frontend (port 5173) — dans un autre terminal
npm run dev:frontend
```

L'app est disponible sur `http://localhost:5173`. Le frontend proxifie `/api` vers le backend.

## Base de données

SQLite à `backend/data/trading.db`. Initialisée automatiquement au démarrage. Schéma dans `backend/src/db/database.ts`.

**Tables :** `users`, `assets`, `events`, `subscriptions`, `news_cache`

## API Backend

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| POST | `/api/auth/register` | — | Créer un compte |
| POST | `/api/auth/login` | — | Se connecter |
| GET | `/api/assets` | opt. | Lister les actifs |
| GET | `/api/assets/:symbol/chart?period=1y` | opt. | Données OHLCV |
| GET | `/api/assets/:symbol/events` | opt. | Événements |
| POST | `/api/assets/:symbol/events` | Premium | Créer un événement |
| GET | `/api/subscriptions` | requis | Mes abonnements |
| POST | `/api/subscriptions` | requis | S'abonner |
| DELETE | `/api/subscriptions/:symbol` | requis | Se désabonner |
| GET | `/api/news` | requis | Actualités |
| GET | `/api/account/me` | requis | Mon profil |
| POST | `/api/account/upgrade` | requis | Passer Premium |

Périodes de graphiques supportées : `3m`, `6m`, `1y`, `2y`, `5y`.

## Modèle Freemium

- **Free** : 3 actifs max, lecture seule des événements, actualités
- **Premium (9,99€/mois)** : actifs illimités, création d'événements, alertes

L'upgrade est simulé en dev (`POST /api/account/upgrade`). En production, brancher Stripe Checkout.

## Pages frontend

| Route | Composant | Description |
|-------|-----------|-------------|
| `/auth` | `AuthPage` | Connexion / inscription |
| `/` | `DashboardPage` | Actifs suivis + raccourcis |
| `/chart/:symbol` | `ChartPage` | Graphique + événements |
| `/assets` | `AssetsPage` | Explorer & suivre des actifs |
| `/news` | `NewsPage` | Flux d'actualités |
| `/account` | `AccountPage` | Profil & abonnement |

## Composants clés

- **`TradingChart`** : wrapper lightweight-charts avec marqueurs d'événements. Les flèches vertes (↑) = haussier, rouges (↓) = baissier. Un clic sur le graphique à la date d'un événement ouvre le modal.
- **`EventModal`** : bottom sheet mobile affichant le détail d'un événement.
- **`Layout`** : navigation bottom bar mobile-first.

## Variables d'environnement

```env
PORT=3001                              # Port backend
JWT_SECRET=change_this_in_production   # Secret JWT
FRONTEND_URL=http://localhost:5173     # CORS origin
```

## Conventions

- Tout le code est en TypeScript strict (pas de `any` explicite)
- Les erreurs Express retournent `{ error: string }`
- Les dates d'événements sont stockées en `YYYY-MM-DD`
- Les timestamps de graphiques sont des Unix seconds (int)
- Design mobile-first, palette sombre — modifier `tailwind.config.js` pour les couleurs
