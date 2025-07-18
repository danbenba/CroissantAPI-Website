import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export const config = {
  api: { bodyParser: false }
};

const itemsIconsDir = path.join(process.cwd(), 'itemsIcons');
if (!fs.existsSync(itemsIconsDir)) fs.mkdirSync(itemsIconsDir, { recursive: true });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const form = new formidable.IncomingForm({ uploadDir: itemsIconsDir, keepExtensions: true });
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'Upload error' });
    const file = files.icon as formidable.File;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    const hash = crypto.createHash('sha256').update(Date.now() + file.originalFilename!).digest('hex');
    const ext = path.extname(file.originalFilename!);
    const destPath = path.join(itemsIconsDir, `${hash}${ext}`);
    fs.renameSync(file.filepath, destPath);

    res.json({ hash });
  });
}