# PLANNING.md - GeekBlog Architecture & Development Guide

## 🎯 Project Overview

**GeekBlog** is a content creation command center that combines human creativity with AI agents to streamline blog post creation through a visual Kanban workflow. The application helps content creators organize, research, write, and refine blog posts using AI-powered assistants.

## 🏗️ Architecture

### Technology Stack
- **Backend**: Python/FastAPI with async support
- **Database**: PostgreSQL with SQLAlchemy ORM and Alembic migrations
- **Queue System**: Celery with Redis backend for async job processing
- **AI Integration**: CrewAI framework with Groq LLM (llama3-8b-8192)
- **Frontend**: React 18 + TypeScript + Vite
- **State Management**: TanStack Query for server state
- **UI Framework**: Tailwind CSS + Radix UI primitives
- **Testing**: pytest (backend) + Vitest (frontend)

### Core Architecture Patterns
- **Modular Services**: Clear separation between API, services, and data layers
- **Async-First**: All AI operations run asynchronously with job tracking
- **Type Safety**: Full TypeScript coverage with Pydantic validation
- **Event-Driven**: Celery workflows for complex multi-step operations

## 📁 Project Structure

```
geekblog/
├── app/                           # Backend (FastAPI)
│   ├── main.py                   # FastAPI application entry point
│   ├── api/endpoints/            # API route handlers
│   ├── services/                 # Business logic layer
│   │   ├── ai_service.py        # CrewAI orchestration
│   │   ├── async_job_service.py # Job management
│   │   └── workflow_service.py  # Workflow orchestration
│   ├── models/                   # SQLAlchemy models
│   ├── schemas/                  # Pydantic schemas
│   ├── db/                       # Database configuration
│   └── tasks/                    # Celery tasks
├── src/                          # Frontend (React)
│   ├── components/               # React components
│   │   ├── kanban/              # Kanban board components (TaskCard enhanced)
│   │   ├── assembly/            # Content assembly interface
│   │   ├── navigation/          # Navigation components (Header, ViewSwitcher)
│   │   ├── neural/              # Neural Flow components (Canvas, Nodes)
│   │   └── ui/                  # Reusable UI components (progress, status)
│   ├── hooks/                   # Custom React hooks
│   │   ├── useJobPolling.ts     # TanStack Query polling hook
│   │   └── useAsyncOperation.ts # Combined mutation + polling
│   ├── services/                # Service layer
│   │   └── jobService.ts        # Job management utilities
│   ├── pages/                   # Page components (ProjectPage enhanced)
│   ├── lib/                     # Utilities and API client (async endpoints)
│   └── types/                   # TypeScript definitions (job types)
├── tests/                        # Test suites
│   ├── backend/                  # Backend tests
│   └── frontend/                 # Frontend tests
└── alembic/                      # Database migrations
```

## 🔄 Development Phases

### ✅ Phase 1 - Foundations (COMPLETE)
- Testing infrastructure (pytest + Vitest)
- Basic CRUD operations for projects and tasks
- POC async architecture with Celery/Redis
- Code cleanup and dependency optimization

### ✅ Phase 2 - Async Architecture (COMPLETE)
- Complete Celery worker infrastructure
- All AI endpoints migrated to async operations
- Workflow orchestration system (Chain/Group/Chord)
- Enhanced job management API
- Comprehensive code review fixes

### ✅ Phase 3 - Frontend Async Adaptation (COMPLETE)
- ✅ Frontend adaptation for async job polling with TanStack Query
- ✅ Real-time status updates and progress tracking UI
- ✅ Improved UX for long-running AI operations with progress bars
- ✅ Enhanced TaskCard and ProjectPage with async/sync mode toggles
- ✅ Neural-themed UI components (JobProgressBar, JobStatusBadge, LoadingSpinner)

### 🔄 Phase 4 - Navigation & UX Refonte (IN PROGRESS)
- ✅ Navigation infrastructure (NavigationHeader, ViewSwitcher)
- 🔄 ProjectPage navigation restructure (IN PROGRESS)
- 🔄 Simplified Neural Flow with Simple/Expert modes
- 🔄 Onboarding system for new users
- 🔄 Visual affordances and interaction improvements

