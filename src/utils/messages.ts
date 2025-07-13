/**
 * Centralization of all user messages for GeekBlog
 * Phase 5 M5 - Polish Final: Standardisation Messages
 *
 * This module centralizes all user-facing messages to ensure:
 * - Consistent French language across the application
 * - Standardized message format and tone
 * - Easy translation management if needed
 * - No more console.warn/log - use toast instead
 */

export const MESSAGES = {
  // Success messages - Green toasts
  SUCCESS: {
    TASK_UPDATED: 'Tâche mise à jour avec succès !',
    TASK_DELETED: 'Tâche supprimée avec succès !',
    TASK_CREATED: 'Tâche créée avec succès !',
    PROJECT_CREATED: 'Projet créé avec succès !',
    PROJECT_UPDATED: 'Projet mis à jour avec succès !',
    PROJECT_DELETED: 'Projet supprimé avec succès !',
    PLANNING_COMPLETED: 'Planification IA terminée avec succès !',
    AGENT_COMPLETED: 'Agent terminé avec succès !',
    REFINEMENT_COMPLETED: 'Raffinement IA terminé avec succès !',
    ALL_TASKS_COMPLETED: '🎉 Félicitations ! Toutes vos tâches sont terminées. Vous pouvez maintenant assembler le contenu final.',
  },

  // Error messages - Red toasts
  ERROR: {
    TASK_UPDATE_FAILED: 'Échec de la mise à jour de la tâche. Veuillez réessayer.',
    TASK_DELETE_FAILED: 'Échec de la suppression de la tâche. Veuillez réessayer.',
    TASK_CREATE_FAILED: 'Échec de la création de la tâche. Veuillez réessayer.',
    PROJECT_CREATE_FAILED: 'Échec de la création du projet. Veuillez réessayer.',
    PROJECT_UPDATE_FAILED: 'Échec de la mise à jour du projet. Veuillez réessayer.',
    PROJECT_DELETE_FAILED: 'Échec de la suppression du projet. Veuillez réessayer.',
    PLANNING_FAILED: 'Erreur lors de la planification IA. Veuillez réessayer.',
    AGENT_FAILED: 'Erreur lors de l\'exécution de l\'agent. Veuillez réessayer.',
    REFINEMENT_FAILED: 'Erreur lors du raffinement IA. Veuillez réessayer.',
    TEMPLATE_CREATE_FAILED: 'Échec de la création du projet depuis le modèle. Veuillez réessayer.',
    JOB_POLLING_ERROR: 'Erreur lors du suivi du travail. Veuillez actualiser la page.',
    JOB_CANCEL_FAILED: 'Échec de l\'annulation du travail. Veuillez réessayer.',
    UNKNOWN_TASK_STATUS: 'Statut de tâche inconnu détecté. Veuillez vérifier les données.',
    INVALID_ACTION: 'Action invalide demandée. Veuillez contacter le support.',
  },

  // Warning messages - Yellow toasts
  WARNING: {
    PROJECT_DESCRIPTION_REQUIRED: 'Ajoutez une description au projet avant de lancer la planification IA',
    PROJECT_DESCRIPTION_REQUIRED_RELAUNCH: 'Ajoutez une description au projet avant de relancer la planification IA',
  },

  // Info messages - Blue toasts
  INFO: {
    NEW_PLANNING_INTERFACE: '🚀 Nouvelle interface de planification ! Utilisez le bouton "Planifier avec IA" ci-dessus pour bénéficier de la planification intelligente améliorée.',
    USE_PLANNING_BUTTON: '💡 Utilisez le bouton "Planifier avec IA" ci-dessus pour démarrer la planification intelligente.',
    USE_RESEARCH_AGENT: '🔍 Sélectionnez une tâche vide et utilisez l\'onglet "Recherche" pour l\'enrichir automatiquement.',
    USE_RESEARCH_IN_PROGRESS: '🔍 Utilisez l\'agent de recherche sur les tâches en cours pour accélérer leur progression.',
    USE_WRITING_AGENT: '✍️ Les tâches avec recherche terminée peuvent être rédigées avec l\'agent "Rédaction".',
    USE_FILTERS: '📋 Utilisez les contrôles de tri et de filtre pour mieux organiser vos tâches.',
    FEEDBACK_NOTED: '💡 Suggestion notée ! Consultez la documentation pour plus d\'aide.',
  },

  // Console replacement messages
  CONSOLE: {
    DUPLICATE_PROJECT: 'Duplication du projet demandée',
    ARCHIVE_PROJECT: 'Archivage du projet demandé',
    TASK_STATUS_UNKNOWN: 'Tâche avec statut inconnu détectée',
    INVALID_HOME_ACTION: 'Action invalide sur la page d\'accueil',
  },

  // Validation messages
  VALIDATION: {
    TITLE_TOO_LONG: 'Le titre ne peut pas dépasser {max} caractères',
    DESCRIPTION_TOO_LONG: 'La description ne peut pas dépasser {max} caractères',
    TITLE_REQUIRED: 'Le titre est obligatoire',
    INVALID_INPUT: 'Saisie invalide détectée',
  },
} as const;

/**
 * Message formatting utilities
 */
export const formatMessage = (template: string, values: Record<string, string | number>): string => {
  return Object.entries(values).reduce(
    (message, [key, value]) => message.replace(`{${key}}`, String(value)),
    template
  );
};

/**
 * Console message handler - replaces console.log/warn/error with toast
 */
export const logMessage = (
  type: 'info' | 'warn' | 'error',
  message: string,
  toastFn?: (message: string) => void
) => {
  // In development, still log to console for debugging
  if (process.env.NODE_ENV === 'development') {
    console[type === 'warn' ? 'warn' : type === 'error' ? 'error' : 'log'](message);
  }

  // Show user-friendly toast if toast function provided
  if (toastFn) {
    toastFn(message);
  }
};

/**
 * Type-safe message access
 */
export type MessageCategory = keyof typeof MESSAGES;
export type MessageKey<T extends MessageCategory> = keyof typeof MESSAGES[T];
export type Message<T extends MessageCategory, K extends MessageKey<T>> = typeof MESSAGES[T][K];
