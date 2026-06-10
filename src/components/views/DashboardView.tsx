import React from 'react'
import { Clock, TrendingUp, Zap, Plus, Inbox, Play, AlertTriangle } from 'lucide-react'
import { Task } from '../../types'
import {
  isDueToday, isOverdue, getTop3Tasks,
  formatMinutes, sumEstimatedMinutes,
} from '../../utils/taskUtils'
import { TaskCard } from '../task/TaskCard'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface DashboardViewProps {
  tasks: Task[]
  onTaskClick: (task: Task) => void
  onMarkDone: (id: string) => void
  onAddTask: () => void
}

function Stat({ icon, label, value, accent }: {
  icon: React.ReactNode
  label: string
  value: string | number
  accent?: string
}) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white border border-stone-100">
      <div className={`text-stone-400 ${accent ?? ''}`}>{icon}</div>
      <div className="flex flex-col leading-tight">
        <span className={`text-base font-medium ${accent ?? 'text-stone-800'}`}>{value}</span>
        <span className="text-xs text-stone-400">{label}</span>
      </div>
    </div>
  )
}

export function DashboardView({ tasks, onTaskClick, onMarkDone, onAddTask }: DashboardViewProps) {
  const active = tasks.filter(t => t.status !== 'done' && t.status !== 'paused')
  const todayTasks = active.filter(t => isDueToday(t) && !isOverdue(t))
  const overdueTasks = active.filter(isOverdue)
  const top3 = getTop3Tasks(tasks)
  const ideaTasks = tasks.filter(t => t.status === 'idea')

  const inProgressCount = active.filter(t => t.status === 'in_progress').length
  const highPriorityCount = active.filter(t => t.importance >= 4 && t.urgency >= 4).length
  const todayMinutes = sumEstimatedMinutes([...todayTasks, ...overdueTasks])

  const today = format(new Date(), 'M月d日 EEEE', { locale: zhCN })

  /* Summary bar — shared between mobile & desktop */
  const summaryItems = (
    <>
      <Stat icon={<Inbox size={16} />} label="今日待办" value={todayTasks.length + overdueTasks.length} />
      <Stat icon={<Play size={16} />} label="进行中" value={inProgressCount} />
      <Stat icon={<Zap size={16} />} label="高优先级" value={highPriorityCount} accent={highPriorityCount >= 4 ? 'text-amber-600' : undefined} />
      <Stat icon={<Clock size={16} />} label="今日预估" value={todayMinutes > 0 ? formatMinutes(todayMinutes) : '—'} />
      {overdueTasks.length > 0 && (
        <Stat icon={<AlertTriangle size={16} />} label="已逾期" value={overdueTasks.length} accent="text-red-500" />
      )}
    </>
  )

  /* Empty state shared */
  const emptyIdea = (
    <div className="flex items-center justify-between text-xs">
      <span className="text-stone-400">还没有幻想中的事</span>
      <button onClick={onAddTask} className="text-stone-500 hover:text-stone-900 transition-colors">
        + 添加
      </button>
    </div>
  )

  return (
    <>
      {/* ── Mobile layout ── */}
      <div className="md:hidden flex flex-col gap-3 p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-stone-400">{today}</div>
            <h1 className="text-lg font-semibold text-stone-800 mt-0.5">今日驾驶舱</h1>
          </div>
          <button
            onClick={onAddTask}
            className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-white text-sm font-medium rounded-xl"
          >
            <Plus size={15} /> 新增
          </button>
        </div>

        {/* Status summary */}
        <div className="grid grid-cols-2 gap-2">
          {summaryItems}
        </div>

        {/* Top 3 — main focus */}
        <div className="bg-white rounded-2xl border border-stone-100 ring-1 ring-stone-200">
          <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-stone-50">
            <TrendingUp size={14} className="text-stone-700" />
            <span className="text-xs font-semibold text-stone-800 uppercase tracking-wider">最重要 5 件事</span>
          </div>
          <div className="px-4 py-3 space-y-2">
            {top3.length === 0
              ? <p className="text-xs text-stone-300 py-2 text-center">暂无待办任务</p>
              : top3.map((task, i) => (
                <div key={task.id} className="flex gap-2.5 items-start">
                  <div className="w-5 h-5 rounded-full bg-stone-100 flex items-center justify-center text-xs text-stone-400 flex-shrink-0 mt-0.5 font-medium">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <TaskCard task={task} onClick={() => onTaskClick(task)} onMarkDone={() => onMarkDone(task.id)} compact />
                  </div>
                </div>
              ))
            }
          </div>
        </div>

        {/* Today */}
        <div className="bg-white rounded-2xl border border-stone-100">
          <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-stone-50">
            <Clock size={14} className="text-stone-400" />
            <span className="text-xs font-semibold text-stone-600 uppercase tracking-wider">今日截止</span>
            {todayTasks.length > 0 && <span className="ml-auto text-xs text-stone-400">{todayTasks.length} 项</span>}
          </div>
          <div className="px-4 py-3 space-y-2">
            {todayTasks.length === 0
              ? <p className="text-xs text-stone-300 py-1 text-center">今天没有截止任务</p>
              : todayTasks.map(task => (
                <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} onMarkDone={() => onMarkDone(task.id)} compact />
              ))
            }
          </div>
        </div>

        {/* Ideas */}
        <div className="bg-white rounded-2xl border border-stone-100">
          <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-stone-50">
            <Zap size={14} className="text-violet-400" />
            <span className="text-xs font-semibold text-stone-600 uppercase tracking-wider">幻想中</span>
            {ideaTasks.length > 0 && <span className="ml-auto text-xs text-stone-400">{ideaTasks.length} 项</span>}
          </div>
          <div className="px-4 py-3 space-y-2">
            {ideaTasks.length === 0
              ? <div className="py-1">{emptyIdea}</div>
              : ideaTasks.map(task => (
                <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} onMarkDone={() => onMarkDone(task.id)} compact />
              ))
            }
          </div>
        </div>

      </div>

      {/* ── Desktop layout ── */}
      <div className="hidden md:flex flex-col h-full p-6 gap-4 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between flex-shrink-0">
          <div>
            <div className="text-xs text-stone-400">{today}</div>
            <h1 className="text-xl font-light text-stone-800 mt-0.5">今日驾驶舱</h1>
          </div>
          <button
            onClick={onAddTask}
            className="flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white text-sm font-medium rounded-xl hover:bg-stone-700 transition-colors"
          >
            <Plus size={15} /> 新增任务
          </button>
        </div>

        {/* Status summary */}
        <div className="flex gap-2 flex-shrink-0">
          {summaryItems}
        </div>

        {/* Main grid */}
        <div className="flex-1 grid grid-cols-4 gap-4 min-h-0">

          {/* Left col: Top3 + Today */}
          <div className="col-span-2 flex flex-col gap-4 min-h-0">
            {/* Top 3 — emphasised */}
            <div className="bg-white rounded-2xl border border-stone-100 ring-1 ring-stone-200 flex flex-col min-h-0 flex-1">
              <div className="flex items-center gap-2 px-5 pt-4 pb-3 border-b border-stone-50 flex-shrink-0">
                <TrendingUp size={14} className="text-stone-700" />
                <span className="text-xs font-semibold text-stone-800 uppercase tracking-wider">最重要 5 件事</span>
                <span className="ml-auto text-[10px] text-stone-400">今天先做这些</span>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
                {top3.length === 0
                  ? <div className="text-xs text-stone-300 py-4 text-center">暂无待办任务</div>
                  : top3.map((task, i) => (
                    <div key={task.id} className="flex gap-2.5 items-start">
                      <div className="w-5 h-5 rounded-full bg-stone-100 flex items-center justify-center text-xs text-stone-400 flex-shrink-0 mt-0.5 font-medium">{i + 1}</div>
                      <div className="flex-1 min-w-0">
                        <TaskCard task={task} onClick={() => onTaskClick(task)} onMarkDone={() => onMarkDone(task.id)} compact />
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>

            {/* Today */}
            <div className="bg-white rounded-2xl border border-stone-100 flex flex-col min-h-0" style={{ maxHeight: '38%' }}>
              <div className="flex items-center gap-2 px-5 pt-4 pb-3 border-b border-stone-50 flex-shrink-0">
                <Clock size={14} className="text-stone-400" />
                <span className="text-xs font-semibold text-stone-600 uppercase tracking-wider">今日截止</span>
                {todayTasks.length > 0 && <span className="ml-auto text-xs text-stone-400">{todayTasks.length} 项</span>}
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
                {todayTasks.length === 0
                  ? <div className="text-xs text-stone-300 py-2 text-center">今天没有截止任务</div>
                  : todayTasks.map(task => (
                    <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} onMarkDone={() => onMarkDone(task.id)} compact />
                  ))
                }
              </div>
            </div>
          </div>

          {/* Center: Ideas */}
          <div className="col-span-2 bg-white rounded-2xl border border-stone-100 flex flex-col min-h-0">
            <div className="flex items-center gap-2 px-5 pt-4 pb-3 border-b border-stone-50 flex-shrink-0">
              <Zap size={14} className="text-violet-400" />
              <span className="text-xs font-semibold text-stone-600 uppercase tracking-wider">幻想中</span>
              {ideaTasks.length > 0 && <span className="ml-auto text-xs text-stone-400">{ideaTasks.length} 项</span>}
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
              {ideaTasks.length === 0
                ? <div className="py-2">{emptyIdea}</div>
                : ideaTasks.map(task => (
                  <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} onMarkDone={() => onMarkDone(task.id)} compact />
                ))
              }
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
