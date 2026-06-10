import React from 'react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Newspaper, Sparkles, AlertTriangle, PlayCircle, MoonStar, Plus } from 'lucide-react'
import { Task } from '../../types'
import { TaskCard } from '../task/TaskCard'
import { getTop3Tasks, isDueToday, isDueThisWeek, isOverdue, formatMinutes } from '../../utils/taskUtils'

interface DailyBriefingViewProps {
  tasks: Task[]
  onTaskClick: (task: Task) => void
  onMarkDone: (id: string) => void
  onAddTask: () => void
}

function StatTile({ label, value, tone = 'text-stone-800' }: {
  label: string
  value: string | number
  tone?: string
}) {
  return (
    <div className="bg-white/80 rounded-2xl border border-stone-200 px-4 py-3">
      <div className="text-xs text-stone-400 mb-1">{label}</div>
      <div className={`text-lg md:text-xl font-medium ${tone}`}>{value}</div>
    </div>
  )
}

export function DailyBriefingView({ tasks, onTaskClick, onMarkDone, onAddTask }: DailyBriefingViewProps) {
  const active = tasks.filter(task => task.status !== 'done' && task.status !== 'paused')
  const topTasks = getTop3Tasks(tasks).slice(0, 3)
  const overdueTasks = active.filter(isOverdue)
  const dueTodayTasks = active.filter(task => isDueToday(task) && !isOverdue(task))
  const inProgressTasks = active.filter(task => task.status === 'in_progress')
  const waitingTasks = active.filter(task => task.status === 'waiting')
  const ideaTasks = tasks.filter(task => task.status === 'idea')
  const weekMinutes = active
    .filter(isDueThisWeek)
    .reduce((sum, task) => sum + (task.estimatedMinutes ?? 0), 0)

  const intro = (() => {
    if (overdueTasks.length > 0) return '先把逾期风险止住，再推进新事项。'
    if (inProgressTasks.length >= 4) return '今天适合收口，把进行中的事情一件件做完。'
    if (dueTodayTasks.length >= 3) return '今天的重点很明确，盯住截止时间就够了。'
    if (topTasks.length > 0) return '节奏不错，抓住最重要的三件事就会很稳。'
    return '今天页面很干净，适合整理想法或补充新任务。'
  })()

  const today = format(new Date(), 'M月d日 EEEE', { locale: zhCN })

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-5 md:mb-8">
        <div>
          <div className="text-xs md:text-sm text-stone-400">{today}</div>
          <h1 className="text-lg md:text-2xl font-semibold md:font-light text-stone-800 mt-0.5">每日私人简报</h1>
          <p className="text-xs md:text-sm text-stone-500 mt-2 leading-relaxed max-w-2xl">{intro}</p>
        </div>
        <button
          onClick={onAddTask}
          className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-white text-sm font-medium rounded-xl shrink-0"
        >
          <Plus size={15} /> 新增
        </button>
      </div>

      <section className="bg-gradient-to-br from-stone-100 via-stone-50 to-amber-50 rounded-3xl border border-stone-200 p-5 md:p-6 mb-6">
        <div className="flex items-center gap-2 text-stone-500 mb-4">
          <Newspaper size={15} />
          <span className="text-xs font-semibold uppercase tracking-wider">今日摘要</span>
        </div>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          <StatTile label="待处理总数" value={active.length} />
          <StatTile label="今日截止" value={dueTodayTasks.length} tone={dueTodayTasks.length > 0 ? 'text-amber-600' : undefined} />
          <StatTile label="进行中" value={inProgressTasks.length} tone={inProgressTasks.length >= 4 ? 'text-orange-600' : undefined} />
          <StatTile label="本周工时" value={weekMinutes > 0 ? formatMinutes(weekMinutes) : '—'} />
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <section className="xl:col-span-1 bg-white rounded-2xl border border-stone-100 flex flex-col min-h-0">
          <div className="flex items-center gap-2 px-5 pt-4 pb-3 border-b border-stone-50">
            <Sparkles size={14} className="text-stone-500" />
            <span className="text-xs font-semibold text-stone-600 uppercase tracking-wider">现在最该做</span>
          </div>
          <div className="px-4 py-3 space-y-2">
            {topTasks.length === 0 ? (
              <div className="text-xs text-stone-300 py-4 text-center">今天还没有需要冲刺的任务</div>
            ) : (
              topTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={() => onTaskClick(task)}
                  onMarkDone={() => onMarkDone(task.id)}
                  compact
                />
              ))
            )}
          </div>
        </section>

        <section className="xl:col-span-1 bg-white rounded-2xl border border-stone-100 flex flex-col min-h-0">
          <div className="flex items-center gap-2 px-5 pt-4 pb-3 border-b border-stone-50">
            <AlertTriangle size={14} className="text-amber-500" />
            <span className="text-xs font-semibold text-stone-600 uppercase tracking-wider">需要留意</span>
          </div>
          <div className="px-4 py-3 space-y-2">
            {[...overdueTasks, ...waitingTasks].slice(0, 4).length === 0 ? (
              <div className="text-xs text-stone-300 py-4 text-center">暂时没有明显卡点</div>
            ) : (
              [...overdueTasks, ...waitingTasks].slice(0, 4).map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={() => onTaskClick(task)}
                  onMarkDone={() => onMarkDone(task.id)}
                  compact
                />
              ))
            )}
          </div>
        </section>

        <section className="xl:col-span-1 bg-white rounded-2xl border border-stone-100 flex flex-col min-h-0">
          <div className="flex items-center gap-2 px-5 pt-4 pb-3 border-b border-stone-50">
            <MoonStar size={14} className="text-stone-500" />
            <span className="text-xs font-semibold text-stone-600 uppercase tracking-wider">稍后再看</span>
          </div>
          <div className="px-4 py-3 space-y-2">
            {ideaTasks.slice(0, 4).length === 0 ? (
              <div className="text-xs text-stone-300 py-4 text-center">幻想清单暂时为空</div>
            ) : (
              ideaTasks.slice(0, 4).map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={() => onTaskClick(task)}
                  onMarkDone={() => onMarkDone(task.id)}
                  compact
                />
              ))
            )}
          </div>
        </section>
      </div>

      <section className="mt-6 bg-white rounded-2xl border border-stone-100 p-5 md:p-6">
        <div className="flex items-center gap-2 mb-3">
          <PlayCircle size={15} className="text-stone-500" />
          <h2 className="text-sm font-medium text-stone-700">一句行动建议</h2>
        </div>
        <p className="text-sm text-stone-500 leading-relaxed">
          {overdueTasks.length > 0
            ? `今天先清掉 ${overdueTasks.length} 个逾期任务，再决定要不要开新任务。`
            : inProgressTasks.length > 0
            ? `先从 ${inProgressTasks[0].title} 开始，优先把手头正在进行的事情收口。`
            : topTasks.length > 0
            ? `把第一件事定成 ${topTasks[0].title}，做完再切第二件，会更轻松。`
            : '先补一条你今天最想推进的任务，简报会更有方向。'}
        </p>
      </section>
    </div>
  )
}
