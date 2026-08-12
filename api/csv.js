const { list } = require('@vercel/blob');

const VALID_KEYS = ['eg-total', 'eg-empty', 'sgs', 'sisler-pa', 'sisler-sb', 'series', 'stats-batting', 'stats-pitching'];

// Proxy endpoint for blob downloads.
// Routes CSV fetches through the server to avoid CORS / CDN issues in the browser.
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  if (req.method !== 'GET') return res.status(405).end();

  const { key } = req.query;
  if (!key || !VALID_KEYS.includes(key)) {
    return res.status(400).json({ error: 'Invalid or missing key' });
  }

  try {
    const { blobs } = await list({ prefix: `csvs/${key}.csv` });
    if (!blobs.length) return res.status(404).json({ error: 'Not found' });

    const blobUrl = blobs[0].url;

    // Public blobs do not require an Authorization header.
    // Sending one can cause the Vercel CDN to reject the request.
    const upstream = await fetch(blobUrl);

    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: 'Blob fetch failed' });
    }

    const text = await upstream.text();
    res.setHeader('Content-Type', 'text/csv');
    res.status(200).send(text);
  } catch (err) {
    console.error('csv proxy error:', err);
    res.status(500).json({ error: err.message || 'Proxy failed' });
  }
};
