// brain/memory/manager.js
import sqlite3 from 'sqlite3';
const { Database } = sqlite3;
import fs from 'fs';
import path from 'path';

class MemoryManager {
  constructor(dbPath = './data/memory.db') {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    
    this.db = new Database(dbPath);
    this.init();
  }

  init() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS memories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        role TEXT,
        content TEXT,
        metadata TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_timestamp ON memories(timestamp);
      CREATE INDEX IF NOT EXISTS idx_role ON memories(role);
    `);
  }

  remember(role, content, metadata = {}) {
    const stmt = this.db.prepare(`
      INSERT INTO memories (role, content, metadata) VALUES (?, ?, ?)
    `);
    return stmt.run(role, content, JSON.stringify(metadata));
  }

  recall(limit = 20) {
    const stmt = this.db.prepare(`
      SELECT role, content, metadata, timestamp 
      FROM memories 
      ORDER BY timestamp DESC 
      LIMIT ?
    `);
    const rows = stmt.all(limit);
    return rows ? rows.reverse() : [];
  }

  search(term) {
    const stmt = this.db.prepare(`
      SELECT * FROM memories 
      WHERE content LIKE ? 
      ORDER BY timestamp DESC 
      LIMIT 50
    `);
    const rows = stmt.all(`%${term}%`);
    return rows || [];
  }

  getStats() {
    const stmt = this.db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN role = 'user' THEN 1 ELSE 0 END) as userMsgs,
        SUM(CASE WHEN role = 'assistant' THEN 1 ELSE 0 END) as assistantMsgs,
        SUM(CASE WHEN role = 'system' THEN 1 ELSE 0 END) as systemMsgs
      FROM memories
    `);
    const result = stmt.get();
    return result || { total: 0, userMsgs: 0, assistantMsgs: 0, systemMsgs: 0 };
  }

  getLastUserMessage() {
    const stmt = this.db.prepare(`
      SELECT content FROM memories 
      WHERE role = 'user' 
      ORDER BY timestamp DESC 
      LIMIT 1
    `);
    const result = stmt.get();
    return result ? result.content : null;
  }

  getRecentActions(limit = 10) {
    const stmt = this.db.prepare(`
      SELECT content, metadata FROM memories 
      WHERE role = 'system' OR role = 'assistant'
      ORDER BY timestamp DESC 
      LIMIT ?
    `);
    const rows = stmt.all(limit);
    return rows || [];
  }

  getRecentMemories(limit = 10) {
    const stmt = this.db.prepare(`
      SELECT role, content, metadata, timestamp 
      FROM memories 
      ORDER BY timestamp DESC 
      LIMIT ?
    `);
    const rows = stmt.all(limit);
    return rows || [];
  }

  getMemoryCount() {
    const stmt = this.db.prepare(`SELECT COUNT(*) as count FROM memories`);
    const result = stmt.get();
    return result ? result.count : 0;
  }

  clearAll() {
    const stmt = this.db.prepare(`DELETE FROM memories`);
    return stmt.run();
  }

  close() {
    this.db.close();
  }
}

export default MemoryManager;
