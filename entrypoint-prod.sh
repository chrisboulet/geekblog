#!/bin/bash
set -e

# Configuration
DB_HOST="${DB_HOST:-db}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-geekblog}"
DB_NAME="${DB_NAME:-geekblogdb}"
TIMEOUT="${DB_TIMEOUT:-30}"
COUNTER=0

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check database connection
check_db() {
    pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -q
}

# Wait for database with timeout
echo -e "${YELLOW}Waiting for database connection (timeout: ${TIMEOUT}s)...${NC}"
echo "Connecting to: $DB_HOST:$DB_PORT as $DB_USER"

while ! check_db; do
    if [ $COUNTER -eq $TIMEOUT ]; then
        echo -e "${RED}ERROR: Database connection timeout after ${TIMEOUT} seconds!${NC}"
        echo "Please check:"
        echo "  - Database service is running"
        echo "  - Connection parameters are correct"
        echo "  - Network connectivity between containers"
        exit 1
    fi
    
    echo -e "Database unavailable - waiting... (${COUNTER}/${TIMEOUT})"
    sleep 1
    COUNTER=$((COUNTER + 1))
done

echo -e "${GREEN}✓ Database connection established${NC}"

# Function to run migrations safely
run_migrations() {
    echo -e "${YELLOW}Checking database migrations...${NC}"
    
    # Check if alembic is initialized
    if ! alembic current 2>/dev/null; then
        echo -e "${YELLOW}Initializing database with migrations...${NC}"
        alembic upgrade head
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ Database initialized successfully${NC}"
        else
            echo -e "${RED}ERROR: Failed to initialize database${NC}"
            exit 1
        fi
    else
        # Check for pending migrations
        CURRENT_REV=$(alembic current 2>/dev/null | grep -oE '[a-f0-9]{12}' | head -1)
        HEAD_REV=$(alembic heads 2>/dev/null | grep -oE '[a-f0-9]{12}' | head -1)
        
        if [ "$CURRENT_REV" != "$HEAD_REV" ]; then
            echo "Current revision: $CURRENT_REV"
            echo "Head revision: $HEAD_REV"
            echo -e "${YELLOW}Running pending migrations...${NC}"
            
            alembic upgrade head
            
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}✓ Migrations completed successfully${NC}"
            else
                echo -e "${RED}ERROR: Migration failed${NC}"
                exit 1
            fi
        else
            echo -e "${GREEN}✓ Database is up to date${NC}"
        fi
    fi
}

# Run migrations
run_migrations

# Seed templates if requested
if [ "$SEED_TEMPLATES" = "true" ]; then
    echo -e "${YELLOW}Seeding blog templates...${NC}"
    python -m app.db.seed_templates
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Templates seeded successfully${NC}"
    else
        echo -e "${YELLOW}Warning: Template seeding failed (may already exist)${NC}"
    fi
fi

# Create necessary directories
echo -e "${YELLOW}Creating application directories...${NC}"
mkdir -p /app/logs /app/uploads
echo -e "${GREEN}✓ Directories created${NC}"

# Health check before starting
echo -e "${YELLOW}Running pre-flight checks...${NC}"
python -c "
import sys
try:
    from app.main import app
    from app.db.config import engine
    from sqlalchemy import text
    
    # Test database connection
    with engine.connect() as conn:
        result = conn.execute(text('SELECT 1'))
        assert result.fetchone()[0] == 1
    
    print('✓ Database connection: OK')
    print('✓ Application import: OK')
except Exception as e:
    print(f'ERROR: Pre-flight check failed: {e}')
    sys.exit(1)
"

if [ $? -ne 0 ]; then
    echo -e "${RED}Pre-flight checks failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✓ All pre-flight checks passed${NC}"

# Start the application
echo -e "${GREEN}Starting GeekBlog application...${NC}"
echo "Command: $@"
exec "$@"