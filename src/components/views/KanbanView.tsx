import React, { useState } from 'react'
import { Plus, Search, AlertTriangle } from 'lucide-react'
import { Task, TaskStatus, TaskArea, STATUS_LABELS, AREA_LABELS, calcPriorityScore } from '../../types'
import { TaskCard } from '../task/TaskCard'
import { sumEstimatedMinutes, formatMinutes } from '../../utils/taskUtils'

interface KanbanViewProps {
  tasks: Task[]
  onTaskClick: (task: Task) => void
  onMarkDone: (id: string) => void
  onAddTask: () => void
  onUpdateStatus: (id: string, status: TaskStatus) => void
}

const KANBAN_COLUMNS: TaskStatus[] = ['idea', 'todo', 'in_progress', 'done']

const STATUS_COLORS: Partial<Record<TaskStatus, string>> = {
  idea: 'bg-[#f6f4fa]',
  todo: 'bg-amber-50',
  in_progress: 'bg-sky-50',
  done: 'bg-emerald-50',
}
const STATUS_ACCENT: Partial<Record<TaskStatus, string>> = {
  idea: 'text-violet-600',
  todo: 'text-stone-600',
  in_progress: 'text-sky-600',
  done: 'text-emerald-600',
}
const STATUS_TAB_ACTIVE: Partial<Record<TaskStatus, string>> = {
  idea: 'border-violet-500 text-violet-600',
  todo: 'border-stone-900 text-stone-900',
  in_progress: 'border-sky-500 text-sky-600',
  done: 'border-emerald-500 text-emerald-600',
}

