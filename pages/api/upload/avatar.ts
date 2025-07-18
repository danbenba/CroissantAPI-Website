import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: { bodyParser: false }
};

const avatarsDir = path.join(process.cwd(), 'avatars');
if (!fs.existsSync(avatarsDir)) fs.mkdirSync(avatarsDir, { recursive: true });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Authorization header missing' });

  // Ici, tu dois vérifier l'utilisateur via ton API si besoin

  const form = formidable({ uploadDir: avatarsDir, keepExtensions: true });
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'Upload error' });
    const file = files.avatar as formidable.File;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    // Ici, récupère l'userId (ex: depuis le token ou un champ)
    const userId = fields.userId as string || 'unknown';
    const destPath = path.join(avatarsDir, `${userId}.png`);
    fs.renameSync(file.filepath, destPath);

    res.json({ message: 'Avatar uploaded successfully', userId });
  });
}