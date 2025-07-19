# DOCKER_CONSOLIDATION_PLAN.md - Plan de Consolidation Docker Sprint 3

**Date**: 2025-07-18  
**Sprint**: Sprint 3 - Docker Simplification  
**Objectif**: 5 conteneurs → 1 conteneur production optimisé

---

## 📊 État Actuel - Architecture 5-Conteneurs

### Conteneurs Actuels Analysés

| Service | Image | Memory | Rôle | Dépendances |
|---------|-------|--------|------|-------------|
| **db** | postgres:15-alpine | N/A | Database principale | Aucune |
| **redis** | redis:7-alpine | N/A | Queue Celery + cache | Aucune |
| **backend** | Custom Dockerfile | 4GB | API FastAPI + migrations | db, redis |
| **celery_worker** | Custom Dockerfile | 2GB | Jobs asynchrones IA | db, redis |
| **frontend** | node:20-alpine → nginx | 6GB | UI React/Vite | backend |

**Total Memory**: 12GB+ limites  
**Startup Time**: ~2 minutes (orchestration)  
**Complexity**: Health checks inter-conteneurs complexes

### Problèmes Identifiés

1. **Over-Engineering Massif**
   - PostgreSQL pour blog personnel (overkill)
   - Celery/Redis pour un seul utilisateur
   - 28 dépendances vs 15 nécessaires

2. **Resource Waste**
   - 12GB memory pour use case simple
   - Network overhead inter-conteneurs
   - 5 processes pour workload mono-utilisateur

3. **Maintenance Burden**
   - Administration PostgreSQL + Redis
   - Orchestration complexe 5 services
   - Health checks et dependencies sophisticated

4. **Performance Issues**
   - Startup lent (orchestration services)
   - Latence network inter-conteneurs
   - Resource contention entre services

---

## 🎯 Architecture Cible - Container Unique

### Vision Container Unique

```
geekblog_production_container:
├── FastAPI App (port 8000)
├── Static Files Serving (React build)
├── SQLite Database (file-based)
├── BackgroundTasks (async jobs)
└── Health Monitoring (simplifié)
```

### Caractéristiques Cibles

| Métrique | Actuel | Cible | Amélioration |
|----------|--------|-------|-------------|
| **Containers** | 5 | 1 | 80% réduction |
| **Memory** | 12GB+ | <500MB | 95% réduction |
| **Startup** | ~2min | <30s | 75% réduction |
| **Dependencies** | 28 packages | 15 packages | 46% réduction |
| **Maintenance** | Complex | Zero-maintenance | 100% simplification |

---

## 🏗️ Plan Technique Détaillé

### Phase 1: Database Migration (PLANNING DÉJÀ FAIT)
*Référence: NEXT_TASKS.md#database-migration*

✅ **Analysé**: Schema PostgreSQL → SQLite compatibility  
✅ **Conçu**: Migration strategy pour données existantes  
⏳ **À faire**: Implémentation effective dans Sprint 1

### Phase 2: Queue System Replacement

#### Celery → FastAPI BackgroundTasks

**Mappage des Tâches**:
```python
# ACTUEL (Celery)
@celery_app.task(bind=True, base=JobAwareTask)
def planning_task(self, project_id, project_goal):
    # Complex queue routing, retry logic

# CIBLE (BackgroundTasks)
async def planning_task_background(project_id: int, project_goal: str):
    # Simple async function
    
@app.post("/api/v1/projects/{project_id}/plan")
async def create_plan(project_id: int, background_tasks: BackgroundTasks):
    background_tasks.add_task(planning_task_background, project_id, goal)
```

**Job Status Tracking**:
- **Actuel**: Redis + Database complex tracking
- **Cible**: SQLite-based simple status table
- **Pattern**: Polling endpoint `/api/v1/jobs/{job_id}/status`

### Phase 3: Container Consolidation

#### Multi-Stage Dockerfile Optimisé

