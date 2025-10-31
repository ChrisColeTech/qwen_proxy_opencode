/**
 * Text manipulation utilities
 * Provides functions for text formatting and transformation
 */

/**
 * Converts a string to a URL-friendly slug
 * @param text - Text to convert to slug
 * @returns Slug string (lowercase, alphanumeric, hyphens)
 * @example slugify("Hello World!") // "hello-world"
 */
export const slugify = (text: string): string => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars (except spaces and hyphens)
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Automatically generates a slug from a name
 * Alias for slugify() for semantic clarity in form contexts
 * @param name - Name to convert to slug
 * @returns Slug string
 */
export const autoSlugify = (name: string): string => {
  return slugify(name);
};

/**
 * Truncates text to a maximum length and adds ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @param suffix - Suffix to add when truncated (default: "...")
 * @returns Truncated text with suffix if needed
 * @example truncateText("Hello World", 5) // "Hello..."
 */
export const truncateText = (
  text: string,
  maxLength: number,
  suffix: string = '...'
): string => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  if (text.length <= maxLength) {
    return text;
  }

  return text.substring(0, maxLength) + suffix;
};

/**
 * Capitalizes the first letter of a string
 * @param text - Text to capitalize
 * @returns Capitalized text
 * @example capitalize("hello") // "Hello"
 */
export const capitalize = (text: string): string => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return text.charAt(0).toUpperCase() + text.slice(1);
};

/**
 * Converts a string to title case
 * @param text - Text to convert
 * @returns Title case text
 * @example toTitleCase("hello world") // "Hello World"
 */
export const toTitleCase = (text: string): string => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return text
    .toLowerCase()
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
};

/**
 * Converts kebab-case or snake_case to Title Case
 * @param text - Text to convert
 * @returns Title case text
 * @example kebabToTitle("hello-world") // "Hello World"
 */
export const kebabToTitle = (text: string): string => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return text
    .replace(/[-_]/g, ' ')
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
};

/**
 * Pluralizes a word based on count
 * @param count - Number to check
 * @param singular - Singular form
 * @param plural - Plural form (optional, defaults to singular + "s")
 * @returns Pluralized string with count
 * @example pluralize(1, "item") // "1 item"
 * @example pluralize(2, "item") // "2 items"
 */
export const pluralize = (
  count: number,
  singular: string,
  plural?: string
): string => {
  const word = count === 1 ? singular : (plural || `${singular}s`);
  return `${count} ${word}`;
};

/**
 * Highlights search terms in text by wrapping them in a marker
 * @param text - Text to search in
 * @param searchTerm - Term to highlight
 * @param marker - HTML tag or marker to wrap matches (default: "mark")
 * @returns Text with highlighted search terms
 */
export const highlightText = (
  text: string,
  searchTerm: string,
  marker: string = 'mark'
): string => {
  if (!text || !searchTerm) {
    return text;
  }

  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, `<${marker}>$1</${marker}>`);
};
