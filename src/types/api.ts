// src/types/api.ts
// Ces types doivent correspondre aux schémas Pydantic du backend (app/schemas/schemas.py)

import { Task as KanbanTask } from './kanban'; // Importer le type Task du Kanban pour référence si besoin

// Task Schemas
export interface TaskBase {
  title: string;
  description?: string | null;
  status?: string;
  order?: number;
}

export interface TaskCreate extends TaskBase {
  project_id: number;
}

export interface TaskUpdate extends Partial<TaskBase> {
  project_id?: number; // Permet de changer le projet d'une tâche, bien que moins courant
}

export interface Task extends TaskBase {
  id: number; // ou string si UUID
  project_id: number;
  created_at: string; // ISO datetime string
  updated_at?: string | null; // ISO datetime string
  
  // Suivi IA
  created_by_ai: boolean;
  last_updated_by_ai_at?: string | null; // ISO datetime string
}

// Project Schemas
export interface ProjectBase {
  name: string;
  description?: string | null;
}

export interface ProjectCreate extends ProjectBase {}

export interface ProjectUpdate extends Partial<ProjectBase> {}

export interface Project extends ProjectBase {
  id: number; // ou string si UUID
  created_at: string; // ISO datetime string
  updated_at?: string | null; // ISO datetime string
  
  // Planification IA
  planning_status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  planning_job_id?: string | null;
  
  tasks: Task[]; // Les tâches sont incluses dans la réponse du projet
}
