# PRD #1: GeekBlog Architecture Simplification

## Document Information
- **Document Type**: Product Requirements Document
- **Project**: GeekBlog Refactoring
- **Version**: 1.0
- **Date**: 2025-07-18
- **Author**: Senior Project Manager (Claude)
- **Status**: APPROVED - IMPLEMENTATION READY

---

## Executive Summary

This PRD outlines the critical transformation of GeekBlog from an over-engineered 5-container architecture to a streamlined single-user solution. Based on consensus analysis with Grok-4 and Kimi-K2, the current architecture is unnecessarily complex for a single-user blog creation tool.

### Problem Statement
The current GeekBlog architecture uses enterprise-grade infrastructure (PostgreSQL + Redis + Celery + 5 Docker containers) for a single-user application, resulting in:
- **Resource Waste**: ~2GB RAM usage for simple operations
- **Complexity Overhead**: ~2 minutes startup time, complex debugging
- **Maintenance Burden**: Multiple external dependencies requiring monitoring
- **Development Friction**: Complex setup blocking rapid iteration

### Solution Overview
Transform to a self-contained, single-container solution optimized for solo usage while preserving all core functionality and the advanced AI integration capabilities.

---

## Current State Analysis

### Current Architecture (Complex)
```
5 Docker Containers:
├── geekblog_db (PostgreSQL)     # 256MB RAM
├── geekblog_redis (Redis)       # 128MB RAM  
├── geekblog_backend (FastAPI)   # 512MB RAM
├── geekblog_celery (Worker)     # 512MB RAM
└── geekblog_frontend (React)    # 1GB RAM
Total: ~2.4GB RAM, 5 services to manage
```

### Current Dependencies
- **Database**: PostgreSQL 15 with Alembic migrations
- **Queue System**: Celery + Redis for async job processing
- **AI Integration**: CrewAI framework (✅ PRESERVED)
- **Frontend**: React + TypeScript + Vite (✅ PRESERVED)
- **Deployment**: Complex docker-compose with service orchestration

### Current Pain Points
1. **Over-Engineering**: Enterprise patterns for single-user needs
2. **Resource Intensive**: 2GB+ RAM for basic blog operations
3. **Complex Setup**: Requires PostgreSQL, Redis, and 5-container orchestration
4. **Slow Development**: 2+ minute startup, complex debugging across services
5. **Maintenance Overhead**: Multiple databases and services to backup/monitor

---

## Target State Specification

### Target Architecture (Simplified)
```
2 Containers (Dev) / 1 Container (Prod):
├── geekblog_app (FastAPI + SQLite + Static)  # 400MB RAM
└── geekblog_frontend_dev (Development only)  # 600MB RAM (dev only)
Total: ~400MB RAM production, ~1GB RAM development
```

### Target Technology Stack
- **Backend**: FastAPI with BackgroundTasks (vs Celery)
- **Database**: SQLite with simple migrations (vs PostgreSQL + Alembic)
- **Queue System**: FastAPI BackgroundTasks (vs Celery + Redis)
- **AI Integration**: CrewAI framework (unchanged)
- **Frontend**: React + TypeScript + Vite (unchanged)
- **Deployment**: Single container with embedded database

### Target Benefits
- **75% RAM Reduction**: 2GB → 500MB total system usage
- **80% Faster Startup**: 2+ minutes → <30 seconds
- **Zero External Dependencies**: Self-contained SQLite database
- **Simplified Deployment**: Single container vs 5-service orchestration
- **Easier Development**: No service dependency management

---

## Technical Requirements

### Database Migration Requirements
- **R1.1**: Convert all PostgreSQL-specific features to SQLite compatible
- **R1.2**: Implement simple migration system replacing Alembic
- **R1.3**: Preserve all existing data relationships and constraints
- **R1.4**: Maintain 100% functional parity for all CRUD operations
- **R1.5**: Implement automatic backup/restore procedures for SQLite

### Queue System Requirements
- **R2.1**: Replace Celery tasks with FastAPI BackgroundTasks
- **R2.2**: Implement in-memory job status tracking (no Redis)
- **R2.3**: Preserve async AI operation capabilities
- **R2.4**: Maintain frontend job polling functionality
- **R2.5**: Ensure job cancellation and error handling work equivalently

