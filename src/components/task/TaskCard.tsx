import React from 'react'
import { Check, Clock, AlertCircle, ChevronRight } from 'lucide-react'
import { Task, AREA_LABELS, AREA_DOT, calcPriorityScore, getPriorityBadge, getPriorityLabel } from '../../types'
import { isOverdue, formatMinutes } from '../../utils/taskUtils'
import { format, parseISO } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface TaskCardProps {
  task: Task
  onClick: () => void
  onMarkDone: () => void
  compact?: boolean
}

export function TaskCard({ task, onClick, onMarkDone, compact }: TaskCardProps) {
  const score = calcPriorityScore(task)
  const priority = getPriorityLabel(score)
  const priorityBadgeClass = getPriorityBadge(score)
  const overdue = isOverdue(task)
  const done = task.status === 'done'

  const handleDone = (e: React.MouseEvent) => {
    e.stopPropagation()
    onMarkDone()
  }

  return (
    <div
      onClick={onClick}
      className={`group relative bg-white rounded-xl border transition-all cursor-pointer ${
        done
          ? 'border-stone-100 opacity-60'
          : overdue
          ? 'border-red-200 hover:border-red-300 hover:shadow-sm'
          : 'border-stone-150 hover:border-stone-300 hover:shadow-sm'
      } ${compact ? 'p-3' : 'p-4'}`}
    >
      {/* Top row: title + done button */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0 flex-1">
          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 ${AREA_DOT[task.area]}`} />
          <span className={`text-sm font-medium leading-snug text-stone-800 ${done ? 'line-through text-stone-400' : ''} line-clamp-2`}>
            {task.title}
          </span>
        </div>
        {!done && (
          <button
            onClick={handleDone}
            className="flex-shrink-0 w-6 h-6 rounded-full border border-stone-200 flex items-center justify-center text-stone-300 hover:border-emerald-400 hover:text-emerald-500 hover:bg-emerald-50 transition-all md:opacity-0 md:group-hover:opacity-100"
            title="标记完成"
          >
            <Check size={12} />
          </button>
        )}
        {done && (
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-500">
            <Check size={12} />
          </div>
        )}
      </div>

      {/* Meta row — shown in both compact and full modes */}
      <div className="flex items-center gap-2 flex-wrap mt-2">
        <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${priorityBadgeClass}`}>
          {priority.label}
        </span>
        <span className="text-xs text-stone-400">{AREA_LABELS[task.area]}</span>

        {task.deadline && (
          <span className={`flex items-center gap-0.5 text-xs ${overdue ? 'text-red-500 font-medium' : 'text-stone-400'}`}>
            {overdue && <AlertCircle size={11} />}
            <Clock size={11} />
            {overdue ? '已逾期 ' : ''}
            {format(parseISO(task.deadline), 'M/d', { locale: zhCN })}
          </span>
        )}

        {task.estimatedMinutes && (
          <span className="text-xs text-stone-400">
            {formatMinutes(task.estimatedMinutes)}
          </span>
        )}

      </div>

      {/* Notes preview — always shown when present */}
      {task.notes && (
        <p className={`text-xs text-stone-500 leading-relaxed mt-2 ${compact ? 'line-clamp-2' : 'line-clamp-3'} whitespace-pre-wrap`}>
          {task.notes}
        </p>
      )}

      {/* Next action — always shown when present */}
      {task.nextAction && (
        <div className="flex items-start gap-1.5 mt-2 text-xs text-stone-600 bg-stone-50 px-2.5 py-1.5 rounded-lg">
          <ChevronRight size={12} className="flex-shrink-0 mt-0.5 text-stone-400" />
          <span className="line-clamp-2 leading-relaxed">{task.nextAction}</span>
        </div>
      )}

      {/* Blocker */}
      {!compact && task.blocker && (
        <div className="mt-2 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-lg truncate">
          🔒 {task.blocker}
        </div>
      )}

      {/* Tags */}
      {!compact && task.tags.length > 0 && (
        <div className="flex gap-1 mt-2 flex-wrap">
          {task.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-xs px-1.5 py-0.5 bg-stone-100 text-stone-400 rounded-md">
              {tag}
            </span>
          ))}
          {task.tags.length > 3 && (
            <span className="text-xs text-stone-300">+{task.tags.length - 3}</span>
          )}
        </div>
      )}
    </div>
  )
}
