// pages/api/daily-room.ts
import type { NextApiRequest, NextApiResponse } from 'next'

const DAILY_API_KEY = process.env.DAILY_API_KEY

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { roomId } = req.body
  if (!roomId) return res.status(400).json({ error: 'Missing roomId' })

  // Create or fetch a Daily room for this roomId
  const resp = await fetch('https://api.daily.co/v1/rooms', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${DAILY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: `mixmingle-${roomId}`,
      properties: {
        enable_chat: true,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24h expiry
      },
    }),
  })
  const data = await resp.json()
  if (!resp.ok) return res.status(500).json({ error: data.error || 'Failed to create room' })
  res.status(200).json({ url: data.url })
}
