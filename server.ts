import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("medai.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    name TEXT
  );

  CREATE TABLE IF NOT EXISTS diagnoses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    date TEXT DEFAULT CURRENT_TIMESTAMP,
    symptoms TEXT,
    summary TEXT,
    urgency TEXT,
    results_json TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS verification_feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    diagnosis_id INTEGER NOT NULL,
    condition_name TEXT NOT NULL,
    doctor_id INTEGER NOT NULL,
    feedback TEXT CHECK(feedback IN ('Agree', 'Correct')),
    correction TEXT,
    date TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (diagnosis_id) REFERENCES diagnoses(id),
    FOREIGN KEY (doctor_id) REFERENCES users(id)
  );
`);

// Migration: Add urgency column if it doesn't exist
const tableInfo = db.prepare("PRAGMA table_info(diagnoses)").all() as any[];
const hasUrgency = tableInfo.some(column => column.name === 'urgency');
if (!hasUrgency) {
  db.exec("ALTER TABLE diagnoses ADD COLUMN urgency TEXT DEFAULT 'Routine'");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/auth/login", (req, res) => {
    const { email, name } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    let user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
    if (!user) {
      const result = db.prepare("INSERT INTO users (email, name) VALUES (?, ?)").run(email, name || "");
      user = { id: result.lastInsertRowid, email, name };
    }
    res.json(user);
  });

  app.get("/api/diagnoses", (req, res) => {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ error: "User ID is required" });

    const diagnoses = db.prepare("SELECT * FROM diagnoses WHERE user_id = ? ORDER BY date DESC").all(userId);
    res.json(diagnoses);
  });

  app.get("/api/triage", (req, res) => {
    const diagnoses = db.prepare(`
      SELECT d.*, u.name as patient_name, u.email as patient_email 
      FROM diagnoses d 
      JOIN users u ON d.user_id = u.id 
      ORDER BY 
        CASE urgency 
          WHEN 'Emergency' THEN 1 
          WHEN 'Urgent' THEN 2 
          WHEN 'Routine' THEN 3 
          ELSE 4 
        END, 
        date DESC
    `).all();
    res.json(diagnoses);
  });

  app.post("/api/diagnoses", (req, res) => {
    const { userId, symptoms, summary, results, urgency } = req.body;
    if (!userId) return res.status(400).json({ error: "User ID is required" });

    const result = db.prepare(`
      INSERT INTO diagnoses (user_id, symptoms, summary, results_json, urgency)
      VALUES (?, ?, ?, ?, ?)
    `).run(userId, JSON.stringify(symptoms), summary, JSON.stringify(results), urgency || 'Routine');

    res.json({ id: result.lastInsertRowid });
  });

  app.post("/api/verify", (req, res) => {
    const { diagnosisId, conditionName, doctorId, feedback, correction } = req.body;
    if (!diagnosisId || !doctorId || !feedback) return res.status(400).json({ error: "Missing required fields" });

    db.prepare(`
      INSERT INTO verification_feedback (diagnosis_id, condition_name, doctor_id, feedback, correction)
      VALUES (?, ?, ?, ?, ?)
    `).run(diagnosisId, conditionName, doctorId, feedback, correction || null);

    res.json({ success: true });
  });

  app.get("/api/confidence", (req, res) => {
    const stats = db.prepare(`
      SELECT 
        condition_name,
        COUNT(*) as total_reviews,
        SUM(CASE WHEN feedback = 'Agree' THEN 1 ELSE 0 END) as agreements
      FROM verification_feedback
      GROUP BY condition_name
    `).all();
    res.json(stats);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
