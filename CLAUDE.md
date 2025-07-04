# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

### 🔄 Project Awareness & Context
- **Always read `PLANNING.md`** at the start of a new conversation to understand the project's architecture, goals, style, and constraints.
- **Check `TASK.md`** before starting a new task. If the task isn’t listed, add it with a brief description and today's date.
- **Use consistent naming conventions, file structure, and architecture patterns** as described in `PLANNING.md`.
- **Use venv_linux** (the virtual environment) whenever executing Python commands, including for unit tests.

### 🧱 Code Structure & Modularity
- **Never create a file longer than 400 lines of code.** If a file approaches this limit, refactor by splitting it into modules or helper files.
- **Organize code into clearly separated modules**, grouped by feature or responsibility.
  For agents this looks like:
    - `agent.py` - Main agent definition and execution logic 
    - `tools.py` - Tool functions used by the agent 
    - `prompts.py` - System prompts
- **Use clear, consistent imports** (prefer relative imports within packages).
- **Use clear, consistent imports** (prefer relative imports within packages).
- **Use python_dotenv and load_env()** for environment variables.

### 🧪 Testing & Reliability
- **Always create Pytest unit tests for new features** (functions, classes, routes, etc).
- **After updating any logic**, check whether existing unit tests need to be updated. If so, do it.
- **Tests should live in a `/tests` folder** mirroring the main app structure.
  - Include at least:
    - 1 test for expected use
    - 1 edge case
    - 1 failure case

### ✅ Task Completion
- **Mark completed tasks in `TASK.md`** immediately after finishing them.
- Add new sub-tasks or TODOs discovered during development to `TASK.md` under a “Discovered During Work” section.

### 📎 Style & Conventions
- **Use Python** as the primary language.
- **Follow PEP8**, use type hints, and format with `black`.
- **Use `pydantic` for data validation**.
- Use `FastAPI` for APIs and `SQLAlchemy` or `SQLModel` for ORM if applicable.
- Write **docstrings for every function** using the Google style:
  ```python
  def example():
      """
      Brief summary.

      Args:
          param1 (type): Description.

      Returns:
          type: Description.
      """
  ```

### 📚 Documentation & Explainability
- **Update `README.md`** when new features are added, dependencies change, or setup steps are modified.
- **Comment non-obvious code** and ensure everything is understandable to a mid-level developer.
- When writing complex logic, **add an inline `# Reason:` comment** explaining the why, not just the what.

### 🧠 AI Behavior Rules
- **Never assume missing context. Ask questions if uncertain.**
- **Never hallucinate libraries or functions** – only use known, verified Python packages.
- **Always confirm file paths and module names** exist before referencing them in code or tests.
- **Never delete or overwrite existing code** unless explicitly instructed to or if part of a task from `TASK.md`.
- **always use zen precommit** to verify your code before you commit.
- **always use zen planner** to complete your planning tasks with details.

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

# Run tests (Vitest + React Testing Library)
npm test
npm run test:watch
npm run test:coverage

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

# Async Jobs (Phase 1.3 POC)
REDIS_URL=redis://localhost:6379/0
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

### Testing Strategy (Phase 1 Complete)
- **Backend**: Complete pytest infrastructure with 60% coverage requirement
  - Integration tests for all CRUD endpoints with SQLite test database
  - Unit tests with CrewAI mocking for AI service components
  - Run tests: `pytest` or `pytest --cov` for coverage
- **Frontend**: Complete Vitest + React Testing Library setup
  - Component tests for TaskCard, KanbanBoard, AssemblyView
  - API client tests with mocked endpoints
  - Run tests: `npm test` or `npm run test:coverage`

### Async Job System (Phase 1.3 POC)
- **Infrastructure**: Celery + Redis for background AI processing
- **Job Tracking**: AsyncJob model with dual tracking (Celery + Database)
- **Endpoints**: 
  - Sync: `/projects/{id}/plan` (original blocking version)
  - Async: `/projects/{id}/plan-async` (returns job_id immediately)
  - Status: `/jobs/{job_id}/status` for progress tracking
- **Usage**: Compare sync vs async performance for AI operations