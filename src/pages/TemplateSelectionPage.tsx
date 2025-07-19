/**
 * TemplateSelectionPage Component
 * Dedicated page for template selection and customization workflow
 * Accessible via /projects/new/template route
 * Integrates TemplateGallery and TemplateCustomizer for full workflow
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Template, TemplateCustomization } from '../types/templates';
import { Project } from '../types/types';
import { useCreateProjectFromTemplate } from '../hooks/useTemplates';
import NeuralBackground from '../components/neural/NeuralBackground';
import NavigationHeader from '../components/navigation/NavigationHeader';
import TemplateGallery from '../components/templates/TemplateGallery';
import TemplateCustomizer from '../components/templates/TemplateCustomizer/TemplateCustomizer';

/**
 * Template selection page with gallery and customization workflow
 */
const TemplateSelectionPage: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const navigate = useNavigate();

  // Project creation mutation
  const createProjectMutation = useCreateProjectFromTemplate();

  // Handle template selection from gallery
  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setShowCustomizer(true);
  };

  // Handle starting from scratch (redirect to regular project creation)
  const handleStartFromScratch = () => {
    navigate('/projects?action=create');
  };

  // Handle back navigation
  const handleBack = () => {
    navigate('/projects');
  };

  // Handle template submission with customization
  const handleTemplateSubmit = async (
    template: Template,
    customization: TemplateCustomization
  ): Promise<Project> => {
    return new Promise((resolve, reject) => {
      createProjectMutation.mutate(
        {
          template_id: template.id,
          customization,
        },
        {
          onSuccess: (project) => {
            // Navigate to the new project
            navigate(`/project/${project.id}`);
            resolve(project);
          },
          onError: (error) => {
            reject(error);
          },
        }
      );
    });
  };

  // Close customizer (back to gallery)
  const handleCustomizerClose = () => {
    setShowCustomizer(false);
    setSelectedTemplate(null);
  };

  return (
    <div className="min-h-screen flex flex-col relative" style={{ background: 'var(--bg-primary)' }}>
      <NeuralBackground />
      <NavigationHeader />

      <main className="flex-grow relative z-10">
        {/* Page Header */}
        <div className="border-b border-neural-blue/10 bg-bg-secondary/30 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors neural-focusable rounded-lg p-2 hover:bg-bg-glass"
                aria-label="Retour aux projets"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="hidden sm:inline">Retour</span>
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-neural-blue/20 rounded-lg flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-neural-blue" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold neural-text-gradient">
                    Choisir un modèle
                  </h1>
                  <p className="text-sm text-text-secondary">
                    Sélectionnez un modèle pour démarrer votre projet rapidement
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Template Gallery */}
        <div className="p-4">
          <TemplateGallery
            isOpen={!showCustomizer}
            onClose={handleBack}
            onTemplateSelect={handleTemplateSelect}
            onStartFromScratch={handleStartFromScratch}
            selectedTemplateId={selectedTemplate?.id}
            title="Galerie de modèles"
            showStartFromScratch={true}
          />
        </div>

        {/* Template Customizer Modal */}
        <TemplateCustomizer
          template={selectedTemplate}
          isOpen={showCustomizer}
          onClose={handleCustomizerClose}
          onSubmit={handleTemplateSubmit}
          isSubmitting={createProjectMutation.isPending}
        />

        {/* Information Panel */}
        {!showCustomizer && (
          <div className="max-w-6xl mx-auto px-4 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Benefits */}
              <div className="neural-card p-6">
                <div className="w-12 h-12 bg-neural-blue/20 rounded-lg flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-neural-blue" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  Démarrage rapide
                </h3>
                <p className="text-sm text-text-secondary">
                  Les modèles préconfigurés vous permettent de commencer immédiatement
                  avec une structure éprouvée et optimisée.
                </p>
              </div>

              {/* Localization */}
              <div className="neural-card p-6">
                <div className="w-12 h-12 bg-neural-purple/20 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-xl">🍁</span>
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  Style québécois
                </h3>
                <p className="text-sm text-text-secondary">
                  Chaque modèle peut être adapté avec différents niveaux de
                  localisation québécoise, du style Boulet authentique au français international.
                </p>
              </div>

              {/* Customization */}
              <div className="neural-card p-6">
                <div className="w-12 h-12 bg-neural-green/20 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-xl">⚙️</span>
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  Personnalisation
                </h3>
                <p className="text-sm text-text-secondary">
                  Personnalisez le thème, le ton et le public cible pour créer
                  du contenu parfaitement adapté à vos besoins.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default TemplateSelectionPage;
