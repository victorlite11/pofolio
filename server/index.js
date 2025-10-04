import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

// Load environment variables from server/.env (server runs from project root)
dotenv.config({ path: './server/.env' });

const app = express();
app.use(cors());
app.use(express.json());

// Helper to create a transporter given options
function createTransport(options) {
  return nodemailer.createTransport(options);
}

// Build primary transporter from env
let transporter = createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 465),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  logger: true,
});

// Configure SendGrid if API key is provided
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log('SendGrid configured via SENDGRID_API_KEY');
}

// If initial verify fails and port 465 was used, try 587 (STARTTLS) as a fallback
async function verifyWithFallback() {
  try {
    await transporter.verify();
    console.log('transporter ready (primary)');
    return;
  } catch (err) {
    console.warn('Primary transporter verify failed:', err && err.message);
    // Try fallback (587, secure=false -> use STARTTLS)
    const fallbackOpts = {
      host: process.env.SMTP_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      logger: true,
    };
    console.log('Attempting fallback to port 587 (STARTTLS)...');
    transporter = createTransport(fallbackOpts);
    try {
      await transporter.verify();
      console.log('transporter ready (fallback 587)');
    } catch (err2) {
      console.error('Both primary and fallback transporter.verify failed:', err2 && err2.message);
    }
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

    // Support both JSON body (no file) and multipart/form-data (with file)
    const body = req.body || {};
    const name = body.name;
    const email = body.email;
    const senderType = body.senderType || 'individual';
    const companyName = body.companyName || '';
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
      // If SendGrid is available use it (avoids SMTP timeouts from some hosts)
      if (process.env.SENDGRID_API_KEY) {
        const sgMsg = {
          to: mailOptions.to,
          from: mailOptions.from,
          subject: mailOptions.subject,
          html: mailOptions.html,
          replyTo: mailOptions.replyTo,
          attachments: [],
        };
        if (mailOptions.attachments && mailOptions.attachments.length) {
          for (const a of mailOptions.attachments) {
            try {
              const data = fs.readFileSync(a.path);
              sgMsg.attachments.push({
                content: data.toString('base64'),
                filename: a.filename,
                type: a.contentType || 'application/octet-stream',
                disposition: 'attachment',
              });
            } catch (e) {
              console.warn('Failed to read attachment for SendGrid', e && e.message);
            }
          }
        }
        const resp = await sgMail.send(sgMsg);
        console.log('SendGrid response', resp && resp[0] && resp[0].statusCode);
      } else {
        const info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
      }
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
