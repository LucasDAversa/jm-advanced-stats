const { list } = require('@vercel/blob');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const results = {};

  // Step 1: list all blobs
  try {
    const { blobs } = await list({ prefix: 'csvs/' });
    results.allBlobs = blobs.map(b => ({ pathname: b.pathname, url: b.url, size: b.size }));
  } catch (e) {
    results.listError = e.message;
    return res.status(200).json(results);
  }

  // Step 2: try to fetch stats-batting specifically
  const statsBatting = results.allBlobs.find(b => b.pathname === 'csvs/stats-batting.csv');
  if (!statsBatting) {
    results.statsBattingBlob = 'NOT FOUND in blob list';
    return res.status(200).json(results);
  }

  results.statsBattingBlob = statsBatting;

  // Step 3: fetch the blob content
  try {
    const r = await fetch(statsBatting.url);
    results.fetchStatus = r.status;
    results.fetchOk = r.ok;
    if (r.ok) {
      const text = await r.text();
      results.contentLength = text.length;
      results.firstLine = text.split('\n')[0];
      results.secondLine = text.split('\n')[1];
    } else {
      results.fetchError = `HTTP ${r.status}`;
    }
  } catch (e) {
    results.fetchError = e.message;
  }

  return res.status(200).json(results);
};
