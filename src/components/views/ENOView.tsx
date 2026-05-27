import React, { useState, useRef, useEffect } from 'react'
import { Trash2, Plus, X } from 'lucide-react'
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

// ── 单张成员卡片 ───────────────────────────────────────────
interface MemberCardProps {
  member: ENOMember
  onUpdate: (updates: Partial<ENOMember>) => void
  onDelete: () => void
}

function MemberCard({ member, onUpdate, onDelete }: MemberCardProps) {
  const setSections = (sections: ENOSection[]) => onUpdate({ sections })

  const updateSection = (idx: number, updates: Partial<ENOSection>) => {
    setSections(member.sections.map((s, i) => i === idx ? { ...s, ...updates } : s))
  }

  const deleteSection = (idx: number) => {
    setSections(member.sections.filter((_, i) => i !== idx))
  }

  const addSection = () => {
    setSections([...member.sections, { tag: '不定期', items: [{ name: '', qty: '' }] }])
  }

  const updateItem = (si: number, ii: number, updates: Partial<ENOTaskItem>) => {
    updateSection(si, {
      items: member.sections[si].items.map((item, i) => i === ii ? { ...item, ...updates } : item),
    })
  }

  const addItem = (si: number) => {
    updateSection(si, {
      items: [...member.sections[si].items, { name: '', qty: '' }],
    })
  }

  const deleteItem = (si: number, ii: number) => {
    updateSection(si, {
      items: member.sections[si].items.filter((_, i) => i !== ii),
    })
  }

  return (
    <div
      className="bg-white rounded-sm relative group/card"
      style={{ border: '1px solid #EAE6DE', padding: '20px 22px' }}
    >
      {/* 删除成员按钮（hover 显示） */}
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

      {/* 卡片头部：姓名 + 角色 tag + 日均 */}
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
      <div style={{ height: '1px', background: '#EAE6DE', marginBottom: '12px' }} />

      {/* 各频率分组 */}
      <div className="space-y-4">
        {member.sections.map((section, si) => (
          <div key={si} className="group/section">
            {/* 段标签 + 删除段按钮 */}
            <div className="flex items-center gap-1.5 mb-1.5">
              <EditableText
                value={section.tag}
                onChange={v => updateSection(si, { tag: v })}
                placeholder="时间段"
                className="tracking-wide"
                style={{ fontSize: '15px', color: '#8A8A8A' }}
              />
              <button
                onClick={() => deleteSection(si)}
                title="删除此段"
                className="opacity-0 group-hover/section:opacity-100 transition-opacity p-0.5 rounded hover:bg-red-50"
                style={{ color: '#C0B8AC' }}
              >
                <X size={10} />
              </button>
            </div>

            {/* 任务列表 */}
            <div className="space-y-1.5">
              {section.items.map((item, ii) => (
                <div key={ii} className="flex items-center gap-1 group/item">
                  {/* Primary 切换点 */}
                  <button
                    onClick={() => updateItem(si, ii, { primary: !item.primary })}
                    title={item.primary ? '取消重点' : '标为重点'}
                    className="shrink-0 w-3 h-3 rounded-full border transition-colors"
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

                  {/* 删除任务按钮 */}
                  <button
                    onClick={() => deleteItem(si, ii)}
                    title="删除此任务"
                    className="shrink-0 opacity-0 group-hover/item:opacity-100 transition-opacity p-0.5 rounded hover:bg-red-50 ml-0.5"
                    style={{ color: '#C0B8AC' }}
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>

            {/* + 添加任务 */}
            <button
              onClick={() => addItem(si)}
              className="mt-1.5 flex items-center gap-1 text-[11px] transition-colors hover:opacity-80"
              style={{ color: '#9B7E50' }}
            >
              <Plus size={10} /> 添加任务
            </button>
          </div>
        ))}
      </div>

      {/* + 添加时间段 */}
      <button
        onClick={addSection}
        className="mt-4 flex items-center gap-1 text-[11px] transition-colors hover:opacity-80 border-t pt-3 w-full"
        style={{ color: '#9B7E50', borderColor: '#EAE6DE' }}
      >
        <Plus size={10} /> 添加时间段
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
  const updateMember = (id: string, updates: Partial<ENOMember>) => {
    onUpdateENOTeam(enoTeam.map(m => m.id === id ? { ...m, ...updates } : m))
  }

  const deleteMember = (id: string) => {
    onUpdateENOTeam(enoTeam.filter(m => m.id !== id))
  }

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

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {/* 页头 */}
      <div className="mb-8 md:mb-10">
        <p
          className="text-[11px] tracking-[0.18em] uppercase mb-2"
          style={{ color: '#9B7E50' }}
        >
          03 ROLE CARDS
        </p>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-lg md:text-2xl font-semibold md:font-light" style={{ color: '#1A1A1A' }}>
              ENO 摄影部
            </h1>
            <p className="text-xs md:text-sm mt-0.5" style={{ color: '#8A8A8A' }}>
              角色与任务分配
            </p>
          </div>
          <button
            onClick={addMember}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            style={{ background: '#1A1A1A', color: '#fff' }}
          >
            <Plus size={14} /> 添加成员
          </button>
        </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {enoTeam.map(member => (
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
