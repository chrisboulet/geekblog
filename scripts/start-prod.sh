#!/bin/bash
# Script de démarrage pour l'environnement de production

echo "🚀 Démarrage de GeekBlog en mode production..."

# Vérifier si Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Vérifier si docker-compose est installé
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Vérifier les variables d'environnement requises
if [ -z "$GROQ_API_KEY" ]; then
    echo "❌ GROQ_API_KEY n'est pas définie. Veuillez l'exporter :"
    echo "   export GROQ_API_KEY=your_api_key_here"
    exit 1
fi

# Arrêter les containers existants
echo "🛑 Arrêt des containers existants..."
docker-compose -f docker-compose.prod.yml down

# Construire et démarrer les services
echo "🏗️  Construction et démarrage des services en mode production..."
docker-compose -f docker-compose.prod.yml up --build -d

# Attendre que les services soient prêts
echo "⏳ Attente du démarrage des services..."
sleep 15

# Exécuter les migrations de base de données
echo "🗄️  Exécution des migrations de base de données..."
docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head

echo "✅ GeekBlog Production est maintenant accessible :"
echo "   🌐 Application: http://localhost"
echo "   🔧 Backend API: http://localhost:8000"
echo "   📚 Documentation API: http://localhost:8000/docs"
echo ""
echo "📊 Pour voir les logs :"
echo "   docker-compose -f docker-compose.prod.yml logs -f"
echo ""
echo "🛑 Pour arrêter :"
echo "   docker-compose -f docker-compose.prod.yml down"
