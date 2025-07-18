import type { NextApiRequest, NextApiResponse } from 'next';
import { genKey } from '../GenKey';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code } = req.query;
  if (!code) return res.status(400).send('Missing code');

  try {
    // 1. Échange le code contre un access_token
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      grant_type: "authorization_code",
      code: code as string,
      redirect_uri: process.env.GOOGLE_CALLBACK_URL!,
    });

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    if (!tokenRes.ok) {
      return res.status(500).send("Failed to fetch access token");
    }
    const tokenData = await tokenRes.json();
    const { access_token } = tokenData;

    // 2. Récupère les infos utilisateur Google
    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    if (!userRes.ok) {
      return res.status(500).send("Failed to fetch user info");
    }
    const user = await userRes.json();
    const userId = `google_${user.id}`;

    // 3. Vérifie/crée l'utilisateur côté API backend
    const apiBase = process.env.API_BASE_URL || "http://localhost:3456";
    const userApiRes = await fetch(`${apiBase}/api/users/${userId}`);
    if (userApiRes.status === 404) {
      await fetch(`${apiBase}/api/users/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          username: user.name || user.email.split('@')[0],
          balance: 1000,
        }),
      });
    }

    // 4. Génère un token (ici, on simule, car pas de genKey côté Next.js)
    // Idéalement, tu dois demander à ton backend de générer le token et le renvoyer
    // Ici, on le met en cookie pour l'exemple
    res.setHeader(
      'Set-Cookie',
      `token=${genKey(userId)}; Path=/; Expires=Fri, 31 Dec 9999 23:59:59 GMT`
    );
    // 5. Redirige vers la page login ou dashboard
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred during the Google authentication process.");
  }
}