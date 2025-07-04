/**
 * Job service for handling async job operations
 * Uses existing apiClient for consistency with the rest of the app
 */

import apiClient from '../lib/api';
import { JobStatus, JobResult, AsyncOperationConfig } from '../types/job';

/**
 * Get the status of a specific job
 */
export const getJobStatus = async (jobId: string): Promise<JobStatus> => {
  const response = await apiClient.get(`/jobs/${jobId}/status`);
  return response.data;
};

/**
 * Get the result of a completed job
 */
export const getJobResult = async (jobId: string): Promise<JobResult> => {
  const response = await apiClient.get(`/jobs/${jobId}/result`);
  return response.data;
};

/**
 * Cancel a running job
 */
export const cancelJob = async (jobId: string): Promise<{ job_id: string; message: string }> => {
  const response = await apiClient.delete(`/jobs/${jobId}`);
  return response.data;
};


/**
 * Helper to check if a job status indicates completion
 */
export const isJobComplete = (status: JobStatus): boolean => {
  return ['SUCCESS', 'FAILURE', 'REVOKED'].includes(status.status);
};

/**
 * Helper to check if a job status indicates failure
 */
export const isJobFailed = (status: JobStatus): boolean => {
  return ['FAILURE', 'REVOKED'].includes(status.status);
};

/**
 * Helper to check if a job status indicates success
 */
export const isJobSuccessful = (status: JobStatus): boolean => {
  return status.status === 'SUCCESS';
};

/**
 * Helper to get a user-friendly status message
 */
export const getJobStatusMessage = (status: JobStatus): string => {
  switch (status.status) {
    case 'PENDING':
      return 'En attente...';
    case 'PROGRESS':
      return status.step || status.status_message || 'En cours...';
    case 'SUCCESS':
      return 'Terminé avec succès';
    case 'FAILURE':
      return status.error || 'Échec de l\'opération';
    case 'RETRY':
      return 'Nouvelle tentative...';
    case 'REVOKED':
      return 'Opération annulée';
    default:
      return status.status_message || status.status;
  }
};

/**
 * Calculate estimated time remaining based on progress and elapsed time
 */
export const getEstimatedTimeRemaining = (status: JobStatus): number | null => {
  if (!status.created_at || status.progress <= 0) {
    return null;
  }

  const now = new Date();
  const createdAt = new Date(status.created_at);
  const elapsedMs = now.getTime() - createdAt.getTime();
  
  if (status.progress >= 100) {
    return 0;
  }

  // Use estimated_duration if available
  if (status.estimated_duration) {
    const estimatedTotalMs = status.estimated_duration * 1000;
    const estimatedRemainingMs = estimatedTotalMs - elapsedMs;
    return Math.max(0, estimatedRemainingMs);
  }

  // Calculate based on current progress rate
  const progressRate = status.progress / elapsedMs; // progress per ms
  if (progressRate <= 0) {
    return null;
  }

  const remainingProgress = 100 - status.progress;
  const estimatedRemainingMs = remainingProgress / progressRate;
  
  return Math.max(0, estimatedRemainingMs);
};