/**
 * CustomizationForm Component
 * Form for template customization with Zod validation and Quebec localization
 * Includes real-time validation feedback and accessibility features
 */

import React from 'react';
import { AlertTriangle, Info, Lightbulb } from 'lucide-react';
import { Template, TemplateCustomization, LOCALIZATION_LEVELS } from '../../../types/templates';
import LocalizationSelector from './LocalizationSelector';

interface CustomizationFormProps {
  /** Template being customized */
  template: Template;
  /** Current customization values */
  customization: TemplateCustomization;
  /** Callback when customization changes */
  onChange: (updates: Partial<TemplateCustomization>) => void;
  /** Validation errors to display */
  validationErrors: string[];
  /** Whether form is being submitted */
  isSubmitting?: boolean;
}

const AUDIENCE_OPTIONS = [
  {
    value: 'québécois' as const,
    label: 'Québécois',
    description: 'Audience principale du Québec',
    context: 'Références culturelles locales, expressions typiquement québécoises'
  },
  {
    value: 'francophone' as const,
    label: 'Francophone',
    description: 'Francophones en général',
    context: 'Français standard avec quelques québécismes expliqués'
  },
  {
    value: 'international' as const,
    label: 'International',
    description: 'Audience internationale',
    context: 'Français standard, éviter les régionalismes'
  },
];

