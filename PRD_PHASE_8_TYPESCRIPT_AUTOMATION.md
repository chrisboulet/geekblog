# Product Requirements Document
# Phase 8: Make It Right - TypeScript Automation & API Refinement

## Executive Summary

GeekBlog has successfully completed its MVP phase with full CRUD functionality for projects and tasks. The application is now fully functional, allowing content creators to manage their blog writing workflow through an intuitive interface with AI-powered assistance.

Phase 8 represents a critical transition from a "working" application to a "robust" system. Over the next 7-10 days, we will transform the walking skeleton into a production-ready platform through automated type safety, refined API patterns, and completion of the template system.

### Key Deliverables
1. **Automated TypeScript type generation** from backend SQLAlchemy models
2. **Resilient API service layer** with retry logic and intelligent caching
3. **Complete template workflow** from selection to customization to project creation
4. **Production-grade code quality** with 95%+ test coverage and zero TypeScript errors

## Vision & Goals

### Primary Objectives

#### 1. Automated Type Safety (Critical)
- **Goal**: Achieve zero manual type maintenance between backend and frontend
- **Impact**: Eliminate runtime type errors and reduce development friction
- **Measurement**: Running `npm run generate:types` produces accurate, up-to-date interfaces

#### 2. Robust API Layer (High)
- **Goal**: Create resilient services that handle network issues gracefully
- **Impact**: Improved user experience during connectivity problems
- **Measurement**: <0.1% error rate, automatic recovery from transient failures

#### 3. Complete Template System (High)
- **Goal**: Full template selection and customization workflow
- **Impact**: Enable content creators to quickly start writing with proven structures
- **Measurement**: End-to-end workflow completion in <30 seconds

#### 4. Production Quality (Medium)
- **Goal**: Achieve production-ready code quality standards
- **Impact**: Reduced bugs, easier maintenance, faster feature development
- **Measurement**: 95%+ test coverage, zero TypeScript errors, <1.5s page load

### Success Metrics

| Metric | Current | Target | Priority |
|--------|---------|--------|----------|
| TypeScript Errors | Unknown | 0 | Critical |
| API Error Rate | ~5% | <0.1% | High |
| Page Load Time | ~2s | <1.5s | Medium |
| Test Coverage | ~60% | >95% | High |
| Task Completion Rate | ~85% | >95% | High |
| Template Selection Time | N/A | <30s | Medium |

## User Stories

### Developer Stories

#### Story 1: Automated Type Generation
**As a developer**, I want automatic TypeScript types from SQLAlchemy models
**So that** I never have type mismatches between backend and frontend
**Given** I have updated a SQLAlchemy model
**When** I run `npm run generate:types`
**Then** TypeScript interfaces are generated with correct types and imports

**Acceptance Criteria:**
- [ ] Script parses all SQLAlchemy models correctly
- [ ] Generated interfaces match model structure exactly
- [ ] Relationships are properly typed
- [ ] Enums are converted to TypeScript enums
- [ ] Import statements are automatically resolved
- [ ] CI/CD pipeline runs type generation on model changes

#### Story 2: Resilient API Services
**As a developer**, I want resilient API services with automatic retry
**So that** temporary network issues don't break the user experience
**Given** an API call fails due to network error
**When** the error is retriable (timeout, 503, etc.)
**Then** the service retries with exponential backoff up to 3 times

**Acceptance Criteria:**
- [ ] Retry logic handles network timeouts
- [ ] Exponential backoff prevents server overload
- [ ] Non-retriable errors fail immediately
- [ ] User sees loading state during retries
- [ ] Final failure shows appropriate error message
- [ ] Successful retry is transparent to user

### Content Creator Stories

#### Story 3: Browse and Select Templates
**As a content creator**, I want to browse and select blog templates
**So that** I can quickly start writing with proven structures
**Given** I click "Écrire un billet" on the project list
**When** the template gallery opens
**Then** I see all available templates with search and filters

**Acceptance Criteria:**
- [ ] Gallery loads in <1 second
- [ ] Templates show title, description, and metadata
- [ ] Search works with 300ms debounce
- [ ] Filters update results instantly
- [ ] Template selection is smooth
- [ ] Mobile responsive layout

