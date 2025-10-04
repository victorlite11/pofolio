import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import dns from 'dns/promises';

// Load environment variables from server/.env (server runs from project root)
dotenv.config({ path: './server/.env' });

const app = express();
app.use(cors());
app.use(express.json());

// Helper to create a transporter given options
function createTransport(options) {
  return nodemailer.createTransport(options);
}

// Build primary transporter from env with configurable timeouts
const SMTP_TIMEOUT_MS = Number(process.env.SMTP_TIMEOUT_MS || 120000); // default 120s for Render
function buildSmtpOptions(override = {}) {
  // Prefer STARTTLS (port 587) by default in cloud environments like Render
  return {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    // If SMTP_SECURE is explicitly set to 'true' we'll use SMTPS (465); otherwise prefer STARTTLS
    secure: process.env.SMTP_SECURE === 'true',
    // Force IPv4 where possible — some cloud hosts have flaky IPv6 routing
    family: 4,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    logger: true,
    connectionTimeout: SMTP_TIMEOUT_MS,
    greetingTimeout: SMTP_TIMEOUT_MS,
    socketTimeout: SMTP_TIMEOUT_MS,
    ...override,
  };
}

// Create transporter instance (may be re-assigned during fallback)
let transporter = createTransport(buildSmtpOptions());


// If initial verify fails and port 465 was used, try 587 (STARTTLS) as a fallback
async function verifyWithFallback() {
  // Try primary then fallback with a small retry/backoff
  const attemptVerify = async (opts, label) => {
    const maxAttempts = 2;
    for (let i = 1; i <= maxAttempts; i++) {
      try {
        console.log(`Verifying transporter (${label}) host=${opts.host} port=${opts.port} secure=${opts.secure}`);
        try {
          const resolved = await dns.lookup(opts.host, { all: true });
          console.log(`Resolved ${opts.host} ->`, resolved.map((r) => r.address).slice(0, 4));
        } catch (e) {
          console.warn('DNS lookup failed for', opts.host, e && e.message);
        }
        transporter = createTransport(opts);
        await transporter.verify();
        console.log(`transporter ready (${label})`);
        return true;
      } catch (err) {
        console.warn(`${label} transporter verify attempt ${i} failed:`, err && err.message);
        if (i < maxAttempts) {
          // backoff
          await new Promise((r) => setTimeout(r, 1000 * i));
        }
      }
    }
    return false;
  };

  const primaryOk = await attemptVerify(buildSmtpOptions(), 'primary');
  if (primaryOk) return;

  console.log('Primary transporter verify failed. Attempting fallback to port 465 (SMTPS) with IPv4-only...');
  const fallbackOpts = buildSmtpOptions({ port: 465, secure: true, family: 4 });
  const fallbackOk = await attemptVerify(fallbackOpts, 'fallback 465');
  if (!fallbackOk) {
    console.error('Both primary and fallback transporter.verify failed: see earlier logs for details');
  }
}

// Log SMTP configuration (redact password) and verify transporter connectivity
console.log('SMTP config:', {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE,
  user: process.env.SMTP_USER ? process.env.SMTP_USER.replace(/.(?=.{4})/g, '*') : undefined,
});

// Run verify with fallback logic
verifyWithFallback();

// Configure multer for optional file uploads with validation
const MAX_FILE_SIZE = Number(process.env.MAX_ATTACHMENT_SIZE || 5 * 1024 * 1024); // default 5MB
const ALLOWED_MIME = (process.env.ALLOWED_MIME_TYPES || 'image/png,image/jpeg,image/webp,application/pdf').split(',');

const uploadDir = path.join(process.cwd(), 'server', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, uploadDir); },
  filename: function (req, file, cb) { cb(null, Date.now() + '-' + (file.originalname || file.fieldname)); }
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (!file || !file.mimetype) return cb(null, false);
    if (ALLOWED_MIME.includes(file.mimetype)) return cb(null, true);
    const err = new Error('Invalid file type');
    // @ts-ignore - set custom code for easier detection
    err.code = 'INVALID_FILE_TYPE';
    return cb(err);
  }
});

