#!/bin/bash
# Script de configuration initiale pour GeekBlog

echo "🔧 Configuration initiale de GeekBlog..."

# Créer le répertoire scripts s'il n'existe pas
mkdir -p scripts

# Rendre les scripts exécutables
chmod +x scripts/*.sh

# Créer le fichier .env.example s'il n'existe pas
if [ ! -f .env.example ]; then
    echo "📝 Création du fichier .env.example..."
    cat > .env.example << 'EOF'
# Configuration GeekBlog

# Base de données (automatique avec Docker)
DATABASE_URL=postgresql://geekblog:geekblog_password@localhost:5432/geekblogdb

# Clé API GROQ (OBLIGATOIRE - obtenir sur https://console.groq.com/)
GROQ_API_KEY=your_groq_api_key_here

# Redis (automatique avec Docker)
REDIS_URL=redis://localhost:6379/0

# CORS Origins (optionnel)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Production uniquement
POSTGRES_PASSWORD=your_secure_production_password
EOF
fi

# Copier .env.example vers .env s'il n'existe pas
if [ ! -f .env ]; then
    echo "📄 Création du fichier .env depuis l'exemple..."
    cp .env.example .env
    echo "⚠️  IMPORTANT: Configurez votre GROQ_API_KEY dans le fichier .env"
fi

echo "✅ Configuration terminée !"
echo ""
echo "📋 Prochaines étapes :"
echo "1. Éditez le fichier .env et configurez votre GROQ_API_KEY"
echo "2. Lancez l'environnement de développement :"
echo "   ./scripts/start-dev.sh"
echo ""
echo "🔗 Liens utiles :"
echo "   - Clé API GROQ: https://console.groq.com/"
echo "   - Documentation Docker: https://docs.docker.com/"
