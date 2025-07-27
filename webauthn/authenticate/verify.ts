import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyAuthentication } from '../../lib/webauthnService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { credential } = req.body;
  // Retrieve user, credentials, and expectedChallenge from session or DB
  const user = {/* ... */};
  const credentials = [];
  const expectedChallenge = '';
  try {
    const verification = await verifyAuthentication({ credential }, expectedChallenge, credentials);
    if (!verification.verified) return res.status(400).json({ message: 'Authentication failed' });
    // Issue token/session for user
    res.status(200).json({ token: 'jwt-or-session-token' });
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
}
