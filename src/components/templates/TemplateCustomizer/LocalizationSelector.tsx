/**
 * LocalizationSelector Component
 * Quebec localization level selector with cultural context and examples
 * Provides three levels of Quebec French localization with detailed explanations
 */

import React, { useState } from 'react';
import { ChevronDown, MapPin, Users, Globe, Info } from 'lucide-react';
import { LOCALIZATION_LEVELS, LocalizationLevel } from '../../../types/templates';

interface LocalizationSelectorProps {
  /** Current selected localization level */
  value: 'bas' | 'moyen' | 'élevé';
  /** Callback when localization level changes */
  onChange: (level: 'bas' | 'moyen' | 'élevé') => void;
  /** Whether the selector is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

const LEVEL_ICONS = {
  'bas': Globe,
  'moyen': Users,
  'élevé': MapPin,
} as const;

const LEVEL_COLORS = {
  'bas': 'text-blue-400',
  'moyen': 'text-purple-400',
  'élevé': 'text-green-400',
} as const;

export default function LocalizationSelector({
  value,
  onChange,
  disabled = false,
  className = '',
}: LocalizationSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const selectedLevel = LOCALIZATION_LEVELS.find(level => level.value === value);
  const Icon = selectedLevel ? LEVEL_ICONS[selectedLevel.value] : Globe;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Level Cards */}
      <div className="grid gap-3">
        {LOCALIZATION_LEVELS.map((level) => {
          const LevelIcon = LEVEL_ICONS[level.value];
          const isSelected = level.value === value;

          return (
            <label
              key={level.value}
              className={`
                relative flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-all
                ${isSelected
                  ? 'border-neural-blue bg-neural-blue/10 ring-2 ring-neural-blue/20'
                  : 'border-neural-blue/20 hover:border-neural-blue/40 hover:bg-bg-secondary/50'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <input
                type="radio"
                name="localization_level"
                value={level.value}
                checked={isSelected}
                onChange={(e) => onChange(e.target.value as 'bas' | 'moyen' | 'élevé')}
                disabled={disabled}
                className="sr-only"
              />

              {/* Icon */}
              <div className={`
                w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                ${isSelected ? 'bg-neural-blue/20' : 'bg-bg-secondary'}
              `}>
                <LevelIcon className={`h-5 w-5 ${isSelected ? 'text-neural-blue' : 'text-text-secondary'}`} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className={`font-medium ${isSelected ? 'text-neural-blue' : 'text-text-primary'}`}>
                    {level.label}
                  </h4>
                  <span className="text-sm text-text-secondary">
                    ({level.value})
                  </span>
                </div>

                <p className="text-sm text-text-secondary mb-2">
                  {level.description}
                </p>

                <p className="text-xs text-text-tertiary mb-3">
                  {level.context}
                </p>

                {/* Example */}
                <div className="bg-bg-primary rounded p-3 border border-neural-blue/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Info className="h-3 w-3 text-neural-blue" />
                    <span className="text-xs font-medium text-neural-blue">Exemple</span>
                  </div>
                  <p className="text-sm text-text-secondary italic">
                    "{level.sample_expression}"
                  </p>
                </div>
              </div>

              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute top-3 right-3 w-4 h-4 bg-neural-blue rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}
            </label>
          );
        })}
      </div>

      {/* Additional Info */}
      <div className="bg-neural-purple/10 border border-neural-purple/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-neural-purple flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-neural-purple mb-2">
              Pourquoi la localisation québécoise ?
            </h4>
            <div className="text-sm text-text-secondary space-y-2">
              <p>
                La localisation adaptée permet de créer du contenu qui résonne vraiment
                avec votre audience québécoise, en utilisant les bonnes expressions
                et références culturelles.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                <div className="text-center p-2 bg-blue-500/10 rounded">
                  <Globe className="h-4 w-4 text-blue-400 mx-auto mb-1" />
                  <div className="text-xs font-medium text-blue-400">International</div>
                  <div className="text-xs text-text-tertiary">Français standard</div>
                </div>
                <div className="text-center p-2 bg-purple-500/10 rounded">
                  <Users className="h-4 w-4 text-purple-400 mx-auto mb-1" />
                  <div className="text-xs font-medium text-purple-400">Québécois Standard</div>
                  <div className="text-xs text-text-tertiary">Naturel et accessible</div>
                </div>
                <div className="text-center p-2 bg-green-500/10 rounded">
                  <MapPin className="h-4 w-4 text-green-400 mx-auto mb-1" />
                  <div className="text-xs font-medium text-green-400">Authentique</div>
                  <div className="text-xs text-text-tertiary">Style Boulet</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Level Summary */}
      {selectedLevel && (
        <div className="text-sm text-text-secondary bg-bg-secondary rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Icon className={`h-4 w-4 ${LEVEL_COLORS[selectedLevel.value]}`} />
            <span className="font-medium">Niveau sélectionné: {selectedLevel.label}</span>
          </div>
          <p>{selectedLevel.context}</p>
        </div>
      )}
    </div>
  );
}
