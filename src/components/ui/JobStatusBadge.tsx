/**
 * Job Status Badge component with neural color scheme
 * Displays job status with appropriate colors and icons
 */

import React from 'react';
import { JobStatus } from '../../types/job';
import * as jobService from '../../services/jobService';

interface JobStatusBadgeProps {
  status: JobStatus;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showProgress?: boolean;
}

const JobStatusBadge: React.FC<JobStatusBadgeProps> = ({
  status,
  className = '',
  size = 'md',
  showIcon = true,
  showProgress = false
}) => {
  const isComplete = jobService.isJobComplete(status);
  const isSuccessful = jobService.isJobSuccessful(status);
  const isFailed = jobService.isJobFailed(status);

  // Size variants
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  // Status-based styling
  const getStatusStyles = () => {
    switch (status.status) {
      case 'PENDING':
        return {
          bg: 'bg-neutral-600/20',
          text: 'text-neutral-300',
          border: 'border-neutral-600',
          glow: ''
        };
      case 'PROGRESS':
        return {
          bg: 'bg-neural-blue/20',
          text: 'text-neural-blue',
          border: 'border-neural-blue',
          glow: 'shadow-neural-glow-blue'
        };
      case 'SUCCESS':
        return {
          bg: 'bg-green-500/20',
          text: 'text-green-400',
          border: 'border-green-500',
          glow: 'shadow-green-500/50'
        };
      case 'FAILURE':
        return {
          bg: 'bg-red-500/20',
          text: 'text-red-400',
          border: 'border-red-500',
          glow: 'shadow-red-500/50'
        };
      case 'RETRY':
        return {
          bg: 'bg-neural-pink/20',
          text: 'text-neural-pink',
          border: 'border-neural-pink',
          glow: 'shadow-neural-glow-pink'
        };
      case 'REVOKED':
        return {
          bg: 'bg-neutral-500/20',
          text: 'text-neutral-400',
          border: 'border-neutral-500',
          glow: ''
        };
      default:
        return {
          bg: 'bg-neural-purple/20',
          text: 'text-neural-purple',
          border: 'border-neural-purple',
          glow: 'shadow-neural-glow-purple'
        };
    }
  };

  const styles = getStatusStyles();

  // Status icons
  const StatusIcon = () => {
    if (!showIcon) return null;

    const iconClass = `${iconSizes[size]} ${styles.text}`;

    switch (status.status) {
      case 'PENDING':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'PROGRESS':
        return (
          <svg className={`${iconClass} animate-spin`} fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        );
      case 'SUCCESS':
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'FAILURE':
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        );
      case 'RETRY':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      case 'REVOKED':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
          </svg>
        );
      default:
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  // Status text
  const getStatusText = () => {
    switch (status.status) {
      case 'PENDING':
        return 'En attente';
      case 'PROGRESS':
        return 'En cours';
      case 'SUCCESS':
        return 'Terminé';
      case 'FAILURE':
        return 'Échec';
      case 'RETRY':
        return 'Nouvelle tentative';
      case 'REVOKED':
        return 'Annulé';
      default:
        return status.status;
    }
  };

  return (
    <div
      className={`
        inline-flex items-center space-x-1.5 font-medium rounded-full border
        ${sizeClasses[size]}
        ${styles.bg}
        ${styles.text}
        ${styles.border}
        ${styles.glow}
        ${status.status === 'PROGRESS' ? 'animate-pulse' : ''}
        ${className}
      `}
    >
      <StatusIcon />
      <span>{getStatusText()}</span>
      {showProgress && status.progress > 0 && (
        <span className="opacity-75">
          ({Math.round(status.progress)}%)
        </span>
      )}
    </div>
  );
};

export default JobStatusBadge;