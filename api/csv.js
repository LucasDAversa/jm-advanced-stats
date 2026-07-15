const { list } = require('@vercel/blob');

const VALID_KEYS = ['eg-total', 'eg-empty', 'sgs', 'sisler-pa', 'sisler-sb', 'series'];

// Proxy endpoint for private blob downloads.
// The browser can't fetch private blobs directly — this server-side
// handler fetches with the BLOB_READ_WRITE_TOKEN and streams it back.
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).end();

  const { key } = req.query;
  if (!key || !VALID_KEYS.includes(key)) {
    return res.status(400).json({ error: 'Invalid or missing key' });
  }

  try {
    const { blobs } = await list({ prefix: `csvs/${key}.csv` });
    if (!blobs.length) return res.status(404).json({ error: 'Not found' });

    const blobUrl = blobs[0].url;
    const token = process.env.BLOB_READ_WRITE_TOKEN;

    const upstream = await fetch(blobUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });

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
