/**
 * Validation utilities for input sanitization and limits
 * Part of Phase 3 M3 - Local Security hardening
 */

import DOMPurify from 'dompurify';

export const VALIDATION_LIMITS = {
  TITLE_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
} as const;

/**
 * Validates task/project title input
 * @param title - The title string to validate
 * @returns Error message or null if valid
 */
export const validateTitle = (title: string): string | null => {
  if (!title.trim()) {
    return "Le titre est requis";
  }

  if (title.length > VALIDATION_LIMITS.TITLE_MAX_LENGTH) {
    return `Le titre doit faire moins de ${VALIDATION_LIMITS.TITLE_MAX_LENGTH} caractères`;
  }

  return null;
};

/**
 * Validates description input
 * @param description - The description string to validate
 * @returns Error message or null if valid
 */
export const validateDescription = (description: string): string | null => {
  if (description.length > VALIDATION_LIMITS.DESCRIPTION_MAX_LENGTH) {
    return `La description doit faire moins de ${VALIDATION_LIMITS.DESCRIPTION_MAX_LENGTH} caractères`;
  }

  return null;
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
