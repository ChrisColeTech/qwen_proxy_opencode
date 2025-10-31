/**
 * Date formatting utilities
 * Provides consistent date formatting across the application
 */

/**
 * Formats a Unix timestamp to a localized date-time string
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted date string (e.g., "10/31/2025, 2:30:45 PM")
 */
export const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString();
};

/**
 * Formats a Unix timestamp to ISO 8601 format
 * @param timestamp - Unix timestamp in milliseconds
 * @returns ISO 8601 formatted date string (e.g., "2025-10-31T14:30:45.123Z")
 */
export const formatISO = (timestamp: number): string => {
  return new Date(timestamp).toISOString();
};

/**
 * Formats a Unix timestamp to a date-only string
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Date-only string (e.g., "10/31/2025")
 */
export const formatDateOnly = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString();
};

/**
 * Formats a Unix timestamp to a time-only string
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Time-only string (e.g., "2:30:45 PM")
 */
export const formatTimeOnly = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString();
};

/**
 * Formats a Unix timestamp to a relative time string
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Relative time string (e.g., "2m ago", "3h ago", "5d ago")
 */
export const formatRelativeTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) return `${years}y ago`;
  if (months > 0) return `${months}mo ago`;
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  if (seconds > 0) return `${seconds}s ago`;
  return 'just now';
};

/**
 * Formats a duration in milliseconds to a human-readable string
 * @param ms - Duration in milliseconds
 * @returns Formatted duration string (e.g., "150ms", "2.35s")
 */
export const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
};

/**
 * Checks if a timestamp is within the last N days
 * @param timestamp - Unix timestamp in milliseconds
 * @param days - Number of days to check
 * @returns True if timestamp is within the last N days
 */
export const isWithinDays = (timestamp: number, days: number): boolean => {
  const now = Date.now();
  const diff = now - timestamp;
  const daysAgo = Math.floor(diff / (1000 * 60 * 60 * 24));
  return daysAgo <= days;
};

/**
 * Checks if a timestamp is expired (in the past)
 * @param timestamp - Unix timestamp in milliseconds
 * @returns True if timestamp is in the past
 */
export const isExpired = (timestamp: number): boolean => {
  return timestamp < Date.now();
};

/**
 * Gets time until expiration in human-readable format
 * @param expiresAt - Unix timestamp in milliseconds
 * @returns Time remaining string or "Expired"
 */
export const getTimeUntilExpiration = (expiresAt: number): string => {
  const now = Date.now();
  const diff = expiresAt - now;

  if (diff <= 0) return 'Expired';

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d remaining`;
  if (hours > 0) return `${hours}h remaining`;
  if (minutes > 0) return `${minutes}m remaining`;
  return `${seconds}s remaining`;
};
