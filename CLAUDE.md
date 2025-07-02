# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Backend Commands
```bash
# Install dependencies
pip install -r backend_requirements.txt

# Run backend server (FastAPI will auto-reload on code changes)
uvicorn app.main:app --reload

# Run backend tests
pytest

# Database migrations
alembic upgrade head
alembic revision --autogenerate -m "Description"

# Access API documentation
# Swagger UI: http://localhost:8000/docs
# ReDoc: http://localhost:8000/redoc
# OpenAPI Schema: http://localhost:8000/api/v1/openapi.json
```

### Frontend Commands
```bash
# Install dependencies
npm install

# Development server (port 5173)
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check

# Linting
npm run lint

# Preview production build
npm run preview
```

## Environment Configuration

### Backend (.env file required)
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/geekblogdb

# AI Service (CrewAI with Groq)
GROQ_API_KEY=your_groq_api_key_here
```

### Frontend
```bash
# API endpoint (defaults to http://localhost:8000/api/v1)
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## Architecture Overview

GeekBlog is a content creation command center that combines human creativity with AI agents to streamline blog post creation through a visual Kanban workflow.

### Backend (Python/FastAPI)
- **Entry Point**: `app/main.py` - FastAPI application with CORS configured for ports 3000 and 5173
- **API Structure**: RESTful API versioned at `/api/v1/`
- **Database**: PostgreSQL with SQLAlchemy ORM, migrations in `app/db/migrations/`
- **Core Models** (`app/models/models.py`):
  - `Project`: Container with name and description
  - `Task`: Work unit with title, description, status, order, and project_id
- **Schemas** (`app/schemas/schemas.py`): Pydantic models for API validation
- **Services Layer** (`app/services/`):
  - `project_service.py`: CRUD operations for projects
  - `task_service.py`: CRUD operations for tasks
  - `ai_service.py`: CrewAI orchestration with Groq LLM (llama3-8b-8192)
- **AI Agents** (defined in `ai_service.py`):
  - `planner_agent`: Decomposes project goals into task lists
  - `researcher_agent`: Web research using DuckDuckGo
  - `writer_agent`: Content creation from research
  - `Finishing Crew`: Sequential refinement (critic → style → fact-check → proofread)
- **API Endpoints** (`app/api/endpoints/`):
  - Projects: CRUD + `/projects/{id}/plan` (AI planning) + `/projects/{id}/assemble` (finishing crew)
  - Tasks: CRUD + `/tasks/{id}/run-agent` (delegate to researcher/writer)

### Frontend (React/TypeScript/Vite)
- **Entry Point**: `src/main.tsx` with React 18 and TanStack Query setup
- **State Management**: TanStack Query for server state, React hooks for UI state
- **API Client** (`src/lib/api.ts`): Axios-based with full TypeScript typing
- **Type Definitions**:
  - `src/types/api.ts`: API models matching backend schemas
  - `src/types/kanban.ts`: UI-specific types for drag-and-drop
- **Key Components**:
  - `src/pages/ProjectPage.tsx`: Main container managing view state
  - `src/components/kanban/KanbanBoard.tsx`: Drag-and-drop board with dnd-kit
  - `src/components/kanban/TaskCard.tsx`: Task cards with AI delegation menu
  - `src/components/assembly/AssemblyView.tsx`: Two-panel article assembly
  - `src/components/editor/RichTextEditor.tsx`: Tiptap-based rich text editor
  - `src/components/ui/ParticleBackground.tsx`: Visual effects component
- **Styling**: Tailwind CSS with custom "Neural Flow" design system
- **UI Libraries**: Radix UI primitives, dnd-kit for drag-and-drop, Tiptap for editing

### Key Integration Points
1. **CORS**: Backend configured for frontend ports 3000 and 5173
2. **API Base URL**: Frontend expects backend at `http://localhost:8000/api/v1`
3. **Task Status Flow**: Status field determines Kanban column placement
4. **AI Integration**: Tasks can be delegated to AI agents via dropdown menu
5. **Content Assembly**: Completed tasks assembled and refined by finishing crew

### Development Workflow
1. Start PostgreSQL database
2. Set environment variables (DATABASE_URL, GROQ_API_KEY)
3. Run database migrations: `alembic upgrade head`
4. Start backend: `uvicorn app.main:app --reload`
5. Start frontend: `npm run dev`
6. Access app at http://localhost:5173

### Testing Strategy
- Backend: pytest configured but no tests implemented yet
- Frontend: No test framework configured yet
- Both use linting (backend: via IDE, frontend: `npm run lint`)