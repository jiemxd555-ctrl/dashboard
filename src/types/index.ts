export type TaskStatus =
  | 'inbox'
  | 'idea'
  | 'todo'
  | 'in_progress'
  | 'waiting'
  | 'done'
  | 'paused'

export type TaskArea =
  | 'work'
  | 'learning'
  | 'finance'
  | 'life'

export type EnergyLevel = 'low' | 'medium' | 'high'

export interface Task {
  id: string
  title: string
  area: TaskArea
  status: TaskStatus
  importance: number      // 1-5
  urgency: number         // 1-5
  longTermValue: number   // 1-5
  difficulty: number      // 1-5
  energy: EnergyLevel
  deadline?: string       // ISO date string
  estimatedMinutes?: number
  blocker?: string
  tags: string[]
  notes?: string
  nextAction?: string
  createdAt: string
  updatedAt: string
}

export type ViewType = 'dashboard' | 'briefing' | 'eno' | 'kanban' | 'domain' | 'timeline' | 'stress'

// ── ENO 摄影部 ──────────────────────────────────────────
export interface ENOTaskItem {
  name: string
  qty: string
  primary?: boolean
}

export interface ENOSection {
  tag: string
  items: ENOTaskItem[]
}

export interface ENOMember {
  id: string
  name: string
  role: string
  metric: string
  sections: ENOSection[]
}

export const AREA_LABELS: Record<TaskArea, string> = {
  work: '工作',
  learning: '学习成长',
  finance: '财务',
  life: '运动与健康',
}

export const AREA_COLORS: Record<TaskArea, string> = {
  work: 'bg-slate-200 text-slate-700',
  learning: 'bg-stone-200 text-stone-700',
  finance: 'bg-zinc-200 text-zinc-700',
  life: 'bg-neutral-200 text-neutral-700',
}

export const AREA_DOT: Record<TaskArea, string> = {
  work: 'bg-slate-500',
  learning: 'bg-amber-500',
  finance: 'bg-emerald-500',
  life: 'bg-sky-500',
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  inbox: '收集箱',
  idea: '幻想中',
  todo: '未开始',
  in_progress: '进行中',
  waiting: '等待中',
  done: '已完成',
  paused: '暂停',
}

export const STATUS_ORDER: TaskStatus[] = [
  'inbox',
  'idea',
  'todo',
  'in_progress',
  'waiting',
  'done',
  'paused',
]

export const ENERGY_LABELS: Record<EnergyLevel, string> = {
  low: '低耗能',
  medium: '中耗能',
  high: '高耗能',
}

export function calcPriorityScore(task: Pick<Task, 'importance' | 'urgency' | 'longTermValue' | 'difficulty'>) {
  return task.importance * 3 + task.urgency * 2 + task.longTermValue * 2 - task.difficulty
}

export function getPriorityLabel(score: number): { label: string; color: string } {
  if (score >= 20) return { label: '极高', color: 'text-red-600' }
  if (score >= 15) return { label: '高', color: 'text-orange-500' }
  if (score >= 10) return { label: '中', color: 'text-yellow-600' }
  return { label: '低', color: 'text-stone-400' }
}

export function getPriorityBadge(score: number): string {
  if (score >= 20) return 'bg-red-50 text-red-600 border border-red-200'
  if (score >= 15) return 'bg-orange-50 text-orange-600 border border-orange-200'
  if (score >= 10) return 'bg-yellow-50 text-yellow-700 border border-yellow-200'
  return 'bg-stone-100 text-stone-500 border border-stone-200'
}
