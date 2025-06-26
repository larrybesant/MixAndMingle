// This API route is a placeholder for Supabase Auth callbacks.
// With @supabase/ssr, you typically handle auth on the client and sync sessions via middleware.
// If you need to handle custom auth logic, implement it here.

import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(404).json({ error: 'Not implemented: Use @supabase/ssr and handle auth via middleware and client.' });
}
