/**
 * Job and async operation types matching backend schema
 * Based on app/schemas/job_schemas.py
 */

export interface ProgressStep {
  step: string;
  progress: number;
  timestamp: string; // ISO datetime string
  message?: string;
}

export interface JobStatus {
  job_id: string;
  status: 'PENDING' | 'PROGRESS' | 'SUCCESS' | 'FAILURE' | 'RETRY' | 'REVOKED';
  job_type?: string;
  progress: number; // 0-100
  step?: string;
  status_message?: string;
  error?: string;
  result?: any;
  created_at?: string; // ISO datetime string
  updated_at?: string; // ISO datetime string
  estimated_duration?: number; // Seconds
  progress_history?: ProgressStep[];
  metadata?: Record<string, any>;
}

export interface AsyncOperationState {
  jobId: string | null;
  status: JobStatus | null;
  isPolling: boolean;
  error: string | null;
}

export interface JobResult {
  job_id: string;
  status: string;
  result: any;
  completed_at?: string; // ISO datetime string
}

export interface JobSummary {
  job_id: string;
  type: string;
  status: string;
  progress: number;
  project_id?: number;
  created_at: string; // ISO datetime string
}

// Job type mapping for different operations
export type JobType = 'planning' | 'finishing' | 'agent_researcher' | 'agent_writer' | 'full_article_workflow';

// Helper types for async operations
export interface AsyncOperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  jobId?: string;
}

export interface AsyncOperationConfig {
  pollingInterval?: number;
  maxRetries?: number;
  timeoutMs?: number;
}
