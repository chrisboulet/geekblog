/**
 * TemplateFilters Component
 * Search and filter controls for template selection with debouncing
 * Supports text search, category, difficulty, tone, and active filters
 * Enhanced with Radix Select components for accessibility
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, X, ChevronDown, Check } from 'lucide-react';
import * as Select from '@radix-ui/react-select';
import { useTemplateCategories } from '../../hooks/useTemplates';
import { TEMPLATE_CATEGORIES } from '../../types/templates';
import TemplateSearch from './TemplateSearch';

export interface TemplateFilters {
  search?: string;
  category?: string;
  difficulty?: string;
  tone?: string;
  active_only?: boolean;
}

interface TemplateFiltersProps {
  /** Current filter values */
  filters: TemplateFilters;
  /** Callback when filters change */
  onFiltersChange: (filters: TemplateFilters) => void;
  /** Debounce delay for search input in milliseconds */
  debounceMs?: number;
  /** Whether to show advanced filters */
  showAdvanced?: boolean;
  /** Loading state */
  isLoading?: boolean;
}

const DIFFICULTY_OPTIONS = [
  { value: '', label: 'All Difficulties' },
  { value: 'Facile', label: 'Facile' },
  { value: 'Moyen', label: 'Moyen' },
  { value: 'Avancé', label: 'Avancé' }
];

/**
 * Reusable Radix Select component with Neural Flow styling
 */
interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onValueChange,
  options,
  placeholder = 'Select...',
  disabled = false,
  className = '',
}) => {
  return (
    <Select.Root value={value} onValueChange={onValueChange} disabled={disabled}>
      <Select.Trigger
        className={`
          flex items-center justify-between gap-2 px-3 py-1.5
          bg-bg-secondary border border-neural-blue/30 rounded-lg
          text-sm text-text-primary
          hover:border-neural-blue/50 transition-colors
          focus:outline-none focus:ring-2 focus:ring-neural-blue/50
          disabled:opacity-50 disabled:cursor-not-allowed
          neural-focusable
          ${className}
        `}
        aria-label={placeholder}
      >
        <Select.Value placeholder={placeholder} />
        <Select.Icon>
          <ChevronDown className="h-3 w-3 text-text-secondary" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          className="
            bg-bg-primary border border-neural-blue/30 rounded-lg shadow-lg
            overflow-hidden z-50 max-h-60
            data-[state=open]:animate-in data-[state=closed]:animate-out
            data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
            data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
            data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2
          "
          position="popper"
          sideOffset={4}
        >
          <Select.ScrollUpButton className="flex items-center justify-center h-6 text-text-secondary">
            <ChevronDown className="h-3 w-3 rotate-180" />
          </Select.ScrollUpButton>

          <Select.Viewport className="p-1">
            {options.map((option) => (
              <Select.Item
                key={option.value}
                value={option.value}
                className="
                  relative flex items-center gap-2 px-3 py-2 rounded text-sm
                  text-text-primary cursor-pointer select-none
                  hover:bg-neural-blue/10 hover:text-neural-blue
                  focus:bg-neural-blue/10 focus:text-neural-blue
                  data-[state=checked]:bg-neural-blue/20 data-[state=checked]:text-neural-blue
                  outline-none
                "
              >
                <Select.ItemIndicator className="absolute left-2">
                  <Check className="h-3 w-3" />
                </Select.ItemIndicator>
                <Select.ItemText className="ml-5">{option.label}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>

          <Select.ScrollDownButton className="flex items-center justify-center h-6 text-text-secondary">
            <ChevronDown className="h-3 w-3" />
          </Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
};

const TemplateFilters: React.FC<TemplateFiltersProps> = ({
  filters,
  onFiltersChange,
  debounceMs = 300,
  showAdvanced = true,
  isLoading = false
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Fetch available categories from API
  const { data: apiCategories } = useTemplateCategories();

  // Combine static and API categories, remove duplicates
  const categoryOptions = React.useMemo(() => {
    const staticCategories = TEMPLATE_CATEGORIES.map(cat => cat.value);
    const allCategories = [...staticCategories];

    if (apiCategories) {
      apiCategories.forEach(cat => {
        if (!allCategories.includes(cat)) {
          allCategories.push(cat);
        }
      });
    }

    return [
      { value: '', label: 'All Categories' },
      ...allCategories.map(cat => ({ value: cat, label: cat }))
    ];
  }, [apiCategories]);

  // Handle filter changes
  const handleFilterChange = useCallback((key: keyof TemplateFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined
    });
  }, [filters, onFiltersChange]);

  // Handle search change
  const handleSearchChange = useCallback((searchTerm: string) => {
    handleFilterChange('search', searchTerm);
  }, [handleFilterChange]);

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    onFiltersChange({ active_only: true });
  }, [onFiltersChange]);

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(value =>
    value !== undefined && value !== '' && value !== false
  );

  // Count active filters
  const activeFilterCount = Object.values(filters).filter(value =>
    value !== undefined && value !== '' && value !== false
  ).length;

  // Generate search suggestions based on categories and common terms
  const searchSuggestions = React.useMemo(() => {
    const suggestions = [
      ...categoryOptions.slice(1).map(cat => cat.label), // Skip "All Categories"
      'Guide pratique',
      'Tutorial',
      'Sécurité',
      'Performance',
      'Boulet style',
      'Québécois',
    ];
    return [...new Set(suggestions)]; // Remove duplicates
  }, [categoryOptions]);

  return (
    <div className="space-y-4">
      {/* Enhanced Search Bar */}
      <TemplateSearch
        value={filters.search || ''}
        onSearch={handleSearchChange}
        isLoading={isLoading}
        placeholder="Rechercher des modèles..."
        debounceMs={debounceMs}
        suggestions={searchSuggestions}
        disabled={isLoading}
      />

      {/* Quick Filters Row */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Category Filter with Radix Select */}
        <CustomSelect
          value={filters.category || ''}
          onValueChange={(value) => handleFilterChange('category', value)}
          options={categoryOptions}
          placeholder="Catégorie"
          disabled={isLoading}
          className="min-w-32"
        />

        {/* Difficulty Filter with Radix Select */}
        <CustomSelect
          value={filters.difficulty || ''}
          onValueChange={(value) => handleFilterChange('difficulty', value)}
          options={DIFFICULTY_OPTIONS}
          placeholder="Difficulté"
          disabled={isLoading}
          className="min-w-32"
        />

        {/* Active Only Toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.active_only || false}
            onChange={(e) => handleFilterChange('active_only', e.target.checked || undefined)}
            disabled={isLoading}
            className="rounded border-neural-blue/30 text-neural-blue focus:ring-neural-blue focus:ring-offset-0 neural-focusable disabled:opacity-50"
          />
          <span className="text-sm text-text-secondary">Actifs seulement</span>
        </label>

        {/* Advanced Filters Toggle */}
        {showAdvanced && (
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-text-secondary border border-neural-blue/30 rounded-lg hover:bg-bg-glass hover:border-neural-blue/50 transition-colors neural-focusable"
            disabled={isLoading}
          >
            <Filter className="h-3 w-3" />
            <span>Avancé</span>
            {activeFilterCount > 0 && (
              <span className="bg-neural-blue text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-1">
                {activeFilterCount}
              </span>
            )}
          </button>
        )}

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-text-tertiary hover:text-text-primary transition-colors neural-focusable"
            disabled={isLoading}
            title="Effacer tous les filtres"
          >
            <X className="h-3 w-3" />
            <span>Effacer</span>
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && showAdvancedFilters && (
        <div className="bg-bg-secondary rounded-lg p-4 border border-neural-blue/20 space-y-3">
          <h4 className="text-sm font-medium text-text-primary mb-3">Filtres Avancés</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tone Filter */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Ton
              </label>
              <input
                type="text"
                placeholder="ex: humoristique, technique..."
                value={filters.tone || ''}
                onChange={(e) => handleFilterChange('tone', e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-1.5 bg-bg-primary border border-neural-blue/30 rounded text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-neural-blue neural-focusable disabled:opacity-50"
              />
            </div>
          </div>
        </div>
      )}

      {/* Filter Summary */}
      {hasActiveFilters && (
        <div className="text-xs text-text-tertiary">
          {activeFilterCount} filtre{activeFilterCount !== 1 ? 's' : ''} appliqué{activeFilterCount !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

export default TemplateFilters;