```dockerfile
# Stage 1: Frontend Build
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY package*.json ./
RUN npm ci --only=production
COPY src/ public/ index.html vite.config.ts tsconfig*.json tailwind.config.js postcss.config.js ./
RUN npm run build

# Stage 2: Backend Builder
FROM python:3.12-slim AS backend-builder
WORKDIR /app

# Install build tools (séparé du container production)
RUN apt-get update && apt-get install -y \
    gcc g++ \
    && rm -rf /var/lib/apt/lists/*

# Créer environnement virtuel
ENV VIRTUAL_ENV=/opt/venv
RUN python3 -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

# Install Python dependencies dans le venv
COPY requirements-simplified.txt .
RUN pip install --no-cache-dir -r requirements-simplified.txt

# Stage 3: Production Container (sans build tools)
FROM python:3.12-slim AS production
WORKDIR /app

# Copier seulement le venv construit (pas les build tools)
COPY --from=backend-builder /opt/venv /opt/venv

# Configurer environnement virtuel
ENV VIRTUAL_ENV=/opt/venv
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

# Copy backend code
COPY app/ ./app/

# Copy frontend build
COPY --from=frontend-builder /app/frontend/dist ./static/

# Create non-root user
RUN useradd --create-home --shell /bin/bash app && chown -R app:app /app
USER app

# Single entrypoint (no external dependencies)
COPY entrypoint-simple.sh /entrypoint-simple.sh
ENTRYPOINT ["/entrypoint-simple.sh"]

# Serve API + Static files
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### Entrypoint Script Definition

Le script `entrypoint-simple.sh` assure un environnement de démarrage cohérent :

```bash
#!/bin/bash
# entrypoint-simple.sh - Script d'entrée simplifié pour container unifié

# Sortir immédiatement si une commande échoue
set -e

echo "🚀 Container GeekBlog unifié - Initialisation..."

# Placeholder pour futures tâches de startup, ex:
# - Vérifier que le schéma SQLite est à jour
# - Créer répertoires nécessaires
# - Validation configuration
echo "✅ Environnement container initialisé"

# Exécuter la commande passée en arguments (le Docker CMD)
exec "$@"
```

#### Static Files Serving

```python
# app/main.py - Enhanced for static serving
from fastapi.staticfiles import StaticFiles
import sqlite3
import os
from urllib.parse import urlparse

app = FastAPI(title="GeekBlog", version="1.0.0")

# Serve React build
app.mount("/static", StaticFiles(directory="static"), name="static")

# SPA fallback for React Router
@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    if full_path.startswith("api/"):
        raise HTTPException(404)
    return FileResponse("static/index.html")
```

---

## 🔧 Configurations Simplifiées

### Development vs Production

#### docker-compose.dev.yml (2 services)
```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.simple
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=sqlite:///./geekblog.db
      - DEBUG=true
    volumes:
      - ./app:/app/app
      - ./geekblog.db:/app/geekblog.db

  frontend-dev:
    build:
      context: .
      dockerfile: Dockerfile.frontend.dev
    ports:
      - "5173:5173"
    environment:
      - VITE_API_BASE_URL=http://localhost:8000/api/v1
    volumes:
      - ./src:/app/src
      - ./package.json:/app/package.json
```

#### docker-compose.prod.yml (1 service)
```yaml
services:
  geekblog:
    build:
      context: .
      dockerfile: Dockerfile.simple
      target: production
    ports:
      - "80:8000"
    environment:
      - DATABASE_URL=sqlite:///./data/geekblog.db
      - GROQ_API_KEY=${GROQ_API_KEY}
    volumes:
      - geekblog_data:/app/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  geekblog_data:
```

### Simplified Requirements

#### requirements-simplified.txt
```txt
# Core Framework (unchanged)
fastapi>=0.100.0
uvicorn[standard]>=0.20.0
pydantic[email]>=2.0.0

# Database (simplified)
sqlalchemy>=2.0.0
# Removed: alembic, psycopg2-binary

# Configuration
python-dotenv>=1.0.0

# Removed: celery, redis

# AI Features (preserved)
crewai>=0.28.8
crewai-tools>=0.1.0
groq>=0.4.0
langchain-groq>=0.1.0
langchain-community>=0.0.29
duckduckgo-search>=4.0.0

# Monitoring (simplified)
psutil>=5.9.8

# Static files serving
aiofiles>=23.0.0
```

---

## 🩺 Health Checks & Monitoring Simplifiés

### Health Endpoint Unified

```python
@app.get("/health", tags=["monitoring"])
async def health_check():
    """Simplified health check for single container"""
    
    checks = {
        "app": "healthy",
        "database": check_sqlite_connection(),
        "ai_service": check_groq_api(),
        "disk_space": check_disk_space(),
        "memory": check_memory_usage()
    }
    
    status = "healthy" if all(v == "healthy" for v in checks.values()) else "unhealthy"
    
    return {
        "status": status,
        "timestamp": datetime.utcnow(),
        "checks": checks,
        "version": "1.0.0"
    }