### Container Simplification Requirements
- **R3.1**: Create single production container serving API + static files
- **R3.2**: Maintain development docker-compose with 2 services max
- **R3.3**: Implement health checks and monitoring in simplified setup
- **R3.4**: Preserve all networking and proxy configurations
- **R3.5**: Ensure production deployment requires only container + volume

### Performance Requirements
- **R4.1**: System RAM usage must not exceed 500MB under normal load
- **R4.2**: Full system startup must complete within 30 seconds
- **R4.3**: Database operations must perform within 10% of PostgreSQL baseline
- **R4.4**: AI operations must maintain same performance characteristics
- **R4.5**: Frontend build and hot reload must remain under 5 seconds

### Compatibility Requirements
- **R5.1**: 100% functional parity with current feature set
- **R5.2**: All existing API endpoints must work identically
- **R5.3**: All frontend components and workflows preserved
- **R5.4**: All AI integration and CrewAI functionality maintained
- **R5.5**: All existing data must be migrated without loss

---

## Implementation Strategy

### Phase 1: Database Migration (Week 1)
**Objective**: Replace PostgreSQL with SQLite while maintaining full functionality

**Key Deliverables**:
- SQLite database configuration and connection
- All models converted to SQLite compatibility
- Simple migration system replacing Alembic
- Data migration scripts for existing content
- Performance baseline comparison

**Acceptance Criteria**:
- All CRUD operations work identically with SQLite
- Existing project/task data successfully migrated
- Database operations perform within 10% of PostgreSQL baseline
- Backup/restore procedures documented and tested

### Phase 2: Queue System Replacement (Week 2) 
**Objective**: Replace Celery + Redis with FastAPI BackgroundTasks

**Key Deliverables**:
- Background service replacing Celery functionality
- In-memory job tracking system
- Updated AI endpoints using BackgroundTasks
- Frontend polling adapted for new backend
- Redis dependency completely removed

**Acceptance Criteria**:
- All AI operations work asynchronously as before
- Job status tracking functions identically to Celery version
- Frontend displays progress and handles cancellation properly
- No Redis dependencies remain in codebase

### Phase 3: Container Simplification (Week 3)
**Objective**: Consolidate to single production container

**Key Deliverables**:
- Single-container Dockerfile serving API + static files
- Simplified docker-compose for development
- Production deployment configuration
- Health checks and monitoring adapted
- Static file serving configured in FastAPI

**Acceptance Criteria**:
- Single container deploys and runs all functionality
- Development environment uses max 2 containers
- All URLs and routing work identically
- Health checks and monitoring functional

### Phase 4: Cleanup & Optimization (Week 4)
**Objective**: Remove deprecated code and optimize for single-user

**Key Deliverables**:
- All Celery and Redis code removed
- PostgreSQL-specific code eliminated
- Documentation updated throughout
- Single-user workflow optimizations
- Final testing and validation

**Acceptance Criteria**:
- No deprecated dependencies in requirements
- Documentation reflects new architecture
- Performance targets achieved (<500MB RAM, <30s startup)
- All tests pass and functionality verified

---

## Risk Assessment & Mitigation

### High Risk: Data Migration Integrity
**Risk**: Loss or corruption of existing project/task data during PostgreSQL → SQLite migration
**Probability**: Medium | **Impact**: High
**Mitigation**: 
- Comprehensive backup before migration
- Staged migration with validation at each step
- Rollback procedures documented and tested
- Data integrity verification scripts

### Medium Risk: Performance Degradation  
**Risk**: SQLite performance insufficient for current data volumes
**Probability**: Low | **Impact**: Medium
**Mitigation**:
- Performance baseline testing early in Sprint 1
- SQLite optimization techniques (indexes, query optimization)
- Fallback plan to optimized PostgreSQL configuration
- Continuous performance monitoring

### Medium Risk: AI Functionality Impact
**Risk**: BackgroundTasks unable to handle complex AI workflows
**Probability**: Low | **Impact**: High  
**Mitigation**:
- Preserve CrewAI framework exactly as-is
- Thorough testing of all AI operations in Sprint 2
- Job tracking system designed to handle long-running tasks
- Cancellation and error handling thoroughly tested

