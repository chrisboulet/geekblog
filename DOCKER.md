# 🐳 Guide Docker - GeekBlog

## Vue d'ensemble

GeekBlog utilise Docker pour simplifier le déploiement et assurer la reproductibilité de l'environnement. Toute la stack (backend, frontend, base de données, Redis) est containerisée.

## 🚀 Démarrage rapide

### Prérequis
- Docker 20.0+
- Docker Compose 2.0+
- Git

### Installation et configuration

```bash
# 1. Cloner le projet
git clone <repository-url>
cd geekblog

# 2. Configuration initiale
./scripts/setup.sh

# 3. Configurer votre clé API GROQ
nano .env
# Modifier GROQ_API_KEY=your_actual_key_here

# 4. Démarrer en mode développement
./scripts/start-dev.sh

# 5. Tester les nouvelles fonctionnalités (Phase 5)
./scripts/test-docker-migration.sh
```

**C'est tout !** L'application est accessible sur http://localhost:5173

## 📦 Architecture Docker

### Services disponibles

| Service | Port | Description |
|---------|------|-------------|
| `frontend` | 5173 | React/Vite (dev) ou Nginx (prod) |
| `backend` | 8000 | API FastAPI |
| `db` | 5432 | PostgreSQL 15 |
| `redis` | 6379 | Cache et jobs async |
| `celery_worker` | - | Workers pour tâches IA |

### Fichiers Docker

- `Dockerfile` - Backend Python/FastAPI
- `Dockerfile.frontend` - Frontend React (production)
- `Dockerfile.frontend.dev` - Frontend React (développement)
- `docker-compose.yml` - Environnement de développement
- `docker-compose.prod.yml` - Environnement de production

## 🛠️ Commandes courantes

### Développement

```bash
# Démarrer tous les services
./scripts/start-dev.sh

# Voir les logs en temps réel
docker-compose logs -f

# Voir les logs d'un service spécifique
docker-compose logs -f backend
docker-compose logs -f frontend

# Redémarrer un service
docker-compose restart backend

# Accéder au shell d'un container
docker-compose exec backend bash
docker-compose exec db psql -U geekblog -d geekblogdb

# Arrêter tous les services
docker-compose down

# Arrêter et supprimer les volumes (⚠️ perte de données)
docker-compose down -v
```

### Production

```bash
# Variables d'environnement requises
export GROQ_API_KEY=your_actual_key
export POSTGRES_PASSWORD=secure_production_password

# Démarrer en production
./scripts/start-prod.sh

# Arrêter la production
docker-compose -f docker-compose.prod.yml down
```

### Maintenance

```bash
# Reconstruire les images
docker-compose build --no-cache

# Nettoyer les images Docker
docker system prune -a

# Sauvegarder la base de données
docker-compose exec db pg_dump -U geekblog geekblogdb > backup.sql

# Restaurer la base de données
docker-compose exec -T db psql -U geekblog geekblogdb < backup.sql
```

## 🔧 Configuration

### Variables d'environnement

Le fichier `.env` est automatiquement chargé par Docker Compose :

```env
# Obligatoire
GROQ_API_KEY=your_groq_api_key_here

# Optionnel (valeurs par défaut fournies)
DATABASE_URL=postgresql://geekblog:geekblog_password@db:5432/geekblogdb
REDIS_URL=redis://redis:6379/0
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Production uniquement
POSTGRES_PASSWORD=secure_production_password
```

### Volumes persistants

- `postgres_data` - Données de la base PostgreSQL
- `redis_data` - Cache Redis

## 🐛 Dépannage

### Problèmes courants

#### "Port already in use"
```bash
# Voir les processus utilisant le port
lsof -i :8000
lsof -i :5173

# Arrêter tous les containers
docker-compose down
```

#### "Database connection failed"
```bash
# Vérifier l'état de la base de données
docker-compose exec db pg_isready -U geekblog

# Voir les logs de la base
docker-compose logs db
```

#### "GROQ API key not configured"
```bash
# Vérifier le fichier .env
cat .env | grep GROQ_API_KEY

# Recréer depuis l'exemple
cp .env.example .env
```

#### Services qui ne démarrent pas
```bash
# Reconstruire complètement
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```

### Logs de débogage