### 🔮 Phase 5 - Advanced Features (PLANNED)
- Complete drag-and-drop Kanban functionality
- Multi-project navigation and management
- Article persistence and export capabilities
- Advanced prompt templating system
- Performance optimization and caching

## 🎨 Design System & Style Guide

### "Neural Flow" Design Language
- **Colors**: Dark theme with accent colors (blue, purple gradients)
- **Typography**: Clear hierarchy with consistent spacing
- **Components**: Consistent button styles, card layouts, and form elements
- **Interactions**: Smooth animations and hover states
- **Accessibility**: ARIA labels and keyboard navigation support

### Code Style Conventions
- **Python**: PEP8 with Black formatting, type hints mandatory
- **TypeScript**: Strict mode enabled, consistent naming conventions
- **File Organization**: Maximum 400 lines per file, modular structure
- **Documentation**: Google-style docstrings for all functions
- **Testing**: 60% minimum coverage requirement

## 🔧 Development Constraints

### Technical Constraints
- **File Size Limit**: Maximum 400 lines per file
- **Test Coverage**: Minimum 60% for backend, comprehensive component tests for frontend
- **Type Safety**: Full TypeScript and Pydantic validation
- **Environment**: Use venv_linux for Python execution
- **Database**: PostgreSQL required for production features

### Development Workflow
1. **Always check TASK.md** before starting new work
2. **Create unit tests** for all new features
3. **Update documentation** when adding features or changing APIs
4. **Use relative imports** within packages
5. **Follow modular architecture** patterns
6. **Run precommit validation** before any commits

## 🎯 Current Goals & Priorities

### ✅ Completed Major Milestones
1. **✅ Phase 3 Frontend Async Adaptation** (COMPLETED 2025-07-04)
   - ✅ Implemented comprehensive job polling with TanStack Query
   - ✅ Added real-time progress tracking UI components
   - ✅ Enhanced TaskCard and ProjectPage with async operations
   - ✅ Created neural-themed progress indicators and status badges
   - ✅ Implemented async/sync mode toggles with cancellation support

### Immediate Priorities (Next 2 Hours)
1. **Create comprehensive unit tests for async components**
2. **Test async workflow end-to-end with backend**
3. **Add assembly view async capabilities**
4. **Performance validation and optimization**

### Short-term Goals (Next Week)
1. **Finish drag-and-drop Kanban functionality**
2. **Add multi-project navigation**
3. **Implement article export features**
4. **Performance optimization**

### Long-term Vision
- **Production deployment** with Docker and CI/CD
- **Advanced AI customization** with prompt templates
- **Collaboration features** for team workflows
- **Analytics and insights** for content performance

## 🚨 Critical Dependencies

### External Services
- **Groq API**: Required for AI functionality (GROQ_API_KEY)
- **Redis**: Required for async job queue
- **PostgreSQL**: Required for production database

### Development Tools
- **Node.js**: v18+ for frontend development
- **Python**: 3.9+ with virtual environment
- **Docker**: Optional but recommended for services

## 🧪 Testing Strategy

### Backend Testing
- **Unit Tests**: pytest with fixtures and mocking
- **Integration Tests**: Database integration with SQLite
- **AI Testing**: CrewAI operations mocked for speed
- **Coverage**: Minimum 60% with automated reporting

### Frontend Testing
- **Component Tests**: React Testing Library with user interactions
- **API Tests**: Mocked API calls with MSW
- **E2E Tests**: Planned for Phase 4

## 📝 Documentation Standards

### Code Documentation
- **Functions**: Google-style docstrings required
- **APIs**: OpenAPI/Swagger auto-generated documentation
- **Components**: TypeScript props documentation
- **README**: Keep updated with setup and usage instructions

### Project Documentation
- **PLANNING.md**: Architecture and development guide (this file)
- **TASK.md**: Current task tracking and completion status
- **CLAUDE.md**: AI assistant guidance and commands
- **API Documentation**: Available at `/docs` endpoint