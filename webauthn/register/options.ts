import type { NextApiRequest, NextApiResponse } from 'next';
import { getRegistrationOptions } from '../../lib/webauthnService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { userId, username, email } = req.body;
  // Convert userId to Uint8Array
  const userIdBuffer = Buffer.from(userId, 'utf8');
  const user = { id: userIdBuffer, username, email, userId };
  const options = await getRegistrationOptions(user);

  // Encode challenge and user.id in base64 for transport
  options.challenge = Buffer.from(options.challenge).toString('base64');
  options.user.id = Buffer.from(options.user.id).toString('base64');

  res.status(200).json(options);
}
