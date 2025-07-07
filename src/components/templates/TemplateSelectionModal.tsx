/**
 * Template Selection Modal - Walking Skeleton Implementation
 * Minimal modal for template selection triggered from ProjectListPage
 */

import React, { useState } from 'react';
import { useTemplates, useCreateProjectFromTemplate } from '../../hooks/useTemplates';
import { Template, TemplateCustomization } from '../../types/templates';
import { useNavigate } from 'react-router-dom';

interface TemplateSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartFromScratch: () => void;
}

const TemplateSelectionModal: React.FC<TemplateSelectionModalProps> = ({
  isOpen,
  onClose,
  onStartFromScratch
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showCustomization, setShowCustomization] = useState(false);
  const navigate = useNavigate();

  // Fetch templates
  const { data: templates, isLoading, isError } = useTemplates({ active_only: true });
  
  // Project creation mutation
  const createProjectMutation = useCreateProjectFromTemplate();

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setShowCustomization(true);
  };

  const handleCreateProject = (customization: TemplateCustomization) => {
    if (!selectedTemplate) return;

    createProjectMutation.mutate({
      template_id: selectedTemplate.id,
      customization
    }, {
      onSuccess: (project) => {
        navigate(`/project/${project.id}`);
        onClose();
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="neural-card max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {!showCustomization ? (
          // Template Selection View
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold neural-text-gradient">
                Choose a Template
              </h2>
              <button
                onClick={onClose}
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                ✕
              </button>
            </div>

            {isLoading && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-neural-purple"></div>
                <p className="mt-2 text-text-secondary">Loading templates...</p>
              </div>
            )}

            {isError && (
              <div className="text-center py-8 neural-error">
                <p>Failed to load templates. Please try again.</p>
              </div>
            )}

            {templates && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {/* Start from Scratch Option */}
                <div
                  className="neural-card neural-interactive neural-clickable p-4 cursor-pointer border-2 border-dashed border-neural-purple/30"
                  onClick={onStartFromScratch}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">⚙️</div>
                    <h3 className="font-semibold text-text-primary mb-2">
                      Start from Scratch
                    </h3>
                    <p className="text-sm text-text-secondary">
                      Create a blank project with custom tasks
                    </p>
                  </div>
                </div>

                {/* Template Cards */}
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="neural-card neural-interactive neural-clickable p-4 cursor-pointer"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">{template.icon}</div>
                      <h3 className="font-semibold text-text-primary mb-2">
                        {template.name}
                      </h3>
                      <p className="text-sm text-text-secondary mb-3">
                        {template.description}
                      </p>
                      <div className="flex justify-between items-center text-xs">
                        <span className="bg-neural-purple/20 text-neural-purple px-2 py-1 rounded">
                          {template.difficulty}
                        </span>
                        <span className="text-text-tertiary">
                          {template.estimated_duration}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          // Customization View (will be moved to separate component later)
          <CustomizationView
            template={selectedTemplate!}
            onBack={() => setShowCustomization(false)}
            onClose={onClose}
            onCreate={handleCreateProject}
            isCreating={createProjectMutation.isPending}
          />
        )}
      </div>
    </div>
  );
};

// Temporary inline customization component (will be extracted later)
interface CustomizationViewProps {
  template: Template;
  onBack: () => void;
  onClose: () => void;
  onCreate: (customization: TemplateCustomization) => void;
  isCreating: boolean;
}

const CustomizationView: React.FC<CustomizationViewProps> = ({
  template,
  onBack,
  onClose,
  onCreate,
  isCreating
}) => {
  const [title, setTitle] = useState('');
  const [theme, setTheme] = useState('');
  const [localizationLevel, setLocalizationLevel] = useState<'bas' | 'moyen' | 'élevé'>('moyen');
  const [audience, setAudience] = useState<'québécois' | 'francophone' | 'international'>('québécois');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !theme.trim()) return;

    onCreate({
      title: title.trim(),
      theme: theme.trim(),
      localization_level: localizationLevel,
      audience
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            ← Back
          </button>
          <h2 className="text-2xl font-bold neural-text-gradient">
            Customize: {template.name}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="text-text-secondary hover:text-text-primary transition-colors"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Title of your article *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Installer Linux sur un vieux PC"
            required
            className="w-full px-4 py-2 bg-bg-secondary border border-neural-purple/30 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-neural-purple neural-focusable"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Theme/Subject *
          </label>
          <input
            type="text"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="e.g., Installation Linux, Sécurité informatique"
            required
            className="w-full px-4 py-2 bg-bg-secondary border border-neural-purple/30 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-neural-purple neural-focusable"
          />
        </div>

        {/* Quebec Localization Selector */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-3">
            Level of Quebec Localization
          </label>
          <div className="space-y-2">
            {[
              { value: 'bas', label: 'International', desc: 'Accessible à tous les francophones' },
              { value: 'moyen', label: 'Québécois Standard', desc: 'Naturel pour le Québec, compréhensible ailleurs' },
              { value: 'élevé', label: 'Authentique Québécois', desc: 'Style Boulet authentique, références locales' }
            ].map((level) => (
              <label key={level.value} className="flex items-center gap-3 p-3 neural-card cursor-pointer">
                <input
                  type="radio"
                  name="localization"
                  value={level.value}
                  checked={localizationLevel === level.value}
                  onChange={(e) => setLocalizationLevel(e.target.value as any)}
                  className="text-neural-purple focus:ring-neural-purple"
                />
                <div>
                  <div className="font-medium text-text-primary">{level.label}</div>
                  <div className="text-sm text-text-secondary">{level.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isCreating || !title.trim() || !theme.trim()}
            className="flex-1 neural-button-primary neural-interactive neural-clickable neural-focusable disabled:opacity-50"
          >
            {isCreating ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Creating Project...
              </span>
            ) : (
              'Create Project'
            )}
          </button>
          <button
            type="button"
            onClick={onBack}
            className="neural-button neural-interactive neural-clickable neural-focusable"
          >
            Back
          </button>
        </div>
      </form>
    </div>
  );
};

export default TemplateSelectionModal;