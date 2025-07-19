/**
 * Hook for managing async operations with job polling
 * Combines mutation for starting operations with polling for status updates
 */

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { JobStatus, AsyncOperationState } from '../types/job';
import { useJobPolling } from './useJobPolling';
import * as jobService from '../services/jobService';

interface AsyncOperationConfig {
  onSuccess?: (result: any) => void;
  onError?: (error: string) => void;
  invalidateQueries?: string[][]; // Query keys to invalidate on success
  pollingInterval?: number;
}

/**
 * Generic hook for async operations
 * @param operationFn - Function that starts the async operation and returns JobStatus
 * @param config - Configuration for success/error handling and cache invalidation
 */
export const useAsyncOperation = <TVariables = any, TResult = any>(
  operationFn: (variables: TVariables) => Promise<JobStatus>,
  config: AsyncOperationConfig = {}
) => {
  const [operationState, setOperationState] = useState<AsyncOperationState>({
    jobId: null,
    status: null,
    isPolling: false,
    error: null
  });

  const queryClient = useQueryClient();
  const { onSuccess, onError, invalidateQueries, pollingInterval } = config;

  // Mutation for starting the async operation
  const startMutation = useMutation({
    mutationFn: operationFn,
    onSuccess: (jobStatus: JobStatus) => {
      setOperationState(prev => ({
        ...prev,
        jobId: jobStatus.job_id,
        status: jobStatus,
        isPolling: true,
        error: null
      }));
    },
    onError: (error: Error) => {
      const errorMessage = error.message || 'Failed to start async operation';
      setOperationState(prev => ({
        ...prev,
        error: errorMessage,
        isPolling: false
      }));

      if (onError) {
        onError(errorMessage);
      }
    }
  });

  // Poll job status
  const { data: jobStatus, isError: isPollingError, error: pollingError } = useJobPolling(
    operationState.jobId,
    {
      enabled: operationState.isPolling,
      pollingInterval,
      onComplete: (status) => {
        setOperationState(prev => ({
          ...prev,
          status,
          isPolling: false
        }));

        // Handle successful completion
        if (jobService.isJobSuccessful(status)) {
          if (invalidateQueries) {
            invalidateQueries.forEach(queryKey => {
              queryClient.invalidateQueries({ queryKey });
            });
          }

          if (onSuccess && status.result) {
            onSuccess(status.result);
          }
        }
        // Handle failure
        else if (jobService.isJobFailed(status)) {
          const errorMessage = status.error || 'Operation failed';
          setOperationState(prev => ({
            ...prev,
            error: errorMessage
          }));

          if (onError) {
            onError(errorMessage);
          }
        }
      },
      onError: (error) => {
        setOperationState(prev => ({
          ...prev,
          error: error.message,
          isPolling: false
        }));
      }
    }
  );

  // Update operation state when job status changes
  useEffect(() => {
    if (jobStatus) {
      setOperationState(prev => ({
        ...prev,
        status: jobStatus as unknown as JobStatus
      }));
    }
  }, [jobStatus]);

  // Handle polling errors
  useEffect(() => {
    if (isPollingError && pollingError) {
      setOperationState(prev => ({
        ...prev,
        error: pollingError.message,
        isPolling: false
      }));
    }
  }, [isPollingError, pollingError]);

  // Reset operation state
  const reset = () => {
    setOperationState({
      jobId: null,
      status: null,
      isPolling: false,
      error: null
    });
  };

  // Cancel operation
  const cancel = async () => {
    if (operationState.jobId && operationState.isPolling) {
      try {
        await jobService.cancelJob(operationState.jobId);
        setOperationState(prev => ({
          ...prev,
          isPolling: false,
          status: prev.status ? { ...prev.status, status: 'REVOKED' } : null
        }));
      } catch (error) {
        console.error('Failed to cancel job:', error);
      }
    }
  };

  return {
    // Operation control
    execute: startMutation.mutate,
    reset,
    cancel,

    // State
    isExecuting: startMutation.isPending || operationState.isPolling,
    isStarting: startMutation.isPending,
    isPolling: operationState.isPolling,
    isComplete: operationState.status ? jobService.isJobComplete(operationState.status) : false,
    isSuccessful: operationState.status ? jobService.isJobSuccessful(operationState.status) : false,
    isFailed: operationState.status ? jobService.isJobFailed(operationState.status) : false,

    // Data
    jobId: operationState.jobId,
    status: operationState.status,
    progress: operationState.status?.progress || 0,
    step: operationState.status?.step,
    result: operationState.status?.result,
    error: operationState.error || startMutation.error?.message,

    // Status helpers
    statusMessage: operationState.status ? jobService.getJobStatusMessage(operationState.status) : '',
    estimatedTimeRemaining: operationState.status ? jobService.getEstimatedTimeRemaining(operationState.status) : null
  };
};

/**
 * Simplified async operation hook with automatic query invalidation
 * @param operationFn - Function that starts the async operation
 * @param queryKeysToInvalidate - Array of query keys to invalidate on success
 * @param onComplete - Callback when operation completes successfully
 */
export const useSimpleAsyncOperation = <TVariables = any>(
  operationFn: (variables: TVariables) => Promise<JobStatus>,
  queryKeysToInvalidate: string[][] = [],
  onComplete?: (result: any) => void
) => {
  return useAsyncOperation(operationFn, {
    invalidateQueries: queryKeysToInvalidate,
    onSuccess: onComplete
  });
};
