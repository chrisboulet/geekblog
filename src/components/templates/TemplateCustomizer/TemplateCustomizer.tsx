/**
 * TemplateCustomizer Component
 * Main modal container for template customization with real-time preview
 * Follows the PRP specification for Quebec localization and Neural Flow design
 */

import React, { useState, useEffect } from 'react';
import { X, Sparkles, Eye, Settings } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { useQuery } from '@tanstack/react-query';
import { Template, TemplateCustomization } from '../../../types/templates';
import { Project } from '../../../types/types';
import TemplateService from '../../../services/templateService';
import CustomizationForm from './CustomizationForm';
import TaskPreview from './TaskPreview';
import { createQueryConfig } from '../../../lib/apiServiceFactory';

interface TemplateCustomizerProps {
  /** Selected template to customize */
  template: Template | null;
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal is closed */
  onClose: () => void;
  /** Callback when template is submitted for project creation */
  onSubmit: (template: Template, customization: TemplateCustomization) => Promise<Project>;
  /** Loading state from parent */
  isSubmitting?: boolean;
}

const DEFAULT_CUSTOMIZATION: TemplateCustomization = {
  title: '',
  theme: '',
  localization_level: 'moyen',
  audience: 'québécois',
  additional_instructions: '',
};

export default function TemplateCustomizer({
  template,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}: TemplateCustomizerProps) {
  const [customization, setCustomization] = useState<TemplateCustomization>(DEFAULT_CUSTOMIZATION);
  const [activeTab, setActiveTab] = useState<'customize' | 'preview'>('customize');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Reset customization when template changes
  useEffect(() => {
    if (template) {
      setCustomization({
        ...DEFAULT_CUSTOMIZATION,
        title: `Guide ${template.name}`,
        theme: template.category || '',
      });
      setValidationErrors([]);
      setActiveTab('customize');
    }
  }, [template]);

  // Real-time preview query with debounce
  const {
    data: previewTasks,
    isLoading: isLoadingPreview,
    error: previewError,
  } = useQuery({
    queryKey: ['template-preview', template?.id, customization],
    queryFn: () => {
      if (!template || !customization.title.trim()) {
        return [];
      }
      return TemplateService.generatePreviewTasks(template.id, customization);
    },
    enabled: !!template && customization.title.trim().length > 0,
    ...createQueryConfig({
      endpoint: 'templates',
      cache: {
        staleTime: 5000, // Cache preview for 5 seconds
        cacheTime: 30000, // Keep in cache for 30 seconds
      },
    }),
  });

  // Validate customization
  const validateCustomization = () => {
    const validation = TemplateService.validateCustomization(customization);
    setValidationErrors(validation.errors);
    return validation.isValid;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!template || !validateCustomization()) {
      return;
    }

    try {
      await onSubmit(template, customization);
      onClose();
    } catch (error) {
      console.error('Failed to create project from template:', error);
      // Error handling is done by parent component
    }
  };

  // Handle customization changes
  const handleCustomizationChange = (updates: Partial<TemplateCustomization>) => {
    setCustomization(prev => ({ ...prev, ...updates }));
    // Clear validation errors when user makes changes
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  // Close handler with confirmation if there are unsaved changes
  const handleClose = () => {
    const hasChanges = customization.title !== '' || customization.theme !== '';

    if (hasChanges) {
      const confirmed = window.confirm(
        'Vous avez des modifications non sauvegardées. Êtes-vous sûr de vouloir fermer ?'
      );
      if (!confirmed) return;
    }

    onClose();
  };

  if (!template) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-4xl max-h-[90vh] outline-none">
          <div className="neural-card flex flex-col h-full max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-neural-blue/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-neural-blue/20 rounded-lg flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-neural-blue" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-text-primary">
                    Personnaliser le modèle
                  </h2>
                  <p className="text-sm text-text-secondary">
                    {template.name} • {template.category}
                  </p>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="text-text-secondary hover:text-text-primary transition-colors neural-focusable rounded-full p-2 hover:bg-bg-glass"
                aria-label="Fermer le personnalisateur"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-neural-blue/10">
              <button
                onClick={() => setActiveTab('customize')}
                className={`
                  flex items-center gap-2 px-4 sm:px-6 py-3 text-sm font-medium transition-colors
                  ${activeTab === 'customize'
                    ? 'text-neural-blue border-b-2 border-neural-blue bg-neural-blue/5'
                    : 'text-text-secondary hover:text-text-primary'
                  }
                `}
              >
                <Settings className="h-4 w-4" />
                Personnalisation
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`
                  flex items-center gap-2 px-4 sm:px-6 py-3 text-sm font-medium transition-colors
                  ${activeTab === 'preview'
                    ? 'text-neural-blue border-b-2 border-neural-blue bg-neural-blue/5'
                    : 'text-text-secondary hover:text-text-primary'
                  }
                `}
                disabled={!customization.title.trim()}
              >
                <Eye className="h-4 w-4" />
                Aperçu
                {!customization.title.trim() && (
                  <span className="text-xs text-text-tertiary">(titre requis)</span>
                )}
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden">
              {activeTab === 'customize' ? (
                <div className="h-full overflow-y-auto p-4 sm:p-6">
                  <CustomizationForm
                    template={template}
                    customization={customization}
                    onChange={handleCustomizationChange}
                    validationErrors={validationErrors}
                    isSubmitting={isSubmitting}
                  />
                </div>
              ) : (
                <div className="h-full overflow-y-auto p-4 sm:p-6">
                  <TaskPreview
                    tasks={previewTasks || []}
                    isLoading={isLoadingPreview}
                    error={previewError}
                    customization={customization}
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 sm:p-6 border-t border-neural-blue/10 bg-bg-secondary/50">
              <div className="text-sm text-text-secondary">
                <p>
                  <strong>Modèle:</strong> {template.name}
                </p>
                <p>
                  <strong>Difficulté:</strong> {template.difficulty} •
                  <strong> Durée estimée:</strong> {template.estimated_duration}
                </p>
              </div>

              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  onClick={handleClose}
                  className="flex-1 sm:flex-none px-4 py-2 text-text-secondary hover:text-text-primary transition-colors neural-focusable"
                  disabled={isSubmitting}
                >
                  Annuler
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!customization.title.trim() || isSubmitting || validationErrors.length > 0}
                  className="flex-1 sm:flex-none neural-button neural-interactive neural-clickable neural-focusable disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Création...
                    </span>
                  ) : (
                    'Créer le projet'
                  )}
                </button>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
