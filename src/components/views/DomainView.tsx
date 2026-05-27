import React from 'react'
import { Task, TaskArea, AREA_LABELS, AREA_DOT, calcPriorityScore } from '../../types'
import { TaskCard } from '../task/TaskCard'
import { formatMinutes, getAreaLoadLabel } from '../../utils/taskUtils'
import { ENOTeamPanel } from './ENOTeamPanel'

interface DomainViewProps {
  tasks: Task[]
  onTaskClick: (task: Task) => void
  onMarkDone: (id: string) => void
  onAddTask: () => void
}

const AREAS: TaskArea[] = ['work', 'learning', 'finance', 'life']

const AREA_BG: Record<TaskArea, string> = {
  work: 'from-slate-50',
  learning: 'from-amber-50',
  finance: 'from-emerald-50',
  life: 'from-sky-50',
}

export function DomainView({ tasks, onTaskClick, onMarkDone, onAddTask }: DomainViewProps) {
  const activeTasks = tasks.filter(t => t.status !== 'done')
  const totalByArea = AREAS.map(area => ({
    area,
    tasks: activeTasks.filter(t => t.area === area),
  }))
  const grandTotal = activeTasks.length

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-5 md:mb-8">
        <div>
          <h1 className="text-lg md:text-2xl font-semibold md:font-light text-stone-800">领域视图</h1>
          <p className="text-xs md:text-sm text-stone-400 mt-0.5">查看你的精力分布是否均衡</p>
        </div>
        <button
          onClick={onAddTask}
          className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-white text-sm font-medium rounded-xl"
        >
          + 新增
        </button>
      </div>

      {/* Balance overview */}
      <div className="bg-white rounded-2xl border border-stone-100 p-6 mb-6">
        <h2 className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-4">精力分布</h2>
        <div className="flex items-end gap-3 h-16 mb-3">
          {totalByArea.map(({ area, tasks: areaT }) => {
            const pct = grandTotal === 0 ? 0 : (areaT.length / grandTotal) * 100
            const colors: Record<TaskArea, string> = {
              work: 'bg-slate-400',
              learning: 'bg-amber-400',
              finance: 'bg-emerald-400',
              life: 'bg-sky-400',
            }
            return (
              <div key={area} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-stone-400">{areaT.length}</span>
                <div className="w-full flex items-end justify-center">
                  <div
                    className={`w-full rounded-t-lg ${colors[area]} transition-all`}
                    style={{ height: `${Math.max(pct * 0.8, areaT.length > 0 ? 4 : 0)}px` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
        <div className="flex gap-3">
          {totalByArea.map(({ area }) => (
            <div key={area} className="flex-1 flex items-center gap-1 justify-center">
              <div className={`w-1.5 h-1.5 rounded-full ${AREA_DOT[area]}`} />
              <span className="text-xs text-stone-400">{AREA_LABELS[area]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Domain columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {totalByArea.map(({ area, tasks: areaT }) => {

          const sorted = [...areaT].sort((a, b) => calcPriorityScore(b) - calcPriorityScore(a))
          const totalMins = areaT.reduce((s, t) => s + (t.estimatedMinutes ?? 0), 0)
          const highPriority = areaT.filter(t => t.importance >= 4 && t.urgency >= 4).length
          const load = getAreaLoadLabel(areaT.length)

          return (
            <div key={area} className={`bg-gradient-to-b ${AREA_BG[area]} to-white rounded-2xl border border-stone-100 overflow-hidden`}>
              {/* Header */}
              <div className="px-5 pt-5 pb-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-2 h-2 rounded-full ${AREA_DOT[area]}`} />
                  <span className="text-sm font-semibold text-stone-700">{AREA_LABELS[area]}</span>
                  <span className={`text-[10px] ml-auto ${load.color}`}>{load.label}</span>
                </div>

                {/* Three key stats */}
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <div className="bg-white/60 rounded-lg px-2.5 py-2">
                    <div className="text-sm font-medium text-stone-800">{areaT.length}</div>
                    <div className="text-[10px] text-stone-400 mt-0.5">待办</div>
                  </div>
                  <div className="bg-white/60 rounded-lg px-2.5 py-2">
                    <div className="text-sm font-medium text-stone-800">{totalMins > 0 ? formatMinutes(totalMins) : '—'}</div>
                    <div className="text-[10px] text-stone-400 mt-0.5">预计耗时</div>
                  </div>
                  <div className="bg-white/60 rounded-lg px-2.5 py-2">
                    <div className={`text-sm font-medium ${highPriority > 0 ? 'text-amber-600' : 'text-stone-800'}`}>{highPriority}</div>
                    <div className="text-[10px] text-stone-400 mt-0.5">高优先级</div>
                  </div>
                </div>
              </div>

              {/* Top 1-2 tasks */}
              <div className="px-4 pb-4 space-y-2">
                {sorted.length === 0 && (
                  <div className="py-4 text-center text-xs text-stone-300">暂无活跃任务</div>
                )}
                {sorted.slice(0, 2).map(task => (
                  <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} onMarkDone={() => onMarkDone(task.id)} />
                ))}
                {sorted.length > 2 && (
                  <div className="text-center text-xs text-stone-400 pt-0.5">
                    还有 {sorted.length - 2} 项
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* ENO 摄影部 */}
      <ENOTeamPanel />
    </div>
  )
}
