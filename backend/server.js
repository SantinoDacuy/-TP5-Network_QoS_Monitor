const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for mobile apps and web preview
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Client-Timestamp']
}));

// In-memory telemetry storage for synchronized measurements
const telemetryStore = [];

// 1. Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'Network QoS Reference Backend',
    version: '1.0.0',
    timestamp: Date.now(),
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage()
  });
});

// 2. High-precision low-overhead Ping Echo
app.get('/api/ping', (req, res) => {
  const clientTs = req.headers['x-client-timestamp'] || req.query.t;
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  res.json({
    pong: true,
    serverTimestamp: Date.now(),
    clientTimestamp: clientTs ? Number(clientTs) : null
  });
});

// 3. Download Throughput Test endpoint
// Generates uncompressible pseudo-random data of requested size
// Default: 5MB (5 * 1024 * 1024 bytes)
app.get('/api/download', (req, res) => {
  let sizeBytes = 5 * 1024 * 1024; // 5MB default

  if (req.query.size) {
    const raw = req.query.size.toString().toLowerCase();
    if (raw.endsWith('mb')) {
      sizeBytes = parseFloat(raw) * 1024 * 1024;
    } else if (raw.endsWith('kb')) {
      sizeBytes = parseFloat(raw) * 1024;
    } else {
      const parsed = parseInt(raw, 10);
      if (!isNaN(parsed) && parsed > 0) {
        sizeBytes = parsed;
      }
    }
  }

  // Safety caps: min 64KB, max 100MB
  sizeBytes = Math.max(64 * 1024, Math.min(sizeBytes, 100 * 1024 * 1024));

  res.set({
    'Content-Type': 'application/octet-stream',
    'Content-Length': sizeBytes,
    'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Content-Disposition': 'attachment; filename="qos_payload.bin"',
    'X-QoS-Payload-Bytes': sizeBytes
  });

  // Generate chunks with random entropy so network compression (gzip/brotli/modem) doesn't skew throughput
  const chunkSize = 64 * 1024; // 64KB chunk
  const sampleChunk = crypto.randomBytes(chunkSize);
  let bytesWritten = 0;

  function writeNext() {
    let ok = true;
    while (bytesWritten < sizeBytes && ok) {
      const remaining = sizeBytes - bytesWritten;
      const currentChunk = remaining >= chunkSize ? sampleChunk : sampleChunk.subarray(0, remaining);
      bytesWritten += currentChunk.length;

      if (bytesWritten >= sizeBytes) {
        res.end(currentChunk);
        return;
      } else {
        ok = res.write(currentChunk);
      }
    }

    if (bytesWritten < sizeBytes) {
      res.once('drain', writeNext);
    }
  }

  writeNext();
});

// 4. Upload Throughput Test endpoint
// Consumes raw octet stream without in-memory buffering to benchmark client uplink bandwidth
app.post('/api/upload', (req, res) => {
  const startTime = process.hrtime.bigint();
  let receivedBytes = 0;

  req.on('data', (chunk) => {
    receivedBytes += chunk.length;
  });

  req.on('end', () => {
    const endTime = process.hrtime.bigint();
    const durationMs = Number(endTime - startTime) / 1_000_000;
    const durationSec = durationMs / 1000;
    const mbps = durationSec > 0 ? (receivedBytes * 8) / (durationSec * 1_000_000) : 0;

    res.json({
      success: true,
      receivedBytes,
      durationMs: Math.round(durationMs * 100) / 100,
      serverMeasuredMbps: Math.round(mbps * 100) / 100,
      timestamp: Date.now()
    });
  });

  req.on('error', (err) => {
    res.status(500).json({ error: 'Stream error', details: err.message });
  });
});

// 5. Telemetry Sync Endpoint (RF-08 / Sync Layer)
app.use(express.json({ limit: '10mb' }));

app.post('/api/telemetry/sync', (req, res) => {
  const records = Array.isArray(req.body) ? req.body : [req.body];
  const validRecords = records.filter(r => r && r.timestamp && (r.networkType || r.downloadMbps || r.pingAvg));

  telemetryStore.push(...validRecords);

  res.json({
    synced: validRecords.length,
    totalRecords: telemetryStore.length,
    status: 'ok'
  });
});

// 6. Aggregate QoS Analytics
app.get('/api/telemetry/stats', (req, res) => {
  if (telemetryStore.length === 0) {
    return res.json({
      totalSamples: 0,
      message: 'No measurements registered yet.'
    });
  }

  const avgDownload = telemetryStore.reduce((acc, r) => acc + (r.downloadMbps || 0), 0) / telemetryStore.length;
  const avgUpload = telemetryStore.reduce((acc, r) => acc + (r.uploadMbps || 0), 0) / telemetryStore.length;
  const avgPing = telemetryStore.reduce((acc, r) => acc + (r.pingAvg || 0), 0) / telemetryStore.length;

  const byNetwork = {};
  telemetryStore.forEach(r => {
    const type = r.networkType || 'UNKNOWN';
    if (!byNetwork[type]) byNetwork[type] = { count: 0, avgDl: 0, avgUl: 0, avgPing: 0 };
    byNetwork[type].count++;
    byNetwork[type].avgDl += r.downloadMbps || 0;
    byNetwork[type].avgUl += r.uploadMbps || 0;
    byNetwork[type].avgPing += r.pingAvg || 0;
  });

  Object.keys(byNetwork).forEach(t => {
    const c = byNetwork[t].count;
    byNetwork[t].avgDl = Math.round((byNetwork[t].avgDl / c) * 100) / 100;
    byNetwork[t].avgUl = Math.round((byNetwork[t].avgUl / c) * 100) / 100;
    byNetwork[t].avgPing = Math.round((byNetwork[t].avgPing / c) * 100) / 100;
  });

  res.json({
    totalSamples: telemetryStore.length,
    overall: {
      avgDownloadMbps: Math.round(avgDownload * 100) / 100,
      avgUploadMbps: Math.round(avgUpload * 100) / 100,
      avgPingMs: Math.round(avgPing * 100) / 100
    },
    byNetworkType: byNetwork
  });
});

// 7. Get raw records for sync/export verification
app.get('/api/telemetry/records', (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 100;
  res.json({
    count: telemetryStore.length,
    records: telemetryStore.slice(-limit)
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(`🚀 Network QoS Reference Backend running on port ${PORT}`);
  console.log(`📡 Health:   http://localhost:${PORT}/api/health`);
  console.log(`⏱️ Ping:     http://localhost:${PORT}/api/ping`);
  console.log(`📥 Download: http://localhost:${PORT}/api/download?size=5mb`);
  console.log(`📤 Upload:   http://localhost:${PORT}/api/upload`);
  console.log(`📊 Stats:    http://localhost:${PORT}/api/telemetry/stats`);
  console.log(`====================================================`);
});
