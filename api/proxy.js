const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = (req, res) => {
  createProxyMiddleware({
    target: 'https://rpc-testnet.shareri.ng',
    changeOrigin: true,
    pathRewrite: { '^/api/proxy': '' },
    onProxyRes: (proxyRes) => {
      proxyRes.headers['Access-Control-Allow-Origin'] = '*';
      proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
      proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
    },
    onError: (err, req, res) => {
      console.error('Proxy error:', err);
      res.status(500).send('Proxy error');
    }
  })(req, res);
};

