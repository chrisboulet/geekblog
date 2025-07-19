/**
 * Job Progress Bar component with Radix UI patterns
 * Displays progress percentage with neural color scheme and smooth animations
 */

import React from 'react';
import * as Progress from '@radix-ui/react-progress';
import { JobStatus } from '../../types/job';
import * as jobService from '../../services/jobService';

interface JobProgressBarProps {
  status: JobStatus;
  className?: string;
  showPercentage?: boolean;
  showStep?: boolean;
  showTimeRemaining?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const JobProgressBar: React.FC<JobProgressBarProps> = ({
  status,
  className = '',
  showPercentage = true,
  showStep = true,
  showTimeRemaining = false,
  size = 'md'
}) => {
  const progress = Math.max(0, Math.min(100, status.progress || 0));
  const isComplete = jobService.isJobComplete(status);
  const isSuccessful = jobService.isJobSuccessful(status);
  const isFailed = jobService.isJobFailed(status);
  const timeRemaining = jobService.getEstimatedTimeRemaining(status);

  // Size variants
  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
  };

  // Progress bar color based on status
  const getProgressColor = () => {
    if (isFailed) return 'bg-red-500';
    if (isSuccessful) return 'bg-green-500';
    if (status.status === 'PROGRESS') return 'bg-neural-blue';
    return 'bg-neural-purple';
  };

  // Glow effect for active progress
  const getGlowEffect = () => {
    if (!isComplete && status.status === 'PROGRESS') {
      return 'shadow-neural-glow-blue';
    }
    if (isSuccessful) {
      return 'shadow-green-500/50';
    }
    return '';
  };

  // Format time remaining
  const formatTimeRemaining = (ms: number) => {
    const seconds = Math.ceil(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.ceil(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.ceil(minutes / 60);
    return `${hours}h`;
  };

  return (
    <div className={`w-full space-y-2 ${className}`}>
      {/* Progress info header */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          {showPercentage && (
            <span className="font-medium text-text-primary">
              {Math.round(progress)}%
            </span>
          )}
          {showStep && status.step && (
            <span className="text-text-secondary truncate">
              {status.step}
            </span>
          )}
        </div>

        {showTimeRemaining && timeRemaining && timeRemaining > 0 && (
          <span className="text-text-tertiary">
            ~{formatTimeRemaining(timeRemaining)}
          </span>
        )}
      </div>

      {/* Progress bar */}
      <Progress.Root
        value={progress}
        max={100}
        className={`relative overflow-hidden bg-bg-secondary rounded-full ${sizeClasses[size]} ${getGlowEffect()}`}
      >
        <Progress.Indicator
          className={`h-full rounded-full transition-all duration-300 ease-out ${getProgressColor()}`}
          style={{
            transform: `translateX(-${100 - progress}%)`,
            // Add pulse animation for active progress
            animation: status.status === 'PROGRESS' && !isComplete
              ? 'pulse 2s infinite'
              : undefined
          }}
        />

        {/* Animated shimmer effect for active progress */}
        {status.status === 'PROGRESS' && !isComplete && (
          <div
            className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            style={{
              animation: 'shimmer 2s infinite linear',
              transform: `translateX(-${100 - progress}%)`
            }}
          />
        )}
      </Progress.Root>

      {/* Status message */}
      {status.status_message && (
        <div className="text-xs text-text-secondary">
          {status.status_message}
        </div>
      )}

      {/* Error message */}
      {isFailed && status.error && (
        <div className="text-xs text-red-400">
          Error: {status.error}
        </div>
      )}

      {/* Success indicator */}
      {isSuccessful && (
        <div className="flex items-center space-x-1 text-xs text-green-400">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span>Completed successfully</span>
        </div>
      )}
    </div>
  );
};

export default JobProgressBar;

// Add CSS animations to global styles if not already present
// @keyframes shimmer {
//   0% { transform: translateX(-100%); }
//   100% { transform: translateX(300%); }
// }
