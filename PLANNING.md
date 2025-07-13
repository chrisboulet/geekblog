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
- **State Management**: TanStack Query for server state with optimistic updates
- **UI Framework**: Tailwind CSS v4.1.11 + Radix UI primitives
- **UI Components**: Radix Primitives (Modal, DropdownMenu, Dialog) for accessibility
- **Notifications**: Custom Toast system with context provider
- **Testing**: pytest (backend) + Vitest (frontend)

### Network Configuration
- **Development Proxy**: Vite dev server proxies `/api` to `http://backend:8000` (Docker internal)
- **Browser Access**: Frontend uses `VITE_API_BASE_URL=http://localhost:8000/api/v1` for direct API calls
- **Docker Network**: `backend` hostname only resolves within Docker containers
- **Configuration Files**:
  - `docker-compose.yml`: Base configuration with `VITE_API_BASE_URL=http://localhost:8000/api/v1`
  - `docker-compose.override.yml`: Development overrides (MUST match base URL)
  - `vite.config.ts`: Proxy configuration for internal Docker communication

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
│   │   ├── project/             # Project CRUD components (ProjectCreateModal, ProjectEditModal, ProjectActionsMenu)
│   │   ├── task/                # Task CRUD components (TaskCreateButton, EditableTaskTitle, TaskEditModal)
│   │   ├── ui/                  # UI primitives (Modal, DropdownMenu, Toast, ConfirmDialog)
│   │   ├── kanban/              # Kanban board components (TaskCard enhanced)
│   │   ├── assembly/            # Content assembly interface
│   │   ├── navigation/          # Navigation components (Header, ViewSwitcher)
│   │   └── neural/              # Neural Flow components (Canvas, Nodes)
│   ├── hooks/                   # Custom React hooks
│   │   ├── mutations/           # Mutation hooks (useCreateProject, useUpdateTask, etc.)
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

### ✅ Phase 4 - Navigation & UX Refonte (COMPLETE)
- ✅ Navigation infrastructure (NavigationHeader, ViewSwitcher)
- ✅ ProjectPage navigation restructure (breadcrumbs, clean navigation)
- ✅ Simplified Neural Flow with Simple/Expert modes
- ✅ Onboarding system for new users
- ✅ Visual affordances and interaction improvements
- ✅ HomePage creation avec workflow 5 étapes
- ✅ Migration Tailwind CSS v4.1.11 (CSS-first configuration)
- ✅ CSS variables standardization et design system cohérent

### ✅ Phase 5 - Project Management & UX Collaboration (COMPLETED)
- ✅ **UI/UX Collaborative Design Process** avec ateliers réguliers
- ✅ **Complete project management functionality** (CRUD operations)
- ✅ **Blog Analysis & Authentic Templates** - Analyse de 67 articles du blog "Les Geeks à Temps Partiel"
- ✅ **Neural Flow integration** for project visualization
- ✅ **Bulk operations** with intuitive interfaces
- ✅ **User-centered design validation** at each step

### ✅ Phase 6 - Blog Templates Implementation (COMPLETED)
- ✅ **Backend Templates API** pour gestion des templates prédéfinis (COMPLETED)
- ✅ **Guide Pratique Template** - Walking skeleton avec foundation solide (COMPLETED)
- ✅ **Architecture Improvements** - Service layer decoupling, Strategy Pattern, auth layer (COMPLETED)
- ✅ **Docker Production Ready** - Health checks, monitoring stack, security improvements (COMPLETED)
- ✅ **Template Engine Frontend** - Template Gallery avec TemplateCard, filtres et recherche (COMPLETED)
- ✅ **Frontend Functionality** - Neural Canvas save/create, Task editing modal (COMPLETED)
- ✅ **Critical Bug Fix** - Docker configuration et API URLs corroées (COMPLETED)
- ✅ **Code Quality** - Console cleanup, expert code review, optimization (COMPLETED)

