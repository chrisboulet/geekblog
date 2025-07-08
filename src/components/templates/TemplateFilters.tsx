/**
 * TemplateFilters Component
 * Search and filter controls for template selection with debouncing
 * Supports text search, category, difficulty, tone, and active filters
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { useTemplateCategories } from '../../hooks/useTemplates';
import { TEMPLATE_CATEGORIES } from '../../types/templates';

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

const TemplateFilters: React.FC<TemplateFiltersProps> = ({
  filters,
  onFiltersChange,
  debounceMs = 300,
  showAdvanced = true,
  isLoading = false
}) => {
  const [searchInput, setSearchInput] = useState(filters.search || '');
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

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchInput !== filters.search) {
        onFiltersChange({
          ...filters,
          search: searchInput.trim() || undefined
        });
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [searchInput, debounceMs, filters, onFiltersChange]);

  // Handle filter changes
  const handleFilterChange = useCallback((key: keyof TemplateFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined
    });
  }, [filters, onFiltersChange]);

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setSearchInput('');
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

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-text-tertiary" />
        </div>
        <input
          type="text"
          placeholder="Search templates..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          disabled={isLoading}
          className="w-full pl-10 pr-4 py-2 bg-bg-secondary border border-neural-purple/30 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-neural-purple neural-focusable disabled:opacity-50"
        />
        {searchInput && (
          <button
            onClick={() => setSearchInput('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-tertiary hover:text-text-primary transition-colors"
            title="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Quick Filters Row */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Category Filter */}
        <div className="relative">
          <select
            value={filters.category || ''}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            disabled={isLoading}
            className="appearance-none bg-bg-secondary border border-neural-purple/30 rounded-lg px-3 py-1.5 pr-8 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-neural-purple neural-focusable disabled:opacity-50"
          >
            {categoryOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-text-tertiary pointer-events-none" />
        </div>

        {/* Difficulty Filter */}
        <div className="relative">
          <select
            value={filters.difficulty || ''}
            onChange={(e) => handleFilterChange('difficulty', e.target.value)}
            disabled={isLoading}
            className="appearance-none bg-bg-secondary border border-neural-purple/30 rounded-lg px-3 py-1.5 pr-8 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-neural-purple neural-focusable disabled:opacity-50"
          >
            {DIFFICULTY_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-text-tertiary pointer-events-none" />
        </div>

        {/* Active Only Toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.active_only || false}
            onChange={(e) => handleFilterChange('active_only', e.target.checked || undefined)}
            disabled={isLoading}
            className="rounded border-neural-purple/30 text-neural-purple focus:ring-neural-purple focus:ring-offset-0 neural-focusable disabled:opacity-50"
          />
          <span className="text-sm text-text-secondary">Active only</span>
        </label>

        {/* Advanced Filters Toggle */}
        {showAdvanced && (
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-text-secondary border border-neural-purple/30 rounded-lg hover:bg-bg-glass transition-colors neural-focusable"
            disabled={isLoading}
          >
            <Filter className="h-3 w-3" />
            <span>Advanced</span>
            {activeFilterCount > 0 && (
              <span className="bg-neural-purple text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-1">
                {activeFilterCount}
              </span>
            )}
          </button>
        )}

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-text-tertiary hover:text-text-primary transition-colors"
            disabled={isLoading}
            title="Clear all filters"
          >
            <X className="h-3 w-3" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && showAdvancedFilters && (
        <div className="bg-bg-secondary rounded-lg p-4 border border-neural-purple/20 space-y-3">
          <h4 className="text-sm font-medium text-text-primary mb-3">Advanced Filters</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tone Filter */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Tone
              </label>
              <input
                type="text"
                placeholder="e.g., humoristique, technique..."
                value={filters.tone || ''}
                onChange={(e) => handleFilterChange('tone', e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-1.5 bg-bg-primary border border-neural-purple/30 rounded text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-neural-purple neural-focusable disabled:opacity-50"
              />
            </div>
          </div>
        </div>
      )}

      {/* Filter Summary */}
      {hasActiveFilters && (
        <div className="text-xs text-text-tertiary">
          {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} applied
        </div>
      )}
    </div>
  );
};

export default TemplateFilters;