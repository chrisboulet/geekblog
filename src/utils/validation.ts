/**
 * Validation utilities for input sanitization and limits
 * Phase 3 M3 - Local Security hardening
 * Phase 5 M5 - Polish Final: Centralized validation patterns
 */

import DOMPurify from 'dompurify';
import { MESSAGES, formatMessage } from './messages';

export const VALIDATION_LIMITS = {
  TITLE_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
  THEME_MAX_LENGTH: 200,
} as const;

export const VALIDATION_ENUMS = {
  LOCALIZATION_LEVELS: ['bas', 'moyen', 'élevé'] as const,
  AUDIENCES: ['québécois', 'francophone', 'international'] as const,
  TASK_STATUSES: ['pending', 'in_progress', 'completed', 'archived'] as const,
  PLANNING_STATUSES: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'FAILED'] as const,
} as const;

/**
 * Validates required string input
 * @param value - The string to validate
 * @param fieldName - Name of the field for error message
 * @returns Error message or null if valid
 */
export const validateRequired = (value: string, fieldName: string = 'champ'): string | null => {
  if (!value?.trim()) {
    return `Le ${fieldName} est requis`;
  }
  return null;
};

/**
 * Validates string length
 * @param value - The string to validate
 * @param maxLength - Maximum allowed length
 * @param fieldName - Name of the field for error message
 * @returns Error message or null if valid
 */
export const validateLength = (value: string, maxLength: number, fieldName: string = 'champ'): string | null => {
  if (value.length > maxLength) {
    return formatMessage(MESSAGES.VALIDATION.TITLE_TOO_LONG, { max: maxLength });
  }
  return null;
};

/**
 * Validates task/project title input
 * @param title - The title string to validate
 * @returns Error message or null if valid
 */
export const validateTitle = (title: string): string | null => {
  const requiredError = validateRequired(title, 'titre');
  if (requiredError) return requiredError;

  return validateLength(title, VALIDATION_LIMITS.TITLE_MAX_LENGTH, 'titre');
};

/**
 * Validates description input
 * @param description - The description string to validate
 * @returns Error message or null if valid
 */
export const validateDescription = (description: string): string | null => {
  return validateLength(description, VALIDATION_LIMITS.DESCRIPTION_MAX_LENGTH, 'description');
};

/**
 * Validates theme input
 * @param theme - The theme string to validate
 * @returns Error message or null if valid
 */
export const validateTheme = (theme: string): string | null => {
  const requiredError = validateRequired(theme, 'thème');
  if (requiredError) return requiredError;

  return validateLength(theme, VALIDATION_LIMITS.THEME_MAX_LENGTH, 'thème');
};

/**
 * Validates enum value
 * @param value - The value to validate
 * @param allowedValues - Array of allowed values
 * @param fieldName - Name of the field for error message
 * @returns Error message or null if valid
 */
export const validateEnum = <T extends string>(
  value: T,
  allowedValues: readonly T[],
  fieldName: string
): string | null => {
  if (!allowedValues.includes(value)) {
    return `${fieldName} invalide`;
  }
  return null;
};

/**
 * Validates localization level
 */
export const validateLocalizationLevel = (level: string): string | null => {
  return validateEnum(level, VALIDATION_ENUMS.LOCALIZATION_LEVELS, 'Niveau de localisation');
};

/**
 * Validates audience
 */
export const validateAudience = (audience: string): string | null => {
  return validateEnum(audience, VALIDATION_ENUMS.AUDIENCES, 'Audience');
};

/**
 * Validates task status
 */
export const validateTaskStatus = (status: string): string | null => {
  return validateEnum(status, VALIDATION_ENUMS.TASK_STATUSES, 'Statut de tâche');
};

/**
 * Validates planning status
 */
export const validatePlanningStatus = (status: string): string | null => {
  return validateEnum(status, VALIDATION_ENUMS.PLANNING_STATUSES, 'Statut de planification');
};

/**
 * Sanitizes user input to prevent XSS using DOMPurify
 * @param input - Raw user input
 * @returns Sanitized string
 */
export const sanitizeInput = (input: string): string => {
  // DOMPurify for comprehensive XSS protection
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // Text only, no HTML tags
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  });
};

/**
 * Validates and sanitizes input in one step
 * @param input - User input
 * @param maxLength - Maximum allowed length
 * @returns Object with isValid flag, error message, and sanitized value
 */
export const validateAndSanitize = (
  input: string,
  maxLength: number
): {
  isValid: boolean;
  error: string | null;
  sanitizedValue: string;
} => {
  const trimmed = input.trim();

  if (trimmed.length > maxLength) {
    return {
      isValid: false,
      error: `Le texte doit faire moins de ${maxLength} caractères`,
      sanitizedValue: sanitizeInput(trimmed),
    };
  }

  return {
    isValid: true,
    error: null,
    sanitizedValue: sanitizeInput(trimmed),
  };
};

/**
 * Validation result type
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Template customization validation
 * Centralizes logic from TemplateService.validateCustomization
 */
export const validateTemplateCustomization = (customization: {
  title: string;
  theme: string;
  localization_level: string;
  audience: string;
}): ValidationResult => {
  const errors: string[] = [];

  // Validate title
  const titleError = validateTitle(customization.title);
  if (titleError) errors.push(titleError);

  // Validate theme
  const themeError = validateTheme(customization.theme);
  if (themeError) errors.push(themeError);

  // Validate localization level
  const localizationError = validateLocalizationLevel(customization.localization_level);
  if (localizationError) errors.push(localizationError);

  // Validate audience
  const audienceError = validateAudience(customization.audience);
  if (audienceError) errors.push(audienceError);

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Comprehensive form validation
 * Validates multiple fields and returns combined result
 */
export const validateForm = (
  fields: Array<{ value: string; validator: (value: string) => string | null }>
): ValidationResult => {
  const errors: string[] = [];

  fields.forEach(({ value, validator }) => {
    const error = validator(value);
    if (error) errors.push(error);
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Utility to check if a status is valid
 * @param status - Status to check
 * @param type - Type of status ('task' | 'planning')
 * @returns boolean
 */
export const isValidStatus = (status: string, type: 'task' | 'planning'): boolean => {
  if (type === 'task') {
    return VALIDATION_ENUMS.TASK_STATUSES.includes(status as any);
  }
  return VALIDATION_ENUMS.PLANNING_STATUSES.includes(status as any);
};