export function KanbanView({ tasks, onTaskClick, onMarkDone, onAddTask, onUpdateStatus }: KanbanViewProps) {
  const [search, setSearch] = useState('')
  const [filterArea, setFilterArea] = useState<TaskArea | 'all'>('work')
  const [dragging, setDragging] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState<TaskStatus | null>(null)
  const [mobileTab, setMobileTab] = useState<TaskStatus>('todo')

  const filtered = tasks.filter(t => {
    const matchArea = filterArea === 'all' || t.area === filterArea
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase())
    return matchArea && matchSearch
  })

  const byStatus = (status: TaskStatus) =>
    filtered.filter(t => t.status === status).sort((a, b) => calcPriorityScore(b) - calcPriorityScore(a))

  const handleDragStart = (id: string) => setDragging(id)
  const handleDragEnd = () => { setDragging(null); setDragOver(null) }
  const handleDrop = (status: TaskStatus) => {
    if (dragging) { onUpdateStatus(dragging, status); setDragging(null); setDragOver(null) }
  }

  const areas: { value: TaskArea; label: string }[] = [
    { value: 'work', label: '工作' },
    { value: 'learning', label: '学习' },
    { value: 'finance', label: '财务' },
    { value: 'life', label: '健康' },
  ]

  return (
    <div className="flex flex-col h-full md:h-screen">

      {/* ── Mobile toolbar ── */}
      <div className="md:hidden flex items-center gap-2 px-4 py-3 bg-white border-b border-stone-100">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-300" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜索任务..."
            className="w-full pl-8 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-700 placeholder-stone-300 focus:outline-none"
          />
        </div>
        <button
          onClick={onAddTask}
          className="flex items-center gap-1 px-3.5 py-2 bg-stone-900 text-white text-sm font-medium rounded-xl flex-shrink-0"
        >
          <Plus size={14} /> 新增
        </button>
      </div>

      {/* ── Mobile tabs ── */}
      <div className="md:hidden flex border-b border-stone-100 bg-white">
        {KANBAN_COLUMNS.map(status => (
          <button
            key={status}
            onClick={() => setMobileTab(status)}
            className={`flex-1 py-3 text-xs font-medium border-b-2 transition-colors ${
              mobileTab === status
                ? STATUS_TAB_ACTIVE[status]
                : 'border-transparent text-stone-400'
            }`}
          >
            {STATUS_LABELS[status]}
            <span className="ml-1 opacity-60">{byStatus(status).length}</span>
          </button>
        ))}
      </div>

      {/* ── Mobile single column ── */}
      <div className="md:hidden flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {byStatus(mobileTab).map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onClick={() => onTaskClick(task)}
            onMarkDone={() => onMarkDone(task.id)}
          />
        ))}
        {byStatus(mobileTab).length === 0 && (
          <div className="py-12 text-center text-sm text-stone-300">暂无任务</div>
        )}
      </div>

      {/* ── Desktop toolbar ── */}
      <div className="hidden md:flex items-center gap-4 px-8 py-5 border-b border-stone-100 bg-white flex-shrink-0">
        <div className="relative w-60 flex-shrink-0">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-300" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜索任务..."
            className="w-full pl-8 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-700 placeholder-stone-300 focus:outline-none focus:border-stone-400 transition-colors"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {areas.map(a => (
            <button
              key={a.value}
              onClick={() => setFilterArea(filterArea === a.value ? 'all' : a.value)}
              className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                filterArea === a.value
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
        <button
          onClick={onAddTask}
          className="flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white text-sm font-medium rounded-xl hover:bg-stone-700 transition-colors ml-auto"
        >
          <Plus size={15} /> 新增任务
        </button>
      </div>

      {/* ── Desktop columns ── */}
      <div className="hidden md:block flex-1 overflow-x-auto px-6 py-6">
        <div className="flex gap-4 h-full min-w-max">
          {KANBAN_COLUMNS.map(status => {
            const col = byStatus(status)
            const isDragTarget = dragOver === status
            const colMinutes = sumEstimatedMinutes(col)
            const tooManyInProgress = status === 'in_progress' && col.length > 5
            const isDoneCol = status === 'done'

            return (
              <div
                key={status}
                className={`flex flex-col w-80 rounded-2xl transition-colors ${STATUS_COLORS[status] ?? 'bg-stone-100'} ${isDragTarget ? 'ring-2 ring-stone-400' : ''} ${isDoneCol && col.length === 0 ? 'self-start' : ''}`}
                onDragOver={e => { e.preventDefault(); setDragOver(status) }}
                onDragLeave={() => setDragOver(null)}
                onDrop={() => handleDrop(status)}
              >
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-semibold ${STATUS_ACCENT[status] ?? 'text-stone-600'}`}>{STATUS_LABELS[status]}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full bg-white/70 ${STATUS_ACCENT[status] ?? 'text-stone-600'}`}>{col.length}</span>
                    {colMinutes > 0 && (
                      <span className="text-[10px] text-stone-400">预计 {formatMinutes(colMinutes)}</span>
                    )}
                  </div>
                  {status === 'todo' && (
                    <button onClick={onAddTask} className="w-5 h-5 rounded-full bg-white/70 flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-white transition-colors">
                      <Plus size={12} />
                    </button>
                  )}
                </div>

                {tooManyInProgress && (
                  <div className="mx-3 mb-2 px-2.5 py-1.5 bg-amber-50 border border-amber-100 text-amber-700 text-[11px] rounded-lg flex items-start gap-1.5">
                    <AlertTriangle size={11} className="flex-shrink-0 mt-0.5" />
                    <span>进行中任务较多，建议先完成一部分</span>
                  </div>
                )}

                {isDoneCol && col.length === 0 ? (
                  <div className="px-4 pb-3 text-xs text-stone-300">暂无已完成任务</div>
                ) : (
                  <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2 min-h-24">
                    {col.map(task => (
                      <div key={task.id} draggable onDragStart={() => handleDragStart(task.id)} onDragEnd={handleDragEnd}
                        className={`transition-opacity ${dragging === task.id ? 'opacity-40' : ''}`}>
                        <TaskCard task={task} onClick={() => onTaskClick(task)} onMarkDone={() => onMarkDone(task.id)} />
                      </div>
                    ))}
                    {col.length === 0 && <div className="py-6 text-center text-xs text-stone-300">暂无任务</div>}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}
