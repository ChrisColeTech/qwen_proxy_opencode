/**
 * Database Integration Tests
 * Tests SettingsService and LogsService functionality
 */

import { describe, it, before, after, beforeEach } from 'node:test'
import assert from 'node:assert'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync, unlinkSync, mkdirSync } from 'fs'
import Database from 'better-sqlite3'
import { readFileSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Test database paths
const TEST_DB_DIR = join(__dirname, '../../data/test')
const TEST_DB_PATH = join(TEST_DB_DIR, 'test.db')
const SCHEMA_PATH = join(__dirname, '../../src/database/schema.sql')

// Test database instance
let testDb = null

// Mock services for testing
class TestSettingsService {
  static get(key) {
    const stmt = testDb.prepare('SELECT value FROM settings WHERE key = ?')
    const row = stmt.get(key)
    return row ? row.value : null
  }

  static set(key, value) {
    const stmt = testDb.prepare(`
      INSERT INTO settings (key, value, updated_at)
      VALUES (?, ?, strftime('%s', 'now'))
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        updated_at = excluded.updated_at
    `)
    stmt.run(key, value)
  }

  static getActiveProvider() {
    return this.get('active_provider') || 'lm-studio'
  }

  static setActiveProvider(provider) {
    this.set('active_provider', provider)
  }

  static getAll() {
    const stmt = testDb.prepare('SELECT key, value, updated_at FROM settings')
    const rows = stmt.all()
    return Object.fromEntries(rows.map(r => [r.key, r.value]))
  }

  static delete(key) {
    const stmt = testDb.prepare('DELETE FROM settings WHERE key = ?')
    stmt.run(key)
  }
}

class TestLogsService {
  static create(logData) {
    const stmt = testDb.prepare(`
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

  static getRecent(limit = 50) {
    const stmt = testDb.prepare(`
      SELECT * FROM request_logs
      ORDER BY created_at DESC
      LIMIT ?
    `)
    return stmt.all(limit).map(this.parseLog)
  }

  static getByProvider(provider, limit = 50) {
    const stmt = testDb.prepare(`
      SELECT * FROM request_logs
      WHERE provider = ?
      ORDER BY created_at DESC
      LIMIT ?
    `)
    return stmt.all(provider, limit).map(this.parseLog)
  }

  static getStats() {
    return {
      total: testDb.prepare('SELECT COUNT(*) as count FROM request_logs').get().count,
      byProvider: testDb.prepare(`
        SELECT provider, COUNT(*) as count
        FROM request_logs
        GROUP BY provider
      `).all(),
      avgDuration: testDb.prepare(`
        SELECT provider, AVG(duration_ms) as avg_ms
        FROM request_logs
        WHERE duration_ms IS NOT NULL
        GROUP BY provider
      `).all()
    }
  }

  static parseLog(row) {
    return {
      ...row,
      request_body: row.request_body ? JSON.parse(row.request_body) : null,
      response_body: row.response_body ? JSON.parse(row.response_body) : null,
    }
  }

  static deleteAll() {
    testDb.prepare('DELETE FROM request_logs').run()
  }
}

describe('Database Integration Tests', () => {
  before(() => {
    console.log('Setting up test database...')

    // Create test directory if it doesn't exist
    if (!existsSync(TEST_DB_DIR)) {
      mkdirSync(TEST_DB_DIR, { recursive: true })
    }

    // Remove existing test database
    if (existsSync(TEST_DB_PATH)) {
      unlinkSync(TEST_DB_PATH)
    }

    // Create new test database
    testDb = new Database(TEST_DB_PATH)
    testDb.pragma('journal_mode = WAL')
    testDb.pragma('foreign_keys = ON')

    // Load and execute schema
    const schema = readFileSync(SCHEMA_PATH, 'utf8')
    testDb.exec(schema)

    console.log('Test database initialized')
  })

  after(() => {
    console.log('Cleaning up test database...')

    if (testDb) {
      testDb.close()
      testDb = null
    }

    // Remove test database
    if (existsSync(TEST_DB_PATH)) {
      unlinkSync(TEST_DB_PATH)
    }

    console.log('Test database cleaned up')
  })

  describe('SettingsService', () => {
    beforeEach(() => {
      // Clean up settings except the default active_provider
      const stmt = testDb.prepare("DELETE FROM settings WHERE key != 'active_provider'")
      stmt.run()
    })

    describe('get() and set()', () => {
      it('should get and set values', () => {
        TestSettingsService.set('test_key', 'test_value')
        const value = TestSettingsService.get('test_key')
        assert.strictEqual(value, 'test_value', 'Should return the set value')
      })

      it('should return null for non-existent keys', () => {
        const value = TestSettingsService.get('non_existent_key')
        assert.strictEqual(value, null, 'Should return null for non-existent keys')
      })

      it('should update existing values', () => {
        TestSettingsService.set('test_key', 'value1')
        TestSettingsService.set('test_key', 'value2')
        const value = TestSettingsService.get('test_key')
        assert.strictEqual(value, 'value2', 'Should update to new value')
      })

      it('should handle special characters in values', () => {
        const specialValue = '{"key": "value", "unicode": "日本語", "emoji": "🚀"}'
        TestSettingsService.set('special_key', specialValue)
        const value = TestSettingsService.get('special_key')
        assert.strictEqual(value, specialValue, 'Should handle special characters')
      })
    })

    describe('getActiveProvider() and setActiveProvider()', () => {
      it('should get default active provider', () => {
        const provider = TestSettingsService.getActiveProvider()
        assert.strictEqual(provider, 'lm-studio', 'Should return default provider')
      })

      it('should set and get active provider', () => {
        TestSettingsService.setActiveProvider('qwen-proxy')
        const provider = TestSettingsService.getActiveProvider()
        assert.strictEqual(provider, 'qwen-proxy', 'Should return updated provider')
      })

      it('should persist active provider changes', () => {
        TestSettingsService.setActiveProvider('qwen-direct')
        const provider1 = TestSettingsService.getActiveProvider()
        assert.strictEqual(provider1, 'qwen-direct', 'Should return qwen-direct')

        TestSettingsService.setActiveProvider('lm-studio')
        const provider2 = TestSettingsService.getActiveProvider()
        assert.strictEqual(provider2, 'lm-studio', 'Should return lm-studio')
      })
    })

    describe('getAll()', () => {
      it('should return all settings', () => {
        TestSettingsService.set('key1', 'value1')
        TestSettingsService.set('key2', 'value2')
        TestSettingsService.set('key3', 'value3')

        const all = TestSettingsService.getAll()
        assert.ok(all.key1, 'Should have key1')
        assert.ok(all.key2, 'Should have key2')
        assert.ok(all.key3, 'Should have key3')
        assert.strictEqual(all.key1, 'value1', 'key1 should have correct value')
        assert.strictEqual(all.key2, 'value2', 'key2 should have correct value')
        assert.strictEqual(all.key3, 'value3', 'key3 should have correct value')
      })

      it('should return empty object when no settings', () => {
        // Delete all settings
        testDb.prepare('DELETE FROM settings').run()
        const all = TestSettingsService.getAll()
        assert.strictEqual(Object.keys(all).length, 0, 'Should return empty object')
      })
    })
  })

  describe('LogsService', () => {
    beforeEach(() => {
      // Clean up all logs before each test
      TestLogsService.deleteAll()
    })

    describe('create()', () => {
      it('should create a log entry', () => {
        const logData = {
          request_id: 'test-req-001',
          provider: 'lm-studio',
          endpoint: '/v1/chat/completions',
          method: 'POST',
          request_body: { model: 'qwen3-max', messages: [{ role: 'user', content: 'Hi' }] },
          response_body: { choices: [{ message: { content: 'Hello!' } }] },
          status_code: 200,
          duration_ms: 150
        }

        const id = TestLogsService.create(logData)
        assert.ok(id > 0, 'Should return a valid ID')
      })

      it('should create log with minimal data', () => {
        const logData = {
          request_id: 'test-req-002',
          provider: 'qwen-proxy',
          endpoint: '/v1/models',
          method: 'GET'
        }

        const id = TestLogsService.create(logData)
        assert.ok(id > 0, 'Should return a valid ID')
      })

      it('should create log with error', () => {
        const logData = {
          request_id: 'test-req-003',
          provider: 'lm-studio',
          endpoint: '/v1/chat/completions',
          method: 'POST',
          request_body: { model: 'invalid' },
          error: 'Provider not available',
          status_code: 503,
          duration_ms: 50
        }

        const id = TestLogsService.create(logData)
        assert.ok(id > 0, 'Should return a valid ID')
      })

      it('should handle complex JSON in request/response bodies', () => {
        const logData = {
          request_id: 'test-req-004',
          provider: 'qwen-direct',
          endpoint: '/v1/chat/completions',
          method: 'POST',
          request_body: {
            model: 'qwen3-max',
            messages: [
              { role: 'system', content: 'You are a helpful assistant' },
              { role: 'user', content: 'Tell me about JSON' }
            ],
            temperature: 0.7,
            max_tokens: 500
          },
          response_body: {
            id: 'chatcmpl-123',
            object: 'chat.completion',
            choices: [{
              index: 0,
              message: { role: 'assistant', content: 'JSON is...' },
              finish_reason: 'stop'
            }]
          },
          status_code: 200,
          duration_ms: 1200
        }

        const id = TestLogsService.create(logData)
        assert.ok(id > 0, 'Should handle complex JSON')
      })
    })

    describe('getRecent()', () => {
      it('should get recent logs', () => {
        // Create multiple logs
        for (let i = 0; i < 5; i++) {
          TestLogsService.create({
            request_id: `test-req-${i}`,
            provider: 'lm-studio',
            endpoint: '/v1/chat/completions',
            method: 'POST'
          })
        }

        const logs = TestLogsService.getRecent(10)
        assert.strictEqual(logs.length, 5, 'Should return 5 logs')
      })

      it('should respect limit parameter', () => {
        // Create 10 logs
        for (let i = 0; i < 10; i++) {
          TestLogsService.create({
            request_id: `test-req-${i}`,
            provider: 'lm-studio',
            endpoint: '/v1/chat/completions',
            method: 'POST'
          })
        }

        const logs = TestLogsService.getRecent(3)
        assert.strictEqual(logs.length, 3, 'Should return only 3 logs')
      })

      it('should return logs in descending order by created_at', () => {
        // Create logs with small delays
        const ids = []
        for (let i = 0; i < 3; i++) {
          const id = TestLogsService.create({
            request_id: `test-req-${i}`,
            provider: 'lm-studio',
            endpoint: '/v1/chat/completions',
            method: 'POST'
          })
          ids.push(id)
        }

        const logs = TestLogsService.getRecent(3)

        // Most recent should be first
        assert.strictEqual(logs[0].id, ids[2], 'Most recent log should be first')
        assert.strictEqual(logs[1].id, ids[1], 'Second log should be second')
        assert.strictEqual(logs[2].id, ids[0], 'Oldest log should be last')
      })

      it('should parse JSON bodies correctly', () => {
        const requestBody = { model: 'qwen3-max', messages: [{ role: 'user', content: 'Hi' }] }
        const responseBody = { choices: [{ message: { content: 'Hello!' } }] }

        TestLogsService.create({
          request_id: 'test-req-json',
          provider: 'lm-studio',
          endpoint: '/v1/chat/completions',
          method: 'POST',
          request_body: requestBody,
          response_body: responseBody
        })

        const logs = TestLogsService.getRecent(1)
        assert.deepStrictEqual(logs[0].request_body, requestBody, 'Request body should be parsed')
        assert.deepStrictEqual(logs[0].response_body, responseBody, 'Response body should be parsed')
      })

      it('should return empty array when no logs', () => {
        const logs = TestLogsService.getRecent(10)
        assert.strictEqual(logs.length, 0, 'Should return empty array')
      })
    })

    describe('getByProvider()', () => {
      beforeEach(() => {
        // Create logs for different providers
        TestLogsService.create({
          request_id: 'lm-1',
          provider: 'lm-studio',
          endpoint: '/v1/chat/completions',
          method: 'POST'
        })
        TestLogsService.create({
          request_id: 'qwen-1',
          provider: 'qwen-proxy',
          endpoint: '/v1/chat/completions',
          method: 'POST'
        })
        TestLogsService.create({
          request_id: 'lm-2',
          provider: 'lm-studio',
          endpoint: '/v1/models',
          method: 'GET'
        })
      })

      it('should get logs for specific provider', () => {
        const logs = TestLogsService.getByProvider('lm-studio', 10)
        assert.strictEqual(logs.length, 2, 'Should return 2 lm-studio logs')
        assert.ok(logs.every(log => log.provider === 'lm-studio'), 'All logs should be from lm-studio')
      })

      it('should respect limit parameter', () => {
        // Create more logs for lm-studio
        for (let i = 0; i < 5; i++) {
          TestLogsService.create({
            request_id: `lm-${i + 3}`,
            provider: 'lm-studio',
            endpoint: '/v1/chat/completions',
            method: 'POST'
          })
        }

        const logs = TestLogsService.getByProvider('lm-studio', 3)
        assert.strictEqual(logs.length, 3, 'Should return only 3 logs')
      })

      it('should return empty array for provider with no logs', () => {
        const logs = TestLogsService.getByProvider('non-existent-provider', 10)
        assert.strictEqual(logs.length, 0, 'Should return empty array')
      })
    })

    describe('getStats()', () => {
      beforeEach(() => {
        // Create sample logs with varying providers and durations
        TestLogsService.create({
          request_id: 'stats-1',
          provider: 'lm-studio',
          endpoint: '/v1/chat/completions',
          method: 'POST',
          duration_ms: 100,
          status_code: 200
        })
        TestLogsService.create({
          request_id: 'stats-2',
          provider: 'lm-studio',
          endpoint: '/v1/chat/completions',
          method: 'POST',
          duration_ms: 200,
          status_code: 200
        })
        TestLogsService.create({
          request_id: 'stats-3',
          provider: 'qwen-proxy',
          endpoint: '/v1/chat/completions',
          method: 'POST',
          duration_ms: 300,
          status_code: 200
        })
      })

      it('should return total count', () => {
        const stats = TestLogsService.getStats()
        assert.strictEqual(stats.total, 3, 'Should return total count of 3')
      })

      it('should return count by provider', () => {
        const stats = TestLogsService.getStats()
        assert.ok(Array.isArray(stats.byProvider), 'byProvider should be an array')

        const lmStudio = stats.byProvider.find(p => p.provider === 'lm-studio')
        const qwenProxy = stats.byProvider.find(p => p.provider === 'qwen-proxy')

        assert.strictEqual(lmStudio.count, 2, 'lm-studio should have 2 logs')
        assert.strictEqual(qwenProxy.count, 1, 'qwen-proxy should have 1 log')
      })

      it('should calculate average duration by provider', () => {
        const stats = TestLogsService.getStats()
        assert.ok(Array.isArray(stats.avgDuration), 'avgDuration should be an array')

        const lmStudio = stats.avgDuration.find(p => p.provider === 'lm-studio')
        const qwenProxy = stats.avgDuration.find(p => p.provider === 'qwen-proxy')

        assert.strictEqual(lmStudio.avg_ms, 150, 'lm-studio average should be 150ms')
        assert.strictEqual(qwenProxy.avg_ms, 300, 'qwen-proxy average should be 300ms')
      })

      it('should handle empty database', () => {
        TestLogsService.deleteAll()
        const stats = TestLogsService.getStats()

        assert.strictEqual(stats.total, 0, 'Total should be 0')
        assert.strictEqual(stats.byProvider.length, 0, 'byProvider should be empty')
        assert.strictEqual(stats.avgDuration.length, 0, 'avgDuration should be empty')
      })

      it('should handle logs without duration', () => {
        TestLogsService.deleteAll()

        TestLogsService.create({
          request_id: 'no-duration',
          provider: 'lm-studio',
          endpoint: '/v1/models',
          method: 'GET'
          // No duration_ms
        })

        const stats = TestLogsService.getStats()
        assert.strictEqual(stats.total, 1, 'Should count log without duration')
        assert.strictEqual(stats.avgDuration.length, 0, 'Should not include in avg when no duration')
      })
    })
  })

  describe('Database Constraints', () => {
    it('should enforce unique request_id constraint', () => {
      TestLogsService.create({
        request_id: 'unique-test',
        provider: 'lm-studio',
        endpoint: '/v1/chat/completions',
        method: 'POST'
      })

      // Try to create another log with same request_id
      assert.throws(
        () => {
          TestLogsService.create({
            request_id: 'unique-test',
            provider: 'qwen-proxy',
            endpoint: '/v1/models',
            method: 'GET'
          })
        },
        /UNIQUE constraint failed/,
        'Should throw error for duplicate request_id'
      )
    })

    it('should enforce primary key constraint on settings', () => {
      TestSettingsService.set('unique-key', 'value1')

      // Should update, not throw error
      TestSettingsService.set('unique-key', 'value2')
      const value = TestSettingsService.get('unique-key')
      assert.strictEqual(value, 'value2', 'Should update existing key')
    })
  })

  describe('Performance and Edge Cases', () => {
    it('should handle large request/response bodies', () => {
      const largeBody = {
        messages: Array(100).fill(null).map((_, i) => ({
          role: i % 2 === 0 ? 'user' : 'assistant',
          content: 'Lorem ipsum dolor sit amet '.repeat(50)
        }))
      }

      const id = TestLogsService.create({
        request_id: 'large-body-test',
        provider: 'lm-studio',
        endpoint: '/v1/chat/completions',
        method: 'POST',
        request_body: largeBody,
        response_body: largeBody
      })

      assert.ok(id > 0, 'Should handle large bodies')

      const logs = TestLogsService.getRecent(1)
      assert.strictEqual(logs[0].request_body.messages.length, 100, 'Should preserve large body')
    })

    it('should handle concurrent writes', () => {
      // Create multiple logs "concurrently"
      const promises = []
      for (let i = 0; i < 10; i++) {
        TestLogsService.create({
          request_id: `concurrent-${i}`,
          provider: 'lm-studio',
          endpoint: '/v1/chat/completions',
          method: 'POST'
        })
      }

      const logs = TestLogsService.getRecent(20)
      assert.ok(logs.length >= 10, 'Should handle multiple writes')
    })

    it('should handle null and undefined values correctly', () => {
      const logData = {
        request_id: 'null-test',
        provider: 'lm-studio',
        endpoint: '/v1/chat/completions',
        method: 'POST',
        request_body: null,
        response_body: undefined,
        status_code: null,
        duration_ms: null,
        error: null
      }

      const id = TestLogsService.create(logData)
      assert.ok(id > 0, 'Should handle null values')

      const logs = TestLogsService.getRecent(1)
      assert.strictEqual(logs[0].request_body, null, 'Should preserve null')
      assert.strictEqual(logs[0].response_body, null, 'Should preserve null')
    })
  })
})