export default function CustomizationForm({
  template,
  customization,
  onChange,
  validationErrors,
  isSubmitting = false,
}: CustomizationFormProps) {
  const handleInputChange = (field: keyof TemplateCustomization, value: string) => {
    onChange({ [field]: value });
  };

  const getFieldError = (field: string) => {
    return validationErrors.find(error => error.toLowerCase().includes(field.toLowerCase()));
  };

  return (
    <div className="space-y-6">
      {/* Form Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          Personnalisation du modèle
        </h3>
        <p className="text-sm text-text-secondary">
          Adaptez ce modèle à votre projet spécifique. Tous les champs marqués d'un astérisque (*) sont obligatoires.
        </p>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-400 mb-2">Erreurs de validation</h4>
              <ul className="text-sm text-red-300 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Title Field */}
      <div className="space-y-2">
        <label
          htmlFor="title"
          className="block text-sm font-medium text-text-primary"
        >
          Titre du projet *
        </label>
        <input
          id="title"
          type="text"
          value={customization.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          placeholder="ex: Guide complet pour configurer Docker"
          disabled={isSubmitting}
          className={`
            w-full px-3 py-2 bg-bg-secondary border rounded-lg text-text-primary placeholder-text-tertiary
            transition-colors focus:outline-none focus:ring-2 neural-focusable
            ${getFieldError('titre')
              ? 'border-red-500/50 focus:ring-red-500/50'
              : 'border-neural-blue/30 focus:ring-neural-blue/50 hover:border-neural-blue/50'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
          aria-describedby={getFieldError('titre') ? 'title-error' : 'title-help'}
        />
        {getFieldError('titre') ? (
          <p id="title-error" className="text-sm text-red-400 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            {getFieldError('titre')}
          </p>
        ) : (
          <p id="title-help" className="text-sm text-text-tertiary">
            Un titre descriptif et engageant pour votre projet
          </p>
        )}
      </div>

      {/* Theme Field */}
      <div className="space-y-2">
        <label
          htmlFor="theme"
          className="block text-sm font-medium text-text-primary"
        >
          Thème ou sujet principal *
        </label>
        <input
          id="theme"
          type="text"
          value={customization.theme}
          onChange={(e) => handleInputChange('theme', e.target.value)}
          placeholder="ex: Configuration, Sécurité, Performance..."
          disabled={isSubmitting}
          className={`
            w-full px-3 py-2 bg-bg-secondary border rounded-lg text-text-primary placeholder-text-tertiary
            transition-colors focus:outline-none focus:ring-2 neural-focusable
            ${getFieldError('thème')
              ? 'border-red-500/50 focus:ring-red-500/50'
              : 'border-neural-blue/30 focus:ring-neural-blue/50 hover:border-neural-blue/50'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
          aria-describedby={getFieldError('thème') ? 'theme-error' : 'theme-help'}
        />
        {getFieldError('thème') ? (
          <p id="theme-error" className="text-sm text-red-400 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            {getFieldError('thème')}
          </p>
        ) : (
          <p id="theme-help" className="text-sm text-text-tertiary">
            Le sujet principal que vous voulez couvrir
          </p>
        )}
      </div>

      {/* Localization Level */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-text-primary">
          Niveau de localisation québécoise *
        </label>
        <LocalizationSelector
          value={customization.localization_level}
          onChange={(level) => handleInputChange('localization_level', level)}
          disabled={isSubmitting}
        />

        {/* Localization Info */}
        <div className="bg-neural-blue/10 border border-neural-blue/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-neural-blue flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-neural-blue mb-2">À propos de la localisation</h4>
              <p className="text-sm text-text-secondary">
                Le niveau de localisation détermine l'intensité des références culturelles québécoises
                et du style d'écriture dans le contenu généré.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Target Audience */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-text-primary">
          Public cible *
        </label>
        <div className="space-y-2">
          {AUDIENCE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex items-start gap-3 p-3 border border-neural-blue/20 rounded-lg hover:bg-bg-secondary/50 transition-colors cursor-pointer"
            >
              <input
                type="radio"
                name="audience"
                value={option.value}
                checked={customization.audience === option.value}
                onChange={(e) => handleInputChange('audience', e.target.value)}
                disabled={isSubmitting}
                className="mt-1 text-neural-blue focus:ring-neural-blue focus:ring-offset-0"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-text-primary">{option.label}</span>
                  <span className="text-sm text-text-secondary">— {option.description}</span>
                </div>
                <p className="text-sm text-text-tertiary mt-1">
                  {option.context}
                </p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Additional Instructions */}
      <div className="space-y-2">
        <label
          htmlFor="additional_instructions"
          className="block text-sm font-medium text-text-primary"
        >
          Instructions additionnelles
          <span className="text-text-tertiary font-normal"> (optionnel)</span>
        </label>
        <textarea
          id="additional_instructions"
          value={customization.additional_instructions || ''}
          onChange={(e) => handleInputChange('additional_instructions', e.target.value)}
          placeholder="Ajoutez des instructions spécifiques, des contraintes particulières, ou des éléments à inclure..."
          rows={4}
          disabled={isSubmitting}
          className="w-full px-3 py-2 bg-bg-secondary border border-neural-blue/30 rounded-lg text-text-primary placeholder-text-tertiary transition-colors focus:outline-none focus:ring-2 focus:ring-neural-blue/50 hover:border-neural-blue/50 neural-focusable disabled:opacity-50 disabled:cursor-not-allowed resize-vertical"
          aria-describedby="instructions-help"
        />
        <p id="instructions-help" className="text-sm text-text-tertiary">
          Ces instructions aideront à personnaliser davantage le contenu généré
        </p>
      </div>

      {/* Template Info */}
      <div className="bg-bg-secondary rounded-lg p-4 border border-neural-blue/10">
        <div className="flex items-start gap-3">
          <Lightbulb className="h-5 w-5 text-neural-purple flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-text-primary mb-2">Modèle sélectionné</h4>
            <div className="text-sm text-text-secondary space-y-1">
              <p><strong>Nom:</strong> {template.name}</p>
              <p><strong>Catégorie:</strong> {template.category}</p>
              <p><strong>Difficulté:</strong> {template.difficulty}</p>
              <p><strong>Durée estimée:</strong> {template.estimated_duration}</p>
              <p><strong>Public cible:</strong> {template.target_audience}</p>
              <p><strong>Ton:</strong> {template.tone}</p>
            </div>
            <p className="text-sm text-text-tertiary mt-2">
              {template.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
