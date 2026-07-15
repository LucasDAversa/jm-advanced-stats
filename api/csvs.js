const { list } = require('@vercel/blob');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).end();

  const { blobs } = await list({ prefix: 'csvs/' });

  // Return proxy URLs (/api/csv?key=...) instead of direct blob URLs.
  // Direct blob URLs require auth because the store is private.
  const result = {};
  for (const b of blobs) {
    const key = b.pathname.replace('csvs/', '').replace('.csv', '');
    result[key] = `/api/csv?key=${encodeURIComponent(key)}`;
  }

  res.status(200).json(result);
};
