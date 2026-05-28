import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Trash2, Plus, X, ChevronUp, ChevronDown } from 'lucide-react'
import { ENOMember, ENOSection, ENOTaskItem } from '../../types'

// ── 行内可编辑文本 ─────────────────────────────────────────
interface EditableTextProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
  style?: React.CSSProperties
}

function EditableText({ value, onChange, placeholder = '点击编辑', className = '', style }: EditableTextProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editing])

  const commit = () => {
    const trimmed = draft.trim()
    onChange(trimmed || value)
    setEditing(false)
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => {
          if (e.key === 'Enter') commit()
          if (e.key === 'Escape') { setDraft(value); setEditing(false) }
        }}
        className={`bg-[#FAF6EF] border border-[#D4C4A8] rounded px-1.5 py-0 outline-none focus:border-[#9B7E50] ${className}`}
        style={{ ...style, minWidth: 40 }}
      />
    )
  }

  return (
    <span
      onClick={() => { setDraft(value); setEditing(true) }}
      title="点击编辑"
      className={`cursor-text rounded px-0.5 hover:bg-[#FAF6EF] transition-colors ${className}`}
      style={style}
    >
      {value || <span style={{ color: '#C0B8AC' }}>{placeholder}</span>}
    </span>
  )
}

// ── 移动按钮 ────────────────────────────────────────────────
function MoveButtons({ onUp, onDown, canUp, canDown }: {
  onUp: () => void; onDown: () => void; canUp: boolean; canDown: boolean
}) {
  return (
    <div className="flex flex-col opacity-0 group-hover/row:opacity-100 transition-opacity shrink-0">
      <button
        onClick={onUp}
        disabled={!canUp}
        className="p-0.5 rounded transition-colors hover:bg-stone-100 disabled:opacity-20 disabled:cursor-not-allowed"
        style={{ color: '#9B7E50' }}
      >
        <ChevronUp size={11} />
      </button>
      <button
        onClick={onDown}
        disabled={!canDown}
        className="p-0.5 rounded transition-colors hover:bg-stone-100 disabled:opacity-20 disabled:cursor-not-allowed"
        style={{ color: '#9B7E50' }}
      >
        <ChevronDown size={11} />
      </button>
    </div>
  )
}

