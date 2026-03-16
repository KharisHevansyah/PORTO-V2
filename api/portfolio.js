const { kv } = require('@vercel/kv');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');

  try {
    const showAll = req.query.all === 'true';
    const keys = await kv.lrange('portfolio:works', 0, -1);

    if (!keys || keys.length === 0) {
      return res.status(200).json({ works: [] });
    }

    const works = await Promise.all(
      keys.map(id => kv.hgetall(`work:${id}`))
    );

    const filtered = works
      .filter(w => w !== null)
      .filter(w => showAll || w.tampilkan === 'true');

    res.status(200).json({ works: filtered.map(w => ({
      ...w,
      tampilkan: w.tampilkan === 'true'
    })) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const { Redis } = require('@upstash/redis');
const redis = new Redis({
  url: process.env.hevansyah_KV_REST_API_URL,
  token: process.env.hevansyah_KV_REST_API_TOKEN,
});

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  const { id, tampilkan, password } = req.body;
  if (password !== process.env.ADMIN_PASSWORD) return res.status(403).json({ error: 'Unauthorized' });
  await redis.hset('work:' + id, { tampilkan: tampilkan ? 'true' : 'false' });
  res.status(200).json({ success: true });
};
