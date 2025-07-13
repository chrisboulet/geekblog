/**
 * Loading Spinner component matching design system
 * Various sizes and colors with neural theme support
 */

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'neural-blue' | 'neural-pink' | 'neural-purple' | 'white' | 'gray';
  className?: string;
  label?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'neural-blue',
  className = '',
  label = 'Loading...'
}) => {
  // Size variants
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  // Color variants
  const colorClasses = {
    'neural-blue': 'text-neural-blue',
    'neural-pink': 'text-neural-pink',
    'neural-purple': 'text-neural-purple',
    'white': 'text-white',
    'gray': 'text-gray-400'
  };

  return (
    <div
      className={`inline-flex items-center ${className}`}
      role="status"
      aria-label={label}
    >
      <svg
        className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]}`}
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  );
};

/**
 * Centered loading spinner with optional text
 */
export const CenteredLoadingSpinner: React.FC<{
  size?: LoadingSpinnerProps['size'];
  color?: LoadingSpinnerProps['color'];
  text?: string;
  className?: string;
}> = ({
  size = 'lg',
  color = 'neural-blue',
  text,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      <LoadingSpinner size={size} color={color} />
      {text && (
        <span className="text-text-secondary text-sm font-medium">
          {text}
        </span>
      )}
    </div>
  );
};

/**
 * Loading spinner with neural glow effect
 */
export const GlowLoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'neural-blue',
  className = '',
  label = 'Loading...'
}) => {
  const glowClasses = {
    'neural-blue': 'drop-shadow-[0_0_8px_rgba(0,191,255,0.6)]',
    'neural-pink': 'drop-shadow-[0_0_8px_rgba(255,20,147,0.6)]',
    'neural-purple': 'drop-shadow-[0_0_8px_rgba(138,43,226,0.6)]',
    'white': 'drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]',
    'gray': 'drop-shadow-[0_0_8px_rgba(156,163,175,0.6)]'
  };

  return (
    <div
      className={`inline-flex items-center ${className}`}
      role="status"
      aria-label={label}
    >
      <svg
        className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]} ${glowClasses[color]}`}
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  );
};

/**
 * Pulse loading indicator (dots)
 */
export const PulseLoadingIndicator: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  color?: LoadingSpinnerProps['color'];
  className?: string;
}> = ({
  size = 'md',
  color = 'neural-blue',
  className = ''
}) => {
  const dotSizes = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3'
  };

  const colorClasses = {
    'neural-blue': 'bg-neural-blue',
    'neural-pink': 'bg-neural-pink',
    'neural-purple': 'bg-neural-purple',
    'white': 'bg-white',
    'gray': 'bg-gray-400'
  };

  return (
    <div className={`flex space-x-1 ${className}`} role="status" aria-label="Loading">
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={`${dotSizes[size]} ${colorClasses[color]} rounded-full animate-pulse`}
          style={{
            animationDelay: `${index * 0.2}s`,
            animationDuration: '1s'
          }}
        />
      ))}
    </div>
  );
};

// Re-export size and color classes for external use
export const sizeClasses = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
};

export const colorClasses = {
  'neural-blue': 'text-neural-blue',
  'neural-pink': 'text-neural-pink',
  'neural-purple': 'text-neural-purple',
  'white': 'text-white',
  'gray': 'text-gray-400'
};

export default LoadingSpinner;
