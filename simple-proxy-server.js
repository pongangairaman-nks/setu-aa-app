const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 3001;

// Enable CORS for all routes
app.use(cors({
  origin: 'http://localhost:8081', // Your frontend URL
  credentials: false
}));

// Parse JSON bodies
app.use(express.json());

// Proxy middleware for Setu API
const setuProxy = createProxyMiddleware({
  target: 'https://fiu-sandbox.setu.co',
  changeOrigin: true,
  pathRewrite: {
    '^/api/setu-proxy': '', // Remove /api/setu-proxy prefix
  },
  onProxyReq: (proxyReq, req, res) => {
    // Log the request
    console.log(`🔄 Proxying request to: ${proxyReq.path}`);
    console.log(`📋 Headers:`, proxyReq.getHeaders());
  },
  onProxyRes: (proxyRes, req, res) => {
    // Log the response
    console.log(`📡 Response status: ${proxyRes.statusCode}`);
  },
  onError: (err, req, res) => {
    console.error('❌ Proxy error:', err);
    res.status(500).json({ error: 'Proxy error', message: err.message });
  }
});

// Use the proxy for /api/setu-proxy routes
app.use('/api/setu-proxy', setuProxy);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Proxy server is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Proxy server running on http://localhost:${PORT}`);
  console.log(`📡 Proxying requests to: https://fiu-sandbox.setu.co`);
  console.log(`🌐 CORS enabled for: http://localhost:8081`);
});

module.exports = app;