### Low Risk: Frontend Compatibility
**Risk**: Changes to backend affect frontend functionality
**Probability**: Low | **Impact**: Medium
**Mitigation**:
- Frontend codebase preserved unchanged
- API endpoints maintain identical contracts
- Comprehensive frontend testing after each sprint
- Rollback capability at each sprint boundary

---

## Success Criteria & Validation

### Technical Success Metrics
- **Performance**: <500MB RAM usage under normal operations
- **Startup Time**: <30 seconds from container start to full functionality
- **Deployment Complexity**: 1 container vs current 5 containers
- **Dependencies**: 0 external services vs current 2 (PostgreSQL, Redis)

### Functional Success Metrics
- **Feature Parity**: 100% of current functionality preserved
- **Data Integrity**: 0% data loss during migration
- **API Compatibility**: 100% of existing API endpoints work identically
- **AI Operations**: 100% of CrewAI functionality preserved

### User Experience Success Metrics
- **Startup Experience**: <30 seconds from command to usable interface
- **Resource Usage**: No performance degradation on development machine
- **Deployment Experience**: Single command deployment vs multi-service setup
- **Maintenance**: Self-contained backup/restore vs external database management

### Validation Procedures
1. **Sprint Validation**: Comprehensive testing after each sprint
2. **Performance Benchmarking**: Before/after comparisons at each phase
3. **User Acceptance Testing**: Full workflow testing with simplified architecture
4. **Rollback Testing**: Ability to revert to complex architecture if needed

---

## Timeline & Milestones

### Sprint 1: Database Migration (July 18-25, 2025)
- **Day 1-2**: Schema analysis and SQLite migration planning
- **Day 3-4**: SQLite implementation and data migration
- **Day 5**: Validation, testing, and performance comparison

### Sprint 2: Queue System Replacement (July 25 - August 1, 2025)  
- **Day 1-2**: Celery analysis and BackgroundTasks design
- **Day 3-4**: BackgroundTasks implementation and AI endpoint updates
- **Day 5**: Testing, Redis removal, and frontend optimization

### Sprint 3: Container Simplification (August 1-8, 2025)
- **Day 1-2**: Single-container architecture design
- **Day 3-4**: Docker implementation and static file serving
- **Day 5**: Deployment testing and configuration validation

### Sprint 4: Cleanup & Optimization (August 8-15, 2025)
- **Day 1-2**: Code cleanup and deprecated dependency removal  
- **Day 3-4**: Single-user optimizations and workflow improvements
- **Day 5**: Final testing, documentation, and go-live preparation

---

## Appendices

### Appendix A: Current vs Target Comparison

| Aspect | Current (Complex) | Target (Simplified) | Improvement |
|--------|------------------|-------------------|-------------|
| Containers | 5 (db, redis, backend, celery, frontend) | 1 production, 2 development | 80% reduction |
| RAM Usage | ~2GB | <500MB | 75% reduction |
| External Deps | PostgreSQL + Redis | None (SQLite embedded) | 100% reduction |
| Startup Time | ~2 minutes | <30 seconds | 75% improvement |
| Setup Complexity | Multi-service orchestration | Single container | Massive simplification |
| Backup/Restore | Database + Redis state | Single SQLite file | Dramatically simpler |

### Appendix B: Technical Debt Eliminated

- **Database Complexity**: No more PostgreSQL setup, Alembic migrations, connection pooling
- **Queue Infrastructure**: No more Redis configuration, Celery workers, task routing
- **Service Orchestration**: No more docker-compose service dependencies, health checks
- **Development Setup**: No more complex environment setup, service startup ordering
- **Production Deployment**: No more multi-container coordination, external service management

### Appendix C: Preserved Capabilities

- **AI Integration**: Full CrewAI framework and all agent capabilities
- **Frontend Experience**: Complete React application with all components
- **API Functionality**: All endpoints and business logic preserved
- **Data Models**: All project/task/template structures maintained
- **User Workflows**: All creation, editing, and management flows preserved

---

*This PRD serves as the definitive specification for GeekBlog's architectural simplification project, ensuring successful transformation from over-engineered complexity to streamlined single-user optimization.*