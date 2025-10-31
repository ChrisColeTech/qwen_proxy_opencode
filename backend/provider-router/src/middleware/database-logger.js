/**
 * Database Logger Middleware
 * Logs all requests and responses to database
 */

import { LogsService } from '../database/services/logs-service.js'
import { SettingsService } from '../database/services/settings-service.js'
import { logger } from '../utils/logger.js'

export default function databaseLogger(req, res, next) {
  const startTime = Date.now()

  // Capture request details
  const logData = {
    request_id: req.requestId, // Set by request-logger middleware
    provider: null, // Will be set when we know the provider
    endpoint: req.path,
    method: req.method,
    request_body: req.body,
  }

  // Try to get active provider from database
  try {
    logData.provider = SettingsService.getActiveProvider()
  } catch (error) {
    // If database not initialized yet, use a default
    logData.provider = 'unknown'
  }

  // Track if log has been saved
  let logSaved = false

  // Capture original res.json and res.send
  const originalJson = res.json.bind(res)
  const originalSend = res.send.bind(res)

  // Override res.json
  res.json = function(body) {
    if (!logSaved) {
      logData.response_body = body
      logData.status_code = res.statusCode
      logData.duration_ms = Date.now() - startTime
      saveLog(logData)
      logSaved = true
    }
    return originalJson(body)
  }

  // Override res.send
  res.send = function(body) {
    if (!logSaved) {
      // Only capture body if it's an object (JSON response)
      if (typeof body === 'object') {
        logData.response_body = body
      }
      logData.status_code = res.statusCode
      logData.duration_ms = Date.now() - startTime
      saveLog(logData)
      logSaved = true
    }
    return originalSend(body)
  }

  // Handle cases where neither json() nor send() is called
  res.on('finish', () => {
    if (!logSaved) {
      logData.status_code = res.statusCode
      logData.duration_ms = Date.now() - startTime
      saveLog(logData)
      logSaved = true
    }
  })

  next()
}

/**
 * Save log to database
 * Errors in logging should not crash the server
 */
function saveLog(logData) {
  try {
    // Don't log health check endpoints to reduce noise
    if (logData.endpoint === '/health' || logData.endpoint === '/') {
      return
    }

    LogsService.create(logData)
    logger.debug(`Request logged to database: ${logData.request_id}`)
  } catch (error) {
    // Log the error but don't throw - logging failures should not crash the server
    logger.error('Failed to save request log to database:', error)
  }
}
