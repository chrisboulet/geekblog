#!/bin/bash
set -e

# Attendre que la base de données soit prête
echo "Waiting for database..."
while ! pg_isready -h db -p 5432 -U geekblog -q; do
  echo "Database is unavailable - sleeping"
  sleep 2
done

echo "Database is up - running migrations"

# Exécuter les migrations Alembic
echo "Running database migrations..."
alembic upgrade head

# Exécuter la commande principale (passée au script)
echo "Starting application..."
exec "$@"