function moveArr<T>(arr: T[], from: number, to: number): T[] {
  const next = [...arr]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

// ── 单张成员卡片 ───────────────────────────────────────────
interface MemberCardProps {
  member: ENOMember
  onUpdate: (updates: Partial<ENOMember>) => void
  onDelete: () => void
}

function MemberCard({ member, onUpdate, onDelete }: MemberCardProps) {
  const setSections = (sections: ENOSection[]) => onUpdate({ sections })

  const updateSection = (idx: number, updates: Partial<ENOSection>) =>
    setSections(member.sections.map((s, i) => i === idx ? { ...s, ...updates } : s))

  const deleteSection = (idx: number) =>
    setSections(member.sections.filter((_, i) => i !== idx))

  const addSection = () =>
    setSections([...member.sections, { tag: '不定期', items: [{ name: '', qty: '' }] }])

  const moveSection = (from: number, to: number) =>
    setSections(moveArr(member.sections, from, to))

  const updateItem = (si: number, ii: number, updates: Partial<ENOTaskItem>) =>
    updateSection(si, {
      items: member.sections[si].items.map((item, i) => i === ii ? { ...item, ...updates } : item),
    })

  const addItem = (si: number) =>
    updateSection(si, { items: [...member.sections[si].items, { name: '', qty: '' }] })

  const deleteItem = (si: number, ii: number) =>
    updateSection(si, { items: member.sections[si].items.filter((_, i) => i !== ii) })

  const moveItem = (si: number, from: number, to: number) =>
    updateSection(si, { items: moveArr(member.sections[si].items, from, to) })

  return (
    <div
      className="bg-white rounded-sm relative group/card"
      style={{ border: '1px solid #EAE6DE', padding: '20px 22px' }}
    >
      {/* 删除成员按钮 */}
      <button
        onClick={onDelete}
        title="删除成员"
        className="absolute top-3 right-3 p-1 rounded opacity-0 group-hover/card:opacity-100 transition-opacity hover:bg-red-50"
        style={{ color: '#C0B8AC' }}
        onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
        onMouseLeave={e => (e.currentTarget.style.color = '#C0B8AC')}
      >
        <Trash2 size={13} />
      </button>

      {/* 卡片头部 */}
      <div className="flex items-center justify-between mb-3 pr-6">
        <div className="flex items-center gap-2 min-w-0">
          <EditableText
            value={member.name}
            onChange={v => onUpdate({ name: v })}
            placeholder="姓名"
            className="font-bold shrink-0"
            style={{ fontSize: '19px', color: '#1A1A1A' }}
          />
          <EditableText
            value={member.role}
            onChange={v => onUpdate({ role: v })}
            placeholder="角色"
            className="text-[11px] px-1.5 py-0.5 rounded-sm shrink-0"
            style={{ color: '#9B7E50', background: '#FAF6EF' }}
          />
        </div>
        <div className="flex items-center gap-1 shrink-0 ml-2">
          <span className="text-[12px]" style={{ color: '#8A8A8A' }}>日均</span>
          <EditableText
            value={member.metric}
            onChange={v => onUpdate({ metric: v })}
            placeholder="—"
            className="text-[13px]"
            style={{ color: '#8A8A8A' }}
          />
        </div>
      </div>

      {/* 分隔线 */}
      <div style={{ height: '1px', background: '#EAE6DE', marginBottom: '14px' }} />

      {/* 各频率分组 */}
      <div className="space-y-4">
        {member.sections.map((section, si) => (
          <div key={si} className="group/section">
            {/* 段标签行 */}
            <div className="flex items-center gap-1.5 mb-2 group/row">
              <MoveButtons
                canUp={si > 0}
                canDown={si < member.sections.length - 1}
                onUp={() => moveSection(si, si - 1)}
                onDown={() => moveSection(si, si + 1)}
              />
              <EditableText
                value={section.tag}
                onChange={v => updateSection(si, { tag: v })}
                placeholder="时间段"
                className="tracking-wide font-medium flex-1"
                style={{ fontSize: '15px', color: '#8A8A8A' }}
              />
              <button
                onClick={() => deleteSection(si)}
                title="删除此段"
                className="opacity-0 group-hover/section:opacity-100 transition-opacity p-0.5 rounded hover:bg-red-50"
                style={{ color: '#C0B8AC' }}
              >
                <X size={11} />
              </button>
            </div>

            {/* 任务列表 */}
            <div className="space-y-2">
              {section.items.map((item, ii) => (
                <div key={ii} className="flex items-center gap-1.5 group/row group/item">
                  <MoveButtons
                    canUp={ii > 0}
                    canDown={ii < section.items.length - 1}
                    onUp={() => moveItem(si, ii, ii - 1)}
                    onDown={() => moveItem(si, ii, ii + 1)}
                  />
                  {/* Primary 切换点 */}
                  <button
                    onClick={() => updateItem(si, ii, { primary: !item.primary })}
                    title={item.primary ? '取消重点' : '标为重点'}
                    className="shrink-0 w-3.5 h-3.5 rounded-full border transition-colors"
                    style={{
                      borderColor: item.primary ? '#9B7E50' : '#D4CEC6',
                      background: item.primary ? '#9B7E50' : 'transparent',
                    }}
                  />
                  {/* 任务名 */}
                  <EditableText
                    value={item.name}
                    onChange={v => updateItem(si, ii, { name: v })}
                    placeholder="任务名称"
                    className="flex-1"
                    style={{
                      fontSize: '13px',
                      color: item.primary ? '#1A1A1A' : '#555555',
                      fontWeight: item.primary ? 600 : 400,
                    }}
                  />
                  {/* 数量 */}
                  <EditableText
                    value={item.qty}
                    onChange={v => updateItem(si, ii, { qty: v })}
                    placeholder="—"
                    className="shrink-0 text-right"
                    style={{ fontSize: '12px', color: '#8A8A8A', minWidth: '56px' }}
                  />
                  {/* 删除任务 */}
                  <button
                    onClick={() => deleteItem(si, ii)}
                    title="删除此任务"
                    className="shrink-0 opacity-0 group-hover/item:opacity-100 transition-opacity p-0.5 rounded hover:bg-red-50"
                    style={{ color: '#C0B8AC' }}
                  >
                    <X size={11} />
                  </button>
                </div>
              ))}
            </div>

            {/* + 添加任务 */}
            <button
              onClick={() => addItem(si)}
              className="mt-2 flex items-center gap-1 transition-colors hover:opacity-80"
              style={{ fontSize: '12px', color: '#9B7E50' }}
            >
              <Plus size={11} /> 添加任务
            </button>
          </div>
        ))}
      </div>

      {/* + 添加时间段 */}
      <button
        onClick={addSection}
        className="mt-4 flex items-center gap-1 transition-colors hover:opacity-80 border-t pt-3 w-full"
        style={{ fontSize: '12px', color: '#9B7E50', borderColor: '#EAE6DE' }}
      >
        <Plus size={11} /> 添加时间段
      </button>
    </div>
  )
}

// ── 主视图 ─────────────────────────────────────────────────
interface ENOViewProps {
  enoTeam: ENOMember[]
  onUpdateENOTeam: (team: ENOMember[]) => void
}

export function ENOView({ enoTeam, onUpdateENOTeam }: ENOViewProps) {
  const [activeId, setActiveId] = useState<string | 'all'>('all')

  const updateMember = useCallback((id: string, updates: Partial<ENOMember>) =>
    onUpdateENOTeam(enoTeam.map(m => m.id === id ? { ...m, ...updates } : m)), [enoTeam, onUpdateENOTeam])

  const deleteMember = useCallback((id: string) => {
    if (activeId === id) setActiveId('all')
    onUpdateENOTeam(enoTeam.filter(m => m.id !== id))
  }, [enoTeam, onUpdateENOTeam, activeId])

  const addMember = () => {
    const newMember: ENOMember = {
      id: `eno-${Date.now()}`,
      name: '新成员',
      role: '角色',
      metric: '',
      sections: [
        { tag: '每日', items: [{ name: '', qty: '', primary: true }] },
      ],
    }
    onUpdateENOTeam([...enoTeam, newMember])
  }

  const displayed = activeId === 'all' ? enoTeam : enoTeam.filter(m => m.id === activeId)

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* 页头 */}
      <div className="mb-6">
        <p
          className="text-[11px] tracking-[0.18em] uppercase mb-2"
          style={{ color: '#9B7E50' }}
        >
          03 ROLE CARDS
        </p>
        {/* 第一行：标题 + 添加按钮 */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl md:text-4xl font-bold" style={{ color: '#1A1A1A' }}>
            ENO 摄影部
          </h1>
          <button
            onClick={addMember}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors shrink-0"
            style={{ background: '#1A1A1A', color: '#fff' }}
          >
            <Plus size={14} /> 添加成员
          </button>
        </div>

        {/* 第二行：人名筛选 tabs（横向可滚动） */}
        {enoTeam.length > 0 && (
          <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            <button
              onClick={() => setActiveId('all')}
              className="px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all shrink-0"
              style={{
                background: activeId === 'all' ? '#1A1A1A' : '#F5F3EF',
                color: activeId === 'all' ? '#fff' : '#555555',
              }}
            >
              全部
            </button>
            {enoTeam.map(m => (
              <button
                key={m.id}
                onClick={() => setActiveId(activeId === m.id ? 'all' : m.id)}
                className="px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all shrink-0"
                style={{
                  background: activeId === m.id ? '#9B7E50' : '#F5F3EF',
                  color: activeId === m.id ? '#fff' : '#555555',
                }}
              >
                {m.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 成员卡片网格 */}
      {enoTeam.length === 0 ? (
        <div
          className="text-center py-16 rounded-sm"
          style={{ border: '1px dashed #EAE6DE', color: '#C0B8AC' }}
        >
          <p className="text-sm">暂无成员</p>
          <button
            onClick={addMember}
            className="mt-3 text-xs underline underline-offset-2"
            style={{ color: '#9B7E50' }}
          >
            添加第一位成员
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {displayed.map(member => (
            <MemberCard
              key={member.id}
              member={member}
              onUpdate={updates => updateMember(member.id, updates)}
              onDelete={() => deleteMember(member.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
