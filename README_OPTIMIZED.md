# GeekBlog - Content Command Center (Optimized Edition)

**Ne Rédigez Plus Seul. Pilotez.**

---

## 🚀 Architecture Optimisée Single-Container

GeekBlog a été complètement optimisé pour une utilisation single-user/self-hosted avec une architecture simplifiée passant de 5 containers à 1 seul container autonome.

### 📊 Améliorations Clés

| Métrique | Avant | Après | Amélioration |
|----------|--------|-------|--------------|
| **Containers** | 5 (PostgreSQL, Redis, Backend, Celery, Frontend) | 1 | 80% réduction |
| **Mémoire** | 12GB+ | <500MB | 95% réduction |
| **Dépendances** | PostgreSQL, Redis, Celery | Aucune | 100% autonome |
| **Démarrage** | ~2 minutes | <30 secondes | 75% plus rapide |
| **Déploiement** | docker-compose complexe | docker run simple | 90% plus simple |

---

## 🎯 Vue d'Ensemble

GeekBlog est un **centre de commandement de contenu** qui transforme la création d'articles de blog en un workflow collaboratif homme-IA. Maintenant optimisé pour être complètement autonome et léger.

### ✨ Caractéristiques Principales (Toutes Préservées)

- **✅ Gestion Complète Projets & Tâches** - CRUD complet avec édition en place
- **🚀 Navigation UX Optimisée** - Interface adaptative et workflow interactif
- **🧠 Interface Neural Flow** - Visualisation créative avec nœuds neuraux
- **🤖 Agents IA Spécialisés** - Planificateur, Chercheur, Rédacteur via CrewAI
- **⚡ Operations Asynchrones** - Via FastAPI BackgroundTasks (remplace Celery)
- **🎨 Design "Neural Flow"** - Interface sombre immersive préservée
- **💾 Base de données SQLite** - Remplace PostgreSQL, backup = 1 fichier

---

## 🚀 Démarrage Ultra-Rapide

### Installation (1 Commande!)

```bash
# Option 1: Pull depuis Docker Hub (recommandé)
docker run -d \
  --name geekblog \
  -p 8000:8000 \
  -v $(pwd)/data:/app/data \
  -e GROQ_API_KEY=your_groq_api_key \
  geekblog:latest

# Option 2: Build local
docker build -f Dockerfile.simple -t geekblog:latest .
docker run -d \
  --name geekblog \
  -p 8000:8000 \
  -v $(pwd)/data:/app/data \
  -e GROQ_API_KEY=your_groq_api_key \
  geekblog:latest
```

**C'est tout!** Application accessible sur http://localhost:8000

### Configuration Minimale

Créez un fichier `.env`:
```env
# Seule configuration requise
GROQ_API_KEY=your_groq_api_key_here

# Optionnel (défauts intelligents)
DATABASE_URL=sqlite:///data/geekblog.db
```

---

## 🏗️ Nouvelle Architecture Simplifiée

### Container Unique Structure

```
geekblog_container/
├── Backend FastAPI (port 8000)
│   ├── API Endpoints (inchangés)
│   ├── BackgroundTasks (remplace Celery)
│   ├── SQLite Database (remplace PostgreSQL)
│   └── Static File Serving (sert React build)
├── Frontend React (embedded)
│   └── Production build intégré
└── Health Check Endpoint
```

### Stack Technique Optimisé

**Backend**:
- FastAPI + Uvicorn (inchangé)
- SQLite (remplace PostgreSQL)
- BackgroundTasks (remplace Celery+Redis)
- CrewAI + Groq (inchangé)

**Frontend**:
- React 18 + TypeScript (inchangé)
- Build de production servi par FastAPI
- Toutes fonctionnalités préservées

---

## 💾 Migration depuis l'Ancienne Version

### Pour les Utilisateurs Existants

