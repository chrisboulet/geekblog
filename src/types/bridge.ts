/**
 * Bridge types for progressive migration from manual to generated types
 * Phase 4 M4 - Type Automation
 */

// Import generated types
import type {
  Project as GeneratedProject,
  Task as GeneratedTask,
  BlogTemplate as GeneratedBlogTemplate
} from './generated/models';
import type {
  ProjectSchema,
  TaskSchema,
  BlogTemplateSchema
} from './generated/schemas';

// Re-export main generated types for new code
export type { GeneratedProject, GeneratedTask, GeneratedBlogTemplate };
export { ProjectSchema, TaskSchema, BlogTemplateSchema };

// Bridge types that extend generated with manual specializations
export interface Project extends Omit<GeneratedProject, 'tasks'> {
  tasks: Task[]; // Use our specialized Task type
}

export interface Task extends GeneratedTask {
  project_id: number; // Ensure this field exists for frontend
}

export interface BlogTemplate extends GeneratedBlogTemplate {}

// CRUD operation types (manual for now, could be generated later)
export interface TaskBase {
  title: string;
  description?: string | null;
  status?: 'pending' | 'in_progress' | 'completed' | 'archived';
  order?: number;
}

export interface TaskCreate extends TaskBase {
  project_id: number;
}

export interface TaskUpdate extends Partial<TaskBase> {
  project_id?: number;
}

export interface ProjectBase {
  name: string;
  description?: string | null;
}

export interface ProjectCreate extends ProjectBase {}
export interface ProjectUpdate extends Partial<ProjectBase> {}

// Legacy compatibility exports (to be removed in future phases)
export type { Task as KanbanTask } from './kanban';

// Type guards for runtime validation
export const isValidTaskStatus = (status: string): status is Task['status'] => {
  return ['pending', 'in_progress', 'completed', 'archived'].includes(status);
};

export const isValidPlanningStatus = (status: string): status is Project['planning_status'] => {
  return ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'FAILED'].includes(status);
};
