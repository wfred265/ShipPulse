import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db, { initDatabase } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));

// Initialize SQLite database
initDatabase();

// ------------------------------------
// 1. SHIPMENTS REST API ENDPOINTS
// ------------------------------------

// GET /api/shipments - Fetch all shipments
app.get('/api/shipments', (req, res) => {
  try {
    const rows = db.prepare('SELECT id, data, updated_at FROM shipments ORDER BY updated_at DESC').all();
    const shipments = rows.map(r => JSON.parse(r.data));
    res.json({ success: true, count: shipments.length, data: shipments });
  } catch (err) {
    console.error("GET /api/shipments error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/shipments/:id - Query single tracking code
app.get('/api/shipments/:id', (req, res) => {
  try {
    const trackingId = req.params.id.toUpperCase();
    const row = db.prepare('SELECT data FROM shipments WHERE UPPER(id) = ?').get(trackingId);
    if (row) {
      res.json({ success: true, data: JSON.parse(row.data) });
    } else {
      res.status(404).json({ success: false, error: `Shipment ${trackingId} not found.` });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/shipments - Create a new shipment manifest
app.post('/api/shipments', (req, res) => {
  try {
    const shipmentObj = req.body;
    if (!shipmentObj || !shipmentObj.id) {
      return res.status(400).json({ success: false, error: "Invalid shipment payload: missing ID" });
    }

    const payloadStr = JSON.stringify(shipmentObj);
    const stmt = db.prepare(`
      INSERT INTO shipments (id, data, updated_at) 
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = CURRENT_TIMESTAMP
    `);
    stmt.run(shipmentObj.id, payloadStr);

    res.status(201).json({ success: true, id: shipmentObj.id, data: shipmentObj });
  } catch (err) {
    console.error("POST /api/shipments error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/shipments/:id - Update existing shipment
app.put('/api/shipments/:id', (req, res) => {
  try {
    const trackingId = req.params.id;
    const shipmentObj = req.body;

    const payloadStr = JSON.stringify(shipmentObj);
    const stmt = db.prepare(`
      UPDATE shipments SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `);
    const result = stmt.run(payloadStr, trackingId);

    if (result.changes > 0) {
      res.json({ success: true, id: trackingId, data: shipmentObj });
    } else {
      // If not found, insert
      const insertStmt = db.prepare('INSERT INTO shipments (id, data) VALUES (?, ?)');
      insertStmt.run(trackingId, payloadStr);
      res.json({ success: true, id: trackingId, data: shipmentObj });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/shipments/:id - Delete shipment
app.delete('/api/shipments/:id', (req, res) => {
  try {
    const trackingId = req.params.id;
    const stmt = db.prepare('DELETE FROM shipments WHERE id = ?');
    const result = stmt.run(trackingId);

    if (result.changes > 0) {
      res.json({ success: true, message: `Shipment ${trackingId} deleted.` });
    } else {
      res.status(404).json({ success: false, error: "Shipment not found" });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ------------------------------------
// 2. AUTHENTICATION & USERS REST API
// ------------------------------------

// POST /api/auth/login - Admin Staff Login
app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body;
    const user = db.prepare('SELECT * FROM admin_users WHERE username = ? AND password = ?').get(username, password);

    if (user) {
      const { password, ...userWithoutPassword } = user;
      res.json({ success: true, user: userWithoutPassword, token: `token_${user.id}_${Date.now()}` });
    } else {
      res.status(401).json({ success: false, error: "Invalid username or password" });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/users - List admin staff
app.get('/api/users', (req, res) => {
  try {
    const users = db.prepare('SELECT id, username, fullName, role, created_at FROM admin_users').all();
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/users - Create new admin staff user
app.post('/api/users', (req, res) => {
  try {
    const { username, password, fullName, role } = req.body;
    const stmt = db.prepare('INSERT INTO admin_users (username, password, fullName, role) VALUES (?, ?, ?, ?)');
    const result = stmt.run(username, password || 'shippulse2026', fullName, role || 'Operations Manager');

    const newUser = { id: result.lastInsertRowid, username, fullName, role: role || 'Operations Manager' };
    res.status(201).json({ success: true, data: newUser });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// DELETE /api/users/:id - Remove staff user
app.delete('/api/users/:id', (req, res) => {
  try {
    const userId = req.params.id;
    const stmt = db.prepare('DELETE FROM admin_users WHERE id = ?');
    stmt.run(userId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🚀 ShipPulse Production REST API Server running on port ${PORT}`);
  console.log(`   Database: server/shippulse.db (SQLite WAL Mode)`);
  console.log(`   Endpoints: http://localhost:${PORT}/api/shipments`);
  console.log(`=======================================================`);
});
