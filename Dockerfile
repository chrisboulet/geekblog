# Dockerfile pour le backend GeekBlog (Python/FastAPI)
FROM python:3.12-slim

# Définir la locale pour éviter les warnings PostgreSQL
ENV LANG C.UTF-8

# Définir le répertoire de travail
WORKDIR /app

# Installer les dépendances système
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copier et installer les dépendances Python
COPY backend_requirements.txt .
RUN pip install --no-cache-dir -r backend_requirements.txt

# Copier le code source
COPY app/ ./app/
COPY alembic.ini .

# S'assurer que les migrations sont copiées (déjà incluses dans app/ mais par sécurité)
# Les migrations sont dans app/db/migrations/versions/

# Installer postgresql-client pour pg_isready et curl pour health check
RUN apt-get update && apt-get install -y postgresql-client curl && rm -rf /var/lib/apt/lists/*

# Copier le script entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Créer un utilisateur non-root pour la sécurité
RUN useradd --create-home --shell /bin/bash app && chown -R app:app /app
USER app

# Exposer le port
EXPOSE 8000

# Utiliser l'entrypoint pour les migrations
ENTRYPOINT ["/entrypoint.sh"]

# Commande de démarrage (sans --reload pour production)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
