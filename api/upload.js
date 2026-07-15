const { put } = require('@vercel/blob');

const VALID_KEYS = ['eg-total', 'eg-empty', 'sgs', 'sisler-pa', 'sisler-sb', 'series'];

// Disable Vercel's default body parser so we can handle large files ourselves
module.exports.config = { api: { bodyParser: false } };

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  // Collect raw body chunks (bypasses the 4.5MB default limit)
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf-8');

  let body;
  try { body = JSON.parse(raw); }
  catch { return res.status(400).json({ error: 'Invalid JSON body' }); }

  const { key, content } = body;
  if (!key || !content) return res.status(400).json({ error: 'Missing key or content' });
  if (!VALID_KEYS.includes(key)) return res.status(400).json({ error: 'Invalid key' });

  try {
    const blob = await put(`csvs/${key}.csv`, content, {
      access: 'public',
      contentType: 'text/csv',
      addRandomSuffix: false,
    });
    return res.status(200).json({ url: blob.url });
  } catch (err) {
    console.error('Blob put error:', err);
    return res.status(500).json({ error: err.message || 'Blob write failed' });
  }
};
