/**
 * TanStack Query hook for polling job status with dynamic intervals
 * Automatically stops polling when job reaches final state
 */

import { useQuery } from '@tanstack/react-query';
import { JobStatus } from '../types/job';
import * as jobService from '../services/jobService';

interface UseJobPollingOptions {
  enabled?: boolean;
  pollingInterval?: number; // Base polling interval in ms
  maxPollingInterval?: number; // Maximum polling interval in ms
  onComplete?: (status: JobStatus) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook for polling job status with TanStack Query
 * @param jobId - The job ID to poll (null disables polling)
 * @param options - Configuration options for polling behavior
 */
export const useJobPolling = (
  jobId: string | null,
  options: UseJobPollingOptions = {}
) => {
  const {
    enabled = true,
    pollingInterval = 2000, // 2 seconds default
    maxPollingInterval = 10000, // 10 seconds max
    onComplete,
    onError
  } = options;

  return useQuery({
    queryKey: ['jobStatus', jobId],
    queryFn: () => {
      if (!jobId) {
        throw new Error('Job ID is required');
      }
      return jobService.getJobStatus(jobId);
    },
    enabled: enabled && !!jobId,
    
    // Dynamic polling interval based on job status
    refetchInterval: (query) => {
      const data = query.state.data as JobStatus | undefined;
      
      // Stop polling for final states
      if (!data || jobService.isJobComplete(data)) {
        // Call onComplete callback if job succeeded
        if (data && jobService.isJobSuccessful(data) && onComplete) {
          onComplete(data);
        }
        return false;
      }
      
      // Faster polling during active processing
      if (data.status === 'PROGRESS') {
        return pollingInterval; // Poll faster during active work
      }
      
      // Slower polling for pending jobs
      if (data.status === 'PENDING') {
        return Math.min(pollingInterval * 2, maxPollingInterval);
      }
      
      // Default polling interval
      return pollingInterval;
    },
    
    // Keep polling in background
    refetchIntervalInBackground: true,
    
    // Always consider job status stale for real-time updates
    staleTime: 0,
    
    // Don't cache job status for too long
    gcTime: 30000, // 30 seconds
    
    // Retry configuration for network errors
    retry: (failureCount, error) => {
      // Don't retry HTTP 404/400 errors (job not found/invalid)
      if (error instanceof Error && error.message.includes('404')) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    
    // Handle errors
    onError: (error: Error) => {
      console.error('Job polling error:', error);
      if (onError) {
        onError(error);
      }
    }
  });
};

/**
 * Simplified polling hook that automatically handles completion
 * @param jobId - The job ID to poll
 * @param onComplete - Callback when job completes successfully
 */
export const useSimpleJobPolling = (
  jobId: string | null,
  onComplete?: (result: any) => void
) => {
  return useJobPolling(jobId, {
    onComplete: (status) => {
      if (status.result && onComplete) {
        onComplete(status.result);
      }
    }
  });
};

/**
 * Hook that polls multiple jobs simultaneously
 * @param jobIds - Array of job IDs to poll
 * @param options - Shared options for all jobs
 */
export const useMultiJobPolling = (
  jobIds: (string | null)[],
  options: UseJobPollingOptions = {}
) => {
  const results = jobIds.map(jobId => 
    useJobPolling(jobId, options)
  );
  
  // Aggregate status
  const isAnyLoading = results.some(result => result.isLoading);
  const isAnyError = results.some(result => result.isError);
  const allComplete = results.every(result => 
    !result.data || jobService.isJobComplete(result.data)
  );
  
  return {
    results,
    isAnyLoading,
    isAnyError,
    allComplete,
    statuses: results.map(result => result.data).filter(Boolean) as JobStatus[]
  };
};