// Accept form-data with optional file under field 'attachment'.
// Use the upload middleware's callback style to capture multer errors.
app.post('/api/contact', (req, res) => {
  upload.single('attachment')(req, res, async function (err) {
    if (err) {
      // Multer errors
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: `Attachment too large. Max size is ${Math.round(MAX_FILE_SIZE / 1024 / 1024)} MB.` });
      }
      if (err.code === 'INVALID_FILE_TYPE') {
        return res.status(400).json({ error: 'Invalid attachment type. Allowed: ' + ALLOWED_MIME.join(', ') });
      }
      console.error('Upload error', err);
      return res.status(400).json({ error: err.message || 'Upload failed' });
    }
    const body = req.body || {};
    const { name, email, senderType = 'individual', companyName } = body;
    const position = body.position || '';
    const message = body.message || '';

    if (!name || !email || !message) return res.status(400).json({ error: 'Missing required fields' });

    const subject = `[Website Contact] ${senderType === 'individual' ? name : `${companyName || ''} - ${position || ''}`}`.trim();
    const html = `
      <h2>New contact message</h2>
      <p><strong>From:</strong> ${name} (${email})</p>
      <p><strong>Sender Type:</strong> ${senderType}</p>
      ${companyName ? `<p><strong>Company:</strong> ${companyName}</p>` : ''}
      ${position ? `<p><strong>Position:</strong> ${position}</p>` : ''}
      <hr />
      <div>${message.replace(/\n/g, '<br/>')}</div>
    `;

    // build mail options
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.CONTACT_RECEIVER || process.env.SMTP_USER,
      subject,
      html,
      replyTo: email,
      attachments: [],
    };

    // If there is an uploaded file, attach it
    if (req.file) {
      mailOptions.attachments.push({
        filename: req.file.originalname || req.file.filename,
        path: req.file.path,
      });
    }

    try {
      // send with Nodemailer but with retry/backoff
      const sendWithRetries = async (mailOpts) => {
        const maxAttempts = Number(process.env.SMTP_MAX_ATTEMPTS || 3);
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
          try {
            console.log(`Attempting send via SMTP host=${transporter.options && transporter.options.host} port=${transporter.options && transporter.options.port}`);
            const info = await transporter.sendMail(mailOpts);
            console.log('Message sent: %s', info.messageId || (info && info.response));
            return info;
          } catch (err) {
            console.warn(`sendMail attempt ${attempt} failed:`, err && err.message);
            if (attempt < maxAttempts) {
              const backoff = 500 * Math.pow(2, attempt); // exponential backoff
              await new Promise((r) => setTimeout(r, backoff));
            } else {
              throw err;
            }
          }
        }
      };
      const info = await sendWithRetries(mailOptions);
      // If file was uploaded, remove it after sending to keep uploads folder clean
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.warn('Failed to remove uploaded file:', err && err.message);
        });
      }
      res.json({ ok: true, message: 'Message sent' });
    } catch (err2) {
      console.error('sendMail error', err2 && (err2.stack || err2));
      res.status(500).json({ error: `Failed to send message: ${err2 && err2.message ? err2.message : 'unknown error'}` });
    }
  });
});

// Health check endpoint for Render and monitoring
app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// Transport health endpoint: runs transporter.verify() and returns result
app.get('/api/transport-status', async (req, res) => {
  try {
    const opts = transporter && transporter.options ? transporter.options : buildSmtpOptions();
    try {
      const resolved = await dns.lookup(opts.host, { all: true });
      console.log('Transport-status DNS:', resolved.map((r) => r.address).slice(0, 4));
    } catch (e) {
      console.warn('Transport-status DNS lookup failed for', opts.host);
    }
    await transporter.verify();
    return res.json({ ok: true, host: opts.host, port: opts.port, secure: opts.secure });
  } catch (err) {
    console.error('transport-status verify failed', err && err.message);
    return res.status(503).json({ ok: false, error: err && err.message });
  }
});

// Try several likely locations for a built frontend (depending on Render's working directory)
const candidates = [
  path.join(process.cwd(), 'dist'), // when running from repo root
  path.join(process.cwd(), '..', 'dist'), // when running from server/ (repo root is parent)
  path.join(process.cwd(), 'server', 'dist'), // in case build placed dist under server/
];

console.log('process.cwd() ->', process.cwd());
let distPath = null;
for (const c of candidates) {
  console.log('Checking for dist at', c, 'exists?', fs.existsSync(c));
  if (fs.existsSync(c)) {
    distPath = c;
    break;
  }
}

if (distPath) {
  try {
    const files = fs.readdirSync(distPath).slice(0, 20);
    console.log('Found dist at', distPath, 'contents (first 20):', files);
  } catch (e) {
    console.warn('Failed to read dist contents:', e && e.message);
  }
  console.log('Serving static frontend from', distPath);
  app.use(express.static(distPath));
  // Fallback to index.html for SPA routing
  app.get('*', (req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  console.log('No dist folder found in any candidate location; root requests will 404 until dist is produced.');
}

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Contact server running on http://localhost:${port}`));
