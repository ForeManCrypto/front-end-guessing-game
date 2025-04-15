const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const url = 'https://rpc-testnet.shareri.ng' + req.url.replace('/api/proxy', '');
  try {
    const response = await fetch(url, {
      method: req.method,
      headers: {
        ...req.headers,
        // Remove headers that might cause issues
        host: undefined,
        origin: undefined,
        referer: undefined,
      },
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    });
    const data = await response.json();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Failed to proxy request' });
  }
};