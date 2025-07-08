/**
 * TemplateGallery Component
 * Main gallery modal with responsive grid, search, and filter capabilities
 * Replaces the template selection logic in TemplateSelectionModal
 */

import React, { useState, useMemo } from 'react';
import { X, Settings, Sparkles } from 'lucide-react';
import { useTemplates } from '../../hooks/useTemplates';
import { Template } from '../../types/templates';
import TemplateCard from './TemplateCard';
import TemplateFilters, { TemplateFilters as FilterState } from './TemplateFilters';

interface TemplateGalleryProps {
  /** Whether the gallery modal is open */
  isOpen: boolean;
  /** Callback when modal is closed */
  onClose: () => void;
  /** Callback when a template is selected */
  onTemplateSelect: (template: Template) => void;
  /** Callback when "Start from Scratch" is selected */
  onStartFromScratch: () => void;
  /** Currently selected template ID (for highlighting) */
  selectedTemplateId?: number;
  /** Modal title */
  title?: string;
  /** Whether to show the "Start from Scratch" option */
  showStartFromScratch?: boolean;
}

const TemplateGallery: React.FC<TemplateGalleryProps> = ({
  isOpen,
  onClose,
  onTemplateSelect,
  onStartFromScratch,
  selectedTemplateId,
  title = "Choose a Template",
  showStartFromScratch = true
}) => {
  const [filters, setFilters] = useState<FilterState>({ active_only: true });

  // Fetch templates with current filters including search
  const { data: templates, isLoading, isError, error, refetch } = useTemplates({
    search: filters.search,
    category: filters.category,
    difficulty: filters.difficulty,
    tone: filters.tone,
    active_only: filters.active_only
  });

  // Templates are now filtered server-side, no need for client-side filtering
  const filteredTemplates = useMemo(() => {
    return templates || [];
  }, [templates]);

  // Close modal on escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="neural-card max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-neural-purple/20">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-neural-purple" />
            <h2 className="text-2xl font-bold neural-text-gradient">
              {title}
            </h2>
            {filteredTemplates.length > 0 && (
              <span className="text-sm text-text-tertiary bg-bg-secondary px-2 py-1 rounded">
                {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors neural-focusable rounded-full p-2 hover:bg-bg-glass"
            aria-label="Close template gallery"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-neural-purple/10">
          <TemplateFilters
            filters={filters}
            onFiltersChange={setFilters}
            isLoading={isLoading}
          />
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-neural-purple mb-4"></div>
              <p className="text-text-secondary">Loading templates...</p>
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="text-center py-12">
              <div className="neural-error-card p-6">
                <h3 className="text-lg font-semibold text-red-400 mb-2">
                  Failed to load templates
                </h3>
                <p className="text-text-secondary mb-4">
                  {error instanceof Error ? error.message : 'Please try again later.'}
                </p>
                <button
                  onClick={() => refetch()}
                  className="neural-button neural-interactive neural-clickable neural-focusable"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* No Results */}
          {!isLoading && !isError && filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4 opacity-50">🔍</div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                No templates found
              </h3>
              <p className="text-text-secondary mb-4">
                Try adjusting your filters or search terms.
              </p>
              {Object.keys(filters).length > 0 && (
                <button
                  onClick={() => setFilters({ active_only: true })}
                  className="text-neural-purple hover:text-neural-pink transition-colors underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}

          {/* Templates Grid */}
          {!isLoading && !isError && filteredTemplates.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* Start from Scratch Option */}
              {showStartFromScratch && (
                <div
                  className="neural-card neural-interactive neural-clickable p-4 cursor-pointer border-2 border-dashed border-neural-purple/30 hover:border-neural-purple/50 transition-colors"
                  onClick={onStartFromScratch}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onStartFromScratch();
                    }
                  }}
                  aria-label="Start from scratch - create a blank project with custom tasks"
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">
                      <Settings className="h-8 w-8 mx-auto text-neural-purple" />
                    </div>
                    <h3 className="font-semibold text-text-primary mb-2">
                      Start from Scratch
                    </h3>
                    <p className="text-sm text-text-secondary">
                      Create a blank project with custom tasks
                    </p>
                  </div>
                </div>
              )}

              {/* Template Cards */}
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onClick={onTemplateSelect}
                  isSelected={selectedTemplateId === template.id}
                  className="h-full" // Ensure consistent heights
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neural-purple/10 bg-bg-secondary/50">
          <div className="flex justify-between items-center text-sm text-text-tertiary">
            <div>
              Templates help you create structured, engaging content quickly
            </div>
            <div className="flex items-center gap-4">
              <span>Press ESC to close</span>
              <span>•</span>
              <span>Click template to select</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateGallery;