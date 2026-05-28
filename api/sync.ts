import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

// 单用户场景：用一个固定 Key 存所有数据
const STORAGE_KEY = 'dashboard:user-data'

interface PayloadIn {
  tasks: unknown[]
  enoTeam?: unknown[]
  savedAt: string
}

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store')

  try {
    if (req.method === 'GET') {
      const data = await redis.get<PayloadIn>(STORAGE_KEY)
      return res.status(200).json(data ?? null)
    }

    if (req.method === 'POST') {
      const body =
        typeof req.body === 'string' ? JSON.parse(req.body) : req.body
      if (
        !body ||
        !Array.isArray(body.tasks) ||
        typeof body.savedAt !== 'string'
      ) {
        return res.status(400).json({ error: 'Invalid payload' })
      }
      // 只保存需要的字段
      const payload: PayloadIn = {
        tasks: body.tasks,
        enoTeam: Array.isArray(body.enoTeam) ? body.enoTeam : [],
        savedAt: body.savedAt,
      }
      await redis.set(STORAGE_KEY, payload)
      return res.status(200).json({ ok: true, savedAt: body.savedAt })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err: any) {
    console.error('Sync API error:', err)
    return res.status(500).json({ error: err?.message ?? 'Internal error' })
  }
}
