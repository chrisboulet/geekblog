# Guide de Migration GeekBlog

⚠️ **Note** : Ce guide est fourni pour référence architecturale. GeekBlog étant encore en développement, l'architecture optimisée single-container est implémentée directement sans migration nécessaire.

Pour le développement, voir **[README_DEVELOPMENT.md](./README_DEVELOPMENT.md)**.

---

## 📋 Contexte Architectural

Ce document explique comment migrer depuis une architecture microservices traditionnelle (5 containers) vers l'architecture optimisée GeekBlog (1 container), pour référence future.

## 📋 Table des Matières

1. [Vue d'Ensemble](#vue-densemble)
2. [Pré-Migration](#pré-migration)
3. [Migration des Données](#migration-des-données)
4. [Migration Manuelle](#migration-manuelle)
5. [Migration Automatisée](#migration-automatisée)
6. [Validation](#validation)
7. [Rollback](#rollback)
8. [FAQ](#faq)

---

## 🔄 Vue d'Ensemble

### Changements Majeurs

| Composant | Avant | Après | Impact |
|-----------|--------|-------|--------|
| **Database** | PostgreSQL | SQLite | Migration données requise |
| **Queue** | Celery + Redis | BackgroundTasks | Jobs migrés automatiquement |
| **Containers** | 5 (db, redis, backend, celery, frontend) | 1 | Architecture simplifiée |
| **Deployment** | docker-compose.yml complexe | docker run simple | Configuration simplifiée |
| **Memory** | 12GB+ | <500MB | 95% réduction |

### Compatibilité

✅ **Préservé**: Toutes les fonctionnalités, API endpoints, données  
✅ **Amélioré**: Performance, simplicité, resource usage  
⚠️ **Changé**: Méthode de déploiement, configuration base de données  

---

## 🔍 Pré-Migration

### 1. Vérification Version Actuelle

```bash
# Vérifier la version actuelle
docker-compose ps
curl http://localhost:8000/api/v1/health

# Lister les projets existants
curl http://localhost:8000/api/v1/projects

# Vérifier les données PostgreSQL
docker exec geekblog_db psql -U geekblog -d geekblogdb -c "SELECT COUNT(*) FROM projects;"
```

### 2. Backup Complet

```bash
# 1. Backup PostgreSQL
docker exec geekblog_db pg_dump -U geekblog -d geekblogdb > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Backup Redis (jobs en cours)
docker exec geekblog_redis redis-cli BGSAVE
docker cp geekblog_redis:/data/dump.rdb ./redis_backup.rdb

# 3. Backup configuration
cp .env .env.backup
cp docker-compose.yml docker-compose.yml.backup
```

### 3. Inventaire des Données

```bash
# Script d'inventaire
cat > inventory.sh << 'EOF'
#!/bin/bash
echo "=== GeekBlog Data Inventory ==="
echo "Projects:"
docker exec geekblog_db psql -U geekblog -d geekblogdb -c "SELECT id, title FROM projects;" -t

echo -e "\nTasks:"
docker exec geekblog_db psql -U geekblog -d geekblogdb -c "SELECT COUNT(*) as task_count FROM tasks;" -t

echo -e "\nJobs (Redis):"
docker exec geekblog_redis redis-cli KEYS "*" | wc -l

echo -e "\nDatabase size:"
docker exec geekblog_db psql -U geekblog -d geekblogdb -c "SELECT pg_size_pretty(pg_database_size('geekblogdb'));" -t
EOF

chmod +x inventory.sh && ./inventory.sh
```

---

## 📊 Migration des Données

### Option 1: Migration Automatique (Recommandée)

```bash
# 1. Télécharger le script de migration
curl -O https://raw.githubusercontent.com/chrisboulet/geekblog/main/scripts/migrate_to_optimized.sh
chmod +x migrate_to_optimized.sh

# 2. Exécuter la migration
./migrate_to_optimized.sh

# Le script va:
# - Exporter les données PostgreSQL
# - Arrêter l'ancienne version
# - Démarrer la nouvelle version
# - Importer les données dans SQLite
# - Valider la migration
```

### Option 2: Migration Étape par Étape

#### Étape 1: Export PostgreSQL

```bash
# Export avec format custom
docker exec geekblog_db pg_dump \
  -U geekblog \
  -d geekblogdb \
  --format=custom \
  --no-owner \
  --no-privileges \
  > geekblog_export.dump

# Export en SQL pour vérification
docker exec geekblog_db pg_dump \
  -U geekblog \
  -d geekblogdb \
  --inserts \
  --column-inserts \
  > geekblog_export.sql
```

#### Étape 2: Conversion PostgreSQL → SQLite

```python
# Script Python de conversion
import sqlite3
import psycopg2
import json
from datetime import datetime

def migrate_data():
    # Connexion PostgreSQL
    pg_conn = psycopg2.connect(
        host="localhost",
        port=5432,
        database="geekblogdb",
        user="geekblog",
        password="geekblog_password"
    )
    
    # Connexion SQLite
    sqlite_conn = sqlite3.connect("geekblog_migrated.db")
    
    # Créer les tables SQLite
    with open("schema.sql", "r") as f:
        sqlite_conn.executescript(f.read())
    
    # Migrer les projets
    pg_cursor = pg_conn.cursor()
    pg_cursor.execute("SELECT * FROM projects")
    projects = pg_cursor.fetchall()
    
    sqlite_cursor = sqlite_conn.cursor()
    for project in projects:
        sqlite_cursor.execute("""
            INSERT INTO projects (id, title, description, goal, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, project)
    
    # Migrer les tâches
    pg_cursor.execute("SELECT * FROM tasks")
    tasks = pg_cursor.fetchall()
    
    for task in tasks:
        sqlite_cursor.execute("""
            INSERT INTO tasks (id, project_id, title, description, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, task)
    
    sqlite_conn.commit()
    print("Migration completed successfully!")

if __name__ == "__main__":
    migrate_data()
```

#### Étape 3: Déploiement Nouvelle Version

```bash
# 1. Arrêter l'ancienne version
docker-compose down

# 2. Créer le volume de données
mkdir -p ./data

# 3. Copier la base SQLite migrée
cp geekblog_migrated.db ./data/geekblog.db

# 4. Démarrer la nouvelle version
docker run -d \
  --name geekblog-optimized \
  -p 8000:8000 \
  -v $(pwd)/data:/app/data \
  -e GROQ_API_KEY=${GROQ_API_KEY} \
  geekblog:latest
```

---

## 🛠️ Migration Manuelle

### Si vous préférez le contrôle total

#### 1. Préparer l'environnement

```bash
# Créer répertoire de travail
mkdir geekblog_migration
cd geekblog_migration

# Télécharger les outils de migration
curl -O https://raw.githubusercontent.com/chrisboulet/geekblog/main/scripts/pg_to_sqlite.py
curl -O https://raw.githubusercontent.com/chrisboulet/geekblog/main/scripts/validate_migration.py
```

#### 2. Export des schémas

```bash
# Schéma PostgreSQL
docker exec geekblog_db pg_dump \
  -U geekblog \
  -d geekblogdb \
  --schema-only \
  > schema_pg.sql

# Données seulement
docker exec geekblog_db pg_dump \
  -U geekblog \
  -d geekblogdb \
  --data-only \
  --inserts \
  > data_pg.sql
```

#### 3. Conversion manuelle

```sql
-- Adapter les types PostgreSQL → SQLite
-- schema_sqlite.sql

-- Remplacer:
-- SERIAL → INTEGER PRIMARY KEY AUTOINCREMENT
-- TIMESTAMP → TEXT
-- BOOLEAN → INTEGER
-- TEXT[] → TEXT (JSON)

CREATE TABLE projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    goal TEXT,
    status TEXT DEFAULT 'active',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER REFERENCES projects(id),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending',
    created_by_ai INTEGER DEFAULT 0,
    last_updated_by_ai_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

#### 4. Import dans SQLite

```bash
# Créer la nouvelle base
sqlite3 geekblog.db < schema_sqlite.sql

# Adapter et importer les données
python3 pg_to_sqlite.py \
  --source data_pg.sql \
  --target geekblog.db \
  --validate
```

---

## ✅ Validation

### Script de Validation Complète

```bash
# validate_migration.sh
#!/bin/bash

echo "=== Validation Migration GeekBlog ==="

# 1. Vérifier que le nouveau container tourne
if ! docker ps | grep -q geekblog-optimized; then
    echo "❌ Container optimisé non trouvé"
    exit 1
fi

# 2. Test health endpoint
if ! curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "❌ Health check failed"
    exit 1
fi

# 3. Comparer le nombre de projets
OLD_PROJECTS=$(grep "INSERT INTO projects" data_pg.sql | wc -l)
NEW_PROJECTS=$(curl -s http://localhost:8000/api/v1/projects | jq length)

if [ "$OLD_PROJECTS" != "$NEW_PROJECTS" ]; then
    echo "❌ Nombre de projets différent: $OLD_PROJECTS → $NEW_PROJECTS"
    exit 1
fi

# 4. Comparer le nombre de tâches
OLD_TASKS=$(grep "INSERT INTO tasks" data_pg.sql | wc -l)
NEW_TASKS=$(curl -s http://localhost:8000/api/v1/tasks | jq length)

if [ "$OLD_TASKS" != "$NEW_TASKS" ]; then
    echo "❌ Nombre de tâches différent: $OLD_TASKS → $NEW_TASKS"
    exit 1
fi

# 5. Test fonctionnel: créer un projet
TEST_PROJECT=$(curl -s -X POST http://localhost:8000/api/v1/projects \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Migration","description":"Test post-migration"}')

if ! echo "$TEST_PROJECT" | jq -e '.id' > /dev/null; then
    echo "❌ Impossible de créer un nouveau projet"
    exit 1
fi

echo "✅ Migration validée avec succès!"
echo "   - Projets: $NEW_PROJECTS"
echo "   - Tâches: $NEW_TASKS"
echo "   - Test fonctionnel: OK"
```

---

## 🔙 Rollback

### En cas de problème

```bash
# 1. Arrêter la nouvelle version
docker stop geekblog-optimized
docker rm geekblog-optimized

# 2. Restaurer l'ancienne version
docker-compose -f docker-compose.yml.backup up -d

# 3. Attendre que les services démarrent
sleep 30

# 4. Restaurer les données PostgreSQL si nécessaire
docker exec -i geekblog_db psql -U geekblog -d geekblogdb < backup_YYYYMMDD_HHMMSS.sql

# 5. Vérifier
curl http://localhost:8000/api/v1/projects
```

### Plan de Rollback Automatisé

```bash
# rollback.sh
#!/bin/bash
echo "Rollback vers l'ancienne version..."

# Backup des nouvelles données au cas où
docker exec geekblog-optimized sqlite3 /app/data/geekblog.db ".backup '/tmp/optimized_backup.db'"
docker cp geekblog-optimized:/tmp/optimized_backup.db ./

# Arrêt nouvelle version
docker stop geekblog-optimized
docker rm geekblog-optimized

# Restauration ancienne version
docker-compose -f docker-compose.yml.backup up -d

echo "Rollback terminé. Vérifiez http://localhost:8000"
```

---

## ❓ FAQ

### Q: Puis-je faire une migration en zero-downtime?

**R**: Partiellement. Vous pouvez:
1. Démarrer la nouvelle version sur port 8001
2. Migrer les données
3. Basculer le reverse proxy
4. Arrêter l'ancienne version

### Q: Les jobs Celery en cours sont-ils perdus?

**R**: Les jobs en cours seront perdus. Planifiez la migration pendant une période creuse.

### Q: Puis-je revenir à PostgreSQL plus tard?

**R**: Oui, nous fournirons un script SQLite → PostgreSQL si nécessaire.

### Q: La nouvelle version supporte-t-elle le clustering?

**R**: Non, elle est optimisée pour single-user. Pour le clustering, gardez l'ancienne architecture.

### Q: Comment migrer si j'ai des customizations?

**R**: Contactez-nous avec vos modifications, nous vous aiderons à les adapter.

### Q: Et si ma base PostgreSQL est très grande (>1GB)?

**R**: SQLite peut gérer plusieurs GB. Testez d'abord sur une copie.

---

## 📞 Support Migration

Pour assistance durant la migration:
- Issues: https://github.com/chrisboulet/geekblog/issues
- Tag: `migration`
- Include: logs, version actuelle, taille des données

---

**Migration GeekBlog - Votre Guide Complet vers l'Optimisation** 🚀