#### Story 4: Customize Templates
**As a blogger**, I want to customize templates for my audience
**So that** my content matches my style and locale
**Given** I've selected a template
**When** the customization modal opens
**Then** I can personalize title, theme, and localization options

**Acceptance Criteria:**
- [ ] Form validates in real-time
- [ ] Preview updates as I type
- [ ] Quebec localization shows example phrases
- [ ] Task preview shows what will be created
- [ ] Form state persists if modal is closed
- [ ] Project creation happens atomically

## Technical Specifications

### Phase 8.1: TypeScript Automation (Days 1-3)

#### Type Generation System Architecture

```
┌─────────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ SQLAlchemy Models   │────▶│ Type Generator   │────▶│ TypeScript      │
│ (models.py)         │     │ (generate_types) │     │ Interfaces      │
└─────────────────────┘     └──────────────────┘     └─────────────────┘
                                      │                         │
                                      ▼                         ▼
                            ┌──────────────────┐     ┌─────────────────┐
                            │ Zod Schemas      │     │ Type Guards     │
                            │ (validation)     │     │ (runtime)       │
                            └──────────────────┘     └─────────────────┘
```

#### Implementation Details

**Type Generator Script** (`scripts/generate_types.py`):
```python
# Core functionality:
1. Import and inspect all SQLAlchemy models
2. Extract column types, relationships, and constraints
3. Map SQL types to TypeScript types
4. Generate interface definitions
5. Create Zod schemas for runtime validation
6. Output to src/types/generated/
```

**Type Mapping Rules**:
| SQLAlchemy Type | TypeScript Type | Zod Schema |
|-----------------|-----------------|------------|
| Integer | number | z.number().int() |
| String(n) | string | z.string().max(n) |
| Boolean | boolean | z.boolean() |
| DateTime | string | z.string().datetime() |
| JSON | Record<string, any> | z.record(z.any()) |
| Enum | enum Type | z.enum([...]) |

**CI/CD Integration**:
```yaml
# .github/workflows/type-sync.yml
- Check for model changes
- Run type generation
- Commit if changes detected
- Run TypeScript compilation
- Fail if errors
```

#### API Service Factory Pattern

```typescript
// services/createApiService.ts
interface ApiServiceConfig<T> {
  endpoint: string;
  retry?: RetryConfig;
  cache?: CacheConfig;
  validation?: ZodSchema<T>;
}

interface RetryConfig {
  maxAttempts: number;      // Default: 3
  backoffMs: number;        // Default: 1000
  backoffMultiplier: number; // Default: 2
  retryableErrors: number[]; // Default: [408, 429, 503, 504]
}

interface CacheConfig {
  ttlMs: number;            // Default: 5 minutes
  invalidateOn: string[];   // Events that clear cache
  cacheKey: (params: any) => string;
}

// Usage example:
const projectService = createApiService<Project>({
  endpoint: 'projects',
  retry: { maxAttempts: 3 },
  cache: { ttlMs: 300000 },
  validation: ProjectSchema
});
```

### Phase 8.2: UI/UX Refinement (Days 4-6)

#### Component Architecture

```
src/components/templates/
├── TemplateGallery/
│   ├── TemplateGallery.tsx       # Main container
│   ├── TemplateFilters.tsx       # Category, style, tone filters
│   ├── TemplateSearch.tsx        # Search with debounce
│   ├── TemplateGrid.tsx          # Responsive grid layout
│   └── TemplateCard.tsx          # Individual template display
├── TemplateCustomizer/
│   ├── TemplateCustomizer.tsx    # Modal container
│   ├── CustomizationForm.tsx     # Form with validation
│   ├── LocalizationSelector.tsx  # Quebec level selector
│   └── TaskPreview.tsx           # Real-time preview
└── index.ts                      # Public exports
```

#### Design System Integration

**Neural Flow Theme Variables**:
```css
:root {
  /* Template Gallery */
  --template-card-bg: var(--neural-dark-bg);
  --template-card-border: var(--neural-accent);
  --template-card-hover: var(--neural-glow);

  /* Animations */
  --template-transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --template-hover-scale: 1.02;

  /* Layout */
  --template-grid-gap: 1.5rem;
  --template-min-width: 280px;
}
```

