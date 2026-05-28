import { Task } from '../types'
import { isToday, isThisWeek, isThisMonth, isPast, parseISO, startOfDay } from 'date-fns'

export function isOverdue(task: Task): boolean {
  if (!task.deadline || task.status === 'done') return false
  return isPast(startOfDay(parseISO(task.deadline + 'T23:59:59'))) &&
    !isToday(parseISO(task.deadline))
}

export function isDueToday(task: Task): boolean {
  if (!task.deadline) return false
  return isToday(parseISO(task.deadline))
}

export function isDueThisWeek(task: Task): boolean {
  if (!task.deadline) return false
  return isThisWeek(parseISO(task.deadline), { weekStartsOn: 1 })
}

export function isDueThisMonth(task: Task): boolean {
  if (!task.deadline) return false
  return isThisMonth(parseISO(task.deadline))
}

export function calcStressIndex(tasks: Task[]): number {
  const active = tasks.filter(t => t.status !== 'done')

  const inProgress = active.filter(t => t.status === 'in_progress').length
  const overdue = active.filter(t => isOverdue(t)).length
  const highPriority = active.filter(t => t.importance >= 4 && t.urgency >= 4).length
  const weekMinutes = active
    .filter(t => isDueThisWeek(t))
    .reduce((sum, t) => sum + (t.estimatedMinutes ?? 0), 0)
  const highEnergy = active.filter(t => t.energy === 'high').length
  const waiting = active.filter(t => t.status === 'waiting').length

  let score = 0
  score += Math.min(inProgress * 0.8, 3)
  score += Math.min(overdue * 1.5, 3)
  score += Math.min(highPriority * 0.6, 2)
  score += Math.min(weekMinutes / 600, 1.5)
  score += Math.min(highEnergy * 0.4, 1.5)
  score += Math.min(waiting * 0.3, 1)

  return Math.min(Math.round(score * 10) / 10, 10)
}

export function getStressLevel(score: number): { label: string; color: string; bg: string; message: string } {
  if (score <= 3) return {
    label: '轻松',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    message: '当前状态良好，保持节奏。',
  }
  if (score <= 6) return {
    label: '正常',
    color: 'text-sky-600',
    bg: 'bg-sky-50',
    message: '任务量在合理范围内，注意留白时间。',
  }
  if (score <= 8) return {
    label: '偏高',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    message: '当前任务压力偏高，建议砍掉或延期低优先级事项。',
  }
  return {
    label: '过载',
    color: 'text-red-600',
    bg: 'bg-red-50',
    message: '任务严重过载！请立即停止接新任务，聚焦最重要的 3 件事。',
  }
}

export function generateId(): string {
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h${m}m` : `${h}h`
}

export function getTop3Tasks(tasks: Task[]): Task[] {
  return tasks
    .filter(t => t.status !== 'done' && t.status !== 'paused')
    .sort((a, b) => {
      const scoreA = a.importance * 3 + a.urgency * 2 + a.longTermValue * 2 - a.difficulty
      const scoreB = b.importance * 3 + b.urgency * 2 + b.longTermValue * 2 - b.difficulty
      return scoreB - scoreA
    })
    .slice(0, 3)
}

/** 给某个领域当前的待办数量一个简单文字判断 */
export function getAreaLoadLabel(count: number): { label: string; color: string } {
  if (count === 0) return { label: '空闲', color: 'text-stone-300' }
  if (count <= 3) return { label: '正常', color: 'text-emerald-500' }
  if (count <= 6) return { label: '偏多', color: 'text-amber-500' }
  return { label: '需关注', color: 'text-red-500' }
}

/** 把任务数组按优先级倒序排序后返回 */
export function sortByPriority(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const sa = a.importance * 3 + a.urgency * 2 + a.longTermValue * 2 - a.difficulty
    const sb = b.importance * 3 + b.urgency * 2 + b.longTermValue * 2 - b.difficulty
    return sb - sa
  })
}

/** 把若干任务的预计耗时求和（分钟） */
export function sumEstimatedMinutes(tasks: Task[]): number {
  return tasks.reduce((s, t) => s + (t.estimatedMinutes ?? 0), 0)
}

/** 基于任务现状生成一句简短的压力建议 */
export function getStressAdvice(opts: {
  overdue: number
  inProgress: number
  weekMinutes: number
  highPriority: number
}): string {
  if (opts.overdue > 0) return '有过期任务，建议优先处理截止风险。'
  if (opts.inProgress >= 6) return '进行中任务偏多，建议先完成已有任务再开新坑。'
  if (opts.highPriority >= 5) return '高优先级任务集中，建议从最重要 3 件开始推进。'
  if (opts.weekMinutes > 2400) return '本周预计工时偏高，留出缓冲时间。'
  return '当前状态良好，保持节奏。'
}
