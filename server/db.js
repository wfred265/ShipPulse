import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { INITIAL_SHIPMENTS } from '../src/utils/mockData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, 'shippulse.db');
const db = new Database(dbPath);

// Enable WAL mode for high performance
db.pragma('journal_mode = WAL');

// Initialize database tables
export function initDatabase() {
  // 1. Shipments Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS shipments (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 2. Admin Users Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      fullName TEXT NOT NULL,
      role TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Seed default admin user if missing
  const adminCount = db.prepare('SELECT COUNT(*) as count FROM admin_users').get();
  if (adminCount.count === 0) {
    const insertAdmin = db.prepare('INSERT INTO admin_users (username, password, fullName, role) VALUES (?, ?, ?, ?)');
    insertAdmin.run('admin', 'shippulse2026', 'Executive Super Admin', 'Super Admin');
  }

  // Seed initial shipments if missing
  const shipmentCount = db.prepare('SELECT COUNT(*) as count FROM shipments').get();
  if (shipmentCount.count === 0) {
    const insertShipment = db.prepare('INSERT INTO shipments (id, data) VALUES (?, ?)');
    INITIAL_SHIPMENTS.forEach(s => {
      insertShipment.run(s.id, JSON.stringify(s));
    });
  }

  console.log("✓ Production SQLite Database initialized at server/shippulse.db");
}

export default db;