**Animation Specifications**:
- Card hover: scale(1.02) with glow effect
- Filter transitions: 200ms ease-out
- Modal open: slide-up with fade
- Preview updates: crossfade 150ms
- Loading states: neural pulse animation

### Phase 8.3: Integration & Workflow (Days 7-8)

#### Navigation Flow Diagram

```
┌─────────────────┐
│ ProjectListPage │
└────────┬────────┘
         │ Click "Écrire un billet"
         ▼
┌─────────────────┐
│ TemplateGallery │ ← URL: /projects/new/template
└────────┬────────┘
         │ Select template
         ▼
┌─────────────────┐
│ Customizer Modal│ ← URL: /projects/new/template?id=guide-pratique
└────────┬────────┘
         │ Create project
         ▼
┌─────────────────┐
│   ProjectPage   │ ← URL: /projects/:id
│  (with tasks)   │
└─────────────────┘
```

#### URL State Management

```typescript
// Route definitions
/projects/new/template              // Template gallery
/projects/new/template?id=:id       // Template selected
/projects/new/template?id=:id&step=customize // Customization modal

// State preservation
interface TemplateFlowState {
  selectedTemplate?: string;
  customization?: {
    title: string;
    theme: string;
    localization: 'low' | 'medium' | 'high';
  };
  previewTasks?: Task[];
}
```

## Risk Assessment & Mitigation

### Technical Risks

#### Risk 1: TypeScript Generation Complexity
- **Probability**: Medium
- **Impact**: High
- **Description**: Complex SQLAlchemy relationships (many-to-many, polymorphic) may be difficult to map to TypeScript
- **Mitigation**:
  - Start with simple models (Project, Task)
  - Manual override file for complex cases
  - Incremental implementation
  - Fallback to manual types if needed

#### Risk 2: API Breaking Changes
- **Probability**: Low
- **Impact**: High
- **Description**: New API patterns might break existing functionality
- **Mitigation**:
  - Incremental refactoring (one service at a time)
  - Comprehensive test suite before changes
  - Feature flags for new patterns
  - Rollback plan for each service

#### Risk 3: Performance Degradation
- **Probability**: Medium
- **Impact**: Medium
- **Description**: Additional validation and caching layers might slow down the app
- **Mitigation**:
  - Performance benchmarks before/after
  - Lazy loading for heavy components
  - Cache warming strategies
  - Progressive enhancement

### Project Risks

#### Risk 4: Scope Creep
- **Probability**: High
- **Impact**: Medium
- **Description**: Temptation to add features beyond Phase 8 scope
- **Mitigation**:
  - Strict adherence to this PRD
  - Daily scope review
  - Defer requests to Phase 9
  - Clear communication about boundaries

#### Risk 5: Timeline Overrun
- **Probability**: Medium
- **Impact**: Low
- **Description**: Complex tasks might take longer than estimated
- **Mitigation**:
  - Buffer time (days 9-10)
  - Daily progress assessment
  - Scope reduction options identified
  - Parallel work where possible

## Implementation Plan

### Day 1-2: TypeScript Foundation
**Morning Day 1**:
- [ ] Create type generation script skeleton
- [ ] Test with Project model
- [ ] Generate first TypeScript interface

**Afternoon Day 1**:
- [ ] Add relationship handling
- [ ] Test with Task model
- [ ] Create npm script

**Day 2**:
- [ ] Complete all model types
- [ ] Add Zod schema generation
- [ ] Set up CI/CD pipeline
- [ ] Document process

### Day 3-4: API Enhancement
**Day 3**:
- [ ] Create API service factory
- [ ] Implement retry logic
- [ ] Add caching layer
- [ ] Refactor templateService

**Day 4**:
- [ ] Refactor projectService
- [ ] Add error handling patterns
- [ ] Create service tests
- [ ] Performance benchmarks

### Day 5-6: Template UI Completion
**Day 5**:
- [ ] Complete TemplateGallery component
- [ ] Implement search and filters
- [ ] Add loading states
- [ ] Create responsive layout

