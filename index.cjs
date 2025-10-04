// CommonJS bootstrap for environments that run `node index.cjs` by default.
// Dynamically import the ESM server entry so the main server (server/index.js)
// which uses ES modules can run correctly.
(async function () {
  try {
    // Use dynamic import so this CJS file can load the ESM module
    await import('./server/index.js');
  } catch (err) {
    console.error('Failed to start server via index.cjs:', err && (err.stack || err));
    process.exit(1);
  }
})();
