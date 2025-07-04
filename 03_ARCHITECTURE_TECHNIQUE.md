# Mémoire V2 - Architecture Technique Détaillée

Ce document décrit l'architecture technique de l'application, les choix de technologies, les modèles de données et les flux de travail principaux.

## 1. Vue d'Ensemble

L'application est une **Single-Page Application (SPA)** avec un backend découplé, conçue pour être robuste, évolutive et maintenable.

-   **Backend :** API RESTful en **Python 3.9+** avec **FastAPI** et **Celery + Redis** pour le traitement asynchrone.
-   **Frontend :** Application **React 18+** avec **TypeScript**, **Vite**, et **TanStack Query** pour la gestion d'état asynchrone.
-   **Base de Données :** **PostgreSQL**, gérée par l'ORM **SQLAlchemy** et les migrations **Alembic**.
-   **Orchestration IA :** **`crewAI`** avec des modèles de langage servis par **Groq** (Llama 3).
-   **Jobs Asynchrones :** **Celery** workers avec **Redis** backend pour les opérations IA longues.
-   **Polling en Temps Réel :** **TanStack Query** avec intervals dynamiques pour le suivi de progression.
-   **Déploiement :** **Docker** et **Docker Compose** pour un environnement de développement et de production cohérent.

---

## 2. Architecture Backend Détaillée

Le backend suit une architecture en couches pour une séparation claire des responsabilités.

### 2.1. Modèles de Données (`models.py`)

Les modèles définissent la structure de la base de données.

-   **`Project`**: Le conteneur principal.
    -   `id`: Clé primaire.
    -   `name`: Nom du projet (ex: "Article sur l'IA en 2025").
    -   `description`: Objectif détaillé du projet.
    -   `tasks`: Relation un-à-plusieurs avec le modèle `Task`.
-   **`Task`**: L'unité de travail atomique.
    -   `id`: Clé primaire.
    -   `project_id`: Clé étrangère liant la tâche à un `Project`.
    -   `title`: Titre de la tâche (ex: "Rédiger l'introduction").
    -   `description`: Contenu de la tâche, qui est mis à jour par les agents IA ou l'utilisateur.
    -   `status`: Chaîne de caractères qui représente la colonne du Kanban (ex: "À faire", "Révision", "Terminé").
    -   `order`: Entier pour définir l'ordre des tâches lors de la phase d'assemblage.

### 2.2. Service IA (`ai_service.py`)

C'est le cerveau de l'application. Il orchestre les agents `crewAI`.

-   **Agents Individuels :**
    -   `planner_agent`: Prend un objectif et génère une liste de titres de tâches.
    -   `researcher_agent`: Prend un titre de tâche et effectue une recherche web pour trouver des informations clés.
    -   `writer_agent`: Prend un titre et un contexte pour rédiger un paragraphe ou une section.
-   **Le "Crew de Finition" (`refine_article`) :** Une chaîne d'agents spécialisés qui travaillent séquentiellement pour polir un article complet.
    1.  `critic_agent`: Analyse la structure et la cohérence.
    2.  `style_agent`: Réécrit le texte pour améliorer le style, en se basant sur la critique précédente.
    3.  `fact_checker_agent`: Utilise l'outil `DuckDuckGoSearchRun` pour vérifier les faits dans le texte stylisé.
    4.  `proofreader_agent`: Effectue la correction finale de la grammaire et de l'orthographe.

### 2.3. API Endpoints (`/endpoints/`)

Les endpoints principaux exposent les fonctionnalités au frontend.

-   `POST /projects/{id}/plan`: Lance l'agent planificateur (synchrone).
-   `POST /projects/{id}/plan-async`: Lance l'agent planificateur (asynchrone, retourne job_id).
-   `POST /tasks/{id}/run-agent`: Délègue une tâche à un agent (synchrone).
-   `POST /tasks/{id}/run-agent-async`: Délègue une tâche à un agent (asynchrone, retourne job_id).
-   `POST /projects/{id}/assemble`: Lance le "Crew de Finition" (synchrone).
-   `POST /projects/{id}/assemble-async`: Lance le "Crew de Finition" (asynchrone, retourne job_id).
-   `GET /jobs/{job_id}/status`: Récupère le statut et la progression d'un job asynchrone.
-   `DELETE /jobs/{job_id}`: Annule un job en cours.
-   Endpoints CRUD standards pour `/projects` et `/tasks`.

---

## 3. Architecture Frontend Détaillée

Le frontend est conçu pour être interactif et réactif.

### 3.1. Composants Clés

