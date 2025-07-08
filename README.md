# GeekBlog - Content Command Center

**Ne Rédigez Plus Seul. Pilotez.**

---

## 🎯 Vue d'Ensemble

GeekBlog est un **centre de commandement de contenu** qui transforme la création d'articles de blog en un workflow collaboratif homme-IA. Au lieu de jongler avec multiples outils et de lutter contre la page blanche, vous pilotez un processus intelligent où des agents IA spécialisés deviennent vos co-équipiers pour la recherche, la rédaction et la révision.

### ✨ Caractéristiques Principales

- **🧠 Interface Neural Flow** - Visualisation créative avec nœuds neuraux connectés
- **🎯 Mode Simple/Expert** - Interface adaptative pour débutants et utilisateurs avancés
- **🗺️ Navigation Intuitive** - Breadcrumbs clairs et basculement fluide entre vues
- **🎓 Onboarding Guidé** - Tutoriel interactif pour nouveaux utilisateurs
- **🤖 Agents IA Spécialisés** - Planificateur, Chercheur, Rédacteur, et Équipe de Finition
- **⚡ Operations Asynchrones** - Interface réactive avec indicateurs de progression en temps réel
- **🎨 Design "Neural Flow"** - Interface sombre immersive avec effets visuels futuristes
- **🔄 Workflow Hybride** - Bascule entre mode synchrone et asynchrone selon vos besoins

---

## 🚀 Démarrage Rapide

### Prérequis

#### Pour Docker (Recommandé)
- Docker 20.0+
- Docker Compose 2.0+
- Clé API Groq

#### Pour installation manuelle  
- **Backend**: Python 3.9+, PostgreSQL, Redis
- **Frontend**: Node.js 16+, npm
- **IA**: Clé API Groq pour les modèles Llama

### Installation

#### 🐳 Option 1 : Docker (Recommandé)

```bash
# Configuration initiale
./scripts/setup.sh

# Configurer votre clé API GROQ dans .env
nano .env  # Modifier GROQ_API_KEY=your_actual_key

# Démarrage complet avec Docker
./scripts/start-dev.sh
```

**C'est tout !** L'application est accessible sur http://localhost:5173

> **✅ STATUS: FULLY FUNCTIONAL** - Tous les boutons et fonctionnalités opérationnels après correction critique Docker

> **Note importante**: Le conteneur frontend nécessite 6GB de RAM pour Tailwind v4 et les dépendances modernes. La configuration Docker Compose est déjà optimisée.

#### 🛠️ Option 2 : Installation manuelle

##### Backend
```bash
# Activation de l'environnement virtuel Python
source .venv/bin/activate  # Linux/macOS
# ou
.venv\Scripts\activate     # Windows

# Installation des dépendances
pip install -r backend_requirements.txt

# Configuration de la base de données
alembic upgrade head

# Démarrage du serveur
uvicorn app.main:app --reload

# Démarrage des workers Celery (terminal séparé)
celery -A app.celery_config worker --loglevel=info
```

##### Frontend
```bash
# Installation des dépendances
npm install

# IMPORTANT : Utilise Tailwind CSS v4.1.11
# Configuration minimale dans tailwind.config.js
# Styles dans src/styles/globals.css avec @import "tailwindcss"

# Vérification de la compilation TypeScript
npm run type-check

# Build de production
npm run build

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
- **Navigation modulaire** avec composants NavigationHeader et ViewSwitcher
- **Système d'onboarding** avec tutoriel interactif guidé

---

## 🎮 Workflow de Création

### 1. Première Visite - Onboarding Guidé
- **Tutoriel interactif** à la première connexion
- **Mode Simple** activé par défaut pour faciliter l'apprentissage
- **Navigation progressive** des fonctionnalités essentielles

### 2. Interface Neural Flow
- **Mode Simple** : Interface épurée avec 2-3 nœuds maximum
- **Mode Expert** : Canvas complet avec connexions dynamiques et fonctionnalités avancées
- **Basculement fluide** entre les modes selon votre niveau de confort

### 3. Planification Intelligente
- Fournissez une idée de projet
- L'Agent Planificateur génère automatiquement un plan de tâches structuré
- **Visualisation en nœuds neuraux** reliés par des connexions intelligentes

### 4. Délégation à la Carte
- **Mode Asynchrone** : Déléguez avec indicateurs de progression temps réel
- **Mode Synchrone** : Exécution immédiate pour les tâches rapides
- Annulation possible à tout moment des opérations en cours

### 5. Agents Spécialisés
- **Agent Chercheur** : Recherche web et synthèse d'informations
- **Agent Rédacteur** : Création de contenu basé sur la recherche
- **Équipe de Finition** : Critique, style, vérification, et correction

### 6. Templates de Blog Authentiques
- **6 Templates** basés sur l'analyse de 67 articles du blog "Les Geeks à Temps Partiel"
- **Guide Pratique** : Tutoriels étape par étape avec style accessible
- **Question Engagement** : Hook → Contexte → Exploration → Synthèse
- **Comparaison Analyse** : Setup → Options A/B → Verdict → Recommandation
- **Localisation Québécoise** : 3 niveaux (bas/moyen/élevé) avec expressions authentiques
- **Personnalisation** : Titre, thème, audience, niveau de québécismes

### 7. Assemblage et Raffinage
- **Navigation claire** entre Neural Flow et vue Assemblage
- Lancement du processus de raffinage avec suivi de progression
- Édition finale dans l'éditeur intégré

---

## 🎨 Design System "Neural Flow"

### Philosophie
Interface immersive et futuriste évoquant un "cockpit" de commande avec :
- **Palette sombre** avec accents neuraux (violet, bleu, rose)
- **Effets de lueur** et transparence ("glassmorphism")
- **Animations fluides** avec feedback visuel continu
- **Variables CSS personnalisées** pour thème cohérent

### Composants Clés
- **JobProgressBar** : Barres de progression avec animations shimmer
- **JobStatusBadge** : Badges de statut avec couleurs adaptatives
- **LoadingSpinner** : Spinners avec effets de lueur neural
- **HomePage** : Page d'accueil avec workflow en 5 étapes
- **NavigationHeader** : Navigation avec breadcrumbs
- **ViewSwitcher** : Toggle Simple/Expert mode

### Stack Technique
- **Tailwind CSS v4.1.11** : Configuration CSS-first moderne
- **PostCSS** : Avec plugin @tailwindcss/postcss (IMPORTANT: utiliser @tailwindcss/postcss et non tailwindcss directement)
- **Variables CSS** : Toutes les couleurs et espacements dans :root
- **Configuration Docker** : Frontend optimisé avec 6GB RAM pour éviter les erreurs ENOMEM

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

# Build de production (vérifie compilation complète)
npm run build
```