**Day 6**:
- [ ] Build customization modal
- [ ] Add real-time preview
- [ ] Implement validation
- [ ] Connect to backend

### Day 7-8: Integration & Polish
**Day 7**:
- [ ] Add navigation flow
- [ ] Implement URL state
- [ ] Create breadcrumbs
- [ ] End-to-end testing

**Day 8**:
- [ ] Performance optimization
- [ ] Bug fixes
- [ ] Documentation updates
- [ ] Final testing

### Day 9-10: Buffer & Refinement
- Address discovered issues
- Complete test coverage
- Performance tuning
- Prepare for Phase 9

## Acceptance Criteria Checklist

### Phase 8.1 Completion
- [ ] Type generation script works for all models
- [ ] Zero TypeScript compilation errors
- [ ] Zod schemas validate correctly
- [ ] CI/CD pipeline runs automatically
- [ ] Documentation complete

### Phase 8.2 Completion
- [ ] API services handle errors gracefully
- [ ] Retry logic works as specified
- [ ] Caching improves performance
- [ ] At least 2 services refactored
- [ ] All tests passing

### Phase 8.3 Completion
- [ ] Template gallery fully functional
- [ ] Search and filters work correctly
- [ ] Customization modal complete
- [ ] Preview updates in real-time
- [ ] End-to-end workflow tested

### Overall Phase 8
- [ ] 95%+ test coverage achieved
- [ ] Page load time <1.5 seconds
- [ ] Zero TypeScript errors
- [ ] All user stories completed
- [ ] Documentation updated

## Dependencies

### External Dependencies
- TypeScript 5.x
- Zod for runtime validation
- Radix UI for modal components
- TanStack Query for data fetching
- Framer Motion for animations

### Internal Dependencies
- Completed Phase 7 (CRUD functionality)
- SQLAlchemy models stable
- Backend API endpoints working
- Neural Flow design system

## Future Considerations (Phase 9)

Upon successful completion of Phase 8, the following items are planned for Phase 9:

1. **Comprehensive Error Boundaries**: Graceful error handling throughout the app
2. **Advanced Loading States**: Skeleton screens, progressive loading
3. **WCAG 2.1 AA Compliance**: Full accessibility audit and fixes
4. **Production Deployment**: Docker optimization, CI/CD pipeline
5. **Performance Monitoring**: Real user metrics, error tracking

## Appendices

### A. Type Generation Examples

**Input (SQLAlchemy)**:
```python
class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True)
    title = Column(String(200), nullable=False)
    status = Column(Enum(ProjectStatus))
    created_at = Column(DateTime, default=datetime.utcnow)
    tasks = relationship("Task", back_populates="project")
```

**Output (TypeScript)**:
```typescript
export interface Project {
  id: number;
  title: string;
  status: ProjectStatus;
  created_at: string;
  tasks: Task[];
}

export const ProjectSchema = z.object({
  id: z.number().int(),
  title: z.string().max(200),
  status: ProjectStatusSchema,
  created_at: z.string().datetime(),
  tasks: z.array(TaskSchema)
});
```

### B. API Service Usage

```typescript
// Before (manual implementation)
const getProjects = async () => {
  try {
    const response = await apiClient.get('/projects');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    throw error;
  }
};

// After (using factory)
const projectService = createApiService<Project>({
  endpoint: 'projects',
  validation: ProjectSchema,
  cache: { ttlMs: 5 * 60 * 1000 }
});

// Automatic retry, caching, and validation
const projects = await projectService.list();
```

### C. Template Workflow Example

1. User clicks "Écrire un billet"
2. Template gallery loads with 6 templates
3. User searches for "guide"
4. Filters to show only "Guide Pratique"
5. Clicks template card
6. Customization modal opens
7. Enters title: "Comment installer Linux"
8. Selects Quebec level: "Medium"
9. Sees preview of 7 tasks
10. Clicks "Créer le projet"
11. Redirected to project page with tasks

---

*Document Version: 1.0*
*Created: 2025-07-12*
*Phase Duration: 7-10 days*
*Next Phase: Phase 9 - Make It Robust*
