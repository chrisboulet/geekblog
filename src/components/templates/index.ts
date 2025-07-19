/**
 * Template Components Barrel Exports
 * Provides clean imports for all template-related components and types
 */

// Main components
export { default as TemplateCard } from './TemplateCard';
export { default as TemplateFilters } from './TemplateFilters';
export { default as TemplateGallery } from './TemplateGallery';
export { default as TemplateSelectionModal } from './TemplateSelectionModal';

// Types and interfaces for external usage
export type { TemplateFilters as TemplateFiltersState } from './TemplateFilters';

// Re-export useful template types from types module
export type {
  Template,
  TemplateCustomization,
  ProjectFromTemplate,
  TemplateCategory,
  TemplateStats,
  LocalizationLevel
} from '../../types/templates';

// Re-export template constants
export {
  TEMPLATE_CATEGORIES,
  LOCALIZATION_LEVELS
} from '../../types/templates';

// Re-export template hooks for convenience
export {
  useTemplates,
  useTemplate,
  useTemplateBySlug,
  useTemplateCategories,
  useTemplateStats,
  useGuidePratiqueTemplate,
  useCreateProjectFromTemplate,
  useTemplatePreview,
  useInvalidateTemplates,
  usePrefetchTemplates,
  templateKeys
} from '../../hooks/useTemplates';