### 🛠️ Résolution de Problèmes

#### Erreurs Docker

**ENOMEM (Out of Memory)**
```bash
# Le conteneur frontend nécessite plus de mémoire
# Solution: Configuration déjà optimisée à 6GB dans docker-compose.yml
docker-compose restart frontend
```

**ERR_NAME_NOT_RESOLVED (Network Error)**
```bash
# Problème: Frontend utilise 'backend:8000' au lieu de 'localhost:8000'
# SOLUTION APPLIQUÉE: docker-compose.yml corrigé
# VITE_API_BASE_URL=http://localhost:8000/api/v1
docker-compose down && docker-compose up --build -d
```

**CSS ne se charge pas (Erreur 500)**
```bash
# Problème de configuration PostCSS
# Vérifier postcss.config.js utilise '@tailwindcss/postcss'
# NON 'tailwindcss' directement
docker-compose restart frontend
```

**Page blanche/chargement infini**
```bash
# Vider le cache et rebuild
docker-compose down
docker-compose build frontend --no-cache
docker-compose up -d
```

#### Erreurs TypeScript Build

Si vous rencontrez des erreurs TypeScript lors du build :

1. **Configuration TypeScript corrigée** - Résolution des conflits vite.config.ts
2. **Types TanStack Query v4** - Utilise la signature `useQuery(key, fn, options)`
3. **Gestion d'erreurs robuste** - Type guards pour error.message
4. **Bundle optimisé** - Build production en ~2min, 222kB gzippé

---

## 📚 Documentation

- **[🐳 DOCKER.md](./DOCKER.md)** - Guide complet Docker et déploiement
- **[🐳 DOCKER_REVIEW.md](./DOCKER_REVIEW.md)** - Audit complet configuration Docker avec recommandations
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

### ✅ Phase 4 - Navigation & UX Refonte (TERMINÉE)
- **Navigation modulaire** avec NavigationHeader et ViewSwitcher
- **Mode Simple/Expert** pour Neural Flow avec progressive disclosure
- **Système d'onboarding** avec tutoriel interactif guidé
- **Migration Tailwind CSS v4** avec configuration CSS-first moderne

### ✅ Phase 5 - Templates de Blog (COMPLETED)
- **Analyse blog authentique** : 67 articles analysés pour style personnel
- **6 Templates créés** : Guide Pratique, Question, Comparaison, etc.
- **Backend API complet** : CRUD templates avec personnalisation
- **Walking skeleton** : Workflow end-to-end fonctionnel
- **Architecture améliorée** : Strategy Pattern, exceptions custom, auth layer

### ✅ Phase 6 - All Functionality Complete (2025-07-08)
- ✅ **Template Gallery UI** : Interface galerie avec TemplateCard et filtres
- ✅ **Neural Canvas Functions** : onSaveContent et onCreateNode opérationnels
- ✅ **Task Edit Modal** : Bouton "Modifier tâche" avec modal complète
- ✅ **Critical Network Fix** : Docker VITE_API_BASE_URL corrigée
- ✅ **Expert Code Review** : Analyse approfondie et optimisations appliquées
- ✅ **All Buttons Working** : Chaque fonctionnalité existante opérationnelle
- ✅ **Build TypeScript optimisé** : Production-ready avec type guards

### 🔮 Future Enhancements (PLANNED)
- User notification system (remplacer console.log TODOs)
- Performance optimization (bundle splitting, lazy loading)
- Accessibility improvements (WCAG 2.1 AA compliance)
- Advanced template features (real-time preview)
- Export et persistance d'articles
- Tests end-to-end automatisés

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