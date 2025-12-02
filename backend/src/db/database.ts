import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(__dirname, '../../data');
const dbPath = path.join(dataDir, 'threads.db');

// dataディレクトリが存在しない場合は作成
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const db = new sqlite3.Database(dbPath);

export function initDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(`
        CREATE TABLE IF NOT EXISTS threads (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          last_post_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          post_count INTEGER DEFAULT 0,
          source_url TEXT,
          language TEXT DEFAULT 'ja',
          is_auto_generated INTEGER DEFAULT 0,
          linked_thread_group_id TEXT
        )
      `, (err) => {
        if (err) reject(err);
      });

      db.run(`
        CREATE TABLE IF NOT EXISTS posts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          thread_id INTEGER NOT NULL,
          author_name TEXT NOT NULL,
          content TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (thread_id) REFERENCES threads (id)
        )
      `, (err) => {
        if (err) reject(err);
      });

      db.run(`
        CREATE TABLE IF NOT EXISTS news_articles (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          url TEXT UNIQUE,
          published_at DATETIME,
          processed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          category TEXT
        )
      `, (err) => {
        if (err) reject(err);
      });

      // 既存テーブルに新しいカラムを追加（存在しない場合のみ）
      db.run(`ALTER TABLE threads ADD COLUMN language TEXT DEFAULT 'ja'`, () => {});
      db.run(`ALTER TABLE threads ADD COLUMN is_auto_generated INTEGER DEFAULT 0`, () => {});
      db.run(`ALTER TABLE threads ADD COLUMN linked_thread_group_id TEXT`, () => {});

      console.log('✅ Database initialized');
      resolve();
    });
  });
}
