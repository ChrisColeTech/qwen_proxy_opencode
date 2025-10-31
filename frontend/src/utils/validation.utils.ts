/**
 * Form validation utilities
 * Provides comprehensive validation functions for form inputs
 */

import type { ProviderType } from '@/types/provider.types';

/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validation rules interface
 */
export interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
  customMessage?: string;
}

/**
 * Validates if a value is not empty
 * @param value - Value to validate
 * @returns True if value is not empty
 */
export const validateRequired = (value: any): boolean => {
  if (value === null || value === undefined) {
    return false;
  }
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  return true;
};

/**
 * Validates if a string is a valid URL
 * @param value - String to validate
 * @returns True if string is a valid URL
 */
export const validateUrl = (value: string): boolean => {
  if (!value || typeof value !== 'string') {
    return false;
  }
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Validates if a string is valid JSON
 * @param value - String to validate
 * @returns True if string is valid JSON
 */
export const validateJson = (value: string): boolean => {
  if (!value || typeof value !== 'string') {
    return false;
  }
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validates if a string matches a slug pattern (lowercase, alphanumeric, hyphens)
 * @param value - String to validate
 * @returns True if string is a valid slug
 */
export const validateSlug = (value: string): boolean => {
  if (!value || typeof value !== 'string') {
    return false;
  }
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
};

/**
 * Validates if a string is a valid email address
 * @param value - String to validate
 * @returns True if string is a valid email
 */
export const validateEmail = (value: string): boolean => {
  if (!value || typeof value !== 'string') {
    return false;
  }
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

/**
 * Validates if a number is within a range
 * @param value - Number to validate
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns True if number is within range
 */
export const validateNumberRange = (
  value: number,
  min?: number,
  max?: number
): boolean => {
  if (typeof value !== 'number' || isNaN(value)) {
    return false;
  }
  if (min !== undefined && value < min) {
    return false;
  }
  if (max !== undefined && value > max) {
    return false;
  }
  return true;
};

/**
 * Validates provider-specific configuration
 * @param providerType - Type of provider
 * @param config - Configuration object
 * @returns Validation result with error message if invalid
 */
export const validateProviderConfig = (
  providerType: ProviderType,
  config: Record<string, any>
): ValidationResult => {
  if (!config || typeof config !== 'object') {
    return { valid: false, error: 'Configuration must be an object' };
  }

  switch (providerType) {
    case 'lm-studio':
      // LM Studio requires base_url
      if (!config.base_url) {
        return { valid: false, error: 'LM Studio requires base_url' };
      }
      if (!validateUrl(config.base_url)) {
        return { valid: false, error: 'base_url must be a valid URL' };
      }
      break;

    case 'qwen-proxy':
      // Qwen Proxy requires api_key and base_url
      if (!config.api_key) {
        return { valid: false, error: 'Qwen Proxy requires api_key' };
      }
      if (!config.base_url) {
        return { valid: false, error: 'Qwen Proxy requires base_url' };
      }
      if (!validateUrl(config.base_url)) {
        return { valid: false, error: 'base_url must be a valid URL' };
      }
      break;

    case 'qwen-direct':
      // Qwen Direct requires api_key
      if (!config.api_key) {
        return { valid: false, error: 'Qwen Direct requires api_key' };
      }
      break;

    default:
      return { valid: false, error: 'Invalid provider type' };
  }

  return { valid: true };
};

/**
 * Validates a field value against a set of rules
 * @param value - Value to validate
 * @param rules - Validation rules
 * @returns Error message if invalid, null if valid
 */
export const getFieldError = (
  value: any,
  rules: ValidationRules
): string | null => {
  // Required validation
  if (rules.required && !validateRequired(value)) {
    return 'This field is required';
  }

  // Skip other validations if value is empty and not required
  if (!validateRequired(value) && !rules.required) {
    return null;
  }

  // String-specific validations
  if (typeof value === 'string') {
    if (rules.minLength && value.length < rules.minLength) {
      return `Minimum length is ${rules.minLength} characters`;
    }
    if (rules.maxLength && value.length > rules.maxLength) {
      return `Maximum length is ${rules.maxLength} characters`;
    }
    if (rules.pattern && !rules.pattern.test(value)) {
      return rules.customMessage || 'Invalid format';
    }
  }

  // Custom validation
  if (rules.custom && !rules.custom(value)) {
    return rules.customMessage || 'Invalid value';
  }

  return null;
};

/**
 * Validates multiple fields at once
 * @param data - Object containing field values
 * @param validationSchema - Object containing validation rules for each field
 * @returns Object containing errors for each field (empty object if all valid)
 */
export const validateForm = <T extends Record<string, any>>(
  data: T,
  validationSchema: Partial<Record<keyof T, ValidationRules>>
): Partial<Record<keyof T, string>> => {
  const errors: Partial<Record<keyof T, string>> = {};

  for (const field in validationSchema) {
    const rules = validationSchema[field];
    if (rules) {
      const error = getFieldError(data[field], rules);
      if (error) {
        errors[field] = error;
      }
    }
  }

  return errors;
};

/**
 * Checks if a form has any errors
 * @param errors - Object containing field errors
 * @returns True if there are any errors
 */
export const hasErrors = (errors: Record<string, any>): boolean => {
  return Object.keys(errors).length > 0;
};

/**
 * Validates API key format (non-empty string)
 * @param apiKey - API key to validate
 * @returns True if API key is valid
 */
export const validateApiKey = (apiKey: string): boolean => {
  return typeof apiKey === 'string' && apiKey.trim().length > 0;
};

/**
 * Validates priority number (must be positive integer)
 * @param priority - Priority number to validate
 * @returns True if priority is valid
 */
export const validatePriority = (priority: number): boolean => {
  return Number.isInteger(priority) && priority >= 0;
};

/**
 * Sanitizes user input by trimming whitespace
 * @param value - String to sanitize
 * @returns Sanitized string
 */
export const sanitizeInput = (value: string): string => {
  return typeof value === 'string' ? value.trim() : '';
};

/**
 * Validates model capabilities array
 * @param capabilities - Array of capability strings
 * @returns Validation result
 */
export const validateCapabilities = (
  capabilities: string[]
): ValidationResult => {
  if (!Array.isArray(capabilities)) {
    return { valid: false, error: 'Capabilities must be an array' };
  }

  if (capabilities.length === 0) {
    return { valid: false, error: 'At least one capability is required' };
  }

  for (const capability of capabilities) {
    if (typeof capability !== 'string' || capability.trim().length === 0) {
      return { valid: false, error: 'All capabilities must be non-empty strings' };
    }
  }

  return { valid: true };
};
