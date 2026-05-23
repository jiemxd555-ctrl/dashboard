import { useState, useEffect, useCallback } from 'react'
import { Task, Review } from '../types'
import { SAMPLE_TASKS, SAMPLE_REVIEWS } from '../utils/sampleData'
import { generateId, generateReviewId } from '../utils/taskUtils'

const TASKS_KEY = 'dashboard_tasks'
const REVIEWS_KEY = 'dashboard_reviews'

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

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks)
  const [reviews, setReviews] = useState<Review[]>(loadReviews)

  useEffect(() => {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks))
  }, [tasks])

  useEffect(() => {
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews))
  }, [reviews])

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

  return {
    tasks,
    reviews,
    addTask,
    updateTask,
    deleteTask,
    markDone,
    importTasks,
    exportData,
    addReview,
    updateReview,
    deleteReview,
  }
}
