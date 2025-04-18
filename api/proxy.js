const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = (req, res) => {
  console.log('Proxy request:', req.url, 'Method:', req.method);
  const proxy = createProxyMiddleware({
    target: 'https://rpc-testnet.shareri.ng',
    changeOrigin: true,
    ws: true,
    pathRewrite: { '^/api/proxy': '' },
    onProxyRes: (proxyRes) => {
      proxyRes.headers['Access-Control-Allow-Origin'] = '*';
      proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
      proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
      console.log('Proxy response headers:', proxyRes.headers);
    },
    onProxyReqWs: (proxyReq, req, socket) => {
      console.log('WebSocket request:', req.url);
    },
    onError: (err, req, res) => {
      console.error('Proxy error:', err);
      res.status(500).send('Proxy error');
    }
  });
  proxy(req, res);
};