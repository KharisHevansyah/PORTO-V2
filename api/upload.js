const { put } = require('@vercel/blob');
const { Redis } = require('@upstash/redis');
const { IncomingForm } = require('formidable');
const fs = require('fs');

const redis = new Redis({
  url: process.env.hevansyah_KV_REST_API_URL,
  token: process.env.hevansyah_KV_REST_API_TOKEN,
});

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  const form = new IncomingForm({ maxFileSize: 4 * 1024 * 1024 });
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(400).json({ error: 'Upload gagal: ' + err.message });
    const password = Array.isArray(fields.password) ? fields.password[0] : fields.password;
    if (password !== process.env.ADMIN_PASSWORD) return res.status(403).json({ error: 'Unauthorized' });
    const title = Array.isArray(fields.title) ? fields.title[0] : fields.title;
    const category = Array.isArray(fields.category) ? fields.category[0] : fields.category;
    const desc = Array.isArray(fields.desc) ? fields.desc[0] : (fields.desc || '');
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });
    try {
      const fileBuffer = fs.readFileSync(file.filepath);
      const blob = await put('portfolio/' + Date.now() + '-' + file.originalFilename, fileBuffer, {
        access: 'public',
        contentType: file.mimetype,
      });
      const id = '' + Date.now();
      const work = { id, judul: title, kategori: category, deskripsi: desc, gambar: blob.url, tampilkan: 'true', createdAt: new Date().toISOString() };
      await redis.hset('work:' + id, work);
      await redis.lpush('portfolio:works', id);
      res.status(200).json({ success: true, work });
    } catch (uploadErr) {
      res.status(500).json({ error: uploadErr.message });
    }
  });
};

export const config = { api: { bodyParser: false } };