1. **Export des données** (depuis l'ancienne version):
```bash
# Exporter depuis PostgreSQL
docker exec -it geekblog_db pg_dump -U geekblog geekblogdb > backup.sql

# Ou utiliser le script de migration fourni
python scripts/migrate_to_sqlite.py --source postgresql://... --dest data/geekblog.db
```

2. **Déployer nouvelle version**:
```bash
docker run -d \
  --name geekblog-new \
  -p 8000:8000 \
  -v $(pwd)/data:/app/data \
  -e GROQ_API_KEY=$GROQ_API_KEY \
  geekblog:latest
```

3. **Importer les données** (si nécessaire):
```bash
# Les données sont automatiquement migrées au premier démarrage
# Ou forcer la migration:
docker exec geekblog-new python -m app.migrations.import_data
```

---

## 🐳 Docker Compose Simplifié

`docker-compose.simple.yml`:
```yaml
services:
  geekblog:
    image: geekblog:latest
    container_name: geekblog
    ports:
      - "8000:8000"
    environment:
      - GROQ_API_KEY=${GROQ_API_KEY}
    volumes:
      - ./data:/app/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

# Plus besoin de volumes pour PostgreSQL/Redis!
```

---

## 🛠️ Développement Local

Pour le développement avec hot-reload:

```bash
# Backend avec auto-reload
cd /app
source .venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0

# Frontend dev server (dans un autre terminal)
cd /app
npm run dev -- --host 0.0.0.0
```

---

## 📋 Workflow Préservé

Toutes les fonctionnalités restent identiques:

1. **Création de Projets** ✅
2. **Gestion des Tâches** ✅
3. **Interface Neural Flow** ✅
4. **Planification IA** ✅
5. **Agents Spécialisés** ✅
6. **Templates de Blog** ✅
7. **Export et Raffinement** ✅

---

## 🔧 Variables d'Environnement

| Variable | Description | Défaut |
|----------|-------------|---------|
| `GROQ_API_KEY` | Clé API Groq (requis) | - |
| `DATABASE_URL` | URL base de données | `sqlite:///data/geekblog.db` |
| `PORT` | Port du serveur | `8000` |
| `WORKERS` | Nombre de workers Uvicorn | `1` |

---

## 🩺 Monitoring & Santé

Endpoint de santé unifié:
```bash
curl http://localhost:8000/health
```

Réponse:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "checks": {
    "app": "healthy",
    "database": "healthy",
    "ai_service": "healthy",
    "disk_space": "healthy",
    "memory": "healthy"
  }
}
```

---

## 🚦 Comparaison des Commandes

| Action | Ancienne Version | Nouvelle Version |
|--------|------------------|------------------|
| **Démarrer** | `docker-compose up -d` (5 containers) | `docker run -d geekblog` (1 container) |
| **Arrêter** | `docker-compose down` | `docker stop geekblog` |
| **Logs** | `docker-compose logs -f` | `docker logs -f geekblog` |
| **Backup** | Complexe (PostgreSQL + Redis) | `cp data/geekblog.db backup/` |
| **Update** | Rebuild 5 containers | Pull 1 image |

---

## 📚 Documentation Technique

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Guide de déploiement production
- **[MIGRATION.md](./MIGRATION.md)** - Migration depuis l'ancienne architecture
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Détails techniques de l'optimisation

### Rapports d'Optimisation
- **Sprint 1**: Migration PostgreSQL → SQLite
- **Sprint 2**: Remplacement Celery+Redis → BackgroundTasks
- **Sprint 3**: Consolidation Docker 5→1 container
- **Sprint 4**: Validation frontend (déjà optimisé)

---

## 🎯 Cas d'Usage Idéaux

Cette version optimisée est parfaite pour:
- ✅ **Blogueurs individuels** 
- ✅ **Petites équipes** (1-5 personnes)
- ✅ **Self-hosting** sur VPS minimal
- ✅ **Raspberry Pi** et appareils limités
- ✅ **Développement local** sans Docker Compose

---

## 🤝 Support & Contribution

- Issues: [GitHub Issues](https://github.com/chrisboulet/geekblog/issues)
- Discussions: [GitHub Discussions](https://github.com/chrisboulet/geekblog/discussions)

---

**GeekBlog Optimized - Plus Simple, Plus Rapide, Toujours Puissant** 🚀