import React, { useState } from 'react'
import { Task, calcPriorityScore } from '../../types'
import { TaskCard } from '../task/TaskCard'
import { isOverdue, isDueToday, isDueThisWeek, isDueThisMonth, sumEstimatedMinutes, formatMinutes } from '../../utils/taskUtils'
import { isFuture, parseISO, startOfDay } from 'date-fns'

interface TimelineViewProps {
  tasks: Task[]
  onTaskClick: (task: Task) => void
  onMarkDone: (id: string) => void
  onAddTask: () => void
}

type Bucket = 'overdue' | 'today' | 'week' | 'month' | 'future' | 'no_deadline'

const BUCKETS: { id: Bucket; label: string; accent: string }[] = [
  { id: 'overdue', label: '已逾期', accent: 'text-red-500' },
  { id: 'today', label: '今天', accent: 'text-sky-600' },
  { id: 'week', label: '本周', accent: 'text-amber-600' },
  { id: 'month', label: '本月', accent: 'text-stone-600' },
  { id: 'future', label: '未来', accent: 'text-violet-600' },
  { id: 'no_deadline', label: '无截止日期', accent: 'text-stone-400' },
]

function getBucket(task: Task): Bucket {
  if (task.status === 'done') return 'no_deadline'
  if (isOverdue(task)) return 'overdue'
  if (!task.deadline) return 'no_deadline'
  if (isDueToday(task)) return 'today'
  if (isDueThisWeek(task)) return 'week'
  if (isDueThisMonth(task)) return 'month'
  if (isFuture(startOfDay(parseISO(task.deadline)))) return 'future'
  return 'no_deadline'
}

export function TimelineView({ tasks, onTaskClick, onMarkDone, onAddTask }: TimelineViewProps) {
  const [activeBucket, setActiveBucket] = useState<Bucket | 'all'>('all')

  const activeTasks = tasks.filter(t => t.status !== 'done')
  const bucketMap: Record<Bucket, Task[]> = {
    overdue: [],
    today: [],
    week: [],
    month: [],
    future: [],
    no_deadline: [],
  }

  activeTasks.forEach(task => {
    bucketMap[getBucket(task)].push(task)
  })

  Object.values(bucketMap).forEach(arr => {
    arr.sort((a, b) => calcPriorityScore(b) - calcPriorityScore(a))
  })

  // 在 "全部" 模式下，跳过空分组；选定单个分组时即使空也展示
  const displayed = activeBucket === 'all'
    ? BUCKETS.filter(b => bucketMap[b.id].length > 0)
    : BUCKETS.filter(b => b.id === activeBucket)

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-5 md:mb-8">
        <div>
          <h1 className="text-lg md:text-2xl font-semibold md:font-light text-stone-800">时间视图</h1>
          <p className="text-xs md:text-sm text-stone-400 mt-0.5">按截止日期查看任务分布</p>
        </div>
        <button
          onClick={onAddTask}
          className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-white text-sm font-medium rounded-xl"
        >
          + 新增
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-6 md:mb-8 bg-stone-100 p-1 rounded-xl overflow-x-auto w-full md:w-fit">
        <button
          onClick={() => setActiveBucket('all')}
          className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
            activeBucket === 'all' ? 'bg-white text-stone-800 shadow-sm font-medium' : 'text-stone-500'
          }`}
        >
          全部
        </button>
        {BUCKETS.map(b => (
          <button
            key={b.id}
            onClick={() => setActiveBucket(b.id)}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
              activeBucket === b.id ? 'bg-white text-stone-800 shadow-sm font-medium' : 'text-stone-500'
            }`}
          >
            {b.label}
            {bucketMap[b.id].length > 0 && (
              <span className={`ml-1 ${b.id === 'overdue' ? 'text-red-400' : 'text-stone-300'}`}>
                {bucketMap[b.id].length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Sections */}
      <div className="space-y-6 md:space-y-8">
        {displayed.map(({ id, label, accent }) => {
          const groupTasks = bucketMap[id]
          const groupMins = sumEstimatedMinutes(groupTasks)
          return (
            <div key={id}>
              <div className="flex items-center gap-3 mb-3">
                <h2 className={`text-sm font-semibold ${accent}`}>{label}</h2>
                <span className="text-xs text-stone-400">{groupTasks.length} 项</span>
                {groupMins > 0 && (
                  <span className="text-xs text-stone-300">预计 {formatMinutes(groupMins)}</span>
                )}
                <div className="flex-1 border-t border-stone-100" />
              </div>
              {groupTasks.length === 0 ? (
                <p className="text-xs text-stone-300 pl-2">暂无任务</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {groupTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onClick={() => onTaskClick(task)}
                      onMarkDone={() => onMarkDone(task.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {displayed.length === 0 && (
          <div className="text-center text-stone-300 py-10 text-sm">该时间段暂无任务</div>
        )}
      </div>
    </div>
  )
}