```bash
# Tous les logs
docker-compose logs --tail=100 -f

# Logs spécifiques avec timestamps
docker-compose logs -t backend
docker-compose logs -t celery_worker
```

## 🔒 Sécurité

### Développement
- Volumes montés pour hot reload
- Ports exposés sur localhost
- Mots de passe par défaut

### Production
- Images optimisées multi-stage
- Utilisateurs non-root
- Variables d'environnement sécurisées
- Pas de volumes de développement

## 📊 Monitoring

### Health checks
Tous les services ont des health checks configurés :

```bash
# Voir l'état des services
docker-compose ps

# Tester manuellement
curl http://localhost:8000/api/v1/
curl http://localhost:5173/
```

### Métriques

```bash
# Utilisation des ressources
docker stats

# Espace disque des volumes
docker system df
```

## 🚀 Déploiement

### Serveur de production

1. **Prérequis serveur**
```bash
# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Installer Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

2. **Déploiement**
```bash
# Cloner et configurer
git clone <repository-url>
cd geekblog

# Variables d'environnement de production
export GROQ_API_KEY=your_production_key
export POSTGRES_PASSWORD=secure_production_password
export ALLOWED_ORIGINS=https://your-domain.com

# Démarrer
./scripts/start-prod.sh
```

3. **Nginx reverse proxy** (optionnel)
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:80;
    }

    location /api/ {
        proxy_pass http://localhost:8000;
    }
}
```

## 📝 Notes importantes

- **Persistence** : Les données sont persistées dans des volumes Docker
- **Hot reload** : Activé en mode développement pour backend et frontend
- **Migrations** : Automatiquement appliquées au démarrage
- **Scalabilité** : Workers Celery peuvent être scalés avec `docker-compose up --scale celery_worker=3`

---

## 🆕 Phase 5 - Gestion Avancée des Projets

### Nouvelles fonctionnalités intégrées (2025-07-06)

#### Extensions de la base de données
```sql
-- Nouvelles colonnes ajoutées à la table 'projects'
ALTER TABLE projects ADD COLUMN archived BOOLEAN DEFAULT FALSE;
ALTER TABLE projects ADD COLUMN archived_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE projects ADD COLUMN settings JSON;
ALTER TABLE projects ADD COLUMN tags VARCHAR;
```

#### Nouveaux endpoints API disponibles
```bash
# Gestion des projets
POST /api/v1/projects/{id}/archive      # Archiver un projet
POST /api/v1/projects/{id}/unarchive    # Désarchiver un projet
POST /api/v1/projects/{id}/duplicate    # Dupliquer un projet

# Paramètres
GET  /api/v1/projects/{id}/settings     # Récupérer les paramètres
PUT  /api/v1/projects/{id}/settings     # Mettre à jour les paramètres

# Recherche et filtrage
GET  /api/v1/projects/filtered          # Projets avec filtres avancés
GET  /api/v1/projects/tags              # Liste des tags disponibles
PUT  /api/v1/projects/{id}/tags         # Mettre à jour les tags
```

#### Test des nouvelles fonctionnalités
```bash
# Tester les migrations et endpoints
./scripts/test-docker-migration.sh

# Vérifier la documentation API mise à jour
curl http://localhost:8000/docs
# Voir la section "Project Management" dans Swagger
```

#### Migrations automatiques
- **Migration** `2025_07_06_0005_add_project_management_extensions.py`
- **Exécution automatique** au démarrage des containers
- **Rollback disponible** avec `alembic downgrade -1`

#### Fonctionnalités disponibles
✅ **Archivage de projets** - Alternative sûre à la suppression
✅ **Paramètres configurables** - Settings JSON par projet
✅ **Duplication de projets** - Avec préservation des tâches
✅ **Filtrage avancé** - Par statut, tags, pagination
✅ **Gestion des tags** - Système de tags CSV
✅ **APIs complètes** - Tous les endpoints CRUD étendus

#### Interface utilisateur (à venir)
🔜 **Menus kebab** - Actions contextuelles sur chaque projet
🔜 **Couleurs sémantiques** - Bleu (édition), Rouge (danger), etc.
🔜 **Animations** - Rotation hover + fade-in dropdowns
🔜 **Templates de projet** - Blog, Documentation, Marketing, Research
