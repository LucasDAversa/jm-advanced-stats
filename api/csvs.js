const { list } = require('@vercel/blob');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).end();

  const { blobs } = await list({ prefix: 'csvs/' });

  // Blobs are stored with access: 'public', so direct CDN URLs work from the browser.
  // Using direct URLs avoids routing large CSVs through a serverless function,
  // which can timeout for large files like the Sisler PA CSV.
  const result = {};
  for (const b of blobs) {
    const key = b.pathname.replace('csvs/', '').replace('.csv', '');
    result[key] = b.url;
  }

  res.status(200).json(result);
};
