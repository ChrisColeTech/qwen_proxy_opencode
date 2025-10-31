/**
 * Settings Controller
 * Business logic for settings management
 */

import { SettingsService } from '../database/services/settings-service.js'
import { logger } from '../utils/logger.js'

// Settings that require server restart to apply
const RESTART_REQUIRED_SETTINGS = [
  'server.port',
  'server.host',
  'logging.level'
]

// Default settings
const DEFAULT_SETTINGS = {
  'server.port': 8000,
  'server.host': '0.0.0.0',
  'server.timeout': 120000,
  'logging.level': 'info',
  'logging.logRequests': true,
  'logging.logResponses': true,
  'system.autoStart': false,
  'system.minimizeToTray': true,
  'system.checkUpdates': true
}

// Settings categories
const SETTINGS_CATEGORIES = {
  SERVER: 'server',
  LOGGING: 'logging',
  SYSTEM: 'system',
  PROVIDER: 'provider'
}

/**
 * Get category from setting key
 */
function getCategoryFromKey(key) {
  const prefix = key.split('.')[0]
  return prefix || 'unknown'
}

/**
 * Check if setting requires restart
 */
function requiresRestart(key) {
  return RESTART_REQUIRED_SETTINGS.includes(key)
}

/**
 * GET /v1/settings
 * Get all settings
 */
export async function getAllSettings(req, res, next) {
  try {
    const { category } = req.query

    logger.debug('Get all settings', { category })

    // Get all settings from database
    let settings = await SettingsService.getAll()

    // Merge with defaults for any missing settings
    const mergedSettings = { ...DEFAULT_SETTINGS }
    for (const [key, value] of Object.entries(settings)) {
      mergedSettings[key] = value
    }

    // Filter by category if provided
    let filteredSettings = mergedSettings
    if (category) {
      filteredSettings = Object.entries(mergedSettings)
        .filter(([key]) => getCategoryFromKey(key) === category)
        .reduce((acc, [key, value]) => {
          acc[key] = value
          return acc
        }, {})
    }

    res.json({
      settings: filteredSettings,
      category: category || 'all'
    })
  } catch (error) {
    logger.error('Failed to get settings', { error: error.message })
    next(error)
  }
}

/**
 * GET /v1/settings/:key
 * Get specific setting
 */
export async function getSetting(req, res, next) {
  try {
    const { key } = req.params

    logger.debug('Get setting', { key })

    // Try to get from database
    let value = await SettingsService.get(key)

    // Fallback to default if not found
    if (value === null && DEFAULT_SETTINGS.hasOwnProperty(key)) {
      value = DEFAULT_SETTINGS[key]
    }

    if (value === null) {
      return res.status(404).json({
        error: 'Setting not found',
        key
      })
    }

    res.json({
      key,
      value,
      category: getCategoryFromKey(key),
      requiresRestart: requiresRestart(key),
      isDefault: !await SettingsService.exists(key)
    })
  } catch (error) {
    logger.error('Failed to get setting', { key: req.params.key, error: error.message })
    next(error)
  }
}

/**
 * PUT /v1/settings/:key
 * Update specific setting
 */
export async function updateSetting(req, res, next) {
  try {
    const { key } = req.params
    const { value } = req.body

    logger.info('Update setting', { key, value })

    // Update in database
    await SettingsService.set(key, value)

    res.json({
      key,
      value,
      requiresRestart: requiresRestart(key),
      updated_at: Date.now(),
      message: requiresRestart(key)
        ? 'Setting updated. Server restart required to apply changes.'
        : 'Setting updated successfully.'
    })
  } catch (error) {
    logger.error('Failed to update setting', { key: req.params.key, error: error.message })
    next(error)
  }
}

/**
 * POST /v1/settings/bulk
 * Bulk update settings
 */
export async function bulkUpdateSettings(req, res, next) {
  try {
    const { settings } = req.body

    logger.info('Bulk update settings', { count: Object.keys(settings).length })

    const updated = []
    const errors = []
    let needsRestart = false

    // Update each setting
    for (const [key, value] of Object.entries(settings)) {
      try {
        await SettingsService.set(key, value)
        updated.push(key)

        if (requiresRestart(key)) {
          needsRestart = true
        }
      } catch (error) {
        errors.push({
          key,
          error: error.message
        })
      }
    }

    res.json({
      updated,
      errors,
      requiresRestart: needsRestart,
      message: needsRestart
        ? `${updated.length} settings updated. Server restart required.`
        : `${updated.length} settings updated successfully.`
    })
  } catch (error) {
    logger.error('Failed to bulk update settings', { error: error.message })
    next(error)
  }
}

/**
 * DELETE /v1/settings/:key
 * Delete setting (reset to default)
 */
export async function deleteSetting(req, res, next) {
  try {
    const { key } = req.params

    logger.info('Delete setting', { key })

    // Delete from database (will fall back to default)
    await SettingsService.delete(key)

    const defaultValue = DEFAULT_SETTINGS[key] || null

    res.json({
      key,
      value: defaultValue,
      message: 'Setting reset to default value.',
      requiresRestart: requiresRestart(key)
    })
  } catch (error) {
    logger.error('Failed to delete setting', { key: req.params.key, error: error.message })
    next(error)
  }
}

export {
  SETTINGS_CATEGORIES,
  DEFAULT_SETTINGS,
  RESTART_REQUIRED_SETTINGS
}
