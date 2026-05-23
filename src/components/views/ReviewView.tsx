import React, { useState } from 'react'
import { Plus, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { Review } from '../../types'
import { format, parseISO } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface ReviewViewProps {
  reviews: Review[]
  onAddReview: (data: Omit<Review, 'id' | 'createdAt'>) => void
  onUpdateReview: (id: string, data: Partial<Review>) => void
  onDeleteReview: (id: string) => void
}

const QUESTIONS: { key: keyof Review; q: string; placeholder: string }[] = [
  { key: 'completed', q: '完成了什么？', placeholder: '本期完成的主要任务...' },
  { key: 'delayed', q: '哪些任务拖延了？', placeholder: '未完成或延期的事项...' },
  { key: 'unimportant', q: '哪些任务其实不重要？', placeholder: '回想起来不值得做的事...' },
  { key: 'nextTop3', q: '下一个周期最重要的 3 件事', placeholder: '1.\n2.\n3.' },
  { key: 'shouldDrop', q: '哪件事应该砍掉？', placeholder: '决定放弃或暂停的事项...' },
]

function ReviewCard({ review, onUpdate, onDelete }: {
  review: Review
  onUpdate: (id: string, data: Partial<Review>) => void
  onDelete: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(review)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const dateLabel = format(parseISO(review.date), 'yyyy年M月d日', { locale: zhCN })

  const handleSave = () => {
    onUpdate(review.id, form)
    setEditing(false)
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-stone-50 transition-colors"
        onClick={() => setExpanded(v => !v)}
      >
        <div>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-0.5 rounded-full ${review.type === 'daily' ? 'bg-sky-100 text-sky-600' : 'bg-violet-100 text-violet-600'}`}>
              {review.type === 'daily' ? '日复盘' : '周复盘'}
            </span>
            <span className="text-sm font-medium text-stone-700">{dateLabel}</span>
          </div>
          {!expanded && review.nextTop3 && (
            <p className="text-xs text-stone-400 mt-0.5 line-clamp-1">重点：{review.nextTop3.split('\n')[0]}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={e => { e.stopPropagation(); if (confirmDelete) { onDelete(review.id) } else { setConfirmDelete(true); setTimeout(() => setConfirmDelete(false), 3000) } }}
            className={`p-1.5 rounded-lg text-xs transition-colors ${confirmDelete ? 'bg-red-500 text-white' : 'text-stone-300 hover:text-red-400'}`}
          >
            <Trash2 size={13} />
          </button>
          {expanded ? <ChevronUp size={15} className="text-stone-300" /> : <ChevronDown size={15} className="text-stone-300" />}
        </div>
      </div>

      {/* Content */}
      {expanded && (
        <div className="px-6 pb-6 border-t border-stone-50">
          {editing ? (
            <div className="pt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-stone-400 block mb-1">类型</label>
                  <select
                    value={form.type}
                    onChange={e => setForm(f => ({ ...f, type: e.target.value as 'daily' | 'weekly' }))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none"
                  >
                    <option value="daily">日复盘</option>
                    <option value="weekly">周复盘</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-stone-400 block mb-1">日期</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none"
                  />
                </div>
              </div>
              {QUESTIONS.map(({ key, q, placeholder }) => (
                <div key={key}>
                  <label className="text-xs text-stone-500 block mb-1">{q}</label>
                  <textarea
                    value={(form[key] as string) ?? ''}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    rows={3}
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-700 placeholder-stone-300 focus:outline-none focus:border-stone-400 transition-colors resize-none"
                  />
                </div>
              ))}
              <div className="flex gap-2">
                <button onClick={() => setEditing(false)} className="flex-1 py-2.5 border border-stone-200 text-stone-500 text-sm rounded-xl">取消</button>
                <button onClick={handleSave} className="flex-1 py-2.5 bg-stone-900 text-white text-sm rounded-xl">保存</button>
              </div>
            </div>
          ) : (
            <div className="pt-4 space-y-4">
              {QUESTIONS.map(({ key, q }) => (
                review[key] ? (
                  <div key={key}>
                    <div className="text-xs text-stone-400 mb-1">{q}</div>
                    <p className="text-sm text-stone-700 whitespace-pre-wrap bg-stone-50 px-4 py-3 rounded-xl">{review[key] as string}</p>
                  </div>
                ) : null
              ))}
              <button
                onClick={() => setEditing(true)}
                className="text-xs text-stone-400 hover:text-stone-700 transition-colors"
              >
                编辑复盘 →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function NewReviewForm({ onSave, onCancel }: { onSave: (data: Omit<Review, 'id' | 'createdAt'>) => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    type: 'weekly' as 'daily' | 'weekly',
    date: new Date().toISOString().split('T')[0],
    completed: '',
    delayed: '',
    unimportant: '',
    nextTop3: '',
    shouldDrop: '',
  })

  const handleSave = () => {
    onSave(form)
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
        <span className="text-sm font-medium text-stone-700">新建复盘</span>
      </div>
      <div className="px-6 pb-6 pt-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-stone-400 block mb-1">类型</label>
            <select
              value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value as 'daily' | 'weekly' }))}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none"
            >
              <option value="daily">日复盘</option>
              <option value="weekly">周复盘</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-stone-400 block mb-1">日期</label>
            <input
              type="date"
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none"
            />
          </div>
        </div>
        {QUESTIONS.map(({ key, q, placeholder }) => (
          <div key={key}>
            <label className="text-xs text-stone-500 block mb-1">{q}</label>
            <textarea
              value={(form[key as keyof typeof form] as string) ?? ''}
              onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
              placeholder={placeholder}
              rows={3}
              className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-700 placeholder-stone-300 focus:outline-none focus:border-stone-400 transition-colors resize-none"
            />
          </div>
        ))}
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 py-2.5 border border-stone-200 text-stone-500 text-sm rounded-xl">取消</button>
          <button onClick={handleSave} className="flex-1 py-2.5 bg-stone-900 text-white text-sm rounded-xl font-medium">保存复盘</button>
        </div>
      </div>
    </div>
  )
}

export function ReviewView({ reviews, onAddReview, onUpdateReview, onDeleteReview }: ReviewViewProps) {
  const [showForm, setShowForm] = useState(false)

  const handleAdd = (data: Omit<Review, 'id' | 'createdAt'>) => {
    onAddReview(data)
    setShowForm(false)
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-5 md:mb-8">
        <div>
          <h1 className="text-lg md:text-2xl font-semibold md:font-light text-stone-800">复盘中心</h1>
          <p className="text-xs md:text-sm text-stone-400 mt-0.5">定期停下来，看清方向</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-white text-sm rounded-xl hover:bg-stone-700 transition-colors"
          >
            <Plus size={14} /> 新建复盘
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-6">
          <NewReviewForm onSave={handleAdd} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {reviews.length === 0 && !showForm && (
        <div className="text-center py-16 text-stone-400">
          <p className="text-sm mb-4">还没有复盘记录</p>
          <button
            onClick={() => setShowForm(true)}
            className="text-sm text-stone-600 underline underline-offset-4"
          >
            创建第一条复盘
          </button>
        </div>
      )}

      <div className="space-y-3">
        {reviews.map(review => (
          <ReviewCard
            key={review.id}
            review={review}
            onUpdate={onUpdateReview}
            onDelete={onDeleteReview}
          />
        ))}
      </div>
    </div>
  )
}
