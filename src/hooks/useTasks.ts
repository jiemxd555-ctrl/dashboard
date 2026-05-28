import { useState, useEffect, useCallback, useRef } from 'react'
import { Task, ENOMember } from '../types'
import { SAMPLE_TASKS } from '../utils/sampleData'
import { DEFAULT_ENO_TEAM } from '../utils/enoData'
import { generateId } from '../utils/taskUtils'

const TASKS_KEY = 'dashboard_tasks'
const ENO_KEY = 'dashboard_eno_team'
const SAVED_AT_KEY = 'dashboard_saved_at'

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'offline' | 'error'

function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(TASKS_KEY)
    if (raw) return JSON.parse(raw) as Task[]
  } catch {}
  return SAMPLE_TASKS
}

function loadENOTeam(): ENOMember[] {
  try {
    const raw = localStorage.getItem(ENO_KEY)
    if (raw) return JSON.parse(raw) as ENOMember[]
  } catch {}
  return DEFAULT_ENO_TEAM
}

/** 取本地最近一次「同步标记」，没有则用本地任务的最新 updatedAt 当作隐式标记 */
function readLocalSavedAt(tasks: Task[]): string {
  const explicit = localStorage.getItem(SAVED_AT_KEY) || ''
  if (explicit) return explicit
  return tasks.reduce((max, t) => (t.updatedAt > max ? t.updatedAt : max), '')
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks)
  const [enoTeam, setENOTeam] = useState<ENOMember[]>(loadENOTeam)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle')

  const dataRef = useRef({ tasks, enoTeam })
  dataRef.current = { tasks, enoTeam }

  const initialFetchDone = useRef(false)
  const pushTimerRef = useRef<number | null>(null)
  const retryTimerRef = useRef<number | null>(null)
  const retryCountRef = useRef(0)
  const inFlightRef = useRef(false)
  const isPullingRef = useRef(false)

  // 持久化到 localStorage
  useEffect(() => {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks))
  }, [tasks])

  useEffect(() => {
    localStorage.setItem(ENO_KEY, JSON.stringify(enoTeam))
  }, [enoTeam])

  // 推送到云端
  const pushNow = useCallback(async () => {
    if (inFlightRef.current) return
    inFlightRef.current = true
    setSyncStatus('syncing')
    try {
      const savedAt = new Date().toISOString()
      const payload = {
        tasks: dataRef.current.tasks,
        enoTeam: dataRef.current.enoTeam,
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
      retryCountRef.current = 0 // 成功后重置重试计数
    } catch (err) {
      console.warn('Cloud sync push failed:', err)
      setSyncStatus('error')
      // 自动重试，最多 3 次，间隔 10s
      if (retryCountRef.current < 3) {
        retryCountRef.current += 1
        if (retryTimerRef.current) window.clearTimeout(retryTimerRef.current)
        retryTimerRef.current = window.setTimeout(() => { pushNow() }, 10_000)
      }
    } finally {
      inFlightRef.current = false
    }
  }, [])

  const schedulePush = useCallback(() => {
    if (!initialFetchDone.current) return
    if (pushTimerRef.current) window.clearTimeout(pushTimerRef.current)
    pushTimerRef.current = window.setTimeout(() => { pushNow() }, 1500)
  }, [pushNow])

  // 初次：从云端拉取
  useEffect(() => {
    let cancelled = false

    async function init() {
      setSyncStatus('syncing')
      try {
        const res = await fetch('/api/sync')
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const cloud = (await res.json()) as
          | { tasks: Task[]; enoTeam?: ENOMember[]; savedAt: string }
          | null
        if (cancelled) return

        const hasLocalHistory = !!localStorage.getItem(SAVED_AT_KEY)
        const localSavedAt = readLocalSavedAt(dataRef.current.tasks)
        const cloudSavedAt = cloud?.savedAt || ''

        if (cloud && cloudSavedAt && (!hasLocalHistory || cloudSavedAt >= localSavedAt)) {
          isPullingRef.current = true
          setTasks(cloud.tasks)
          if (cloud.enoTeam) setENOTeam(cloud.enoTeam)
          localStorage.setItem(SAVED_AT_KEY, cloudSavedAt)
          setSyncStatus('synced')
          initialFetchDone.current = true
        } else if (hasLocalHistory && (!cloud || !cloudSavedAt || localSavedAt > cloudSavedAt)) {
          initialFetchDone.current = true
          await pushNow()
        } else if (!cloud || !cloudSavedAt) {
          setSyncStatus('synced')
          initialFetchDone.current = true
        } else {
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
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 数据变化 → 防抖推送
  useEffect(() => {
    if (isPullingRef.current) {
      isPullingRef.current = false
      return
    }
    if (initialFetchDone.current) {
      schedulePush()
    }
  }, [tasks, enoTeam, schedulePush])

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

  const importTasks = useCallback((data: { tasks?: Task[]; enoTeam?: ENOMember[] }) => {
    if (data.tasks) setTasks(data.tasks)
    if (data.enoTeam) setENOTeam(data.enoTeam)
  }, [])

  const exportData = useCallback(() => {
    const blob = new Blob(
      [JSON.stringify({ tasks, enoTeam, exportedAt: new Date().toISOString() }, null, 2)],
      { type: 'application/json' }
    )
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dashboard-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [tasks, enoTeam])

  // —— ENO 团队 ——
  const updateENOTeam = useCallback((team: ENOMember[]) => {
    setENOTeam(team)
  }, [])

  // 手动从云端拉取
  const pullNow = useCallback(async () => {
    setSyncStatus('syncing')
    try {
      const res = await fetch('/api/sync')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const cloud = (await res.json()) as
        | { tasks: Task[]; enoTeam?: ENOMember[]; savedAt: string }
        | null
      if (cloud && cloud.savedAt) {
        isPullingRef.current = true
        setTasks(cloud.tasks)
        if (cloud.enoTeam) setENOTeam(cloud.enoTeam)
        localStorage.setItem(SAVED_AT_KEY, cloud.savedAt)
      }
      setSyncStatus('synced')
      retryCountRef.current = 0
    } catch (err) {
      console.warn('Cloud sync pull failed:', err)
      setSyncStatus('error')
      // 自动重试，最多 3 次，间隔 10s
      if (retryCountRef.current < 3) {
        retryCountRef.current += 1
        if (retryTimerRef.current) window.clearTimeout(retryTimerRef.current)
        retryTimerRef.current = window.setTimeout(() => { pullNow() }, 10_000)
      }
    }
  }, [])

  // 切回页面时自动同步
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible' && initialFetchDone.current) {
        pullNow()
      }
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [pullNow])

  return {
    tasks,
    enoTeam,
    syncStatus,
    addTask,
    updateTask,
    deleteTask,
    markDone,
    importTasks,
    exportData,
    updateENOTeam,
    pushNow,
    pullNow,
  }
}
