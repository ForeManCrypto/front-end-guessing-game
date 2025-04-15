const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/rpc',
    createProxyMiddleware({
      target: 'https://rpc-testnet.shareri.ng',
      changeOrigin: true,
      pathRewrite: { '^/rpc': '' },
      logLevel: 'debug',
    })
  );
};