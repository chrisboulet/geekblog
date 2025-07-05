#!/bin/bash
# Script de démarrage pour l'environnement de développement

echo "🚀 Démarrage de GeekBlog en mode développement..."

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

# Vérifier si le fichier .env existe
if [ ! -f .env ]; then
    echo "⚠️  Fichier .env introuvable. Création d'un fichier d'exemple..."
    cp .env.example .env
    echo "📝 Veuillez configurer votre GROQ_API_KEY dans le fichier .env"
fi

# Arrêter les containers existants
echo "🛑 Arrêt des containers existants..."
docker-compose down

# Construire et démarrer les services
echo "🏗️  Construction et démarrage des services..."
docker-compose up --build -d

# Attendre que les services soient prêts
echo "⏳ Attente du démarrage des services..."
sleep 10

# Exécuter les migrations de base de données
echo "🗄️  Exécution des migrations de base de données..."
docker-compose exec backend alembic upgrade head

echo "✅ GeekBlog est maintenant accessible :"
echo "   🖥️  Frontend: http://localhost:5173"
echo "   🔧 Backend API: http://localhost:8000"
echo "   📚 Documentation API: http://localhost:8000/docs"
echo "   🗄️  Base de données: localhost:5432"
echo "   🔴 Redis: localhost:6379"
echo ""
echo "📊 Pour voir les logs :"
echo "   docker-compose logs -f"
echo ""
echo "🛑 Pour arrêter :"
echo "   docker-compose down"