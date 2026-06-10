import React, { useEffect, useRef, useState } from 'react'
import { format, formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { LoaderCircle, Newspaper, RefreshCw } from 'lucide-react'
import { Task } from '../../types'

interface DailyBriefingViewProps {
  tasks: Task[]
  onTaskClick: (task: Task) => void
  onMarkDone: (id: string) => void
  onAddTask: () => void
}

interface BriefingResponse {
  date: string
  html: string
  updatedAt: string
  sourceFile?: string
}

export function DailyBriefingView(_: DailyBriefingViewProps) {
  const today = format(new Date(), 'M月d日 EEEE', { locale: zhCN })
  const [briefing, setBriefing] = useState<BriefingResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [frameHeight, setFrameHeight] = useState(960)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const measureFrame = () => {
    const doc = iframeRef.current?.contentDocument
    if (!doc) return

    const nextHeight = Math.max(
      doc.documentElement.scrollHeight,
      doc.body?.scrollHeight ?? 0,
      640
    )

    setFrameHeight(nextHeight)
  }

  const fetchBriefing = async (silent?: boolean) => {
    if (silent) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    try {
      const res = await fetch('/api/briefing', { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const data = await res.json() as BriefingResponse | null
      setBriefing(data)
      setError('')
    } catch (err) {
      console.warn('Failed to load daily briefing:', err)
      setError('暂时还没有可展示的日报，或者日报同步还没完成。')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    void fetchBriefing()

    const intervalId = window.setInterval(() => {
      void fetchBriefing(true)
    }, 60_000)

    return () => window.clearInterval(intervalId)
  }, [])

  useEffect(() => {
    if (!briefing) return

    const timers = [
      window.setTimeout(measureFrame, 60),
      window.setTimeout(measureFrame, 240),
      window.setTimeout(measureFrame, 900),
      window.setTimeout(measureFrame, 1800),
    ]

    return () => timers.forEach(timer => window.clearTimeout(timer))
  }, [briefing])

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="mb-5 md:mb-8 flex items-start justify-between gap-4">
        <div>
        <div className="text-xs md:text-sm text-stone-400">{today}</div>
        <h1 className="text-lg md:text-2xl font-semibold md:font-light text-stone-800 mt-0.5">每日私人简报</h1>
          {briefing?.updatedAt && (
            <p className="text-xs md:text-sm text-stone-400 mt-2">
              最近同步于 {format(new Date(briefing.updatedAt), 'M月d日 HH:mm', { locale: zhCN })}
            </p>
          )}
        </div>
        <button
          onClick={() => void fetchBriefing(true)}
          className="shrink-0 inline-flex items-center gap-2 px-3 py-2 text-xs md:text-sm text-stone-500 hover:text-stone-800 bg-white border border-stone-200 rounded-xl transition-colors"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          刷新
        </button>
      </div>

      {loading && (
        <section className="bg-white rounded-3xl border border-stone-100 min-h-[360px] md:min-h-[440px] flex items-center justify-center px-6">
          <div className="text-center max-w-md">
            <LoaderCircle size={20} className="animate-spin text-stone-400 mx-auto mb-4" />
            <p className="text-sm md:text-base text-stone-500 leading-relaxed">
              正在载入今天的日报内容。
            </p>
          </div>
        </section>
      )}

      {!loading && !briefing && (
        <section className="bg-white rounded-3xl border border-stone-100 min-h-[360px] md:min-h-[440px] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-4">
            <Newspaper size={20} />
          </div>
          <p className="text-sm md:text-base text-stone-500 leading-relaxed">
              {error || '今天的日报还没有同步进来。'}
          </p>
        </div>
      </section>
      )}

      {!loading && briefing && (
        <section className="rounded-[28px] overflow-hidden border border-stone-200 bg-[#d9d9d6] shadow-sm">
          <div className="px-4 md:px-6 py-3 bg-white/80 border-b border-stone-200 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">Private Briefing</div>
              <div className="text-sm text-stone-600 mt-1">
                {briefing.date}
              </div>
            </div>
            <div className="text-[11px] text-stone-400 shrink-0">
              {formatDistanceToNow(new Date(briefing.updatedAt), { addSuffix: true, locale: zhCN })}
            </div>
          </div>

          <iframe
            ref={iframeRef}
            title="每日私人简报"
            srcDoc={briefing.html}
            className="w-full bg-[#d9d9d6]"
            style={{ height: `${frameHeight}px` }}
            onLoad={measureFrame}
          />
        </section>
      )}
    </div>
  )
}
