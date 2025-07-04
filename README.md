# GeekBlog - Content Command Center

**Ne Rédigez Plus Seul. Pilotez.**

---

## 🎯 Vue d'Ensemble

GeekBlog est un **centre de commandement de contenu** qui transforme la création d'articles de blog en un workflow collaboratif homme-IA. Au lieu de jongler avec multiples outils et de lutter contre la page blanche, vous pilotez un processus intelligent où des agents IA spécialisés deviennent vos co-équipiers pour la recherche, la rédaction et la révision.

### ✨ Caractéristiques Principales

- **🎮 Interface Kanban Interactive** - Visualisez et gérez votre workflow de création
- **🤖 Agents IA Spécialisés** - Planificateur, Chercheur, Rédacteur, et Équipe de Finition
- **⚡ Operations Asynchrones** - Interface réactive avec indicateurs de progression en temps réel
- **🎨 Design "Neural Flow"** - Interface sombre immersive avec effets visuels futuristes
- **🔄 Workflow Hybride** - Bascule entre mode synchrone et asynchrone selon vos besoins

---

## 🚀 Démarrage Rapide

### Prérequis

- **Backend**: Python 3.9+, PostgreSQL, Redis
- **Frontend**: Node.js 16+, npm
- **IA**: Clé API Groq pour les modèles Llama

### Installation

#### Backend
```bash
# Installation des dépendances
pip install -r backend_requirements.txt

# Configuration de la base de données
alembic upgrade head

# Démarrage du serveur
uvicorn app.main:app --reload

# Démarrage des workers Celery (terminal séparé)
celery -A app.celery_config worker --loglevel=info
```

#### Frontend
```bash
# Installation des dépendances
npm install

# Démarrage du serveur de développement
npm run dev
```

### Configuration

Créez un fichier `.env` à la racine du projet :

```env
# Base de données
DATABASE_URL=postgresql://user:password@localhost:5432/geekblogdb

# Service IA
GROQ_API_KEY=your_groq_api_key_here

# Jobs asynchrones
REDIS_URL=redis://localhost:6379/0
```

---

## 🏗️ Architecture

### Backend (Python/FastAPI)
- **API RESTful** avec endpoints synchrones et asynchrones
- **Celery + Redis** pour le traitement asynchrone des opérations IA
- **CrewAI** pour l'orchestration des agents IA spécialisés
- **PostgreSQL** avec SQLAlchemy pour la persistance

### Frontend (React/TypeScript)
- **React 18** avec hooks personnalisés pour la gestion async
- **TanStack Query** pour le polling en temps réel et la gestion d'état
- **Tailwind CSS + Radix UI** pour l'interface "Neural Flow"
- **dnd-kit** pour les interactions drag-and-drop

---

## 🎮 Workflow de Création

### 1. Planification Intelligente
- Fournissez une idée de projet
- L'Agent Planificateur génère automatiquement un plan de tâches structuré
- Visualisation immédiate dans la colonne "À faire" du Kanban

### 2. Délégation à la Carte
- **Mode Asynchrone** : Déléguez avec indicateurs de progression temps réel
- **Mode Synchrone** : Exécution immédiate pour les tâches rapides
- Annulation possible à tout moment des opérations en cours

### 3. Agents Spécialisés
- **Agent Chercheur** : Recherche web et synthèse d'informations
- **Agent Rédacteur** : Création de contenu basé sur la recherche
- **Équipe de Finition** : Critique, style, vérification, et correction

### 4. Assemblage et Raffinage
- Réorganisation des tâches par drag-and-drop
- Lancement du processus de raffinage avec suivi de progression
- Édition finale dans l'éditeur intégré

---

## 🎨 Design System "Neural Flow"

### Philosophie
Interface immersive et futuriste évoquant un "cockpit" de commande avec :
- **Palette sombre** avec accents neuraux (violet, bleu, rose)
- **Effets de lueur** et transparence ("glassmorphism")
- **Animations fluides** avec feedback visuel continu

### Composants Clés
- **JobProgressBar** : Barres de progression avec animations shimmer
- **JobStatusBadge** : Badges de statut avec couleurs adaptatives
- **LoadingSpinner** : Spinners avec effets de lueur neural

---

## 🧪 Tests et Validation

### Backend
```bash
# Tests unitaires
pytest

# Avec coverage
pytest --cov
```

### Frontend
```bash
# Tests unitaires
npm test

# Tests avec coverage
npm run test:coverage

# Validation TypeScript
npm run type-check

# Linting
npm run lint
```

---

## 📚 Documentation

- **[PLANNING.md](./PLANNING.md)** - Architecture détaillée et feuille de route
- **[TASK.md](./TASK.md)** - Suivi des tâches et sprints
- **[01_MANIFESTE.md](./01_MANIFESTE.md)** - Vision et principes fondamentaux
- **[02_GUIDE_DE_STYLE.md](./02_GUIDE_DE_STYLE.md)** - Guide de design "Neural Flow"
- **[03_ARCHITECTURE_TECHNIQUE.md](./03_ARCHITECTURE_TECHNIQUE.md)** - Architecture technique détaillée
- **[04_PITCH_MARKETING.md](./04_PITCH_MARKETING.md)** - Positionnement produit

---

## 🚦 Statut du Projet

### ✅ Phase 1 - Fondations (TERMINÉE)
- Infrastructure de base (FastAPI + React)
- Tests unitaires (pytest + Vitest)
- CRUD complet pour projets et tâches

### ✅ Phase 2 - Architecture Async (TERMINÉE)
- Celery + Redis pour jobs asynchrones
- Endpoints async pour toutes les opérations IA
- Workflow orchestration avancée

### ✅ Phase 3 - Frontend Async (TERMINÉE)
- Hooks de polling temps réel avec TanStack Query
- Composants UI avec indicateurs de progression
- Interface responsive pour opérations longues

### 🔮 Phase 4 - Fonctionnalités Avancées (PLANIFIÉE)
- Navigation multi-projets
- Export et persistance d'articles
- Templates de prompts personnalisés

---

## 🤝 Contribution

Ce projet suit une architecture modulaire stricte :
- **Limite de 400 lignes** par fichier
- **Coverage minimum 60%** pour les tests
- **TypeScript strict** pour le frontend
- **PEP8 + type hints** pour le backend

---

## 📄 Licence

Ce projet est développé comme un centre de commandement personnel pour la création de contenu technique.

---

**GeekBlog - Transformez vos idées en articles, sans friction.**