Render combined deployment (frontend + server)

This project is configured to deploy as a single Render Web Service that builds the frontend (Vite) and starts the Node server which serves the built SPA.

Key files
- render-build.sh — build script that installs root deps, builds the frontend into `./dist`, and installs server deps.
- render.yaml — Render service definition: a single `pofolio` Node web service that runs `bash ./render-build.sh` as the build command and `node server/index.js` as the start command.
- server/index.js — Express server; includes `/api/contact`, `/api/health`, and (optionally) serves static files from `./dist`.

Render service configuration (single combined service)
- Service type: Web Service
- Branch: main
- Build Command: bash ./render-build.sh
- Start Command: node server/index.js
- Root Directory: (leave empty — run from repo root)
- Health Check Path: /api/health

Environment variables (set in Render dashboard; do NOT commit these to git)
- SMTP_HOST = smtp.gmail.com
- SMTP_PORT = 465
- SMTP_SECURE = true
- SMTP_USER = your-email@gmail.com
- SMTP_PASS = <your-16-char-Gmail-App-Password-no-spaces>  (mark as secret)
- SMTP_FROM = "Creative Mind <your-email@gmail.com>"
- CONTACT_RECEIVER = your-receiving-email@example.com
- PORT = 4000 (optional; Render usually provides a port via env)

Optional frontend env (for client-side API calls; set in Static or Web service environment if needed)
- VITE_API_URL = https://<your-render-service>.onrender.com

Local testing
- Build frontend locally: npm install && npm run build
- Start server locally: cd server && npm install && PORT=4000 node index.js
- Or run both together (from repo root): npm install && npm run build && cd server && npm install && PORT=4000 node index.js

Notes and tips
- Use Gmail App Passwords for `SMTP_PASS` (16 characters, no spaces). If you accidentally copied with spaces, remove them.
- If your network blocks port 465, set SMTP_PORT=587 and SMTP_SECURE=false.
- The server serves the built frontend from `./dist`. Ensure the build completes successfully (Vite logs) during Render deploy.
- Keep secrets out of the repository. Use Render's environment variables/secret store.

Troubleshooting
- If you see `Cannot GET /` after deploy:
  - Check deploy logs for the `bash ./render-build.sh` output and confirm Vite build completed and `dist/index.html` was produced.
  - Check server logs for `Serving static frontend from` and for `Contact server running` messages.
  - Confirm Render’s start command is `node server/index.js`.

If you want, I can add a small README into `README.md` instead, or tailor this file into a deploy checklist for other providers (Netlify, Vercel, etc.).
