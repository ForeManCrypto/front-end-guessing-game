const fetch = require('node-fetch');
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = (req, res) => {
  if (req.headers.upgrade === 'websocket') {
    createProxyMiddleware({
      target: 'wss://rpc-testnet.shareri.ng',
      ws: true,
      changeOrigin: true,
      pathRewrite: { '^/api/proxy': '' },
      logLevel: 'debug',
    })(req, res);
  } else {
    const url = 'https://rpc-testnet.shareri.ng' + req.url.replace('/api/proxy', '');
    fetch(url, {
      method: req.method,
      headers: {
        ...req.headers,
        host: undefined,
        origin: undefined,
        referer: undefined,
      },
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    })
      .then((response) => response.json())
      .then((data) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.status(response.status).json(data);
      })
      .catch((error) => {
        console.error('Proxy error:', error);
        res.status(500).json({ error: 'Failed to proxy request' });
      });
  }
};