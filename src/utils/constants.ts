/**
 * Application constants and magic numbers centralization
 * Phase 5 M5 - Polish Final: Elimination of magic numbers
 */

// UI Constants
export const UI_CONSTANTS = {
  // Z-index layers
  Z_INDEX: {
    MODAL_OVERLAY: 50,
    MODAL_CONTENT: 50,
    DROPDOWN: 10,
    NAVBAR: 40,
    TOAST: 60,
  },

  // Opacity values
  OPACITY: {
    DISABLED: 0.5,
    MUTED: 0.6,
    OVERLAY: 0.6,
    INACTIVE: 0.25,
  },

  // Animation durations (in ms)
  ANIMATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
  },

  // Common spacing values (Tailwind-compatible)
  SPACING: {
    XS: 2,
    SM: 4,
    MD: 6,
    LG: 8,
    XL: 12,
  },

  // Border radius values
  BORDER_RADIUS: {
    SM: 4,
    MD: 6,
    LG: 8,
    XL: 12,
  },
} as const;

// Network and API Constants
export const API_CONSTANTS = {
  // Default timeouts (in ms)
  TIMEOUT: {
    DEFAULT: 5000,
    UPLOAD: 30000,
    POLLING: 2000,
  },

  // Retry settings
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY_MS: 1000,
  },

  // HTTP status codes
  STATUS_CODES: {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_ERROR: 500,
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
  },
} as const;

// Business Logic Constants
export const BUSINESS_CONSTANTS = {
  // Progress values
  PROGRESS: {
    MIN: 0,
    MAX: 100,
    COMPLETE: 100,
  },

  // Content limits (matches validation)
  CONTENT_LIMITS: {
    TITLE_MAX: 100,
    DESCRIPTION_MAX: 500,
    THEME_MAX: 200,
    POST_CONTENT_MIN: 100,
    POST_CONTENT_MAX: 10000,
  },

  // File size limits (in bytes)
  FILE_LIMITS: {
    AVATAR_MAX_SIZE: 2 * 1024 * 1024, // 2MB
    DOCUMENT_MAX_SIZE: 10 * 1024 * 1024, // 10MB
    IMAGE_MAX_SIZE: 5 * 1024 * 1024, // 5MB
  },

  // Cache durations (in ms)
  CACHE_DURATION: {
    SHORT: 5 * 60 * 1000, // 5 minutes
    MEDIUM: 30 * 60 * 1000, // 30 minutes
    LONG: 24 * 60 * 60 * 1000, // 24 hours
  },

  // Template specific
  TEMPLATE: {
    MIN_TASKS: 3,
    MAX_TASKS: 50,
    DEFAULT_TASKS: 10,
    MIN_DURATION_HOURS: 1,
    MAX_DURATION_HOURS: 100,
  },
} as const;

// Environment specific constants
export const ENV_CONSTANTS = {
  // Development
  DEV: {
    HOT_RELOAD_PORT: 5173,
    API_PORT: 8000,
    DB_PORT: 5432,
  },

  // Production
  PROD: {
    SECURE_HEADERS_MAX_AGE: 63072000, // 2 years in seconds
    SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  },

  // Docker ports
  DOCKER: {
    FRONTEND: 5173,
    BACKEND: 8000,
    DATABASE: 5432,
    REDIS: 6379,
    GRAFANA: 3000,
    PROMETHEUS: 9090,
    NODE_EXPORTER: 9100,
    LOKI: 3100,
  },
} as const;

// SVG and Graphics Constants
export const GRAPHICS_CONSTANTS = {
  // SVG circle radius
  CIRCLE_RADIUS: {
    SMALL: 10,
    MEDIUM: 15,
    LARGE: 20,
  },

  // Stroke widths
  STROKE_WIDTH: {
    THIN: 1,
    NORMAL: 2,
    THICK: 4,
  },

  // Icon sizes (common Tailwind sizes)
  ICON_SIZE: {
    XS: 12,
    SM: 16,
    MD: 20,
    LG: 24,
    XL: 32,
  },
} as const;

// Toast and Notification Constants
export const NOTIFICATION_CONSTANTS = {
  // Toast display durations (in ms)
  TOAST_DURATION: {
    SHORT: 3000,
    NORMAL: 5000,
    LONG: 8000,
    PERSISTENT: 0, // No auto-dismiss
  },

  // Notification types
  TYPES: {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
  },
} as const;

// Keyboard shortcuts and accessibility
export const A11Y_CONSTANTS = {
  // ARIA labels and descriptions
  ARIA: {
    LOADING: 'Chargement en cours',
    CLOSE: 'Fermer',
    EXPAND: 'Développer',
    COLLAPSE: 'Réduire',
    MENU: 'Menu',
  },

  // Keyboard codes
  KEYS: {
    ENTER: 13,
    ESCAPE: 27,
    SPACE: 32,
    TAB: 9,
    ARROW_UP: 38,
    ARROW_DOWN: 40,
  },
} as const;

// Export grouped constants for easier importing
export const CONSTANTS = {
  UI: UI_CONSTANTS,
  API: API_CONSTANTS,
  BUSINESS: BUSINESS_CONSTANTS,
  ENV: ENV_CONSTANTS,
  GRAPHICS: GRAPHICS_CONSTANTS,
  NOTIFICATION: NOTIFICATION_CONSTANTS,
  A11Y: A11Y_CONSTANTS,
} as const;

// Type helpers for type-safe constant access
export type UIConstant = typeof UI_CONSTANTS;
export type APIConstant = typeof API_CONSTANTS;
export type BusinessConstant = typeof BUSINESS_CONSTANTS;
export type EnvConstant = typeof ENV_CONSTANTS;
export type GraphicsConstant = typeof GRAPHICS_CONSTANTS;
export type NotificationConstant = typeof NOTIFICATION_CONSTANTS;
export type A11yConstant = typeof A11Y_CONSTANTS;
