# NEXT_TASKS.md - Prochaines Actions Immédiates

**Dernière mise à jour**: 2025-07-18
**Focus actuel**: REFACTORING Sprint 1 - Database Migration (PostgreSQL → SQLite)
**PRIORITÉ CRITIQUE**: Architecture Simplification - Bloque tout développement legacy

---

## Actions Immédiates (5-10 prochaines tâches)

### 🚨 REFACTORING SPRINT 1 - SEMAINE 1 (2025-07-18 à 2025-07-25)

**OBJECTIF**: Remplacer PostgreSQL + Alembic par SQLite + migrations simples

### 🔴 CRITIQUE - À faire aujourd'hui et demain (Day 1-2)

1. **[REFACTORING] Analyse Schema Database** 
   - ⏳ Auditer tous les modèles SQLAlchemy pour fonctionnalités PostgreSQL-spécifiques
   - ⏳ Identifier foreign keys, contraintes, et indexes problématiques  
   - ⏳ Documenter schema actuel et relations entre tables
   - ⏳ Créer matrice compatibilité PostgreSQL → SQLite
   - Référence: TASK.md#database-schema-analysis

2. **[REFACTORING] Stratégie Migration SQLite**
   - ⏳ Concevoir approche migration données (export/import)
   - ⏳ Créer versions modèles compatibles SQLite
   - ⏳ Planifier migration données utilisateur existantes
   - ⏳ Designer système migration simple (remplacer Alembic)
   - Référence: TASK.md#sqlite-migration-strategy

### 🟠 HAUTE - Cette semaine (Day 3-4)

3. **[REFACTORING] Implémentation SQLite**
   - ⏳ Configurer connexion database SQLite dans db config
   - ⏳ Mettre à jour modèles pour compatibilité SQLite
   - ⏳ Implémenter scripts migration basiques
   - ⏳ Tester toutes opérations CRUD avec backend SQLite
   - Référence: TASK.md#sqlite-implementation

4. **[REFACTORING] Validation & Tests Database**
   - ⏳ Exécuter tests complets sur backend SQLite
   - ⏳ Comparaison performance: PostgreSQL vs SQLite
   - ⏳ Mettre à jour documentation database
   - ⏳ Créer procédures backup/restore pour SQLite
   - Référence: TASK.md#validation-testing

5. **[REFACTORING] Préparation Sprint 2**
   - ⏳ Documenter toutes tâches Celery existantes
   - ⏳ Analyser dépendances async_job_service.py
   - ⏳ Rechercher BackgroundTasks patterns FastAPI
   - ⏳ Planifier architecture job status tracking sans Redis
   - Référence: TASK.md#sprint-2-queue-system-replacement

### 🟡 MOYENNE - Semaine prochaine (Sprint 2)

6. **[REFACTORING] Sprint 2 - Remplacement Queue System**
   - ⏳ Mapper tous workflows Celery existants
   - ⏳ Designer architecture BackgroundTasks équivalente
   - ⏳ Créer background_service.py de remplacement
   - ⏳ Mettre à jour endpoints AI pour BackgroundTasks
   - Référence: TASK.md#sprint-2-queue-system-replacement

7. **[REFACTORING] Suppression Redis**
   - ⏳ Supprimer toutes dépendances Redis
   - ⏳ Tester opérations async sans Redis
   - ⏳ Mettre à jour configuration Docker
   - ⏳ Valider performance job polling
   - Référence: TASK.md#redis-removal

### 🟢 BASSE - Sprint 3-4 (Semaines 3-4)

8. **[REFACTORING] Simplification Docker (Sprint 3)**
   - ⏳ Designer container unique FastAPI + fichiers statiques
   - ⏳ Créer Dockerfile.simple
   - ⏳ Mettre à jour docker-compose.yml (5 → 2 services)
   - ⏳ Tester déploiement container unique

9. **[REFACTORING] Cleanup Final (Sprint 4)**
   - ⏳ Supprimer tasks/ et celery_config.py
   - ⏳ Supprimer code spécifique PostgreSQL
   - ⏳ Optimiser UI pour workflow solo
   - ⏳ Tests complets et documentation finale

---

## Contexte & Références

### Plan Principal REFACTORING
- 📄 **PLANNING.md**: Architecture simplifiée complète 
- 📄 **TASK.md**: Sprints refactoring 4 semaines
- 📄 **PRD_ARCHITECTURE_SIMPLIFICATION.md**: Requirements détaillés (à créer)

### Sprint Actuel
**SPRINT 1 - Database Migration**: PostgreSQL → SQLite + migrations simples

### Metrics de Succès Sprint 1
- ✅ Schema PostgreSQL entièrement analysé
- ✅ Migration SQLite opérationnelle  
- ✅ Toutes opérations CRUD fonctionnelles avec SQLite
- ✅ Performance baseline SQLite vs PostgreSQL établie

### Progress Global REFACTORING
```
⏳ SPRINT 1: Database Migration (PostgreSQL → SQLite)
⏳ SPRINT 2: Queue System (Celery + Redis → BackgroundTasks)  
⏳ SPRINT 3: Docker Simplification (5 containers → 1)
⏳ SPRINT 4: Cleanup & Single-User Optimization
```

### Objectifs Architecture Cible
- **Complexité**: 5 containers → 1 container
- **Mémoire**: ~2GB → <500MB
- **Dépendances**: PostgreSQL + Redis → SQLite seulement  
- **Startup**: ~2 minutes → <30 secondes
- **Maintenance**: Complexe → Zéro dépendances externes

### Dependencies
- React DevTools Profiler installé ✅
- Webpack Bundle Analyzer à configurer ⏳
- Git branches pour rollback si nécessaire ✅
- Types génération pipeline fonctionnel ✅

---

## Notes & Découvertes

*Espace pour noter découvertes importantes pendant l'exécution*

### 2025-07-13 - Phases 1-5 COMPLETED
- ✅ **5 Phases majeures terminées** avec succès
- ✅ **Code qualité bout en bout** maintenue (aucun noqa, patterns propres)
- ✅ **Résultats mesurables** : +50% performance, sécurité hardened, types auto, messages FR
- ✅ **Architecture solide** : CSS Modules, validation centralisée, constants documentées
- 🎯 **Prêt pour Phase 6** : Testing & validation pour garantir zéro régression

### Artifacts créés Phase 5
- 📄 `src/utils/messages.ts` : 35+ messages français centralisés
- 📄 `src/utils/validation.ts` : 8 validators + patterns extraits
- 📄 `src/utils/constants.ts` : 30+ constantes type-safe
- 🔧 Architecture plus maintenable et professionnelle

---

*Fichier mis à jour automatiquement après chaque session*
*Garder concis (max 10 items)*