/**
 * Logs Service
 * Manages request/response logging
 */

import { getDatabase } from '../connection.js'
import { logger } from '../../utils/logger.js'

export class LogsService {
  /**
   * Create new request log
   */
  static create(logData) {
    const db = getDatabase()
    const stmt = db.prepare(`
      INSERT INTO request_logs (
        request_id, provider, endpoint, method,
        request_body, response_body, status_code,
        duration_ms, error, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, strftime('%s', 'now'))
    `)

    const info = stmt.run(
      logData.request_id,
      logData.provider,
      logData.endpoint,
      logData.method,
      logData.request_body ? JSON.stringify(logData.request_body) : null,
      logData.response_body ? JSON.stringify(logData.response_body) : null,
      logData.status_code || null,
      logData.duration_ms || null,
      logData.error || null
    )

    return info.lastInsertRowid
  }

  /**
   * Get recent logs
   */
  static getRecent(limit = 50) {
    const db = getDatabase()
    const stmt = db.prepare(`
      SELECT * FROM request_logs
      ORDER BY created_at DESC
      LIMIT ?
    `)
    return stmt.all(limit).map(this.parseLog)
  }

  /**
   * Get logs by provider
   */
  static getByProvider(provider, limit = 50) {
    const db = getDatabase()
    const stmt = db.prepare(`
      SELECT * FROM request_logs
      WHERE provider = ?
      ORDER BY created_at DESC
      LIMIT ?
    `)
    return stmt.all(provider, limit).map(this.parseLog)
  }

  /**
   * Get statistics
   */
  static getStats() {
    const db = getDatabase()
    return {
      total: db.prepare('SELECT COUNT(*) as count FROM request_logs').get().count,
      byProvider: db.prepare(`
        SELECT provider, COUNT(*) as count
        FROM request_logs
        GROUP BY provider
      `).all(),
      avgDuration: db.prepare(`
        SELECT provider, AVG(duration_ms) as avg_ms
        FROM request_logs
        WHERE duration_ms IS NOT NULL
        GROUP BY provider
      `).all()
    }
  }

  /**
   * Parse log row (convert JSON strings back to objects)
   */
  static parseLog(row) {
    return {
      ...row,
      request_body: row.request_body ? JSON.parse(row.request_body) : null,
      response_body: row.response_body ? JSON.parse(row.response_body) : null,
    }
  }
}