### ✅ Phase 7 - Basic CRUD Implementation (COMPLETED 2025-07-11)
- ✅ **UI Primitive Components** - Modal, DropdownMenu, ConfirmDialog, Toast with Radix Primitives
- ✅ **Optimistic Update Pattern** - TanStack Query mutations with automatic rollback on error
- ✅ **Project Management Interface** - Create, edit, delete projects with full UI workflow
- ✅ **Task Management Interface** - Create, edit-in-place, full modal editing, delete tasks
- ✅ **Compound Component Architecture** - TypeScript-safe compound patterns for reusable UI
- ✅ **Toast Notification System** - Context-based notifications with auto-dismiss and actions
- ✅ **Application Fully Functional** - Users can now perform all basic content management operations

### 🏗️ Phase 8 - Make It Right: Type Automation & API Refinement (ACTIVE)
**Durée estimée: 7-10 jours**
**Started: 2025-07-12**
**PRD**: See [PRD_PHASE_8_TYPESCRIPT_AUTOMATION.md](./PRD_PHASE_8_TYPESCRIPT_AUTOMATION.md) for detailed requirements

**Objectif**: Transformer le système CRUD de base en système robuste avec automatisation TypeScript, validation complète, et UX fluide. Cette phase se concentre sur la qualité du code, l'automatisation des types, et l'expérience utilisateur cohérente.

**Sous-phases**:
- **8.1 TypeScript Automation & Code Quality** (2-3 jours):
  - [ ] Automatic type generation from SQLAlchemy models
  - [ ] Runtime validation with Zod schemas
  - [ ] Enhanced API service layer with retry logic
  - [ ] Template validation engine

- **8.2 UI/UX Refinement & Component Architecture** (3-4 jours):
  - [ ] Complete Template Gallery implementation
  - [ ] Design system integration
  - [ ] Real-time preview system
  - [ ] Component library standardization

- **8.3 Integration & Workflow Optimization** (2-3 jours):
  - [ ] Navigation & routing enhancement
  - [ ] Performance optimization
  - [ ] Developer experience improvements

### 🎨 Phase 9 - Make It Robust: Error States & UX Polish (FINAL)
**Durée estimée: 10-13 jours**

**Objectif**: Créer une expérience utilisateur exceptionnelle avec gestion complète des cas d'erreur, états de loading sophistiqués, accessibilité WCAG, et robustesse production-ready.

**Sous-phases**:
- **9.1 Error Handling & Edge Cases** (3-4 jours): Error boundaries comprehensive, network resilience, input validation & security
- **9.2 Advanced UX & Accessibility** (4-5 jours): Loading states & micro-interactions, WCAG 2.1 AA compliance, responsive & mobile optimization
- **9.3 Testing & Quality Assurance** (3-4 jours): Comprehensive testing suite, user testing & feedback integration, documentation & maintenance

**Métriques de succès**: Performance < 1.5s load, WCAG AA compliance, 95%+ test coverage, Error rate < 0.1%

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
- **Environment**: Use .venv for Python execution, Docker for development
- **Database**: PostgreSQL required for production features
- **Docker Configuration**: VITE_API_BASE_URL=http://localhost:8000/api/v1 for frontend browser access
- **API URLs**: Use relative paths without leading slashes in API services

### Development Workflow
1. **Always check TASK.md** before starting new work
2. **UI/UX Collaborative Sessions** before implementing major interface changes
3. **Create unit tests** for all new features
4. **Update documentation** when adding features or changing APIs
5. **Use relative imports** within packages
6. **Follow modular architecture** patterns
7. **User feedback integration** throughout development cycle
8. **Run precommit validation** before any commits

## 🎯 Current Goals & Priorities

### ✅ Recent Achievements (2025-07-07)
1. **✅ Template System Architecture**
   - ✅ Custom exception hierarchy (ProjectNotFound, etc.) for service layer decoupling
   - ✅ Strategy Pattern implementation for extensible template generation
   - ✅ Backend preview endpoint eliminating frontend logic duplication
   - ✅ Authentication layer with development-friendly stub
   - ✅ Centralized project creation through project_service

