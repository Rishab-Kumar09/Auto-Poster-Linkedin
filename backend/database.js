import Database from 'better-sqlite3';
import { existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';

let db = null;

export function initDatabase() {
  const dbPath = './data/automation.db';
  
  // Create data directory if it doesn't exist
  const dir = dirname(dbPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  
  db = new Database(dbPath);
  
  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content_source TEXT NOT NULL,
      twitter_post TEXT,
      twitter_thread TEXT,
      linkedin_post TEXT,
      tone TEXT,
      image_url TEXT,
      image_data TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      posted_at DATETIME,
      engagement_score INTEGER DEFAULT 0
    );
    
    CREATE TABLE IF NOT EXISTS content_cache (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source TEXT NOT NULL,
      topic TEXT NOT NULL,
      url TEXT UNIQUE,
      title TEXT,
      content TEXT,
      fetched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      used INTEGER DEFAULT 0
    );
    
    CREATE TABLE IF NOT EXISTS analytics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER,
      platform TEXT,
      likes INTEGER DEFAULT 0,
      comments INTEGER DEFAULT 0,
      shares INTEGER DEFAULT 0,
      impressions INTEGER DEFAULT 0,
      recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES posts(id)
    );
    
    CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
    CREATE INDEX IF NOT EXISTS idx_content_cache_topic ON content_cache(topic);
    CREATE INDEX IF NOT EXISTS idx_content_cache_used ON content_cache(used);
  `);
  
  console.log('✅ Database initialized');
  return db;
}

export function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

