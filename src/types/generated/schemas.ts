// AUTO-GENERATED - DO NOT EDIT
// Generated from SQLAlchemy models by scripts/generate_types.py
// Last generated: 2025-07-13T16:52:50.946131


import { z } from 'zod';

// Zod validation schemas generated from SQLAlchemy models

/**
 * Project Zod schema for runtime validation
 * Generated from SQLAlchemy model: projects
 */
export const ProjectSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  description: z.string().nullable(),
  created_at: z.string().datetime().nullable(),
  updated_at: z.string().datetime().nullable(),
  final_content: z.string().nullable(),
  final_content_updated_at: z.string().datetime().nullable(),
  archived: z.boolean(),
  archived_at: z.string().datetime().nullable(),
  settings: z.record(z.string(), z.unknown()).nullable(),
  tags: z.string().nullable(),
  planning_status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'FAILED']),
  planning_job_id: z.string().nullable(),
});

export type ProjectInput = z.infer<typeof ProjectSchema>;

/**
 * Task Zod schema for runtime validation
 * Generated from SQLAlchemy model: tasks
 */
export const TaskSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  description: z.string().nullable(),
  status: z.enum(['pending', 'in_progress', 'completed', 'archived']),
  order: z.number().int().nullable(),
  created_at: z.string().datetime().nullable(),
  updated_at: z.string().datetime().nullable(),
  created_by_ai: z.boolean(),
  last_updated_by_ai_at: z.string().datetime().nullable(),
});

export type TaskInput = z.infer<typeof TaskSchema>;

/**
 * BlogTemplate Zod schema for runtime validation
 * Generated from SQLAlchemy model: blog_templates
 */
export const BlogTemplateSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  icon: z.string(),
  category: z.string(),
  difficulty: z.string(),
  estimated_duration: z.string(),
  target_audience: z.string(),
  tone: z.string(),
  localization_level: z.string().nullable(),
  is_boulet_style: z.boolean().nullable(),
  template_structure: z.record(z.string(), z.unknown()),
  sample_expressions: z.record(z.string(), z.unknown()).nullable(),
  additional_metadata: z.record(z.string(), z.unknown()).nullable(),
  created_at: z.string().datetime().nullable(),
  updated_at: z.string().datetime().nullable(),
  is_active: z.boolean().nullable(),
});

export type BlogTemplateInput = z.infer<typeof BlogTemplateSchema>;

/**
 * WorkflowExecution Zod schema for runtime validation
 * Generated from SQLAlchemy model: workflow_executions
 */
export const WorkflowExecutionSchema = z.object({
  id: z.string(),
  // Max length: 13
  workflow_type: z.unknown(),
  // Max length: 9
  status: z.enum(['pending', 'in_progress', 'completed', 'archived']),
  current_step: z.record(z.string(), z.unknown()).nullable(),
  total_steps: z.number().int().nullable(),
  workflow_metadata: z.record(z.string(), z.unknown()).nullable(),
  started_at: z.string().datetime().nullable(),
  completed_at: z.string().datetime().nullable(),
  updated_at: z.string().datetime().nullable(),
  error_details: z.record(z.string(), z.unknown()).nullable(),
});

export type WorkflowExecutionInput = z.infer<typeof WorkflowExecutionSchema>;

/**
 * TaskOutput Zod schema for runtime validation
 * Generated from SQLAlchemy model: task_outputs
 */
export const TaskOutputSchema = z.object({
  id: z.string(),
  // Max length: 9
  output_type: z.unknown(),
  content: z.string(),
  // Max length: 64
  content_hash: z.string().max(64).nullable(),
  output_metadata: z.record(z.string(), z.unknown()).nullable(),
  created_at: z.string().datetime().nullable(),
});

export type TaskOutputInput = z.infer<typeof TaskOutputSchema>;

/**
 * AsyncJob Zod schema for runtime validation
 * Generated from SQLAlchemy model: async_jobs
 */
export const AsyncJobSchema = z.object({
  id: z.string(),
  type: z.string(),
  status: z.enum(['pending', 'in_progress', 'completed', 'archived']).nullable(),
  step: z.string().nullable(),
  progress: z.unknown().nullable(),
  status_message: z.string().nullable(),
  error_message: z.string().nullable(),
  job_metadata: z.record(z.string(), z.unknown()).nullable(),
  estimated_duration: z.unknown().nullable(),
  progress_history: z.record(z.string(), z.unknown()).nullable(),
  created_at: z.string().datetime().nullable(),
  updated_at: z.string().datetime().nullable(),
  completed_at: z.string().datetime().nullable(),
  result_summary: z.string().nullable(),
});

export type AsyncJobInput = z.infer<typeof AsyncJobSchema>;

// Export all schemas for easy importing
export const schemas = {
  Project: ProjectSchema,
  Task: TaskSchema,
  BlogTemplate: BlogTemplateSchema,
  WorkflowExecution: WorkflowExecutionSchema,
  TaskOutput: TaskOutputSchema,
  AsyncJob: AsyncJobSchema,
};
