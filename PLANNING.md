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
- **UI Framework**: Tailwind CSS v4.1.11 + Radix UI primitives
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

### 🚧 Phase 6 - Blog Templates Implementation (FOUNDATION COMPLETE, UI IN PROGRESS)
- ✅ **Backend Templates API** pour gestion des templates prédéfinis (COMPLETED)
- ✅ **Guide Pratique Template** - Walking skeleton avec foundation solide (COMPLETED)
- ✅ **Architecture Improvements** - Service layer decoupling, Strategy Pattern, auth layer (COMPLETED)
- ✅ **Docker Production Ready** - Health checks, monitoring stack, security improvements (COMPLETED)
- 🔄 **Template Engine Frontend** avec galerie cards et filtres spécialisés blog (NEXT SESSION)
- 🔄 **Modal de personnalisation** avec adaptation du niveau de québécismes (NEXT SESSION)
- 🔄 **Integration complète** creation workflow avec templates (NEXT SESSION)

### 🏗️ Phase 7 - Make It Right: Type Automation & API Refinement (NEXT)
**Durée estimée: 7-10 jours**

**Objectif**: Transformer le walking skeleton en système robuste avec automatisation TypeScript, validation complète, et UX fluide. Cette phase se concentre sur la qualité du code, l'automatisation des types, et l'expérience utilisateur cohérente.

**Sous-phases**:
- **7.1 TypeScript Automation & Code Quality** (2-3 jours): Génération automatique types, validation runtime Zod, enhanced API service layer
- **7.2 UI/UX Refinement & Component Architecture** (3-4 jours): Design system integration, TemplateGallery avancée, real-time preview system
- **7.3 Integration & Workflow Optimization** (2-3 jours): Navigation enhancement, performance optimization, developer experience

### 🎨 Phase 8 - Make It Robust: Error States & UX Polish (FINAL)
**Durée estimée: 10-13 jours**

**Objectif**: Créer une expérience utilisateur exceptionnelle avec gestion complète des cas d'erreur, états de loading sophistiqués, accessibilité WCAG, et robustesse production-ready.

**Sous-phases**:
- **8.1 Error Handling & Edge Cases** (3-4 jours): Error boundaries comprehensive, network resilience, input validation & security
- **8.2 Advanced UX & Accessibility** (4-5 jours): Loading states & micro-interactions, WCAG 2.1 AA compliance, responsive & mobile optimization
- **8.3 Testing & Quality Assurance** (3-4 jours): Comprehensive testing suite, user testing & feedback integration, documentation & maintenance

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
- **Environment**: Use venv_linux for Python execution
- **Database**: PostgreSQL required for production features

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

### Immediate Priorities (Next Session 2025-07-12)
1. **Template Gallery Frontend** - Composant TemplateGallery.tsx avec layout responsive
2. **Template Card Component** - TemplateCard.tsx avec metadata et Neural Flow design
3. **Filter & Search System** - Filtres catégorie/difficulté/style avec recherche temps réel
4. **Modal Enhancement** - Amélioration modal personnalisation avec preview temps réel
5. **Integration Testing** - Tests workflow complet de création depuis template

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
- **API Documentation**: Available at `/docs` endpoint