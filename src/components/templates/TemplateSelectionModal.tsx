/**
 * Template Selection Modal - Enhanced Implementation
 * Modal for template selection with integrated TemplateGallery
 */

import React, { useState } from 'react';
import { useCreateProjectFromTemplate } from '../../hooks/useTemplates';
import { Template, TemplateCustomization } from '../../types/templates';
import { useNavigate } from 'react-router-dom';
import TemplateGallery from './TemplateGallery';

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

  const handleBackToGallery = () => {
    setShowCustomization(false);
    setSelectedTemplate(null);
  };

  if (!isOpen) return null;

  // Show customization view if template is selected
  if (showCustomization && selectedTemplate) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="neural-card max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <CustomizationView
            template={selectedTemplate}
            onBack={handleBackToGallery}
            onClose={onClose}
            onCreate={handleCreateProject}
            isCreating={createProjectMutation.isPending}
          />
        </div>
      </div>
    );
  }

  // Show template gallery
  return (
    <TemplateGallery
      isOpen={isOpen}
      onClose={onClose}
      onTemplateSelect={handleTemplateSelect}
      onStartFromScratch={onStartFromScratch}
      selectedTemplateId={selectedTemplate?.id}
      title="Choose a Template"
      showStartFromScratch={true}
    />
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