import { list } from '@vercel/blob';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).end();

  const { blobs } = await list({ prefix: 'csvs/' });

  const result = {};
  for (const b of blobs) {
    const key = b.pathname.replace('csvs/', '').replace('.csv', '');
    result[key] = b.url;
  }

  res.status(200).json(result);
}
