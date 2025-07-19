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
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-neural-blue/20">
          <div className="flex items-center gap-2 sm:gap-3">
            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-neural-blue" />
            <h2 className="text-xl sm:text-2xl font-bold neural-text-gradient">
              {title}
            </h2>
            {filteredTemplates.length > 0 && (
              <span className="text-xs sm:text-sm text-text-tertiary bg-bg-secondary px-2 py-1 rounded">
                {filteredTemplates.length} modèle{filteredTemplates.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors neural-focusable rounded-full p-2 hover:bg-bg-glass"
            aria-label="Fermer la galerie de modèles"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 sm:p-6 border-b border-neural-blue/10">
          <TemplateFilters
            filters={filters}
            onFiltersChange={setFilters}
            isLoading={isLoading}
          />
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-8 sm:py-12">
              <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-neural-blue mb-4"></div>
              <p className="text-text-secondary text-sm sm:text-base">Chargement des modèles...</p>
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="text-center py-8 sm:py-12">
              <div className="neural-error-card p-4 sm:p-6 max-w-md mx-auto">
                <h3 className="text-base sm:text-lg font-semibold text-red-400 mb-2">
                  Échec du chargement des modèles
                </h3>
                <p className="text-text-secondary mb-4 text-sm sm:text-base">
                  {error instanceof Error ? error.message : 'Veuillez réessayer plus tard.'}
                </p>
                <button
                  onClick={() => refetch()}
                  className="neural-button neural-interactive neural-clickable neural-focusable text-sm sm:text-base"
                >
                  Réessayer
                </button>
              </div>
            </div>
          )}

          {/* No Results */}
          {!isLoading && !isError && filteredTemplates.length === 0 && (
            <div className="text-center py-8 sm:py-12">
              <div className="text-3xl sm:text-4xl mb-4 opacity-50">🔍</div>
              <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-2">
                Aucun modèle trouvé
              </h3>
              <p className="text-text-secondary mb-4 text-sm sm:text-base">
                Essayez d'ajuster vos filtres ou termes de recherche.
              </p>
              {Object.keys(filters).length > 0 && (
                <button
                  onClick={() => setFilters({ active_only: true })}
                  className="text-neural-blue hover:text-neural-purple transition-colors underline text-sm sm:text-base"
                >
                  Effacer tous les filtres
                </button>
              )}
            </div>
          )}

          {/* Templates Grid */}
          {!isLoading && !isError && filteredTemplates.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 auto-rows-fr">
              {/* Start from Scratch Option */}
              {showStartFromScratch && (
                <div
                  className="neural-card neural-interactive neural-clickable p-4 cursor-pointer border-2 border-dashed border-neural-blue/30 hover:border-neural-blue/50 transition-colors h-full flex flex-col"
                  onClick={onStartFromScratch}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onStartFromScratch();
                    }
                  }}
                  aria-label="Commencer de zéro - créer un projet vide avec des tâches personnalisées"
                >
                  <div className="text-center flex-1 flex flex-col justify-center">
                    <div className="text-xl sm:text-2xl mb-2">
                      <Settings className="h-6 w-6 sm:h-8 sm:w-8 mx-auto text-neural-blue" />
                    </div>
                    <h3 className="font-semibold text-text-primary mb-2 text-sm sm:text-base">
                      Commencer de zéro
                    </h3>
                    <p className="text-xs sm:text-sm text-text-secondary">
                      Créer un projet vide avec des tâches personnalisées
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
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-neural-blue/10 bg-bg-secondary/50">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4 text-xs sm:text-sm text-text-tertiary">
            <div className="text-center sm:text-left">
              Les modèles vous aident à créer du contenu structuré et engageant rapidement
            </div>
            <div className="flex items-center gap-2 sm:gap-4 text-xs">
              <span className="hidden sm:inline">Appuyez sur ESC pour fermer</span>
              <span className="hidden sm:inline">•</span>
              <span>Cliquez sur un modèle pour le sélectionner</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateGallery;
