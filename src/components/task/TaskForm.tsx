import React, { useState } from 'react'
import { Star } from 'lucide-react'
import { Task, TaskArea, TaskStatus, AREA_LABELS, STATUS_LABELS } from '../../types'

type FormData = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>

interface TaskFormProps {
  initial?: Partial<FormData>
  onSubmit: (data: FormData) => void
  onCancel: () => void
  submitLabel?: string
}

const AREAS: TaskArea[] = ['work', 'learning', 'finance', 'life']
const STATUSES: TaskStatus[] = ['idea', 'todo', 'in_progress', 'done']

const DEFAULT: FormData = {
  title: '',
  area: 'work',
  status: 'todo',
  importance: 3,
  urgency: 3,
  longTermValue: 3,
  difficulty: 2,
  energy: 'medium',
  deadline: undefined,
  estimatedMinutes: undefined,
  blocker: '',
  tags: [],
  notes: '',
  nextAction: '',
}

function ScoreInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="block text-xs text-stone-500 mb-1.5">{label}</label>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(n => {
          const active = n <= value
          return (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              className="p-1 transition-transform hover:scale-110 focus:outline-none"
              aria-label={`${label} ${n}`}
            >
              <Star
                size={20}
                strokeWidth={1.5}
                className={active ? 'text-stone-800 fill-stone-800' : 'text-stone-300'}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function TaskForm({ initial, onSubmit, onCancel, submitLabel = '保存' }: TaskFormProps) {
  const [form, setForm] = useState<FormData>({ ...DEFAULT, ...initial })

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
      {/* 标题 */}
      <div>
        <label className="block text-xs text-stone-500 mb-1.5">任务名称 *</label>
        <input
          autoFocus
          value={form.title}
          onChange={e => set('title', e.target.value)}
          placeholder="输入任务名称..."
          className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors"
          required
        />
      </div>

      {/* 领域 & 状态 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-stone-500 mb-1.5">所属领域</label>
          <select
            value={form.area}
            onChange={e => set('area', e.target.value as TaskArea)}
            className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-700 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors appearance-none"
          >
            {AREAS.map(a => <option key={a} value={a}>{AREA_LABELS[a]}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-stone-500 mb-1.5">任务状态</label>
          <select
            value={form.status}
            onChange={e => set('status', e.target.value as TaskStatus)}
            className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-700 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors appearance-none"
          >
            {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
        </div>
      </div>

      {/* 评分：重要性、紧急性、执行难度 */}
      <div className="grid grid-cols-3 gap-4">
        <ScoreInput label="重要性" value={form.importance} onChange={v => set('importance', v)} />
        <ScoreInput label="紧急性" value={form.urgency} onChange={v => set('urgency', v)} />
        <ScoreInput label="执行难度" value={form.difficulty} onChange={v => set('difficulty', v)} />
      </div>

      {/* 截止日期 & 预计时长 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-stone-500 mb-1.5">截止日期</label>
          <input
            type="date"
            value={form.deadline ?? ''}
            onChange={e => set('deadline', e.target.value || undefined)}
            className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-700 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs text-stone-500 mb-1.5">预计时长（分钟）</label>
          <input
            type="number"
            min={0}
            value={form.estimatedMinutes ?? ''}
            onChange={e => set('estimatedMinutes', e.target.value ? Number(e.target.value) : undefined)}
            placeholder="60"
            className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-700 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* 下一步动作 */}
      <div>
        <label className="block text-xs text-stone-500 mb-1.5">下一步动作（可选）</label>
        <input
          value={form.nextAction ?? ''}
          onChange={e => set('nextAction', e.target.value)}
          placeholder="最具体的下一步是..."
          className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors"
        />
      </div>

      {/* 备注 */}
      <div>
        <label className="block text-xs text-stone-500 mb-1.5">备注</label>
        <textarea
          value={form.notes ?? ''}
          onChange={e => set('notes', e.target.value)}
          placeholder="补充信息..."
          rows={3}
          className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors resize-none"
        />
      </div>

      {/* 按钮 */}
      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2.5 border border-stone-200 text-stone-500 text-sm rounded-xl hover:bg-stone-50 transition-colors"
        >
          取消
        </button>
        <button
          type="submit"
          className="flex-1 py-2.5 bg-stone-900 text-white text-sm rounded-xl hover:bg-stone-700 transition-colors font-medium"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
