require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { nanoid } = require('nanoid');
const sqlite3 = require('sqlite3').verbose();

const PORT = process.env.PORT || 4000;
const API_KEY = process.env.API_KEY || 'dev-key';
const ADMIN_PASS = process.env.ADMIN_PASS || 'adminpass';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret';
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const DB_PATH = path.join(__dirname, 'projects.db');
const seedPath = path.join(__dirname, '..', 'public', 'data', 'projects.json');

const db = new sqlite3.Database(DB_PATH);

function initDb() {
  db.serialize(() => {
    db.run(
      `CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT,
        description TEXT,
        category TEXT,
        technologies TEXT,
        codeSnippet TEXT,
        image TEXT,
        liveUrl TEXT,
        repoUrl TEXT,
        featured INTEGER DEFAULT 0
      )`
    );

    // Seed if empty
    db.get('SELECT COUNT(1) as c FROM projects', (err, row) => {
      if (err) return console.error(err);
      if (row.c === 0) {
        try {
          const raw = fs.readFileSync(seedPath, 'utf-8');
          const items = JSON.parse(raw);
          const stmt = db.prepare('INSERT INTO projects (id,name,description,category,technologies,codeSnippet,image,liveUrl,repoUrl,featured) VALUES (?,?,?,?,?,?,?,?,?,?)');
          items.forEach((it) => {
            stmt.run(it.id || nanoid(), it.name, it.description, it.category, JSON.stringify(it.technologies || []), it.codeSnippet || '', it.image || null, it.liveUrl || null, it.repoUrl || null, it.featured ? 1 : 0);
          });
          stmt.finalize();
          console.log('DB seeded from projects.json');
        } catch (e) {
          console.warn('Failed to seed DB:', e.message);
        }
      }
    });
  });
}

function requireApiKeyOrToken(req, res, next) {
  const key = req.headers['x-api-key'] || req.query.apiKey;
  if (key && key === API_KEY) return next();

  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    const token = auth.split(' ')[1];
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      req.user = payload;
      return next();
    } catch (e) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  }

  return res.status(401).json({ error: 'Unauthorized' });
}

// Simple login to get a JWT. POST { password }
app.post('/api/login', (req, res) => {
  const { password } = req.body;
  if (!password || password !== ADMIN_PASS) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '12h' });
  res.json({ token });
});

app.get('/api/projects', (req, res) => {
  db.all('SELECT * FROM projects ORDER BY name', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const parsed = rows.map((r) => ({ ...r, technologies: JSON.parse(r.technologies || '[]') }));
    res.json(parsed);
  });
});

app.post('/api/projects', requireApiKeyOrToken, (req, res) => {
  const { name, description, category, technologies, codeSnippet, image, liveUrl, repoUrl, featured } = req.body;
  const id = nanoid();
  const tech = JSON.stringify(technologies || []);
  db.run(
    'INSERT INTO projects (id,name,description,category,technologies,codeSnippet,image,liveUrl,repoUrl,featured) VALUES (?,?,?,?,?,?,?,?,?,?)',
    [id, name, description, category, tech, codeSnippet || '', image || null, liveUrl || null, repoUrl || null, featured ? 1 : 0],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id });
    }
  );
});

app.put('/api/projects/:id', requireApiKeyOrToken, (req, res) => {
  const id = req.params.id;
  const { name, description, category, technologies, codeSnippet, image, liveUrl, repoUrl, featured } = req.body;
  const tech = JSON.stringify(technologies || []);
  db.run(
    'UPDATE projects SET name=?,description=?,category=?,technologies=?,codeSnippet=?,image=?,liveUrl=?,repoUrl=?,featured=? WHERE id=?',
    [name, description, category, tech, codeSnippet || '', image || null, liveUrl || null, repoUrl || null, featured ? 1 : 0, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Not found' });
      res.json({ updated: true });
    }
  );
});

app.delete('/api/projects/:id', requireApiKeyOrToken, (req, res) => {
  const id = req.params.id;
  db.run('DELETE FROM projects WHERE id=?', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes > 0 });
  });
});

// open endpoint to check health
app.get('/api/health', (req, res) => res.json({ ok: true }));

// serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// multer upload endpoint
const multer = require('multer');
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

app.post('/api/upload', requireApiKeyOrToken, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const url = `/uploads/${req.file.filename}`;
  res.json({ url });
});

// Contact form endpoint - accepts { name, email, phone, message }
const nodemailer = require('nodemailer');

app.post('/api/contact', async (req, res) => {
  const { name, email, phone, message } = req.body || {};
  if (!name || !email || !message) return res.status(400).json({ error: 'Missing required fields' });

  const mailBody = `New contact message from portfolio:\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\n\nMessage:\n${message}`;

  // If SMTP config available, send email; otherwise log and return success (useful for dev)
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const toAddress = process.env.CONTACT_TO || 'creativemindtechnology33@gmail.com';

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user: smtpUser, pass: smtpPass },
      });

      await transporter.sendMail({
        from: `Portfolio Contact <${smtpUser}>`,
        to: toAddress,
        subject: `New message from ${name} via portfolio`,
        text: mailBody,
      });

      return res.json({ ok: true, sent: true });
    } catch (err) {
      console.error('Failed to send email:', err);
      return res.status(500).json({ error: 'Failed to send email' });
    }
  }

  // No SMTP configured — fallback: log message and respond success
  console.log('CONTACT MESSAGE (SMTP not configured):', { name, email, phone, message });
  return res.json({ ok: true, sent: false, note: 'SMTP not configured; message logged on server' });
});

initDb();

app.listen(PORT, () => console.log(`Server listening on ${PORT} (API_KEY=${API_KEY ? 'set' : 'not-set'})`));