-   **`ProjectPage.tsx`**: Le conteneur principal qui gère l'état de la page (vue Kanban ou vue Assemblage) et les appels API via TanStack Query. **Intègre maintenant** les opérations asynchrones avec toggles sync/async, barres de progression, et annulation des jobs.
-   **`KanbanBoard.tsx`**:
    -   Utilise `dnd-kit` pour gérer toute la logique de glisser-déposer.
    -   Affiche les `KanbanColumn` et leur passe les tâches correspondantes.
    -   Gère l'état de la modale de détail (`TaskDetailsModal`).
-   **`TaskCard.tsx`**:
    -   Représente une tâche individuelle avec **support async complet**.
    -   Contient le menu `DropdownMenu` (Radix UI) pour les actions de délégation à l'IA avec mode toggle async/sync.
    -   **Intègre** `JobProgressBar` et `JobStatusBadge` pour le feedback visuel en temps réel.
    -   **Permet** l'annulation des opérations en cours.
    -   Déclenche l'ouverture de la modale de détail au clic.
-   **Nouveaux Composants UI**:
    -   **`JobProgressBar.tsx`**: Barre de progression avec animations shimmer et couleurs adaptatives.
    -   **`JobStatusBadge.tsx`**: Badge de statut avec icônes et thème neural.
    -   **`LoadingSpinner.tsx`**: Spinner avec effets de lueur et variantes multiples.
-   **`TaskDetailsModal.tsx`**:
    -   Utilise le composant `Dialog` (Radix UI).
    -   Intègre le `RichTextEditor` pour permettre la visualisation et la modification du contenu de la tâche.
-   **`AssemblyView.tsx`**:
    -   Interface à deux panneaux pour la phase finale.
    -   Panneau de gauche : une liste de tâches réorganisable avec `dnd-kit`.
    -   Panneau de droite : le `RichTextEditor` pour l'aperçu et le résultat du raffinage IA.
-   **`RichTextEditor.tsx`**:
    -   Basé sur **Tiptap**, configuré en mode "headless".
    -   Son style est entièrement contrôlé par le plugin `@tailwindcss/typography`.
    -   Accepte du contenu initial et notifie les changements via des props (`initialContent`, `onContentChange`).

### 3.2. Gestion de l'État

-   **TanStack Query (React Query)** est utilisé pour toutes les interactions avec le backend. Cela simplifie la mise en cache, la revalidation automatique des données et la gestion des états de chargement/erreur.
-   **Hooks Async Personnalisés**:
    -   **`useJobPolling.ts`**: Gère le polling automatique des jobs avec intervalles dynamiques (2s pendant l'exécution, arrêt automatique à completion).
    -   **`useAsyncOperation.ts`**: Combine mutation + polling pour une gestion complète des opérations async avec invalidation des queries.
-   **Services Spécialisés**:
    -   **`jobService.ts`**: Utilitaires pour la gestion des jobs (status, annulation, helpers de vérification).
-   Les mutations de React Query (`useMutation`) sont utilisées pour toutes les actions qui modifient les données, **maintenant avec support async/sync** et revalidation automatique des données du projet en cas de succès.

---

## 4. Flux de Travail Détaillés

### 4.1. Planification d'un Projet

```mermaid
sequenceDiagram
    participant User
    participant ProjectPage
    participant React Query
    participant Backend

    User->>ProjectPage: Clique "Planifier avec l'IA"
    ProjectPage->>React Query: Appelle `planningMutation.mutate()`
    React Query->>Backend: POST /api/v1/projects/{id}/plan
    Backend-->>React Query: Retourne la liste des nouvelles tâches
    React Query->>ProjectPage: Invalide la query `['project', id]`
    ProjectPage->>Backend: Re-fetch les données du projet (incluant les nouvelles tâches)
    ProjectPage->>User: Affiche les nouvelles tâches dans la colonne "À faire"
```

### 4.2. Assemblage et Raffinage d'un Article

```mermaid
sequenceDiagram
    participant User
    participant AssemblyView
    participant React Query
    participant Backend
    participant "Finishing Crew"

    User->>AssemblyView: Réorganise les tâches (état local)
    User->>AssemblyView: Clique "Lancer le Raffinage IA"
    AssemblyView->>React Query: Appelle `refinementMutation.mutate(contenu_brut)`
    React Query->>Backend: POST /api/v1/projects/{id}/assemble
    Backend->>"Finishing Crew": Lance le processus de raffinage séquentiel
    "Finishing Crew"-->>Backend: Retourne l'article final
    Backend-->>React Query: Répond avec le texte raffiné
    React Query->>AssemblyView: Met à jour l'état `refinedContent` via `onSuccess`
    AssemblyView->>User: Affiche l'article final dans l'éditeur de droite
```
