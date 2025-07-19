# GeekBlog - Content Command Center (Development Edition)

**Ne Rédigez Plus Seul. Pilotez.**

---

## 🚀 Architecture Optimisée Single-Container

GeekBlog utilise dès le départ une architecture optimisée single-user avec 1 container autonome au lieu de la complexité traditionnelle des microservices.

### 🎯 Design Philosophy

- **Self-Contained** : Zéro dépendances externes (PostgreSQL, Redis)
- **Resource Efficient** : <500MB vs 12GB+ des architectures traditionnelles  
- **Developer Friendly** : `docker run` simple vs orchestration complexe
- **Production Ready** : Architecture qui scale du développement à la production

---

## 🏗️ Architecture Moderne

```
geekblog_container/
├── FastAPI Backend (port 8000)
│   ├── API Endpoints REST
│   ├── BackgroundTasks (async jobs natifs)
│   ├── SQLite Database (file-based)
│   └── Static File Serving (sert React build)
├── React Frontend (embedded)
│   └── Build de production intégré
└── Health Monitoring simplifié
```

### Stack Technique

**Backend**:
- **FastAPI + Uvicorn** - API moderne et performante
- **SQLite** - Base de données file-based, zéro admin
- **BackgroundTasks** - Jobs async natifs, pas besoin de Celery/Redis
- **CrewAI + Groq** - Agents IA spécialisés

**Frontend**:
- **React 18 + TypeScript** - Interface moderne
- **TanStack Query** - State management et polling temps réel
- **Tailwind CSS v4** - Design system "Neural Flow"
- **Build intégré** - Servi directement par FastAPI

---

## 🚀 Démarrage Ultra-Rapide

### Installation One-Liner

```bash
# Démarrage immédiat
docker run -d \
  --name geekblog \
  -p 8000:8000 \
  -v geekblog_data:/app/data \
  -e GROQ_API_KEY=your_groq_api_key \
  geekblog:latest
```

**Résultat** : Application complète accessible sur http://localhost:8000 en <30 secondes

### Développement Local

```bash
# Build l'image optimisée
docker build -f Dockerfile.simple -t geekblog:dev .

# Développement avec hot-reload
docker-compose -f docker-compose.simple.yml up -d

# Ou mode dev natif
source .venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0
```

---

## ⚙️ Configuration

### Minimale (Production)

```env
# .env
GROQ_API_KEY=your_groq_api_key_here
```

### Complète (Développement)

```env
# Variables principales
GROQ_API_KEY=your_groq_api_key_here
DATABASE_URL=sqlite:///data/geekblog.db

# Développement
LOG_LEVEL=debug
WORKERS=1

# CORS pour dev
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:8000
```

---

## 🎮 Fonctionnalités Complètes

### Interface Utilisateur
- **✅ Gestion Projets & Tâches** - CRUD complet avec édition en place
- **🧠 Neural Flow Canvas** - Visualisation créative des workflows
- **🎯 Mode Simple/Expert** - Interface adaptative
- **🚀 Navigation Optimisée** - UX fluide et intuitive

### Intelligence Artificielle
- **🤖 Agents Spécialisés** - Planificateur, Chercheur, Rédacteur via CrewAI
- **⚡ Jobs Asynchrones** - BackgroundTasks natifs avec polling temps réel
- **💡 Assistant Contextuel** - Suggestions intelligentes
- **📝 Templates Authentiques** - Basés sur analyse de blogs réels

### Architecture Technique
- **📊 API REST Complète** - FastAPI avec documentation auto-générée
- **💾 SQLite Embedded** - Backup = 1 fichier, zéro administration
- **🎨 Design System** - Interface "Neural Flow" cohérente
- **📱 Responsive** - Optimisé mobile/desktop

---

## 🔧 Docker Compose Development

`docker-compose.simple.yml`:
```yaml
services:
  geekblog:
    build:
      context: .
      dockerfile: Dockerfile.simple
    ports:
      - "8000:8000"
    environment:
      - GROQ_API_KEY=${GROQ_API_KEY}
      - LOG_LEVEL=debug
    volumes:
      - geekblog_data:/app/data
      - ./app:/app/app  # Hot reload backend
    restart: unless-stopped

volumes:
  geekblog_data:
```

---

## 🧪 Tests & Validation

```bash
# Tests backend
pytest app/tests/ -v

# Tests frontend  
npm run test

# Tests d'intégration
curl http://localhost:8000/health
curl http://localhost:8000/api/v1/projects

# Performance
docker stats geekblog
```

---

## 📊 Avantages vs Architecture Traditionnelle

| Aspect | Architecture Traditionnelle | GeekBlog Optimisé |
|--------|----------------------------|-------------------|
| **Containers** | 5 (PostgreSQL, Redis, Backend, Celery, Frontend) | 1 (Tout intégré) |
| **Mémoire** | 12GB+ | <500MB |
| **Démarrage** | ~2 minutes | <30 secondes |
| **Configuration** | docker-compose complexe | docker run simple |
| **Dépendances** | PostgreSQL admin, Redis management | Aucune |
| **Backup** | Complexe (multiple databases) | 1 fichier SQLite |
| **Scaling** | Orchestration complexe | Horizontal simple |
| **Debugging** | Multiple logs, services | Logs unifiés |

---

## 🎯 Cas d'Usage Parfaits

Cette architecture est idéale pour:
- ✅ **Développement moderne** - Stack unifié, simple à déboguer
- ✅ **Prototypage rapide** - Déploiement instantané
- ✅ **Self-hosting** - VPS minimal, Raspberry Pi
- ✅ **Production single-user** - Blogueurs, petites équipes
- ✅ **CI/CD** - Tests rapides, builds simples

---

## 🔄 Workflow de Développement

```bash
# 1. Clone et setup
git clone https://github.com/chrisboulet/geekblog.git
cd geekblog

# 2. Configuration
cp .env.example .env
# Éditer GROQ_API_KEY

# 3. Démarrage
docker-compose -f docker-compose.simple.yml up -d

# 4. Développement
# Frontend: Rebuild automatique via volume mount
# Backend: Hot reload avec uvicorn --reload

# 5. Tests
make test  # ou npm run test

# 6. Build production
docker build -f Dockerfile.simple -t geekblog:prod .
```

---

## 📚 Documentation

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Guide de déploiement production
- **[API.md](./API.md)** - Documentation API complète  
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Détails techniques
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Guide de contribution

---

## 🚦 Statut du Projet

### ✅ Phase 1-8 : Complètes
- Infrastructure moderne (FastAPI + React)
- Architecture async avec BackgroundTasks
- Interface Neural Flow complète
- Agents IA opérationnels
- CRUD complet et fonctionnel

### 🔮 Prochaines Étapes
- Optimisations performance
- Tests end-to-end automatisés  
- Documentation utilisateur
- Templates additionnels

---

## 🤝 Contribution

```bash
# Setup développement
git clone https://github.com/chrisboulet/geekblog.git
cd geekblog
docker-compose -f docker-compose.simple.yml up -d

# Architecture modulaire respectée
# - Limite 400 lignes par fichier
# - Tests unitaires obligatoires
# - TypeScript strict
# - PEP8 + type hints Python
```

---

**GeekBlog - Architecture Moderne, Développement Simplifié** 🚀