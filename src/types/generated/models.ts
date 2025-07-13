// AUTO-GENERATED - DO NOT EDIT
// Generated from SQLAlchemy models by scripts/generate_types.py
// Last generated: 2025-07-13T16:31:13.381515


// TypeScript interfaces generated from SQLAlchemy models

/**
 * Project interface generated from SQLAlchemy model
 * Table: projects
 */
export interface Project {
  id: number;
  name: string;
  description: string | null;
  created_at: string | null;
  updated_at: string | null;
  final_content: string | null;
  final_content_updated_at: string | null;
  archived: boolean;
  archived_at: string | null;
  settings: Record<string, unknown> | null;
  tags: string | null;
  planning_status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  planning_job_id: string | null;
  tasks?: Task[];
  workflow_executions?: WorkflowExecution[];
}

/**
 * Task interface generated from SQLAlchemy model
 * Table: tasks
 */
export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'archived';
  order: number | null;
  created_at: string | null;
  updated_at: string | null;
  created_by_ai: boolean;
  last_updated_by_ai_at: string | null;
  project?: Project | null;
  outputs?: TaskOutput[];
}

/**
 * BlogTemplate interface generated from SQLAlchemy model
 * Table: blog_templates
 */
export interface BlogTemplate {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  category: string;
  difficulty: string;
  estimated_duration: string;
  target_audience: string;
  tone: string;
  localization_level: string | null;
  is_boulet_style: boolean | null;
  template_structure: Record<string, unknown>;
  sample_expressions: Record<string, unknown> | null;
  additional_metadata: Record<string, unknown> | null;
  created_at: string | null;
  updated_at: string | null;
  is_active: boolean | null;
}

/**
 * WorkflowExecution interface generated from SQLAlchemy model
 * Table: workflow_executions
 */
export interface WorkflowExecution {
  id: string;
  /** Max length: 13 */
  workflow_type: unknown;
  /** Max length: 9 */
  status: 'pending' | 'in_progress' | 'completed' | 'archived';
  current_step: Record<string, unknown> | null;
  total_steps: number | null;
  workflow_metadata: Record<string, unknown> | null;
  started_at: string | null;
  completed_at: string | null;
  updated_at: string | null;
  error_details: Record<string, unknown> | null;
  project?: Project | null;
  async_jobs?: AsyncJob[];
  task_outputs?: TaskOutput[];
}

/**
 * TaskOutput interface generated from SQLAlchemy model
 * Table: task_outputs
 */
export interface TaskOutput {
  id: string;
  /** Max length: 9 */
  output_type: unknown;
  content: string;
  /** Max length: 64 */
  content_hash: string | null;
  output_metadata: Record<string, unknown> | null;
  created_at: string | null;
  task?: Task | null;
  workflow_execution?: WorkflowExecution | null;
}

/**
 * AsyncJob interface generated from SQLAlchemy model
 * Table: async_jobs
 */
export interface AsyncJob {
  id: string;
  type: string;
  status: 'pending' | 'in_progress' | 'completed' | 'archived' | null;
  step: string | null;
  progress: unknown | null;
  status_message: string | null;
  error_message: string | null;
  job_metadata: Record<string, unknown> | null;
  estimated_duration: unknown | null;
  progress_history: Record<string, unknown> | null;
  created_at: string | null;
  updated_at: string | null;
  completed_at: string | null;
  result_summary: string | null;
  workflow_execution?: WorkflowExecution | null;
}
