import type { NextApiRequest, NextApiResponse } from 'next';
import { genKey } from '../GenKey';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code } = req.query;
  if (!code) return res.status(400).send('Missing code');

  try {
    // 1. Échange le code contre un access_token
    const params = new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID!,
      client_secret: process.env.DISCORD_CLIENT_SECRET!,
      grant_type: "authorization_code",
      code: code as string,
      redirect_uri: process.env.DISCORD_CALLBACK_URL!,
    });

    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    if (!tokenRes.ok) {
      return res.status(500).send("Failed to fetch access token");
    }
    const tokenData = await tokenRes.json();
    const { access_token } = tokenData;

    // 2. Récupère les infos utilisateur Discord
    const userRes = await fetch("https://discord.com/api/v10/users/@me", {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    if (!userRes.ok) {
      return res.status(500).send("Failed to fetch user info");
    }
    const user = await userRes.json();
    const userId = user.id;

    // 3. Vérifie/crée l'utilisateur côté API backend
    const apiBase = process.env.API_BASE_URL || "http://localhost:3456";
    const userApiRes = await fetch(`${apiBase}/api/users/${userId}`);
    if (userApiRes.status === 404) {
      await fetch(`${apiBase}/api/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          username: user.username,
          email: user.email,
          password: null,
          balance: 0,
        }),
      });
    }

    // 4. Génère un token et le met en cookie
    res.setHeader(
      'Set-Cookie',
      `token=${genKey(userId)}; Path=/; Expires=Fri, 31 Dec 9999 23:59:59 GMT`
    );

    // 5. Redirige vers la page login ou dashboard
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred during the Discord authentication process.");
  }
}