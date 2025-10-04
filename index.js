// Minimal root entry that forwards to the actual server entrypoint.
// Render appears to try `node index.js` by default — this file ensures
// the correct server file runs without changing Render settings.
import './server/index.js';

// Nothing else to do here — the real server listens in server/index.js