def check_sqlite_connection() -> str:
    try:
        # Utiliser la même source de vérité que l'application
        db_url = os.getenv("DATABASE_URL", "sqlite:///geekblog.db")
        db_path = urlparse(db_url).path
        # Le path peut être relatif, ex: ./data/geekblog.db
        # Dans un container Docker, working directory est /app
        # Supprimer le '/' initial pour sqlite connect
        if db_path.startswith('/'):
            db_path = db_path[1:]
        
        with sqlite3.connect(db_path) as conn:
            conn.execute("SELECT 1").fetchone()
        return "healthy"
    except Exception as e:
        # Bonne pratique de logger l'exception pour debug
        print(f"Health check failed: {e}")
        return "unhealthy"
```

### Monitoring Léger (Optional)

Pour les users qui veulent monitoring avancé, créer:
`docker-compose.monitoring-light.yml` avec seulement:
- Prometheus (métrics léger)
- Grafana (dashboards essentiels)

Total: 3 containers (app + monitoring) vs 13 actuels.

---

## 📋 Migration Roadmap

### Week 1: Database Migration (Sprint 1)
- [x] **Database Analysis** ✅ (analysé via cette session)
- [ ] **SQLite Implementation** - NEXT_TASKS.md#sqlite-implementation
- [ ] **Data Migration Scripts** - Export PostgreSQL → Import SQLite
- [ ] **Model Updates** - Remove PostgreSQL-specific features

### Week 2: Queue System (Sprint 2)
- [ ] **Celery Mapping** - Document all current Celery tasks
- [ ] **BackgroundTasks Implementation** - Replace Celery workflows
- [ ] **Job Tracking** - SQLite-based status tracking
- [ ] **Redis Removal** - Clean up all Redis dependencies

### Week 3: Docker Consolidation (Sprint 3)
- [ ] **Multi-stage Dockerfile** - Frontend build + Backend serve
- [ ] **Static Files Serving** - FastAPI serve React build
- [ ] **Container Testing** - Validate single container works
- [ ] **Performance Validation** - Baseline vs new architecture

### Week 4: Cleanup & Optimization (Sprint 4)
- [ ] **Code Cleanup** - Remove celery_config.py, tasks/, etc.
- [ ] **Documentation Update** - New deployment guides
- [ ] **Performance Tuning** - Optimize for single-user workload
- [ ] **Final Testing** - End-to-end validation

---

## ✅ Success Criteria

### Functional Requirements
- [ ] **All API endpoints** fonctionnent identiquement
- [ ] **AI workflows** (planning, research, writing) préservés
- [ ] **Frontend** fonctionne sans changement
- [ ] **Data integrity** maintenue pendant migration

### Performance Requirements
- [ ] **Memory usage** < 500MB (vs 12GB+ actuel)
- [ ] **Startup time** < 30s (vs 2min actuel)
- [ ] **API response time** ≤ current performance
- [ ] **AI task completion** ≤ current time

### Operational Requirements
- [ ] **Single command deploy** `docker run` pour production
- [ ] **Zero external dependencies** pour core functionality
- [ ] **Backup/restore** simple (1 SQLite file)
- [ ] **Health monitoring** functional et informatif

---

## ⚠️ Risks & Mitigations

### Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **SQLite Performance** | Medium | Low | Benchmark + fallback plan |
| **BackgroundTasks Limitations** | High | Medium | Thorough testing + monitoring |
| **Static Files Serving** | Low | Low | Use proven FastAPI patterns |
| **Data Migration Loss** | High | Low | Full backup + validation scripts |

### Operational Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Development Workflow** | Medium | Medium | Maintain dev compose for hot reload |
| **Monitoring Loss** | Low | High | Essential monitoring preserved |
| **Debugging Complexity** | Medium | Medium | Enhanced logging + dev tools |

---

## 📈 Expected Benefits

### Quantified Improvements

- **Resource Efficiency**: 95% memory reduction
- **Deployment Simplicity**: 80% complexity reduction
- **Maintenance Burden**: 100% external dependencies elimination
- **Development Speed**: 75% faster startup/iteration

### Qualitative Benefits

- **Self-Contained**: No external service dependencies
- **Production-Ready**: Single container deployment
- **Cost-Effective**: Minimal resource requirements
- **Developer-Friendly**: Simplified local development

---

## 🚀 Next Actions

### Immediate (Today)
1. **Review ce plan** avec équipe/stakeholders
2. **Validate approach** BackgroundTasks vs Celery
3. **Confirm SQLite** compatibility avec tous modèles
4. **Plan data backup** strategy avant migration

### This Week
1. **Start Sprint 1** - Database migration implementation
2. **Document current** Celery workflows pour mapping
3. **Setup development** branches pour rollback
4. **Begin testing** SQLite avec existing data

---

*Plan créé: 2025-07-18*  
*Version: 1.0*  
*Référence: NEXT_TASKS.md, PLANNING.md, METHOD_TASK.md*