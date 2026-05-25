const express = require('express');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;

let requestCount = 0;

// ── Helper ────────────────────────────────────────────────────────────────────
function getLocalIP() {
  return Object.values(os.networkInterfaces())
    .flat()
    .find(i => i.family === 'IPv4' && !i.internal)?.address || 'unknown';
}

// ── Routes ────────────────────────────────────────────────────────────────────

// Browser UI
app.get('/', (req, res) => {
  requestCount++;
  const hostname = os.hostname();

  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Scaling Demo</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-950 text-white min-h-screen flex items-center justify-center p-8">

  <div class="bg-gray-900 border border-gray-700 rounded-2xl p-8 w-full max-w-md shadow-xl">

    <span class="text-xs font-semibold uppercase tracking-widest text-indigo-400">
      🟢 Live Container
    </span>

    <h1 class="text-3xl font-black mt-2 text-indigo-400 break-all">${hostname}</h1>
    <p class="text-gray-500 text-sm mb-6">You are talking to this container instance</p>

    <div class="grid grid-cols-2 gap-3 mb-4">
      <div class="bg-gray-800 rounded-xl p-3">
        <p class="text-xs text-gray-500 uppercase">Container ID</p>
        <p class="font-mono text-sm text-white">${hostname}</p>
      </div>
      <div class="bg-gray-800 rounded-xl p-3">
        <p class="text-xs text-gray-500 uppercase">Internal IP</p>
        <p class="font-mono text-sm text-white">${getLocalIP()}</p>
      </div>
      <div class="bg-gray-800 rounded-xl p-3">
        <p class="text-xs text-gray-500 uppercase">Port</p>
        <p class="font-mono text-sm text-white">${PORT}</p>
      </div>
      <div class="bg-gray-800 rounded-xl p-3">
        <p class="text-xs text-gray-500 uppercase">Requests Served</p>
        <p class="font-mono text-sm text-indigo-300 font-bold">${requestCount}</p>
      </div>
    </div>

    <p class="text-gray-500 text-xs mb-4">
      Refresh the page — NGINX will round-robin to a different container each time.
    </p>

    <button onclick="location.reload()"
      class="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 rounded-xl transition">
      ↻ Refresh — Hit Another Container
    </button>

  </div>

</body>
</html>
  `);
});

// JSON endpoint — test with curl or fetch
app.get('/api/info', (req, res) => {
  requestCount++;
  res.json({
    hostname: os.hostname(),
    ip: getLocalIP(),
    port: PORT,
    requestCount,
    uptime: process.uptime().toFixed(1) + 's',
    timestamp: new Date().toISOString(),
  });
});

// Health check — used by NGINX / orchestrators
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', hostname: os.hostname() });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[${os.hostname()}] Listening on port ${PORT}`);
});
