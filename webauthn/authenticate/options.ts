import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthenticationOptions } from '../../lib/webauthnService';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email } = req.body;
  // Lookup user and credentials from DB
  const user = { id: 'user-id', username: 'username', email };
  const credentials = []; // get credentials for user
  const options = getAuthenticationOptions(user, credentials);
  // Store challenge in session or DB for later verification
  // req.session.challenge = options.challenge;
  res.status(200).json(options);
}
