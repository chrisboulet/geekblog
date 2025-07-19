# Guide de Déploiement GeekBlog (Version Optimisée)

Ce guide couvre le déploiement de GeekBlog avec la nouvelle architecture single-container optimisée.

## 📋 Table des Matières

1. [Prérequis](#prérequis)
2. [Déploiement Rapide](#déploiement-rapide)
3. [Configuration Production](#configuration-production)
4. [Déploiement Cloud](#déploiement-cloud)
5. [SSL/HTTPS](#sslhttps)
6. [Monitoring](#monitoring)
7. [Backup & Restore](#backup--restore)
8. [Troubleshooting](#troubleshooting)

---

## 🔧 Prérequis

### Minimum Requis
- **Docker**: 20.10+
- **RAM**: 512MB minimum (1GB recommandé)
- **Disque**: 1GB espace libre
- **CPU**: 1 vCPU minimum

### Ports Requis
- **8000**: Application web (configurable)

---

## 🚀 Déploiement Rapide

### 1. Installation One-Liner

```bash
# Télécharger et démarrer GeekBlog
docker run -d \
  --name geekblog \
  --restart unless-stopped \
  -p 8000:8000 \
  -v geekblog_data:/app/data \
  -e GROQ_API_KEY=your_groq_api_key \
  geekblog:latest
```

### 2. Vérification

```bash
# Vérifier que le container tourne
docker ps | grep geekblog

# Vérifier les logs
docker logs geekblog

# Tester l'endpoint de santé
curl http://localhost:8000/health
```

---

## ⚙️ Configuration Production

### 1. Créer le fichier de configuration

`production.env`:
```env
# API Keys
GROQ_API_KEY=your_production_groq_key

# Database
DATABASE_URL=sqlite:///data/geekblog.db

# Security
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Performance
WORKERS=4
LOG_LEVEL=warning

# Optional
SENTRY_DSN=your-sentry-dsn-for-monitoring
```

### 2. Docker Compose Production

`docker-compose.prod.yml`:
```yaml
version: '3.8'

services:
  geekblog:
    image: geekblog:latest
    container_name: geekblog_prod
    restart: always
    ports:
      - "127.0.0.1:8000:8000"  # Bind to localhost only
    env_file:
      - production.env
    volumes:
      - geekblog_data:/app/data
      - ./backups:/app/backups
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M

volumes:
  geekblog_data:
    driver: local
```

### 3. Démarrer en production

```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

## ☁️ Déploiement Cloud

### AWS EC2 / Lightsail

```bash
# 1. Lancer une instance Ubuntu 22.04 (t3.micro suffit)

# 2. SSH dans l'instance
ssh ubuntu@your-instance-ip

# 3. Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# 4. Déployer GeekBlog
docker run -d \
  --name geekblog \
  --restart always \
  -p 80:8000 \
  -v geekblog_data:/app/data \
  -e GROQ_API_KEY=your_key \
  geekblog:latest
```

### DigitalOcean Droplet

```bash
# 1. Créer un Droplet Ubuntu avec Docker pré-installé

# 2. Deploy script
#!/bin/bash
docker pull geekblog:latest
docker stop geekblog || true
docker rm geekblog || true
docker run -d \
  --name geekblog \
  --restart always \
  -p 80:8000 \
  -v /var/lib/geekblog:/app/data \
  -e GROQ_API_KEY=$GROQ_API_KEY \
  geekblog:latest
```

### Google Cloud Run

```bash
# 1. Build et push vers Container Registry
gcloud builds submit --tag gcr.io/PROJECT-ID/geekblog

# 2. Déployer sur Cloud Run
gcloud run deploy geekblog \
  --image gcr.io/PROJECT-ID/geekblog \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars GROQ_API_KEY=$GROQ_API_KEY \
  --memory 1Gi
```

---

## 🔒 SSL/HTTPS

### Avec Nginx Reverse Proxy

1. **Installer Nginx**:
```bash
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx
```

2. **Configuration Nginx** `/etc/nginx/sites-available/geekblog`:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

3. **Activer et obtenir SSL**:
```bash
sudo ln -s /etc/nginx/sites-available/geekblog /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Avec Traefik (Alternative)

`docker-compose.traefik.yml`:
```yaml
version: '3.8'

services:
  traefik:
    image: traefik:v2.10
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./traefik.yml:/traefik.yml
      - ./acme.json:/acme.json
    labels:
      - "traefik.enable=true"

  geekblog:
    image: geekblog:latest
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.geekblog.rule=Host(`yourdomain.com`)"
      - "traefik.http.routers.geekblog.tls=true"
      - "traefik.http.routers.geekblog.tls.certresolver=letsencrypt"
```

---

## 📊 Monitoring

### 1. Health Check Endpoint

```bash
# Script de monitoring
#!/bin/bash
while true; do
  if ! curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "GeekBlog is DOWN!" | mail -s "GeekBlog Alert" admin@yourdomain.com
  fi
  sleep 300
done
```

### 2. Prometheus Metrics (Optionnel)

Ajouter au `docker-compose.prod.yml`:
```yaml
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"
```

### 3. Logs Aggregation

```bash
# Voir les logs en temps réel
docker logs -f geekblog

# Export logs vers fichier
docker logs geekblog > geekblog.log 2>&1

# Avec timestamps
docker logs -t geekblog
```

---

## 💾 Backup & Restore

### Backup Automatique

`backup.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/geekblog"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Créer le répertoire de backup
mkdir -p $BACKUP_DIR

# Backup de la base de données
docker exec geekblog sqlite3 /app/data/geekblog.db ".backup '$BACKUP_DIR/geekblog_$TIMESTAMP.db'"

# Compression
gzip $BACKUP_DIR/geekblog_$TIMESTAMP.db

# Nettoyer les anciens backups (garder 7 jours)
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete

echo "Backup completed: geekblog_$TIMESTAMP.db.gz"
```

### Restore

```bash
# 1. Arrêter GeekBlog
docker stop geekblog

# 2. Restaurer la base de données
gunzip -c /var/backups/geekblog/geekblog_20250119_120000.db.gz > temp.db
docker cp temp.db geekblog:/app/data/geekblog.db

# 3. Redémarrer
docker start geekblog
```

### Backup vers S3 (Optionnel)

```bash
# Installation AWS CLI
apt-get install awscli

# Script backup S3
aws s3 cp $BACKUP_DIR/geekblog_$TIMESTAMP.db.gz s3://your-bucket/geekblog-backups/
```

---

## 🔧 Troubleshooting

### Container ne démarre pas

```bash
# Vérifier les logs détaillés
docker logs geekblog --details

# Vérifier les permissions
ls -la /var/lib/docker/volumes/geekblog_data/_data

# Mode debug
docker run -it --rm \
  -e LOG_LEVEL=debug \
  -e GROQ_API_KEY=your_key \
  geekblog:latest
```

### Performance Issues

```bash
# Vérifier l'utilisation des ressources
docker stats geekblog

# Augmenter les limites mémoire
docker update --memory="2g" --memory-swap="2g" geekblog

# Optimiser SQLite
docker exec geekblog sqlite3 /app/data/geekblog.db "VACUUM;"
```

### Database Corruption

```bash
# 1. Backup corrompu
docker cp geekblog:/app/data/geekblog.db ./corrupted.db

# 2. Tenter réparation
sqlite3 corrupted.db ".recover" | sqlite3 recovered.db

# 3. Remplacer
docker cp recovered.db geekblog:/app/data/geekblog.db
docker restart geekblog
```

---

## 🚨 Commandes Utiles

```bash
# Update GeekBlog
docker pull geekblog:latest
docker stop geekblog
docker rm geekblog
# Re-run with same parameters

# Shell dans le container
docker exec -it geekblog /bin/bash

# Voir config active
docker exec geekblog env | grep -E "GROQ|DATABASE"

# Test API directement
docker exec geekblog curl http://localhost:8000/api/v1/projects

# Export données JSON
docker exec geekblog python -m app.utils.export_data > export.json
```

---

## 📞 Support

Pour toute question ou problème:
- GitHub Issues: https://github.com/chrisboulet/geekblog/issues
- Documentation: https://github.com/chrisboulet/geekblog/wiki

---

**GeekBlog - Déploiement Simple, Performance Optimale** 🚀