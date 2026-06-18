import React from 'react'
import { AlertTriangle, TrendingDown, Clock, Zap, Pause, Eye, Lightbulb } from 'lucide-react'
import { Task } from '../../types'
import {
  calcStressIndex, getStressLevel, isOverdue, isDueThisWeek, formatMinutes,
  getStressAdvice,
} from '../../utils/taskUtils'
import { TaskCard } from '../task/TaskCard'

interface StressViewProps {
  tasks: Task[]
  onTaskClick: (task: Task) => void
  onMarkDone: (id: string) => void
}

function Factor({ label, value, max, icon, warn }: {
  label: string; value: number | string; max?: number; icon: React.ReactNode; warn?: boolean
}) {
  return (
    <div className={`bg-white rounded-2xl border p-5 ${warn ? 'border-orange-200' : 'border-stone-100'}`}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs text-stone-400">{label}</span>
        <span className={`${warn ? 'text-orange-400' : 'text-stone-300'}`}>{icon}</span>
      </div>
      <div className={`text-2xl font-light ${warn ? 'text-orange-600' : 'text-stone-700'}`}>{value}</div>
      {typeof max === 'number' && typeof value === 'number' && (
        <div className="mt-3 bg-stone-100 rounded-full h-1 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${warn ? 'bg-orange-400' : 'bg-stone-400'}`}
            style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
          />
        </div>
      )}
    </div>
  )
}

export function StressView({ tasks, onTaskClick, onMarkDone }: StressViewProps) {
  const active = tasks.filter(t => t.status !== 'done')
  const stressIndex = calcStressIndex(tasks)
  const stressLevel = getStressLevel(stressIndex)

  const inProgress = active.filter(t => t.status === 'in_progress')
  const overdue = active.filter(isOverdue)
  const highPriority = active.filter(t => t.importance >= 4 && t.urgency >= 4)
  const waiting = active.filter(t => t.status === 'waiting')
  const weekMinutes = active.filter(isDueThisWeek).reduce((s, t) => s + (t.estimatedMinutes ?? 0), 0)

  // Relief suggestions
  const paused = active.filter(t => t.importance <= 2 && t.urgency <= 2)
  const lowValue = active.filter(t => t.importance * 3 + t.urgency * 2 + t.longTermValue * 2 - t.difficulty < 10)
  const urgentItems = [...new Map([...overdue, ...highPriority].map(task => [task.id, task])).values()]

  const arcDeg = (stressIndex / 10) * 180

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="mb-5 md:mb-8">
        <h1 className="text-lg md:text-2xl font-semibold md:font-light text-stone-800">压力视图</h1>
        <p className="text-xs md:text-sm text-stone-400 mt-0.5">系统自动根据任务数据计算当前压力指数</p>
      </div>

      {/* Big gauge */}
      <div className="bg-white rounded-3xl border border-stone-100 p-8 mb-6 flex flex-col items-center">
        {/* Semicircle gauge */}
        <div className="relative w-48 h-24 mb-4 overflow-hidden">
          <svg viewBox="0 0 200 100" className="w-full h-full">
            <path d="M 10 100 A 90 90 0 0 1 190 100" fill="none" stroke="#e7e5e4" strokeWidth="12" strokeLinecap="round" />
            <path
              d="M 10 100 A 90 90 0 0 1 190 100"
              fill="none"
              stroke={stressIndex <= 3 ? '#10b981' : stressIndex <= 6 ? '#0ea5e9' : stressIndex <= 8 ? '#f97316' : '#ef4444'}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${(stressIndex / 10) * 283} 283`}
            />
            <text x="100" y="90" textAnchor="middle" fontSize="32" fontWeight="300" fill="#1c1917">
              {stressIndex}
            </text>
          </svg>
        </div>

        <div className={`text-xl font-medium ${stressLevel.color} mb-2`}>{stressLevel.label}</div>
        <p className={`text-sm ${stressLevel.color} max-w-xs text-center`}>{stressLevel.message}</p>

        {/* Smart advice */}
        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-stone-100 rounded-full">
          <Lightbulb size={12} className="text-stone-500" />
          <span className="text-xs text-stone-600">
            {getStressAdvice({
              overdue: overdue.length,
              inProgress: inProgress.length,
              weekMinutes,
              highPriority: highPriority.length,
            })}
          </span>
        </div>

        {/* Scale */}
        <div className="flex items-center gap-0 mt-4 text-xs text-stone-400">
          {['0', '', '', '轻松', '', '', '正常', '', '偏高', '', '过载'].map((label, i) => (
            <div key={i} className={`w-8 text-center ${i === Math.round(stressIndex) ? 'font-bold text-stone-700' : ''}`}>
              {i % 2 === 0 ? i : ''}
            </div>
          ))}
        </div>
      </div>

      {/* Factor grid — 压力来源 */}
      <div className="mb-6">
        <h2 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">压力来源</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Factor label="进行中任务" value={inProgress.length} max={10} icon={<TrendingDown size={16} />} warn={inProgress.length >= 5} />
          <Factor label="已逾期任务" value={overdue.length} max={10} icon={<AlertTriangle size={16} />} warn={overdue.length > 0} />
          <Factor label="高优先级" value={highPriority.length} max={10} icon={<Zap size={16} />} warn={highPriority.length >= 4} />
          <Factor label="本周预计耗时" value={weekMinutes > 0 ? formatMinutes(weekMinutes) : '—'} icon={<Clock size={16} />} warn={weekMinutes > 2400} />
          <Factor label="等待中任务" value={waiting.length} max={10} icon={<Pause size={16} />} warn={waiting.length >= 4} />
        </div>
      </div>

      {/* Relief suggestions */}
      {stressIndex >= 6 && (
        <div className="bg-stone-50 rounded-2xl border border-stone-100 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Eye size={15} className="text-stone-400" />
            <h2 className="text-sm font-medium text-stone-700">减压建议 — 可延期 / 砍掉的任务</h2>
          </div>
          {paused.length + lowValue.length === 0 ? (
            <p className="text-sm text-stone-400">暂无明显低价值任务，建议检查是否有任务可以委托他人。</p>
          ) : (
            <div className="space-y-2">
              {[...new Map([...paused, ...lowValue].map(t => [t.id, t])).values()].slice(0, 5).map(task => (
                <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} onMarkDone={() => onMarkDone(task.id)} compact />
              ))}
            </div>
          )}
        </div>
      )}

      {/* High pressure items */}
      {overdue.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-stone-700 mb-3 flex items-center gap-2">
            <AlertTriangle size={14} className="text-red-400" /> 需要立即处理
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {urgentItems.slice(0, 6).map(task => (
              <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} onMarkDone={() => onMarkDone(task.id)} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
