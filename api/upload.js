const { put } = require('@vercel/blob');

const VALID_KEYS = ['eg-total', 'eg-empty', 'sgs', 'sisler-pa', 'sisler-sb', 'series'];

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { key, content } = req.body;
  if (!key || !content) return res.status(400).json({ error: 'Missing key or content' });
  if (!VALID_KEYS.includes(key)) return res.status(400).json({ error: 'Invalid key' });

  const blob = await put(`csvs/${key}.csv`, content, {
    access: 'public',
    contentType: 'text/csv',
    addRandomSuffix: false,
  });

  res.status(200).json({ url: blob.url });
};

module.exports.config = { api: { bodyParser: { sizeLimit: '10mb' } } };
