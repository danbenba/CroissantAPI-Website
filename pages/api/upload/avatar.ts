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
  const user = await fetch('https://croissant-api.fr/api/users/@me', {method: 'GET', headers: { Authorization: authHeader } });
  if (!user.ok) return res.status(401).json({ error: 'Unauthorized' });
  const userData = await user.json();

  const form = formidable({ uploadDir: avatarsDir, keepExtensions: true });
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'Upload error' });
    let file = files.avatar;
    if (Array.isArray(file)) file = file[0];
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    // Use 'filepath' for formidable v3+, fallback to 'path' for older versions
    const tempPath = (file.filepath || file.path);
    if (!tempPath) return res.status(500).json({ error: 'File path missing' });

    // console.log('Temp file path:', userData);

    // Ici, récupère l'userId (ex: depuis le token ou un champ)
    const userId = (userData.id as string) || 'unknown';
    const destPath = path.join(avatarsDir, `${userId}.png`);
    fs.renameSync(tempPath, destPath);

    res.json({ message: 'Avatar uploaded successfully', userId });
  });
}