2. **✅ Docker Production Configuration**
   - ✅ Comprehensive Docker audit and DOCKER_REVIEW.md documentation
   - ✅ Production nginx.conf with security headers and caching
   - ✅ Enhanced entrypoint scripts with pre-flight checks
   - ✅ Health check endpoints (/health, /health/detailed, /health/live, /health/ready)
   - ✅ Optional monitoring stack (Prometheus, Grafana, Loki)

### ✅ Completed Major Milestones
1. **✅ Phase 3 Frontend Async Adaptation** (COMPLETED 2025-07-04)
   - ✅ Implemented comprehensive job polling with TanStack Query
   - ✅ Added real-time progress tracking UI components
   - ✅ Enhanced TaskCard and ProjectPage with async operations
   - ✅ Created neural-themed progress indicators and status badges
   - ✅ Implemented async/sync mode toggles with cancellation support

2. **✅ Phase 4 Navigation & UX Refonte** (COMPLETED 2025-07-06)
   - ✅ Created comprehensive navigation system with breadcrumbs
   - ✅ Implemented HomePage with 5-step workflow visualization
   - ✅ Migrated to Tailwind CSS v4.1.11 with CSS-first configuration
   - ✅ Fixed critical CSS build issues causing blank page
   - ✅ Standardized Neural Flow design system across all pages

### ✅ Session Complete (2025-07-08) - Critical Issues Resolved
1. ✅ **Template Gallery Frontend** - TemplateGallery.tsx avec layout responsive et TemplateCard (COMPLETED)
2. ✅ **Neural Canvas Functionality** - onSaveContent et onCreateNode implémentés (COMPLETED)
3. ✅ **Task Edit Modal** - Bouton "Modifier tâche" avec modal complète (COMPLETED)
4. ✅ **Critical Network Fix** - Docker VITE_API_BASE_URL corrigée (COMPLETED)
5. ✅ **Code Review Expert** - Analyse approfondie et optimisations (COMPLETED)
6. ✅ **All Functionality Working** - Objectif "chaque bouton fonctionne" atteint (COMPLETED)

### ✅ Session Complete (2025-07-11) - Basic CRUD Implementation
1. ✅ **UI Primitives Foundation** - Modal, DropdownMenu, ConfirmDialog, Toast with Radix Primitives
2. ✅ **Optimistic Mutations** - Project/Task CRUD with automatic rollback and user feedback
3. ✅ **Project Management UI** - Complete create/edit/delete workflow with modals and menus
4. ✅ **Task Management UI** - In-place editing, full modals, creation buttons integrated
5. ✅ **Application Usability** - Users can now perform all essential content management operations
6. ✅ **Documentation Updated** - README, TASK, PLANNING synchronized with implementation

### Current Goals & Priorities (2025-07-12)

#### Active Development - Phase 8
1. **TypeScript Automation Foundation**
   - Create SQLAlchemy → TypeScript type generator
   - Implement Zod validation schemas
   - Set up CI/CD type synchronization

2. **Complete Template System**
   - Finish TemplateGallery component
   - Build TemplateCustomizer modal
   - Integrate template workflow

3. **API Service Enhancement**
   - Refactor with error handling patterns
   - Add retry logic and caching
   - Create service factory

### Next Session Goals (Future)
1. **Performance Optimization** - Bundle splitting, lazy loading
2. **Error Handling Enhancement** - User notifications system
3. **Accessibility Improvements** - WCAG 2.1 AA compliance
4. **Advanced Template Features** - Real-time preview system

### Short-term Goals (Phase 7-8 Implementation)
1. ✅ **Template Foundation** - Walking skeleton établi avec API et frontend de base (COMPLETED)
2. **Navigation & Routing Enhancement** - Deep linking modals, breadcrumb navigation
3. **Performance Optimization** - Bundle splitting, lazy loading, caching HTTP
4. **Comprehensive Error Handling** - Error boundaries, network resilience, graceful degradation
5. **WCAG 2.1 AA Compliance** - Accessibility complète, navigation keyboard, screen reader
6. **Testing Suite Complete** - Coverage 95%+, E2E tests, visual regression testing

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
- **PRD_PHASE_8_TYPESCRIPT_AUTOMATION.md**: Detailed requirements for Phase 8
- **API Documentation**: Available at `/docs` endpoint
