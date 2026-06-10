import { readdir, readFile, stat } from 'node:fs/promises'
import path from 'node:path'

const sourceDir = process.env.BRIEFING_SOURCE_DIR || '/Users/a/daily-briefings'
const targetUrl = process.env.BRIEFING_SYNC_URL || 'https://jie-board.com/api/briefing'
const token = process.env.BRIEFING_SYNC_TOKEN || ''
const date = process.env.BRIEFING_DATE || new Date().toISOString().slice(0, 10)

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

async function findLatestBriefingFile() {
  const entries = await readdir(sourceDir)
  const pattern = new RegExp(`^${escapeRegExp(date)}(?:-v\\d+)?\\.html$`)

  const matches = await Promise.all(
    entries
      .filter(entry => pattern.test(entry))
      .map(async entry => {
        const fullPath = path.join(sourceDir, entry)
        const fileStat = await stat(fullPath)
        return {
          fullPath,
          mtimeMs: fileStat.mtimeMs,
        }
      })
  )

  return matches.sort((a, b) => b.mtimeMs - a.mtimeMs)[0] ?? null
}

async function main() {
  const latest = await findLatestBriefingFile()

  if (!latest) {
    console.error(`No daily briefing file found for ${date} in ${sourceDir}`)
    process.exit(1)
  }

  const html = await readFile(latest.fullPath, 'utf8')
  const updatedAt = new Date().toISOString()

  const response = await fetch(targetUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'x-briefing-token': token } : {}),
    },
    body: JSON.stringify({
      date,
      html,
      updatedAt,
      sourceFile: latest.fullPath,
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Upload failed (${response.status}): ${text}`)
  }

  const result = await response.json()

  console.log(`Uploaded daily briefing: ${latest.fullPath}`)
  console.log(`Target: ${targetUrl}`)
  console.log(`Date: ${result.date}`)
  console.log(`UpdatedAt: ${result.updatedAt}`)
}

main().catch(err => {
  console.error(err instanceof Error ? err.message : String(err))
  process.exit(1)
})
