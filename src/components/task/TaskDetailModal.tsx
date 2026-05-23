import React, { useState } from 'react'
import { Trash2, Edit3, Check, Star } from 'lucide-react'
import { Task, AREA_LABELS, STATUS_LABELS, calcPriorityScore, getPriorityLabel } from '../../types'
import { Modal } from '../ui/Modal'
import { TaskForm } from './TaskForm'
import { isOverdue, formatMinutes } from '../../utils/taskUtils'
import { format, parseISO } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface TaskDetailModalProps {
  task: Task | null
  onClose: () => void
  onUpdate: (id: string, data: Partial<Task>) => void
  onDelete: (id: string) => void
  onMarkDone: (id: string) => void
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-stone-100 last:border-0">
      <span className="text-xs text-stone-400 w-16 flex-shrink-0 pt-0.5">{label}</span>
      <div className="text-sm text-stone-700">{children}</div>
    </div>
  )
}

function StarRow({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <Star
          key={n}
          size={13}
          strokeWidth={1.5}
          className={n <= value ? 'text-stone-800 fill-stone-800' : 'text-stone-300'}
        />
      ))}
    </div>
  )
}

export function TaskDetailModal({ task, onClose, onUpdate, onDelete, onMarkDone }: TaskDetailModalProps) {
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (!task) return null

  const score = calcPriorityScore(task)
  const priority = getPriorityLabel(score)
  const overdue = isOverdue(task)

  const handleUpdate = (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    onUpdate(task.id, data)
    setEditing(false)
  }

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete(task.id)
      onClose()
    } else {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
    }
  }

  if (editing) {
    return (
      <Modal open onClose={() => setEditing(false)} title="编辑任务" wide>
        <TaskForm
          initial={task}
          onSubmit={handleUpdate}
          onCancel={() => setEditing(false)}
          submitLabel="保存修改"
        />
      </Modal>
    )
  }

  return (
    <Modal open onClose={onClose} title={task.title} wide>
      <div className="px-6 pb-6">
        {/* Priority score */}
        <div className="flex items-center gap-3 mt-1 mb-4">
          <span className={`text-sm font-semibold ${priority.color}`}>优先级 {priority.label}</span>
          <span className="text-xs text-stone-400">得分 {score}</span>
          {overdue && (
            <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full">已逾期</span>
          )}
          {task.status === 'done' && (
            <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">已完成</span>
          )}
        </div>

        {/* Info grid */}
        <div className="bg-stone-50 rounded-xl px-4 py-1 mb-4">
          <InfoRow label="领域">{AREA_LABELS[task.area]}</InfoRow>
          <InfoRow label="状态">{STATUS_LABELS[task.status]}</InfoRow>
          <InfoRow label="重要性"><StarRow value={task.importance} /></InfoRow>
          <InfoRow label="紧急性"><StarRow value={task.urgency} /></InfoRow>
          <InfoRow label="难度"><StarRow value={task.difficulty} /></InfoRow>
          {task.deadline && (
            <InfoRow label="截止">
              <span className={overdue ? 'text-red-500' : ''}>
                {format(parseISO(task.deadline), 'yyyy年M月d日 EEEE', { locale: zhCN })}
              </span>
            </InfoRow>
          )}
          {task.estimatedMinutes && (
            <InfoRow label="预计">{formatMinutes(task.estimatedMinutes)}</InfoRow>
          )}
          {task.nextAction && (
            <InfoRow label="下一步">{task.nextAction}</InfoRow>
          )}
          {task.blocker && (
            <InfoRow label="阻塞">
              <span className="text-amber-600">{task.blocker}</span>
            </InfoRow>
          )}
          {task.tags.length > 0 && (
            <InfoRow label="标签">
              <div className="flex gap-1 flex-wrap">
                {task.tags.map(tag => (
                  <span key={tag} className="px-2 py-0.5 bg-stone-100 text-stone-500 text-xs rounded-md">{tag}</span>
                ))}
              </div>
            </InfoRow>
          )}
          {task.notes && (
            <InfoRow label="备注">
              <span className="whitespace-pre-wrap text-stone-500">{task.notes}</span>
            </InfoRow>
          )}
          <InfoRow label="创建">
            {format(parseISO(task.createdAt), 'yyyy/MM/dd HH:mm')}
          </InfoRow>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {task.status !== 'done' && (
            <button
              onClick={() => { onMarkDone(task.id); onClose() }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-stone-900 text-white text-sm rounded-xl hover:bg-stone-700 transition-colors"
            >
              <Check size={14} /> 标记完成
            </button>
          )}
          <button
            onClick={() => setEditing(true)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-stone-200 text-stone-600 text-sm rounded-xl hover:bg-stone-50 transition-colors"
          >
            <Edit3 size={14} /> 编辑
          </button>
          <button
            onClick={handleDelete}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 text-sm rounded-xl transition-colors ${
              confirmDelete
                ? 'bg-red-600 text-white'
                : 'border border-stone-200 text-stone-400 hover:text-red-500 hover:border-red-200'
            }`}
          >
            <Trash2 size={14} />
            {confirmDelete ? '确认删除' : ''}
          </button>
        </div>
      </div>
    </Modal>
  )
}
