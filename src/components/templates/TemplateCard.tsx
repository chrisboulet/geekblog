/**
 * TemplateCard Component
 * Reusable card component for displaying template information
 * Extracted from TemplateSelectionModal for better modularity
 */

import React from 'react';
import { Template } from '../../types/templates';

interface TemplateCardProps {
  /** Template data to display */
  template: Template;
  /** Callback when template card is clicked */
  onClick: (template: Template) => void;
  /** Additional CSS classes */
  className?: string;
  /** Whether the card is currently selected/active */
  isSelected?: boolean;
  /** Whether the card should be disabled */
  disabled?: boolean;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onClick,
  className = '',
  isSelected = false,
  disabled = false
}) => {
  const handleClick = () => {
    if (!disabled) {
      onClick(template);
    }
  };

  const baseClasses = "neural-card neural-interactive neural-clickable p-4 cursor-pointer transition-all duration-200";
  const stateClasses = disabled
    ? "opacity-50 cursor-not-allowed"
    : isSelected
      ? "ring-2 ring-neural-purple border-neural-purple"
      : "hover:border-neural-blue hover:shadow-neural-glow-sm";

  const combinedClasses = `${baseClasses} ${stateClasses} ${className}`.trim();

  return (
    <div
      className={combinedClasses}
      onClick={handleClick}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
          e.preventDefault();
          onClick(template);
        }
      }}
      aria-label={`Select template: ${template.name}`}
      aria-pressed={isSelected}
      aria-disabled={disabled}
    >
      <div className="text-center">
        {/* Template Icon */}
        <div className="text-2xl mb-2" aria-hidden="true">
          {template.icon}
        </div>

        {/* Template Name */}
        <h3 className="font-semibold text-text-primary mb-2 text-sm md:text-base">
          {template.name}
        </h3>

        {/* Template Description */}
        <p className="text-sm text-text-secondary mb-3 line-clamp-2">
          {template.description}
        </p>

        {/* Template Metadata */}
        <div className="flex justify-between items-center text-xs gap-2">
          {/* Difficulty Badge */}
          <span
            className="bg-neural-purple/20 text-neural-purple px-2 py-1 rounded-full text-xs font-medium flex-shrink-0"
            title={`Difficulty: ${template.difficulty}`}
          >
            {template.difficulty}
          </span>

          {/* Estimated Duration */}
          <span
            className="text-text-tertiary text-right truncate"
            title={`Estimated duration: ${template.estimated_duration}`}
          >
            {template.estimated_duration}
          </span>
        </div>

        {/* Optional Category (if available) */}
        {template.category && (
          <div className="mt-2 pt-2 border-t border-neural-purple/10">
            <span className="text-xs text-text-tertiary bg-bg-secondary px-2 py-1 rounded">
              {template.category}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateCard;
