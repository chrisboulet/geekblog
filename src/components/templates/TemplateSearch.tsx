/**
 * TemplateSearch Component
 * Debounced search input for template gallery with loading states and suggestions
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';

interface TemplateSearchProps {
  /** Current search term */
  value: string;
  /** Callback when search term changes (debounced) */
  onSearch: (searchTerm: string) => void;
  /** Whether search is currently loading */
  isLoading?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Debounce delay in milliseconds */
  debounceMs?: number;
  /** Optional search suggestions */
  suggestions?: string[];
  /** Callback when a suggestion is selected */
  onSuggestionSelect?: (suggestion: string) => void;
  /** Whether the component is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Custom hook for debounced value
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function TemplateSearch({
  value,
  onSearch,
  isLoading = false,
  placeholder = "Rechercher des modèles...",
  debounceMs = 300,
  suggestions = [],
  onSuggestionSelect,
  disabled = false,
  className = "",
}: TemplateSearchProps) {
  const [localValue, setLocalValue] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedSuggestionIndex, setFocusedSuggestionIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Debounce the search term
  const debouncedSearchTerm = useDebounce(localValue, debounceMs);

  // Call onSearch when debounced value changes
  useEffect(() => {
    if (debouncedSearchTerm !== value) {
      onSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, onSearch, value]);

  // Update local value when prop value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Filter suggestions based on current input
  const filteredSuggestions = suggestions.filter(
    suggestion =>
      suggestion.toLowerCase().includes(localValue.toLowerCase()) &&
      suggestion.toLowerCase() !== localValue.toLowerCase()
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    setShowSuggestions(newValue.length > 0 && filteredSuggestions.length > 0);
    setFocusedSuggestionIndex(-1);
  };

  const handleClear = useCallback(() => {
    setLocalValue('');
    setShowSuggestions(false);
    setFocusedSuggestionIndex(-1);
    onSearch('');
    inputRef.current?.focus();
  }, [onSearch]);

  const handleSuggestionClick = (suggestion: string) => {
    setLocalValue(suggestion);
    setShowSuggestions(false);
    setFocusedSuggestionIndex(-1);
    onSearch(suggestion);
    onSuggestionSelect?.(suggestion);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || filteredSuggestions.length === 0) {
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedSuggestionIndex(prev =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        setFocusedSuggestionIndex(prev =>
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        );
        break;

      case 'Enter':
        e.preventDefault();
        if (focusedSuggestionIndex >= 0) {
          const suggestion = filteredSuggestions[focusedSuggestionIndex];
          handleSuggestionClick(suggestion);
        }
        break;

      case 'Escape':
        setShowSuggestions(false);
        setFocusedSuggestionIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleFocus = () => {
    if (localValue.length > 0 && filteredSuggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    // Hide suggestions only if focus is not moving to a suggestion
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setShowSuggestions(false);
      setFocusedSuggestionIndex(-1);
    }
  };

  return (
    <div
      className={`relative ${className}`}
      onBlur={handleBlur}
    >
      {/* Search Input */}
      <div className="relative">
        {/* Search Icon */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {isLoading ? (
            <Loader2 className="h-5 w-5 text-text-secondary animate-spin" />
          ) : (
            <Search className="h-5 w-5 text-text-secondary" />
          )}
        </div>

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={localValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full pl-10 pr-10 py-3
            bg-bg-secondary border border-neural-blue/30 rounded-lg
            text-text-primary placeholder-text-secondary
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-neural-blue/50 focus:border-neural-blue
            hover:border-neural-blue/50
            disabled:opacity-50 disabled:cursor-not-allowed
            neural-input
          `}
          aria-label="Rechercher des modèles"
          aria-expanded={showSuggestions}
          aria-haspopup="listbox"
          role="combobox"
          aria-autocomplete="list"
          aria-describedby={showSuggestions ? "search-suggestions" : undefined}
        />

        {/* Clear Button */}
        {localValue && !disabled && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-text-primary transition-colors"
            aria-label="Effacer la recherche"
            tabIndex={-1}
          >
            <X className="h-5 w-5 text-text-secondary hover:text-text-primary" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          id="search-suggestions"
          className="absolute top-full left-0 right-0 z-50 mt-1 bg-bg-primary border border-neural-blue/30 rounded-lg shadow-lg max-h-48 overflow-y-auto"
          role="listbox"
          aria-label="Suggestions de recherche"
        >
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={suggestion}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`
                w-full px-4 py-2 text-left hover:bg-bg-secondary transition-colors
                ${index === focusedSuggestionIndex ? 'bg-neural-blue/10 text-neural-blue' : 'text-text-primary'}
                ${index === 0 ? 'rounded-t-lg' : ''}
                ${index === filteredSuggestions.length - 1 ? 'rounded-b-lg' : ''}
              `}
              role="option"
              aria-selected={index === focusedSuggestionIndex}
            >
              <span className="flex items-center">
                <Search className="h-4 w-4 mr-2 text-text-secondary" />
                {suggestion}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
