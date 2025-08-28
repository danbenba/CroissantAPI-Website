import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { code } = req.query;
  if (!code) return res.status(400).send("Missing code");

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

    // 2. Appelle le backend pour login/register OAuth (sans fetch userinfo ici)
    const apiBase = process.env.API_BASE_URL || "http://localhost:3456";
    const loginRes = await fetch(`${apiBase}/users/login-oauth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider: "google",
        code: code as string, // tu peux aussi transmettre le code si tu veux que le backend fasse tout
        accessToken: access_token,
      }),
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok || !loginData.token) {
      return res.status(401).send(loginData.message || "OAuth login failed");
    }
    // 4. Place le token backend en cookie et redirige
    res.setHeader(
      "Set-Cookie",
      `token=${loginData.token}; Path=/; Expires=Fri, 31 Dec 9999 23:59:59 GMT`
    );
    res.redirect("/");
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send("An error occurred during the Google authentication process.");
  }
}
