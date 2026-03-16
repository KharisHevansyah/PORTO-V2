const { Redis } = require('@upstash/redis');
const redis = new Redis({
  url: process.env.hevansyah_KV_REST_API_URL,
  token: process.env.hevansyah_KV_REST_API_TOKEN,
});

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  const { id, password } = req.body;
  if (password !== process.env.ADMIN_PASSWORD) return res.status(403).json({ error: 'Unauthorized' });
  await redis.del('work:' + id);
  await redis.lrem('portfolio:works', 0, id);
  res.status(200).json({ success: true });
};
