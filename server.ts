import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import { Server } from "socket.io";
import http from "http";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = "medai.db";
const JWT_SECRET = process.env.JWT_SECRET || "medai-secret-key-2026";

function initDb() {
  let db: Database.Database;
  try {
    db = new Database(DB_PATH);
    // Test the database
    db.prepare("SELECT 1").get();
  } catch (err: any) {
    if (err.code === 'SQLITE_CORRUPT') {
      console.error("Database is corrupted. Deleting and recreating...");
      try {
        fs.unlinkSync(DB_PATH);
      } catch (unlinkErr) {
        console.error("Failed to delete corrupted database:", unlinkErr);
      }
      db = new Database(DB_PATH);
    } else {
      throw err;
    }
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      password TEXT,
      role TEXT DEFAULT 'patient'
    );

    CREATE TABLE IF NOT EXISTS diagnoses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      date TEXT DEFAULT CURRENT_TIMESTAMP,
      symptoms TEXT,
      summary TEXT,
      urgency TEXT,
      results_json TEXT,
      files TEXT DEFAULT '[]',
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

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      date TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // Migration: Add password column if it doesn't exist
  const userTableInfo = db.prepare("PRAGMA table_info(users)").all() as any[];
  const hasPassword = userTableInfo.some(column => column.name === 'password');
  if (!hasPassword) {
    db.exec("ALTER TABLE users ADD COLUMN password TEXT");
  }

  // Migration: Add role column if it doesn't exist
  const hasRole = userTableInfo.some(column => column.name === 'role');
  if (!hasRole) {
    db.exec("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'patient'");
  }

  // Migration: Add urgency column if it doesn't exist
  const diagnosesTableInfo = db.prepare("PRAGMA table_info(diagnoses)").all() as any[];
  const hasUrgency = diagnosesTableInfo.some(column => column.name === 'urgency');
  if (!hasUrgency) {
    db.exec("ALTER TABLE diagnoses ADD COLUMN urgency TEXT DEFAULT 'Routine'");
  }

  // Migration: Add files column if it doesn't exist
  const hasFiles = diagnosesTableInfo.some(column => column.name === 'files');
  if (!hasFiles) {
    db.exec("ALTER TABLE diagnoses ADD COLUMN files TEXT DEFAULT '[]'");
  }

  // Migration: Lowercase all existing emails for consistency
  db.exec("UPDATE users SET email = LOWER(TRIM(email))");
  
  // Seed/Reset demo user
  const demoEmail = "demo@example.com";
  const hashedDemoPassword = bcrypt.hashSync("password123", 10);
  const demoUser = db.prepare("SELECT * FROM users WHERE email = ?").get(demoEmail) as any;
  
  if (!demoUser) {
    db.prepare("INSERT INTO users (email, name, password, role) VALUES (?, ?, ?, ?)").run(demoEmail, "Demo User", hashedDemoPassword, "patient");
    console.log("Demo user created: demo@example.com / password123");
  } else {
    // Always reset demo password to ensure it works
    db.prepare("UPDATE users SET password = ? WHERE email = ?").run(hashedDemoPassword, demoEmail);
    console.log("Demo user password reset to default");
  }

  // Seed/Reset doctor user
  const doctorEmail = "doctor@medai.local";
  const hashedDoctorPassword = bcrypt.hashSync("doctor123", 10);
  const doctorUser = db.prepare("SELECT * FROM users WHERE email = ?").get(doctorEmail) as any;
  if (!doctorUser) {
    db.prepare("INSERT INTO users (email, name, password, role) VALUES (?, ?, ?, ?)").run(doctorEmail, "Dr. Smith", hashedDoctorPassword, "doctor");
    console.log("Doctor user created: doctor@medai.local / doctor123");
  }

  return db;
}

  const db = initDb();

  // Configure Multer for file uploads
  const UPLOADS_DIR = path.join(__dirname, "uploads");
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  });

  const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
  });

  async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));

  // Socket.io connection
  io.on("connection", (socket) => {
    socket.on("join", (userId) => {
      socket.join(`user_${userId}`);
    });
  });

  const sendNotification = (userId: number, title: string, message: string, type: string) => {
    const result = db.prepare(`
      INSERT INTO notifications (user_id, title, message, type)
      VALUES (?, ?, ?, ?)
    `).run(userId, title, message, type);
    
    const notification = {
      id: result.lastInsertRowid,
      user_id: userId,
      title,
      message,
      type,
      is_read: 0,
      date: new Date().toISOString()
    };

    io.to(`user_${userId}`).emit("notification", notification);
  };

  // Middlewares
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: "Access denied. Token missing." });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: "Invalid or expired token." });
      req.user = user;
      next();
    });
  };

  const authorizeRole = (roles: string[]) => {
    return (req: any, res: any, next: any) => {
      if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ error: "Access denied. Insufficient permissions." });
      }
      next();
    };
  };

  // API Routes
  app.get("/api/health", (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    res.json({ 
      status: "ok", 
      geminiConfigured: !!apiKey,
      geminiKeyStart: apiKey ? apiKey.substring(0, 4) : "none",
      nodeEnv: process.env.NODE_ENV
    });
  });

  app.post("/api/auth/reset-demo", async (req, res) => {
    const demoEmail = "demo@example.com";
    const hashedDemoPassword = await bcrypt.hash("password123", 10);
    const demoUser = db.prepare("SELECT * FROM users WHERE email = ?").get(demoEmail) as any;
    
    if (!demoUser) {
      db.prepare("INSERT INTO users (email, name, password) VALUES (?, ?, ?)").run(demoEmail, "Demo User", hashedDemoPassword);
    } else {
      db.prepare("UPDATE users SET password = ? WHERE email = ?").run(hashedDemoPassword, demoEmail);
    }
    res.json({ success: true });
  });

  app.post("/api/auth/register", async (req, res) => {
    const { email: rawEmail, name, password, role } = req.body;
    if (!rawEmail || !password) return res.status(400).json({ error: "Email and password are required" });

    const email = rawEmail.trim().toLowerCase();
    const existingUser = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role === 'doctor' ? 'doctor' : 'patient';

    if (existingUser) {
      if (existingUser.password) {
        return res.status(400).json({ error: "Email already exists" });
      } else {
        // Legacy user without password, update it
        db.prepare("UPDATE users SET name = ?, password = ?, role = ? WHERE email = ?").run(name || existingUser.name || "", hashedPassword, userRole, email);
        const user = { id: existingUser.id, email, name: name || existingUser.name, role: userRole };
        const token = jwt.sign(user, JWT_SECRET, { expiresIn: '24h' });
        return res.json({ ...user, token });
      }
    }

    const result = db.prepare("INSERT INTO users (email, name, password, role) VALUES (?, ?, ?, ?)").run(email, name || "", hashedPassword, userRole);
    const user = { id: result.lastInsertRowid, email, name, role: userRole };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '24h' });
    res.json({ ...user, token });
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email: rawEmail, password } = req.body;
    if (!rawEmail || !password) return res.status(400).json({ error: "Email and password are required" });

    const email = rawEmail.trim().toLowerCase();
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
    
    if (!user) {
      console.log(`Login failed: User not found for email: ${email}`);
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (!user.password) {
      console.log(`Login failed: User ${email} has no password set`);
      return res.status(401).json({ error: "Account needs password setup. Please register again." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`Login failed: Password mismatch for user: ${email}`);
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const { password: _, ...userWithoutPassword } = user;
    const token = jwt.sign(userWithoutPassword, JWT_SECRET, { expiresIn: '24h' });
    res.json({ ...userWithoutPassword, token });
  });

  app.post("/api/auth/guest", async (req, res) => {
    const guestId = Math.floor(Math.random() * 1000000);
    const email = `guest_${guestId}@medai.local`;
    const name = `Guest User ${guestId}`;
    const password = "guest_password_123";
    const hashedPassword = await bcrypt.hash(password, 10);
    const role = 'patient';

    try {
      const result = db.prepare("INSERT INTO users (email, name, password, role) VALUES (?, ?, ?, ?)").run(email, name, hashedPassword, role);
      const user = { id: result.lastInsertRowid, email, name, role };
      const token = jwt.sign(user, JWT_SECRET, { expiresIn: '24h' });
      res.json({ ...user, token });
    } catch (err) {
      console.error("Guest creation failed:", err);
      res.status(500).json({ error: "Failed to create guest account" });
    }
  });

  app.get("/api/diagnoses", authenticateToken, (req: any, res) => {
    const userId = req.user.id;
    const { search, urgency, startDate, endDate } = req.query;
    
    let query = "SELECT * FROM diagnoses WHERE user_id = ?";
    const params: any[] = [userId];

    if (search) {
      query += " AND (summary LIKE ? OR symptoms LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    if (urgency) {
      query += " AND urgency = ?";
      params.push(urgency);
    }

    if (startDate) {
      query += " AND date >= ?";
      params.push(startDate);
    }

    if (endDate) {
      query += " AND date <= ?";
      params.push(endDate);
    }

    query += " ORDER BY date DESC";
    
    const diagnoses = db.prepare(query).all(...params);
    res.json(diagnoses);
  });

  app.get("/api/triage", authenticateToken, authorizeRole(['doctor']), (req, res) => {
    const { patientName, urgency, condition, startDate, endDate } = req.query;

    let query = `
      SELECT d.*, u.name as patient_name, u.email as patient_email 
      FROM diagnoses d 
      JOIN users u ON d.user_id = u.id 
      WHERE 1=1
    `;
    const params: any[] = [];

    if (patientName) {
      query += " AND u.name LIKE ?";
      params.push(`%${patientName}%`);
    }

    if (urgency) {
      query += " AND d.urgency = ?";
      params.push(urgency);
    }

    if (condition) {
      query += " AND (d.summary LIKE ? OR d.results_json LIKE ?)";
      params.push(`%${condition}%`, `%${condition}%`);
    }

    if (startDate) {
      query += " AND d.date >= ?";
      params.push(startDate);
    }

    if (endDate) {
      query += " AND d.date <= ?";
      params.push(endDate);
    }

    query += `
      ORDER BY 
        CASE urgency 
          WHEN 'Emergency' THEN 1 
          WHEN 'Urgent' THEN 2 
          WHEN 'Routine' THEN 3 
          ELSE 4 
        END, 
        date DESC
    `;

    const diagnoses = db.prepare(query).all(...params);
    res.json(diagnoses);
  });

  app.post("/api/diagnoses", authenticateToken, (req: any, res) => {
    const userId = req.user.id;
    const { symptoms, summary, results, urgency } = req.body;

    const result = db.prepare(`
      INSERT INTO diagnoses (user_id, symptoms, summary, results_json, urgency)
      VALUES (?, ?, ?, ?, ?)
    `).run(userId, JSON.stringify(symptoms), summary, JSON.stringify(results), urgency || 'Routine');

    sendNotification(userId, "Analysis Complete", `Your diagnostic analysis for "${summary}" is ready.`, "diagnosis_complete");

    res.json({ id: result.lastInsertRowid });
  });

  app.put("/api/diagnoses/:id", authenticateToken, (req: any, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    const { symptoms, summary, results, urgency, files } = req.body;

    const diagnosis = db.prepare("SELECT * FROM diagnoses WHERE id = ?").get(id) as any;
    if (!diagnosis) return res.status(404).json({ error: "Diagnosis not found" });
    if (diagnosis.user_id !== userId) return res.status(403).json({ error: "Unauthorized" });

    db.prepare(`
      UPDATE diagnoses 
      SET symptoms = ?, summary = ?, results_json = ?, urgency = ?, files = ?
      WHERE id = ?
    `).run(
      JSON.stringify(symptoms), 
      summary, 
      JSON.stringify(results), 
      urgency, 
      JSON.stringify(files || []), 
      id
    );

    res.json({ success: true });
  });

  app.delete("/api/diagnoses/:id", authenticateToken, (req: any, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    const diagnosis = db.prepare("SELECT * FROM diagnoses WHERE id = ?").get(id) as any;
    if (!diagnosis) return res.status(404).json({ error: "Diagnosis not found" });
    if (diagnosis.user_id !== userId) return res.status(403).json({ error: "Unauthorized" });

    // Delete associated files if needed (optional, but good practice)
    try {
      const files = JSON.parse(diagnosis.files || '[]');
      files.forEach((file: any) => {
        const filePath = path.join(__dirname, file.path);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    } catch (err) {
      console.error("Failed to delete files for diagnosis:", err);
    }

    db.prepare("DELETE FROM diagnoses WHERE id = ?").run(id);
    res.json({ success: true });
  });

  app.post("/api/upload", authenticateToken, upload.array("files", 5), (req: any, res) => {
    const files = (req.files as Express.Multer.File[]).map(file => ({
      name: file.originalname,
      path: `/uploads/${file.filename}`,
      size: file.size,
      type: file.mimetype
    }));
    res.json({ files });
  });

  app.post("/api/verify", authenticateToken, authorizeRole(['doctor']), (req: any, res) => {
    const { diagnosisId, conditionName, feedback, correction } = req.body;
    const doctorId = req.user.id;
    if (!diagnosisId || !feedback) return res.status(400).json({ error: "Missing required fields" });

    db.prepare(`
      INSERT INTO verification_feedback (diagnosis_id, condition_name, doctor_id, feedback, correction)
      VALUES (?, ?, ?, ?, ?)
    `).run(diagnosisId, conditionName, doctorId, feedback, correction || null);

    // Notify the patient
    const diagnosis = db.prepare("SELECT user_id, summary FROM diagnoses WHERE id = ?").get(diagnosisId) as any;
    if (diagnosis) {
      sendNotification(
        diagnosis.user_id, 
        "Doctor Review", 
        `A doctor has reviewed your diagnosis for "${diagnosis.summary}".`, 
        "doctor_review"
      );
    }

    res.json({ success: true });
  });

  app.get("/api/confidence", authenticateToken, authorizeRole(['doctor']), (req, res) => {
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

  app.get("/api/notifications", authenticateToken, (req: any, res) => {
    const userId = req.user.id;
    const notifications = db.prepare(`
      SELECT * FROM notifications 
      WHERE user_id = ? 
      ORDER BY date DESC 
      LIMIT 50
    `).all(userId);
    res.json(notifications);
  });

  app.post("/api/notifications/:id/read", authenticateToken, (req: any, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    
    db.prepare(`
      UPDATE notifications 
      SET is_read = 1 
      WHERE id = ? AND user_id = ?
    `).run(id, userId);
    
    res.json({ success: true });
  });

  app.post("/api/notifications/read-all", authenticateToken, (req: any, res) => {
    const userId = req.user.id;
    db.prepare(`
      UPDATE notifications 
      SET is_read = 1 
      WHERE user_id = ?
    `).run(userId);
    res.json({ success: true });
  });

  // 404 Handler for API
  app.use("/api/*", (req, res) => {
    res.status(404).json({ error: "API endpoint not found" });
  });

  // Global Error Handler
  app.use((err: any, req: any, res: any, next: any) => {
    console.error("Server Error:", err);
    if (req.path.startsWith("/api/")) {
      res.status(500).json({ error: "Internal server error" });
    } else {
      next(err);
    }
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
