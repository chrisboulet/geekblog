/**
 * TaskPreview Component
 * Real-time preview of generated tasks from template customization
 * Shows how the customized template will look as actual tasks
 */

import React from 'react';
import { Eye, CheckCircle, Clock, AlertTriangle, RefreshCw, Lightbulb } from 'lucide-react';
import { TemplateCustomization } from '../../../types/templates';

interface PreviewTask {
  title: string;
  description: string;
}

interface TaskPreviewProps {
  /** Generated preview tasks */
  tasks: PreviewTask[];
  /** Whether preview is loading */
  isLoading: boolean;
  /** Preview generation error */
  error?: Error | null;
  /** Current customization for context */
  customization: TemplateCustomization;
}

export default function TaskPreview({
  tasks,
  isLoading,
  error,
  customization,
}: TaskPreviewProps) {
  return (
    <div className="space-y-6">
      {/* Preview Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-neural-purple/20 rounded-lg flex items-center justify-center">
          <Eye className="h-5 w-5 text-neural-purple" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-text-primary">
            Aperçu du projet
          </h3>
          <p className="text-sm text-text-secondary">
            Voici comment vos tâches apparaîtront dans le projet final
          </p>
        </div>
      </div>

      {/* Customization Summary */}
      <div className="bg-bg-secondary rounded-lg p-4 border border-neural-blue/10">
        <h4 className="font-medium text-text-primary mb-3 flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-neural-blue" />
          Configuration actuelle
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-text-secondary">Titre:</span>
            <span className="ml-2 text-text-primary font-medium">
              {customization.title || 'Non défini'}
            </span>
          </div>
          <div>
            <span className="text-text-secondary">Thème:</span>
            <span className="ml-2 text-text-primary font-medium">
              {customization.theme || 'Non défini'}
            </span>
          </div>
          <div>
            <span className="text-text-secondary">Localisation:</span>
            <span className="ml-2 text-text-primary font-medium">
              {customization.localization_level}
            </span>
          </div>
          <div>
            <span className="text-text-secondary">Public:</span>
            <span className="ml-2 text-text-primary font-medium">
              {customization.audience}
            </span>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-3 text-neural-blue">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span className="text-sm font-medium">Génération de l'aperçu...</span>
          </div>
          <p className="text-sm text-text-secondary mt-2">
            Création des tâches personnalisées en cours
          </p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-400 mb-2">
                Erreur lors de la génération de l'aperçu
              </h4>
              <p className="text-sm text-red-300 mb-3">
                {error.message || 'Une erreur inattendue est survenue'}
              </p>
              <p className="text-xs text-red-200">
                Vous pouvez toujours créer le projet. L'aperçu sera disponible après la création.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && tasks.length === 0 && !customization.title.trim() && (
        <div className="text-center py-8">
          <div className="text-4xl mb-4 opacity-50">📝</div>
          <h4 className="text-lg font-medium text-text-primary mb-2">
            Aperçu non disponible
          </h4>
          <p className="text-sm text-text-secondary mb-4">
            Complétez au minimum le titre du projet pour voir l'aperçu des tâches
          </p>
          <div className="text-xs text-text-tertiary bg-bg-secondary rounded p-3 max-w-md mx-auto">
            💡 L'aperçu vous montrera comment les tâches seront structurées selon votre personnalisation
          </div>
        </div>
      )}

      {/* Tasks Preview */}
      {!isLoading && !error && tasks.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-text-primary">
              Tâches générées ({tasks.length})
            </h4>
            <div className="text-sm text-text-secondary flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-400" />
              Prêt à créer
            </div>
          </div>

          <div className="space-y-3">
            {tasks.map((task, index) => (
              <div
                key={index}
                className="bg-bg-secondary rounded-lg p-4 border border-neural-blue/10 hover:border-neural-blue/20 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-neural-blue/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-neural-blue">
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-medium text-text-primary mb-2">
                      {task.title}
                    </h5>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {task.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-text-tertiary">
                    <Clock className="h-3 w-3" />
                    <span className="text-xs">À faire</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Preview Note */}
          <div className="bg-neural-blue/5 border border-neural-blue/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Eye className="h-5 w-5 text-neural-blue flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-neural-blue mb-2">
                  À propos de cet aperçu
                </h4>
                <p className="text-sm text-text-secondary mb-2">
                  Cet aperçu montre les tâches qui seront créées dans votre projet.
                  Le contenu réel peut être légèrement différent selon l'évolution
                  de votre personnalisation.
                </p>
                <ul className="text-xs text-text-tertiary space-y-1">
                  <li>• Les tâches seront créées dans l'ordre affiché</li>
                  <li>• Vous pourrez modifier, réorganiser ou ajouter des tâches après création</li>
                  <li>• Le style d'écriture respectera votre niveau de localisation choisi</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
