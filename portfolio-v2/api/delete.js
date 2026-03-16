const { kv } = require('@vercel/kv');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  const { id, password } = req.body;
  if (password !== process.env.ADMIN_PASSWORD) return res.status(403).json({ error: 'Unauthorized' });
  await kv.del(`work:${id}`);
  await kv.lrem('portfolio:works', 0, id);
  res.status(200).json({ success: true });
};
