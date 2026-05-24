import { useState, useEffect, useCallback, useRef } from 'react'
import { Task, Review } from '../types'
import { SAMPLE_TASKS, SAMPLE_REVIEWS } from '../utils/sampleData'
import { generateId, generateReviewId } from '../utils/taskUtils'

const TASKS_KEY = 'dashboard_tasks'
const REVIEWS_KEY = 'dashboard_reviews'
const SAVED_AT_KEY = 'dashboard_saved_at'

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'offline' | 'error'

function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(TASKS_KEY)
    if (raw) return JSON.parse(raw) as Task[]
  } catch {}
  return SAMPLE_TASKS
}

function loadReviews(): Review[] {
  try {
    const raw = localStorage.getItem(REVIEWS_KEY)
    if (raw) return JSON.parse(raw) as Review[]
  } catch {}
  return SAMPLE_REVIEWS
}

/** 取本地最近一次「同步标记」，没有则用本地任务的最新 updatedAt 当作隐式标记 */
function readLocalSavedAt(tasks: Task[], reviews: Review[]): string {
  const explicit = localStorage.getItem(SAVED_AT_KEY) || ''
  if (explicit) return explicit
  const fromTasks = tasks.reduce((max, t) => (t.updatedAt > max ? t.updatedAt : max), '')
  const fromReviews = reviews.reduce((max, r) => (r.createdAt > max ? r.createdAt : max), '')
  return fromTasks > fromReviews ? fromTasks : fromReviews
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks)
  const [reviews, setReviews] = useState<Review[]>(loadReviews)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle')

  // 用 ref 保证 push 时拿到最新数据
  const dataRef = useRef({ tasks, reviews })
  dataRef.current = { tasks, reviews }

  // 初次拉取是否完成；完成前不要触发 push（避免覆盖云端）
  const initialFetchDone = useRef(false)
  const pushTimerRef = useRef<number | null>(null)
  const inFlightRef = useRef(false)
  // 正在从云端拉取数据时设为 true，防止拉取触发多余的 push
  const isPullingRef = useRef(false)

  // 持久化到 localStorage
  useEffect(() => {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks))
  }, [tasks])

  useEffect(() => {
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews))
  }, [reviews])

  // 推送到云端（立即）
  const pushNow = useCallback(async () => {
    if (inFlightRef.current) return
    inFlightRef.current = true
    setSyncStatus('syncing')
    try {
      const savedAt = new Date().toISOString()
      const payload = {
        tasks: dataRef.current.tasks,
        reviews: dataRef.current.reviews,
        savedAt,
      }
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      localStorage.setItem(SAVED_AT_KEY, savedAt)
      setSyncStatus('synced')
    } catch (err) {
      console.warn('Cloud sync push failed:', err)
      setSyncStatus('error')
    } finally {
      inFlightRef.current = false
    }
  }, [])

  // 防抖推送：1.5s 内的多次改动合并为一次上传
  const schedulePush = useCallback(() => {
    if (!initialFetchDone.current) return
    if (pushTimerRef.current) window.clearTimeout(pushTimerRef.current)
    pushTimerRef.current = window.setTimeout(() => {
      pushNow()
    }, 1500)
  }, [pushNow])

  // 初次：从云端拉取，根据时间戳决定方向
  useEffect(() => {
    let cancelled = false

    async function init() {
      setSyncStatus('syncing')
      try {
        const res = await fetch('/api/sync')
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const cloud = (await res.json()) as
          | { tasks: Task[]; reviews: Review[]; savedAt: string }
          | null
        if (cancelled) return

        const hasLocalHistory = !!localStorage.getItem(SAVED_AT_KEY)
        const localSavedAt = readLocalSavedAt(dataRef.current.tasks, dataRef.current.reviews)
        const cloudSavedAt = cloud?.savedAt || ''

        if (cloud && cloudSavedAt && (!hasLocalHistory || cloudSavedAt >= localSavedAt)) {
          // 云端有数据，且：本设备从未同步过（新设备/新浏览器），或云端更新 → 下行同步
          isPullingRef.current = true
          setTasks(cloud.tasks)
          setReviews(cloud.reviews || [])
          localStorage.setItem(SAVED_AT_KEY, cloudSavedAt)
          setSyncStatus('synced')
          initialFetchDone.current = true
        } else if (hasLocalHistory && (!cloud || !cloudSavedAt || localSavedAt > cloudSavedAt)) {
          // 本设备有同步历史 且 本地更新（或云端空）→ 上行同步
          initialFetchDone.current = true
          await pushNow()
        } else if (!cloud || !cloudSavedAt) {
          // 云端完全没数据 且 本地没历史 → 这是全新状态，不推送示例数据
          setSyncStatus('synced')
          initialFetchDone.current = true
        } else {
          // 两端一致
          setSyncStatus('synced')
          initialFetchDone.current = true
        }
      } catch (err) {
        console.warn('Cloud sync init failed:', err)
        if (!cancelled) {
          setSyncStatus('offline')
          initialFetchDone.current = true
        }
      }
    }

    init()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 数据变化 → 触发防抖推送（云端拉取引起的变化不推送，避免循环写入）
  useEffect(() => {
    if (isPullingRef.current) {
      isPullingRef.current = false
      return
    }
    if (initialFetchDone.current) {
      schedulePush()
    }
  }, [tasks, reviews, schedulePush])

  // —— CRUD ——
  const addTask = useCallback((data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString()
    const task: Task = { ...data, id: generateId(), createdAt: now, updatedAt: now }
    setTasks(prev => [task, ...prev])
    return task
  }, [])

  const updateTask = useCallback((id: string, data: Partial<Omit<Task, 'id' | 'createdAt'>>) => {
    setTasks(prev => prev.map(t =>
      t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t
    ))
  }, [])

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id))
  }, [])

  const markDone = useCallback((id: string) => {
    setTasks(prev => prev.map(t =>
      t.id === id ? { ...t, status: 'done', updatedAt: new Date().toISOString() } : t
    ))
  }, [])

  const importTasks = useCallback((data: { tasks?: Task[]; reviews?: Review[] }) => {
    if (data.tasks) setTasks(data.tasks)
    if (data.reviews) setReviews(data.reviews)
  }, [])

  const exportData = useCallback(() => {
    const blob = new Blob(
      [JSON.stringify({ tasks, reviews, exportedAt: new Date().toISOString() }, null, 2)],
      { type: 'application/json' }
    )
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dashboard-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [tasks, reviews])

  const addReview = useCallback((data: Omit<Review, 'id' | 'createdAt'>) => {
    const now = new Date().toISOString()
    const review: Review = { ...data, id: generateReviewId(), createdAt: now }
    setReviews(prev => [review, ...prev])
  }, [])

  const updateReview = useCallback((id: string, data: Partial<Omit<Review, 'id' | 'createdAt'>>) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, ...data } : r))
  }, [])

  const deleteReview = useCallback((id: string) => {
    setReviews(prev => prev.filter(r => r.id !== id))
  }, [])

  // 手动从云端重新拉取一次（用户主动点击同步按钮）
  const pullNow = useCallback(async () => {
    setSyncStatus('syncing')
    try {
      const res = await fetch('/api/sync')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const cloud = (await res.json()) as
        | { tasks: Task[]; reviews: Review[]; savedAt: string }
        | null
      if (cloud && cloud.savedAt) {
        isPullingRef.current = true
        setTasks(cloud.tasks)
        setReviews(cloud.reviews || [])
        localStorage.setItem(SAVED_AT_KEY, cloud.savedAt)
      }
      setSyncStatus('synced')
    } catch (err) {
      console.warn('Cloud sync pull failed:', err)
      setSyncStatus('error')
    }
  }, [])

  return {
    tasks,
    reviews,
    syncStatus,
    addTask,
    updateTask,
    deleteTask,
    markDone,
    importTasks,
    exportData,
    addReview,
    updateReview,
    deleteReview,
    pushNow,
    pullNow,
  }
}
