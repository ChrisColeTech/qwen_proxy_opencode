/**
 * Utility functions barrel export
 * Centralizes all utility exports for easy importing
 */

// Date utilities
export {
  formatDate,
  formatISO,
  formatDateOnly,
  formatTimeOnly,
  formatRelativeTime,
  formatDuration,
  isWithinDays,
  isExpired,
  getTimeUntilExpiration,
} from './date.utils';

// Validation utilities
export {
  validateRequired,
  validateUrl,
  validateJson,
  validateSlug,
  validateEmail,
  validateNumberRange,
  validateProviderConfig,
  validateApiKey,
  validatePriority,
  validateCapabilities,
  getFieldError,
  validateForm,
  hasErrors,
  sanitizeInput,
} from './validation.utils';

// Text utilities
export {
  slugify,
  autoSlugify,
  truncateText,
  capitalize,
  toTitleCase,
  kebabToTitle,
  pluralize,
  highlightText,
} from './text.utils';

// Re-export types
export type { ValidationResult, ValidationRules } from './validation.utils';
