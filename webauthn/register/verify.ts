import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyRegistration } from '../../lib/webauthnService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { credential } = req.body;
  // Retrieve user and expectedChallenge from session or DB
  const user = {/* ... */};
  const expectedChallenge = '';
  try {
    const verification = await verifyRegistration({ credential }, expectedChallenge, user);
    if (!verification.verified) return res.status(400).json({ message: 'Verification failed' });
    // Store credential in DB for user
    // credentialDB[user.id] = verification.registrationInfo;
    res.status(200).json({ success: true });
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
}
