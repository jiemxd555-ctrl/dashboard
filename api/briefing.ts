import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

const STORAGE_KEY = 'dashboard:daily-briefing'

interface BriefingPayload {
  date: string
  html: string
  updatedAt: string
  sourceFile?: string
}

function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '')
}

function isAuthorized(req: any): boolean {
  const expected = process.env.BRIEFING_SYNC_TOKEN
  if (!expected) return true

  const incoming = req.headers['x-briefing-token']
  return incoming === expected
}

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store')

  try {
    if (req.method === 'GET') {
      const data = await redis.get<BriefingPayload>(STORAGE_KEY)
      return res.status(200).json(data ?? null)
    }

    if (req.method === 'POST') {
      if (!isAuthorized(req)) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      const body =
        typeof req.body === 'string' ? JSON.parse(req.body) : req.body

      if (
        !body ||
        typeof body.date !== 'string' ||
        typeof body.html !== 'string' ||
        typeof body.updatedAt !== 'string'
      ) {
        return res.status(400).json({ error: 'Invalid payload' })
      }

      const payload: BriefingPayload = {
        date: body.date,
        html: sanitizeHtml(body.html),
        updatedAt: body.updatedAt,
        sourceFile: typeof body.sourceFile === 'string' ? body.sourceFile : undefined,
      }

      await redis.set(STORAGE_KEY, payload)
      return res.status(200).json({
        ok: true,
        date: payload.date,
        updatedAt: payload.updatedAt,
      })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err: any) {
    console.error('Briefing API error:', err)
    return res.status(500).json({ error: err?.message ?? 'Internal error' })
  }
}
